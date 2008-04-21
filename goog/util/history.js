// Copyright 2007-8 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview
 *
 * The goog.History object allows a page to create history state without leaving
 * the current document. This allows users to, for example, hit the browser's
 * back button without leaving the current page.
 *
 * The history object can be instantiated in one of two modes. In user visible
 * mode, the current history state is shown in the browser address bar as a
 * document location fragment (the portion of the URL after the '#'). These
 * addresses can be bookmarked, copied and pasted into another browser, and
 * modified directly by the user like any other URL.
 *
 * If the history object is created in invisible mode, the user can still
 * affect the state using the browser forward and back buttons, but the current
 * state is not displayed in the browser address bar. These states are not
 * bookmarkable or editable.
 *
 * It is possible to use both types of history object on the same page, but not
 * currently recommended due to browser deficiencies.
 *
 * Tested to work in:
 * <ul>
 *   <li>Firefox 1.0-2.0</li>
 *   <li>Internet Explorer 5.5-7.0</li>
 *   <li>Opera 9</li>
 *   <li>Safari 1.3-2.0, but not very well.</li>
 * </ul>
 *
 * Shipping versions of Safari are incapable of creating and then reading
 * history states due to a browser bug. The bugs have been fixed in Webkit
 * nightly builds (tested on version 420+.) Older Safaris still fire the same
 * navigation events as other browsers while browsing forward, but creates dead
 * history states for going backward. Unfortunately, replacing the location
 * does not seem to help, the history states are created anyway.
 */


/* Some browser specific implementation notes:
 *
 * Firefox (through version 2.0.0.1):
 *
 * Ideally, navigating inside the hidden iframe could be done using
 * about:blank#state instead of a real page on the server. Setting the hash on
 * about:blank creates history entries, but the hash is not recorded and is lost
 * when the user hits the back button. This is true in Opera as well. A blank
 * HTML page must be provided for invisible states to be recorded in the iframe
 * hash.
 *
 * After leaving the page with the History object and returning to it (by
 * hitting the back button from another site), the last state of the iframe is
 * overwritten. The most recent state is saved in a hidden input field so the
 * previous state can be restored.
 *
 * Firefox does not store the previous value of dynamically generated input
 * elements. To save the state, the hidden element must be in the HTML document,
 * either in the original source or added with document.write. If a reference
 * to the input element is not provided as a constructor argument, then the
 * history object creates one using document.write, in which case the history
 * object must be created from a script in the body element of the page.
 *
 * Manually editing the address field to a different hash link prevents further
 * updates to the address bar. The page continues to work as normal, but the
 * address shown will be incorrect until the page is reloaded.
 *
 * NOTE(pupius): It should be noted that Firefox will URL encode any non-regular
 * ascii character, along with |space|, ", <, and >, when added to the fragment.
 * If you expect these characters in your tokens you should consider that
 * setToken('<b>') would result in the history fragment "%3Cb%3E", and
 * "esp&eacute;re" would show "esp%E8re".  (IE allows unicode characters in the
 * fragment)
 *
 * TODO(pupius): Should we encapsualte this escaping into the API for visible
 * history and encode all characters that aren't supported by Firefox?  It also
 * needs to be optional so apps can elect to handle the escaping themselves.
 *
 *
 * Internet Explorer (through version 7.0):
 *
 * IE does not modify the history stack when the document fragment is changed.
 * We create history entries instead by using document.open and document.write
 * into a hidden iframe.
 *
 * IE destroys the history stack when navigating from /foo.html#someFragment to
 * /foo.html. The workaround is to always append the # to the URL. This is
 * somewhat unfortunate when loading the page without any # specified, because
 * a second "click" sound will play on load as the fragment is automatically
 * appended. If the hash is always present, this can be avoided.
 *
 * Manually editing the hash in the address bar in IE6 and then hitting the back
 * button can replace the page with a blank page. This is a Bad User Experience,
 * but probably not preventable.
 *
 *
 * Opera (through version 9.02):
 *
 * Navigating through pages at a rate faster than some threshhold causes Opera
 * to cancel all outstanding timeouts and intervals, including the location
 * polling loop. Since this condition cannot be detected, common input events
 * are captured to cause the loop to restart.
 *
 * location.replace is adding a history entry inside setHash_, despite
 * documentation that suggests it should not.
 *
 *
 * Safari (through version 2.0.4):
 *
 * After hitting the back button, the location.hash property is no longer
 * readable from JavaScript. This is fixed in later WebKit builds, but not in
 * currently shipping Safari. For now, the only recourse is to disable history
 * states in Safari. Pages are still navigable via the History object, but the
 * back button cannot restore previous states.
 *
 * Safari sets history states on navigation to a hashlink, but doesn't allow
 * polling of the hash, so following actual anchor links in the page will create
 * useless history entries. Using location.replace does not seem to prevent
 * this. Not a terribly good user experience, but fixed in later Webkits.
 *
 *
 * WebKit (nightly version 420+):
 *
 * This almost works. Returning to a page with an invisible history object does
 * not restore the old state, however, and there is no pageshow event that fires
 * in this browser. Holding off on finding a solution for now.
 *
 *
 * Safari (version 3 and later)
 * TODO(brenneman): Investigate Safari 3. It almost works, but the forward
 * button seems to fail.
 */

