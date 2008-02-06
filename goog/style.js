goog.style = goog.style || {};

/**
 * Returns the position relative to the client viewport.
 * @param {Element|Event} el  Element or a mouse event object
 * @return {goog.math.Coordinate}
 */
goog.style.getClientPosition = function(el) {
  var pos = new goog.math.Coordinate;
  if (el.nodeType == goog.dom.NodeType.ELEMENT) {
    if (el.getBoundingClientRect) { // IE
      var box = el.getBoundingClientRect();
      pos.x = box.left;
      pos.y = box.top;
    } else {
      var doc = goog.dom.getOwnerDocument(el);
      var viewportElement = goog.style.getClientViewportElement(doc);

      var pageCoord = goog.style.getPageOffset(el);
      pos.x = pageCoord.x - viewportElement.scrollLeft;
      pos.y = pageCoord.y - viewportElement.scrollTop;
    }
  } else {
    pos.x = el.clientX;
    pos.y = el.clientY;
  }

  return pos;
};

goog.style.isAboveTheFold = function(el) {
  return goog.style.getClientPosition(element).y + element.offsetHeight <= 0;
}

/**
 * Retrieves a computed style value of a node, or null if the value cannot be
 * computed (which will be the case in Internet Explorer).
 *
 * @param {Element} element Element to get style of
 * @param {String} style Property to get (camel-case)
 * @return {String} Style value
 */
goog.style.getComputedStyle = function(element, style) {
  var doc = goog.dom.getOwnerDocument(element);
  if (doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, "");
    if (styles) {
      return styles[style];
    }
  }

  return null;
};


/**
 * Gets the cascaded style value of a node, or null if the value cannot be
 * computed (only Internet Explorer can do this).
 *
 * @param {Element} element Element to get style of
 * @param {String} style Property to get (camel-case)
 * @return {String} Style value
 */
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null;
};


/**
 * Cross-browser pseudo get computed style. It returns the computed style where
 * available. If not available it tries the cascaded style value (IE
 * currentStyle) and in worst case the inline style value.
 *
 * @param {Element} element Element to get style of
 * @param {String} style Property to get (must be camelCase, not css-style.)
 * @return {String} Style value
 * @private
 */
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) ||
         goog.style.getCascadedStyle(element, style) ||
         element.style[style];
};

/**
 * Returns the viewport element for a particular document
 * @param {Node} opt_node DOM node (Document is OK) to get the viewport element of
 * @return {Element} document.documentElement or document.body
 */
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if (opt_node) {
    if (opt_node.nodeType == goog.dom.NodeType.DOCUMENT) {
      doc = opt_node;
    } else {
      doc = goog.dom.getOwnerDocument(opt_node);
    }
  } else {
    doc = document;
  }

  // In old IE versions the document.body represented the viewport
  if (goog.userAgent.IE && doc.compatMode != 'CSS1Compat') {
    return doc.body;
  }
  return doc.documentElement;
};

/**
 * Returns a bounding rectangle for a given element in page space.
 * @param {Element} element Element to get bounds of
 * @return {goog.math.Rect} Bounding rectangle for the element.
 */
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height);
};

/**
 * Gets the height and width of an element, even if its display is none.
 * Specifically, this returns the height and width of the border box,
 * irrespective of the box model in effect.
 * @param {Element} element Element to get width of
 * @return {goog.math.Size} Object with width/height properties
 */
goog.style.getSize = function(element) {
  if (goog.style.getStyle_(element, 'display') != 'none') {
    return new goog.math.Size(element.offsetWidth, element.offsetHeight);
  }

  var style = element.style;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;

  style.visibility = 'hidden';
  style.position = 'absolute';
  style.display = '';

  var originalWidth = element.offsetWidth;
  var originalHeight = element.offsetHeight;

  style.display = 'none';
  style.position = originalPosition;
  style.visibility = originalVisibility;

  return new goog.math.Size(originalWidth, originalHeight);
};

/**
 * Sets 'display: inline-block' for an element (cross-browser).
 * @param {Element} el Element to which the inline-block display style is to be
 *    applied
 */
goog.style.setInlineBlock = function(el) {
  // Without position:relative, weirdness ensues.  Just accept it and move on.
  el.style.position = 'relative';

  if (goog.userAgent.IE) {
    // Zoom:1 forces hasLayout, display:inline gives inline behavior.
    el.style.zoom = '1';
    el.style.display = 'inline';
  } else if (goog.userAgent.GECKO) {
    // Pre-Firefox 3, Gecko doesn't support inline-block, but -moz-inline-box
    // is close enough.
    el.style.display =
        goog.userAgent.compare(goog.userAgent.VERSION, '1.8') > 0 ?
            'inline-block' : '-moz-inline-box';
  } else {
    // Opera, Webkit, and Safari seem to do OK with the standard inline-block
    // style.
    el.style.display = 'inline-block';
  }
};