goog.provide('goog.History');
goog.provide('goog.History.Event');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.string');
goog.require('goog.Timer');
goog.require('goog.userAgent');


/**
 * A history management object. Can be instantiated in user-visible mode (uses
 * the address fragment to manage state) or in hidden mode. This object should
 * be created from a script in the document body before the document has
 * finished loading.
 *
 * To store the hidden states in browsers other than IE, a hidden iframe is
 * used. It must point to a valid html page on the same domain (which can and
 * probably should be blank.)
 *
 * Sample instantiation and usage:
 *
 * <pre>
 * // Instantiate history to use the address bar for state.
 * var h = new goog.History();
 * goog.events.listen(h, goog.History.EventType.NAVIGATE, navCallback);
 * h.setEnabled(true);
 *
 * // Any changes to the location hash will call the following function.
 * function navCallback(e) {
 *   alert('Navigated to state "' + e.token + '"');
 * }
 *
 * // The history token can also be set from code directly.
 * h.setToken('foo');
 * </pre>
 *
 * @param {boolean} opt_invisible True to use hidden history states instead of
 *     the user-visible location hash.
 * @param {string} opt_blankPageUrl A URL to a blank page on the same server.
 *     Required if opt_invisible is true.  This URL is also used as the src
 *     for the iframe used to track history state in IE (if not specified the
 *     iframe is not given a src attribute).  Access is Denied error may
 *     occur in IE7 if the window's URL's scheme is https, and this URL is
 *     not specified.
 * @param {HTMLInputElement} opt_input The hidden input element to be used to
 *     store the history token.  If not provided, a hidden input element will
 *     be created using document.write.
 * @param {HTMLIFrameElement} opt_iframe The hidden iframe that will be used by
 *     IE for pushing history state changes, or by all browsers if opt_invisible
 *     is true. If not provided, a hidden iframe element will be created using
 *     document.write.
 * @constructor
 */
goog.History = function(opt_invisible, opt_blankPageUrl, opt_input,
                        opt_iframe) {
  goog.events.EventTarget.call(this);

  if (opt_invisible && !opt_blankPageUrl) {
    throw Error('Can\'t use invisible history without providing a blank page.');
  }

  var input;
  if (opt_input) {
    input = opt_input;
  } else {
    var inputId = 'history_state' + goog.History.historyCount_;
    document.write(goog.string.subs(goog.History.INPUT_TEMPLATE_,
                                    inputId, inputId));
    input = goog.dom.getElement(inputId);
  }

  /**
   * An input element that stores the current iframe state. Used to restore
   * the state when returning to the page on non-IE browsers.
   * @type {HTMLInputElement}
   * @private
   */
  this.hiddenInput_ = input;

  /**
   * The window whose location contains the history token fragment. This is
   * the window that contains the hidden input. It's typically the top window.
   * It is not necessarily the same window that the js code is loaded in.
   * @type {Window}
   * @private
   */
  this.window_ = opt_input ?
      goog.dom.getWindow(goog.dom.getOwnerDocument(opt_input)) : window;

  /**
   * The initial page location with an empty hash component. If the page uses
   * a BASE element, setting location.hash directly will navigate away from the
   * current document. To prevent this, the full path is always specified. The #
   * character is appended to the base URL, since removing the hash entirely
   * once it has been set reloads the entire page.
   * @type {string}
   * @private
   */
  this.baseUrl_ = this.window_.location.href.split('#')[0] + '#';

  /**
   * The base URL for the hidden iframe. Must refer to a document in the
   * same domain as the main page.
   * @type {string|undefined}
   * @private
   */
  this.iframeSrc_ = opt_blankPageUrl;

  /**
   * A timer for polling the current history state for changes.
   * @type {goog.Timer}
   * @private
   */
  this.timer_ = new goog.Timer(goog.History.PollingType.NORMAL);

  /**
   * True if the state tokens are displayed in the address bar, false for hidden
   * history states.
   * @type {boolean}
   * @private
   */
  this.userVisible_ = !opt_invisible;

  /**
   * An object to keep track of the history event listeners.
   * @type {goog.events.EventHandler;}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  if (opt_invisible || goog.userAgent.IE) {
    var iframe;
    if (opt_iframe) {
      iframe = opt_iframe;
    } else {
      var iframeId = 'history_iframe' + goog.History.historyCount_;
      var srcAttribute = this.iframeSrc_ ?
          'src="' + goog.string.htmlEscape(this.iframeSrc_) + '"' : '';
      document.write(goog.string.subs(
          goog.History.IFRAME_TEMPLATE_, iframeId, srcAttribute));
      iframe = goog.dom.getElement(iframeId);
    }

    /**
     * Internet Explorer uses a hidden iframe for all history changes. Other
     * browsers use the iframe only for pushing invisible states.
     * @type {HTMLIFrameElement}
     * @private
     */
    this.iframe_ = iframe;
  }

  if (goog.userAgent.IE) {
    // IE relies on the hidden input to restore the history state from previous
    // sessions, but input values are only restored after window.onload. Set up
    // a callback to poll the value after the onload event.
    this.eventHandler_.listen(this.window_, goog.events.EventType.LOAD,
                              this.onDocumentLoaded);

    /**
     * IE-only variable for determining if the document has loaded.
     * @type {boolean}
     * @protected
     */
    this.documentLoaded = false;

    /**
     * IE-only variable for storing whether the history object should be enabled
     * once the document finishes loading.
     * @type {boolean}
     * @private
     */
    this.shouldEnable_ = false;
  }

  // Set the initial history state.
  if (this.userVisible_) {
    this.setHash_(this.getToken());
  } else {
    this.setIframeToken_(this.hiddenInput_.value);
  }

  goog.History.historyCount_++;
};
goog.inherits(goog.History, goog.events.EventTarget);


/**
 * Status of when the object is active and dispatching events.
 * @type {boolean}
 * @private
 */
goog.History.prototype.enabled_ = false;


/**
 * Whether the object is performing polling with longer intervals. This can
 * occur for instance when setting the location of the iframe when in invisible
 * mode and the server that is hosting the blank html page is down. In FF, this
 * will cause the location of the iframe to no longer be accessible, with
 * permision denied exceptions being thrown on every access of the history
 * token. When this occurs, the polling interval is elongated. This causes
 * exceptions to be thrown at a lesser rate while allowing for the history
 * object to resurrect itself when the html page becomes accessible.
 * @type {boolean}
 * @private
 */