/**
 * Installs the styles string into the window that contains opt_element.  If
 * opt_element is null, the main window is used.
 * @param {String} stylesString The style string to install.
 * @param {Element} opt_element Element who's parent document should have the
 *     styles installed.
 * @return {Element} The style element created.
 */
goog.style.installStyles = function(stylesString, opt_element) {
  var dh = goog.dom.getDomHelper(opt_element);
  var styleSheet = null;

  if (goog.userAgent.IE) {
    styleSheet = dh.getDocument().createStyleSheet();
  } else {
    var head = dh.$$('head')[0];

    // In opera documents are not guaranteed to have a head element, thus we
    // have to make sure one exists before using it.
    if (!head) {
      var body = dh.$$('body')[0];
      head = dh.createDom('head');
      body.parentNode.insertBefore(head, body);
    }
    styleSheet = dh.createDom('style');
    dh.appendChild(head, styleSheet);
  }

  goog.style.setStyles(styleSheet, stylesString);
  return styleSheet;
};

/**
 * Sets the content of a style element.  The style element can be any valid
 * style element.  This element will have its content completely replaced by
 * the new stylesString.
 * @param {Element} element A stylesheet element as returned by installStyles
 * @param {String} stylesString The new content of the stylesheet
 */
goog.style.setStyles = function(element, stylesString) {
  if (goog.userAgent.IE) {
    // Adding the selectors individually caused the browser to hang if the
    // selector was invalid or there were CSS comments.  Setting the cssText of
    // the style node works fine and ignores CSS that IE doesn't understand
    element.cssText = stylesString;
  } else {
    var propToSet = goog.userAgent.SAFARI ? 'innerText' : 'innerHTML';
    element[propToSet] = stylesString;
  }
};

/**
 * Sets the opacity of a node (x-browser)
 * @param {Element} el Elements
 * @param {Number} alpha Opacity between 0 and 1
 */
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if ('opacity' in style) {
    style.opacity = alpha;
  } else if ('MozOpacity' in style) {
    style.MozOpacity = alpha;
  } else if ('KhtmlOpacity' in style) {
    style.KhtmlOpacity = alpha
  } else if ('filter' in style) {
    // TODO(arv): Overwriting the filter might have undesired side effects.
    style.filter = 'alpha(opacity=' + (alpha * 100) + ')';
  }
};

/**
 * Returns a Coordinate object relative to the top-left of the HTML document.
 * Implemented as a single function to save having to do two recursive loops in
 * opera and safari just to get both coordinates.  If you just want one value do
 * use goog.style.getPageOffsetLeft() and goog.style.getPageOffsetTop(), but
 * note if you call both those methods the tree will be analysed twice.
 *
 * Note: this is based on Yahoo's getXY method, which is
 * Copyright (c) 2006, Yahoo! Inc.
 * All rights reserved.
 * 
 * Redistribution and use of this software in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above
 *   copyright notice, this list of conditions and the
 *   following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above
 *   copyright notice, this list of conditions and the
 *   following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 * 
 * * Neither the name of Yahoo! Inc. nor the names of its
 *   contributors may be used to endorse or promote products
 *   derived from this software without specific prior
 *   written permission of Yahoo! Inc.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @param {Element} el Element to get the page offset for
 * @return {goog.math.Coordinate}
 */
goog.style.getPageOffset = function(el) {
  var doc = goog.dom.getOwnerDocument(el);

  // Gecko browsers normally use getBoxObjectFor to calculate the position.
  // When invoked for an element with an implicit absolute position though it
  // can be off by one. Therefor the recursive implementation is used in those
  // (relatively rare) cases.
  var BUGGY_GECKO_BOX_OBJECT = goog.userAgent.GECKO && doc.getBoxObjectFor &&
      goog.style.getStyle_(el, 'position') == 'absolute' &&
      (el.style.top == '' || el.style.left == '');

  if (typeof goog.style.BUGGY_CAMINO_ == 'undefined') {
    /**
     * Camino versions up to 1.0.4 (which is navigator.version 1.8.0.10) return
     * an invalid y-coordinate for the viewport element from calls to
     * document.getBoxObjectFor. See:
     * https://bugzilla.mozilla.org/show_bug.cgi?id=350018
     *
     * Constant defined out of global scope to eliminate runtime dependency.
     * @type {Boolean}
     * @private
     */
    goog.style.BUGGY_CAMINO_ = goog.userAgent.CAMINO &&
                               !goog.userAgent.isVersion('1.8.0.11');
  }

  // NOTE: If element is hidden (display none or disconnected or any the
  // ancestors are hidden) we get (0,0) by default but we still do the
  // accumulation of scroll position.

  // TODO: Should we check if the node is disconnected and in that case
  //       return (0,0)?

  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if (el == viewportElement) {
    // viewport is always at 0,0 as that defined the coordinate system for this
    // function - this avoids special case checks in the code below
    return pos;
  }

  var parent = null;
  var box;

  if (el.getBoundingClientRect) { // IE
    box = el.getBoundingClientRect();
    var scrollTop = viewportElement.scrollTop;
    var scrollLeft = viewportElement.scrollLeft;

    pos.x = box.left + scrollLeft;
    pos.y = box.top + scrollTop;

  } else if (doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT &&
      !goog.style.BUGGY_CAMINO_) { // gecko
    // Gecko ignores the scroll values for ancestors, up to 1.9.  See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=328881 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=330619

    box = doc.getBoxObjectFor(el);
    var vpBox = doc.getBoxObjectFor(viewportElement);
    pos.x = box.screenX - vpBox.screenX;
    pos.y = box.screenY - vpBox.screenY;

  } else { // safari/opera
    pos.x = el.offsetLeft;
    pos.y = el.offsetTop;
    parent = el.offsetParent;
    if (parent != el) {
      while (parent) {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        parent = parent.offsetParent;
      }
    }

    // opera & (safari absolute) incorrectly account for body offsetTop
    if (goog.userAgent.OPERA || (goog.userAgent.SAFARI &&
        goog.style.getStyle_(el, 'position') == 'absolute')) {
      pos.y -= doc.body.offsetTop;
    }

    // accumulate the scroll positions for everything but the body element
    parent = el.offsetParent;
    while (parent && parent != doc.body) {
      pos.x -= parent.scrollLeft;
      // see https://bugs.opera.com/show_bug.cgi?id=249965
      if (!goog.userAgent.OPERA || parent.tagName != 'TR') {
        pos.y -= parent.scrollTop;
      }
      parent = parent.offsetParent;
    }
  }

  return pos;
};

/**
 * Sets 'white-space: pre-wrap' for a node (x-browser).
 *
 * There are as many ways of specifying pre-wrap as there are browsers.
 *
 * CSS3:    white-space: pre-wrap;
 * Mozilla: white-space: -moz-pre-wrap;
 * Opera:   white-space: -o-pre-wrap;
 * IE6/7:   white-space: pre; word-wrap: break-word;
 *
 * @param {Element} el Element to enable pre-wrap for.
 */
goog.style.setPreWrap = function(el) {
  if (goog.userAgent.IE) {
    el.style.whiteSpace = 'pre';
    el.style.wordWrap = 'break-word';
  } else if (goog.userAgent.GECKO) {
    el.style.whiteSpace = '-moz-pre-wrap';
  } else if (goog.userAgent.OPERA) {
    el.style.whiteSpace = '-o-pre-wrap';
  } else  {
    el.style.whiteSpace = 'pre-wrap';
  }
};

/**
 * Returns the position of an element relative to another element in the
 * document.  A relative to B
 * @param {Element|Event} a Element or mouse event who's position we're
 *     calculating
 * @param {Element|Event} b Element or mouse event position is relative to
 * @return {goog.math.Coordinate}
 */
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y);
};

/**
 * Sets the background of an element to a transparent image in a browser-
 * independent manner.
 *
 * This function does not support repeating backgrounds or alternate background
 * positions to match the behavior of Internet Explorer. It also does not
 * support sizingMethods other than crop since they cannot be replicated in
 * browsers other than Internet Explorer.
 *
 * @param {Element} el
 * @param {String} src The image source URL
 */
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if ('filter' in style) {
    // See TODO in setOpacity.
    style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(' +
        'src="' + src + '", sizingMethod="crop")';
  } else {
    // Set style properties individually instead of using background shorthand
    // to prevent overwriting a pre-existing background color.
    style.backgroundImage = 'url(' + src + ')';
    style.backgroundPosition = 'top left';
    style.backgroundRepeat = 'no-repeat';
  }
};