goog.History.prototype.longerPolling_ = false;


/**
 * The last token set by the history object, used to poll for changes.
 * @type {string?}
 * @private
 */
goog.History.prototype.lastToken_ = null;


/**
 * If not null, polling in the user invisible mode will be disabled until this
 * token is seen. This is used to prevent a race condition where the iframe
 * hangs temporarily while the location is changed.
 * @type {string?}
 * @private
 */
goog.History.prototype.lockedToken_ = null;


/**
 * Disposes the object.
 */
goog.History.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.History.superClass_.dispose.call(this);
    this.eventHandler_.dispose();
    this.setEnabled(false);
  }
};


/**
 * Starts or stops the History polling loop. When enabled, the History object
 * will immediately fire an event for the current location. The caller can set
 * up event listeners between the call to the constructor and the call to
 * setEnabled.
 *
 * On IE, actual startup may be delayed until the iframe and hidden input
 * element have been loaded and can be polled. This behavior is transparent to
 * the caller.
 *
 * @param {boolean} enable Whether to enable the history polling loop.
 */
goog.History.prototype.setEnabled = function(enable) {

  if (enable == this.enabled_) {
    return;
  }

  if (goog.userAgent.IE && !this.documentLoaded) {
    // Wait until the document has actually loaded before enabling the
    // object or any saved state from a previous session will be lost.
    this.shouldEnable_ = enable;
    return;
  }

  if (enable) {
    if (goog.userAgent.OPERA) {
      // Capture events for common user input so we can restart the timer in
      // Opera if it fails. Yes, this is distasteful. See operaDefibrillator_.
      this.eventHandler_.listen(this.window_.document,
                                goog.History.INPUT_EVENTS_,
                                this.operaDefibrillator_);
    } else if (goog.userAgent.GECKO) {
      // Firefox will not restore the correct state after navigating away from
      // and then back to the page with the history object. This can be fixed
      // by restarting the history object on the pageshow event.
      this.eventHandler_.listen(this.window_, 'pageshow', this.onShow_);
    }

    if (!goog.userAgent.IE || this.documentLoaded) {
      // Start dispatching history events if all necessary loading has
      // completed (always true for browsers other than IE.)
      this.eventHandler_.listen(this.timer_, goog.Timer.TICK, this.poll_);

      this.enabled_ = true;

      this.timer_.start();
      this.dispatchEvent(new goog.History.Event(this.getToken()));
    }

  } else {
    this.enabled_ = false;
    this.eventHandler_.removeAll();
    this.timer_.stop();
  }
};


/**
 * Callback for the window onload event in IE. This is necessary to read the
 * value of the hidden input after restoring a history session. The value of
 * input elements is not viewable until after window onload for some reason (the
 * iframe state is similarly unavailable during the loading phase.)  If
 * setEnabled is called before the iframe has completed loading, the history
 * object will actually be enabled at this point.
 * @protected
 */
goog.History.prototype.onDocumentLoaded = function() {
  this.documentLoaded = true;
  if (this.hiddenInput_.value) {
    // Any saved value in the hidden input can only be read after the document
    // has been loaded due to an IE limitation. Restore the previous state if
    // it has been set.
    this.setIframeToken_(this.hiddenInput_.value, true);
  }
  this.setEnabled(this.shouldEnable_);
};


/**
 * Handler for the Gecko pageshow event. Restarts the history object so that the
 * correct state can be restored in the hash or iframe.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.History.prototype.onShow_ = function(e) {
  // NOTE(pupius): persisted is a property passed in the pageshow event that
  // indicates whether the page is being persisted from the cache or is being
  // loaded for the first time.
  if (e.getBrowserEvent()['persisted']) {
    this.setEnabled(false);
    this.setEnabled(true);
  }
};


/**
 * @return {string} The current token.
 */
goog.History.prototype.getToken = function() {
  if (this.lockedToken_ !== null) {
    return this.lockedToken_;
  } else if (this.userVisible_) {
    return this.getLocationFragment_(this.window_);
  } else {
    return this.getIframeToken_() || '';
  }
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token.  Sometimes it is necessary to set the
 * history token before the document title has changed, in this case IE's
 * history drop down can be out of sync with the token.  To get around this
 * problem, the app can pass in a title to use with the hidden iframe.
 * @param {string} token The history state identifier.
 * @param {string} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.setToken = function(token, opt_title) {
  this.setHistoryState_(token, false, opt_title);
};


/**
 * Replaces the current history state without affecting the rest of the history
 * stack.
 * @param {string} token The history state identifier.
 * @param {string} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.replaceToken = function(token, opt_title) {
  this.setHistoryState_(token, true, opt_title);
};


/**
 * Gets the location fragment for the current URL.  We don't use location.hash
 * directly as the browser helpfully urlDecodes the string for us which can
 * corrupt the tokens.  For example, if we want to store: label/%2Froot it would
 * be returned as label//root.
 * @param {Window} win The window object to use.
 * @return {string} The fragment.
 * @private
 */
goog.History.prototype.getLocationFragment_ = function(win) {
  var loc = win.location.href;
  var index = loc.indexOf('#');
  return index < 0 ? '' : loc.substring(index + 1);
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token. Setting opt_replace to true will cause the
 * navigation to occur, but will replace the current history entry without
 * affecting the length of the stack.
 *
 * @param {string} token The history state identifier.
 * @param {boolean} replace Set to replace the current history entry instead of
 *    appending a new history state.
 * @param {string} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setHistoryState_ = function(token, replace, opt_title) {
  if (this.getToken() != token) {
    if (this.userVisible_) {
      this.setHash_(token, replace);

      if (goog.userAgent.IE) {
        // IE must save state using the iframe.
        this.setIframeToken_(token, replace, opt_title);
      }
      if (this.enabled) {
        this.poll_();
      }
    } else {
      // Fire the event immediately so that setting history is synchronous, but
      // set a suspendToken so that polling doesn't trigger a 'back'.
      this.setIframeToken_(token, replace);
      this.lockedToken_ = this.lastToken_ = this.hiddenInput_.value = token;
      this.dispatchEvent(new goog.History.Event(token));
    }
  }
};


/**
 * Sets or replaces the URL fragment. The token does not need to be URL encoded
 * according to the URL specification, though certain characters (like newline)
 * are automatically stripped.
 *
 * If opt_replace is not set, non-IE browsers will append a new entry to the
 * history list. Setting the hash does not affect the history stack in IE
 * (unless there is a pre-existing named anchor for that hash.)
 *
 * Older versions of Webkit cannot query the location hash, but it still can be
 * set. If we detect one of these versions, always replace instead of creating
 * new history entries.
 *
 * @param {string} hash The new string to set.
 * @param {boolean} opt_replace Set to true to replace the current token without
 *    appending a history entry.
 * @private
 */
goog.History.prototype.setHash_ = function(hash, opt_replace) {
  // The page is reloaded if the hash is removed, so the '#' must always be
  // appended to the base URL, even if setting an empty token.
  var url = this.baseUrl_ + (hash || '');

  var loc = this.window_.location;
  if (url != loc.href) {
    if (opt_replace) {
      loc.replace(url);
    } else {
      loc.href = url;
    }
  }
};


/**
 * Sets the hidden iframe state. On IE, this is accomplished by writing a new
 * document into the iframe. In Firefox, the iframe's URL fragment stores the
 * state instead.
 *
 * Older versions of webkit cannot set the iframe, so ignore those browsers.
 *
 * @param {string} token The new string to set.
 * @param {boolean} opt_replace Set to true to replace the current iframe state
 *     without appending a new history entry.
 * @param {string} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setIframeToken_ = function(token,
                                                  opt_replace,
                                                  opt_title) {
  if (!goog.History.BAD_WEBKIT_ && token != this.getIframeToken_()) {

    token = goog.string.urlEncode(token);

    if (goog.userAgent.IE) {
      // Caching the iframe document results in document permission errors after
      // leaving the page and returning. Access it anew each time instead.
      var doc = goog.dom.getFrameContentDocument(this.iframe_);

      doc.open('text/html', opt_replace ? 'replace' : undefined);
      doc.write(goog.string.subs(goog.History.IFRAME_SOURCE_TEMPLATE_,
                                 opt_title || this.window_.document.title,
                                 token));
      doc.close();
    } else {
      var url = this.iframeSrc_ + '#' + token;

      // In Safari, it is possible for the contentWindow of the iframe to not
      // be present when the page is loading after a reload.
      var contentWindow = this.iframe_.contentWindow;
      if (contentWindow) {
        if (opt_replace) {
          contentWindow.location.replace(url);
        } else {
          contentWindow.location.href = url;
        }
      }
    }
  }
};


/**
 * Return the current state string from the hidden iframe. On internet explorer,
 * this is stored as a string in the document body. Other browsers use the
 * location hash of the hidden iframe.
 *
 * Older versions of webkit cannot access the iframe location, so always return
 * null in that case.
 *
 * @return {string?} The state token saved in the iframe (possibly null if the
 *     iframe has never loaded.).
 * @private
 */
goog.History.prototype.getIframeToken_ = function() {
  if (goog.userAgent.IE) {
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    return doc.body ? goog.string.urlDecode(doc.body.innerHTML) : null;
  } else if (goog.History.BAD_WEBKIT_) {
    return null;
  } else {
    // In Safari, it is possible for the contentWindow of the iframe to not
    // be present when the page is loading after a reload.
    var contentWindow = this.iframe_.contentWindow;
    if (contentWindow) {
      var hash;
      /** @preserveTry */
      try {
        // Iframe tokens are urlEncoded
        hash = goog.string.urlDecode(this.getLocationFragment_(contentWindow));
      } catch(e) {
        // An exception will be thrown if the location of the iframe can not be
        // accessed (permission denied). This can occur in FF if the the server
        // that is hosting the blank html page goes down and then a new history
        // token is set. The iframe will navigate to an error page, and the
        // location of the iframe can no longer be accessed. Due to the polling,
        // this will cause constant exceptions to be thrown. In this case,
        // we enable longer polling. We do not have to attempt to reset the
        // iframe token because (a) we already fired the NAVIGATE event when
        // setting the token, (b) we can rely on the locked token for current
        // state, and (c) the token is still in the history and
        // accesible on forward/back.
        if (!this.longerPolling_) {
          this.setLongerPolling_(true)
        }

        return null;
      }

      // There was no exception when getting the hash so turn off longer polling
      // if it is on.
      if (this.longerPolling_) {
        this.setLongerPolling_(false);
      }

      return hash || null;
    } else {
      return null;
    }
  }
};


/**
 * Polls the state of the document fragment and the iframe title to detect
 * navigation changes. Runs approximately twenty times per second.
 * @private
 */
goog.History.prototype.poll_ = function() {
  if (this.userVisible_) {
    var hash = this.getLocationFragment_(this.window_);
    if (hash != this.lastToken_) {
      this.update_(hash);
    }
  }

  // IE uses the iframe for state for both the visible and non-visible version.
  if (!this.userVisible_ || goog.userAgent.IE) {
    var token = this.getIframeToken_() || '';
    if (this.lockedToken_ == null || token == this.lockedToken_) {
      this.lockedToken_ = null;
      if (token != this.lastToken_) {
        this.update_(token);
      }
    }
  }
};


/**
 * Updates the current history state with a given token. Called after a change
 * to the location or the iframe state is detected by poll_.
 *
 * @param {goog.History.State_} token The new history state.
 * @private
 */
goog.History.prototype.update_ = function(token) {
  this.lastToken_ = this.hiddenInput_.value = token;

  if (this.userVisible_) {
    if (goog.userAgent.IE) {
      this.setIframeToken_(token);
    }

    this.setHash_(token);
  } else {
    this.setIframeToken_(token);
  }

  this.dispatchEvent(new goog.History.Event(this.getToken()));
};


/**
 * Sets if the history oject should use longer intervals when polling.
 *
 * @param {boolean} longerPolling Whether to enable longer polling.
 * @private
 */
goog.History.prototype.setLongerPolling_ = function(longerPolling) {
  if (this.longerPolling_ != longerPolling) {
    this.timer_.setInterval(longerPolling ?
        goog.History.PollingType.LONG : goog.History.PollingType.NORMAL);
  }
  this.longerPolling_ = longerPolling;
};


/**
 * Opera cancels all outstanding timeouts and intervals after any rapid
 * succession of navigation events, including the interval used to detect
 * navigation events. This function restarts the interval so that navigation can
 * continue. Ideally, only events which would be likely to cause a navigation
 * change (mousedown and keydown) would be bound to this function. Since Opera
 * seems to ignore keydown events while the alt key is pressed (such as
 * alt-left or right arrow), this function is also bound to the much more
 * frequent mousemove event. This way, when the update loop freezes, it will
 * unstick itself as the user wiggles the mouse in frustration.
 * @private
 */
goog.History.prototype.operaDefibrillator_ = function() {
  this.timer_.stop();
  this.timer_.start();
};


/**
 * Webkit versions prior to 420 are unable to poll the state of the location
 * hash after the back button is hit. They are also unable to access an iframe
 * location object at all.
 *
 * Test for version 419 or less since goog.userAgent.isVersion('420') fails on
 * the current Webkit nightly version ('420+').
 * @type {boolean}
 * @private
 */
goog.History.BAD_WEBKIT_ = goog.userAgent.WEBKIT &&
    goog.userAgent.compare(goog.userAgent.VERSION, '419') <= 0;


/**
 * List of user input event types registered in Opera to restart the history
 * timer (@see goog.History#operaDefibrillator_).
 * @type {Array.<string>}
 * @private
 */
goog.History.INPUT_EVENTS_ = [goog.events.EventType.MOUSEDOWN,
                              goog.events.EventType.KEYDOWN,
                              goog.events.EventType.MOUSEMOVE];


/**
 * Minimal HTML page used to populate the iframe in Internet Explorer. The title
 * is visible in the history dropdown menu, the iframe state is stored as the
 * body innerHTML.
 * @type {string}
 * @private
 */
goog.History.IFRAME_SOURCE_TEMPLATE_ = '<title>%s</title><body>%s</body>';


/**
 * HTML template for an invisible iframe.
 * @type {string}
 * @private
 */
goog.History.IFRAME_TEMPLATE_ =
    '<iframe id="%s" style="display:none" %s></iframe>';

/**
 * HTML template for an invisible named input element.
 * @type {string}
 * @private
 */
goog.History.INPUT_TEMPLATE_ =
    '<input type="text" name="%s" id="%s" style="display:none" />';


/**
 * Counter for the number of goog.History objects that have been instantiated.
 * Used to create unique IDs.
 * @type {number}
 * @private
 */
goog.History.historyCount_ = 0;


/**
 * Types of polling. The values are in ms of the polling interval.
 * @enum {number}
 */
goog.History.PollingType = {
  NORMAL: 150,
  LONG: 10000
};


/**
 * Constant for the history change event type.
 * @enum {string}
 */
goog.History.EventType = {
  NAVIGATE: 'navigate'
};


/**
 * Event object dispatched after navigation events.
 * @param {string} token The string identifying the new history state.
 * @constructor
 */
goog.History.Event = function(token) {
  goog.events.Event.call(this, goog.History.EventType.NAVIGATE);

  /**
   * The current history state.
   * @type {string}
   */
  this.token = token;
};
goog.inherits(goog.History.Event, goog.events.Event);
