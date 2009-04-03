// Copyright 2005 Google Inc.
// All Rights Reserved.
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
 * @fileoverview A class that can be used to listen to font size changes.
 */

goog.provide('goog.dom.FontSizeMonitor');
goog.provide('goog.dom.FontSizeMonitor.EventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.userAgent');





/**
 * This class can be used to monitor changes in font size.  Instances will
 * dispatch a {@code goog.dom.FontSizeMonitor.EventType.CHANGE} event.
 * Example usage:
 * <pre>
 * var fms = new goog.dom.FontSizeMonitor();
 * goog.events.listen(fms, goog.dom.FontSizeMonitor.EventType.CHANGE,
 *     function(e) {
 *       alert('Font size was changed');
 *     });
 * </pre>
 * @param {goog.dom.DomHelper} opt_domHelper DOM helper object that is used to
 *     determine where to insert the DOM nodes used to determine when the font
 *     size changes.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.dom.FontSizeMonitor = function(opt_domHelper) {
  goog.events.EventTarget.call(this);

  var dom = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Offscreen iframe which we use to detect resize events.
   * @type {Element}
   * @private
   */
  this.sizeElement_ = dom.createDom(
      // The size of the iframe is expressed in em, which are font size relative
      // which will cause the iframe to be resized when the font size changes.
      // The actual values are not relevant as long as we can ensure that the
      // iframe has a non zero size and is completely off screen.
      goog.userAgent.IE ? 'div' : 'iframe',
      {'style': 'position:absolute;width:9em;height:9em;top:-99em'});
  var p = dom.getDocument().body;
  p.insertBefore(this.sizeElement_, p.firstChild);

  var resizeTarget = this.getResizeTarget_();

  // We need to open and close the document to get Firefox 2 to work.  We must
  // not do this for IE in case we are using HTTPS since accessing the document
  // on an about:blank iframe in IE using HTTPS raises a Permission Denied
  // error. Additionally, firefox shows this frame in tab order by default,
  // suppress it by using a tabindex of -1.
  if (goog.userAgent.GECKO) {
    this.sizeElement_.tabIndex = -1;
    var doc = resizeTarget.document;
    doc.open();
    doc.close();
  }

  // Listen to resize event on the window inside the iframe.
  goog.events.listen(resizeTarget, goog.events.EventType.RESIZE,
                     this.handleResize_, false, this);

  /**
   * Last measured width of the iframe element.
   * @type {number}
   * @private
   */
  this.lastWidth_ = this.sizeElement_.offsetWidth;
};
goog.inherits(goog.dom.FontSizeMonitor, goog.events.EventTarget);


/**
 * The event types that the FontSizeMonitor fires.
 * @enum {string}
 */
goog.dom.FontSizeMonitor.EventType = {
  CHANGE: 'fontsizechange'
};


/**
 * Constant for the change event.
 * @type {string}
 * @deprecated Use {@code goog.dom.FontSizeMonitor.EventType.CHANGE} instead.
 */
goog.dom.FontSizeMonitor.CHANGE_EVENT =
    goog.dom.FontSizeMonitor.EventType.CHANGE;


/**
 * @return {Element|Window} The object that we listen to resize events on.
 * @private
 */
goog.dom.FontSizeMonitor.prototype.getResizeTarget_ = function() {
  if (goog.userAgent.IE) {
    return this.sizeElement_;
  } else {
    return goog.dom.getFrameContentWindow(
        /** @type {HTMLIFrameElement} */ (this.sizeElement_));
  }
};


/**
 * Disposes of the font size monitor.
 */
goog.dom.FontSizeMonitor.prototype.disposeInternal = function() {
  goog.dom.FontSizeMonitor.superClass_.disposeInternal.call(this);

  var resizeTarget = this.getResizeTarget_();
  goog.events.unlisten(resizeTarget, goog.events.EventType.RESIZE,
                       this.handleResize_, false, this);
  // Firefox 2 crashes if the iframe is removed during the unload phase.
  if (!goog.userAgent.GECKO || goog.userAgent.isVersion('1.9')) {
    goog.dom.removeNode(this.sizeElement_);
  }
  delete this.sizeElement_;
};


/**
 * Handles the onresize event of the iframe and dispatches a change event in
 * case its size really changed.
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
goog.dom.FontSizeMonitor.prototype.handleResize_ = function(e) {
  // Only dispatch the event if the size really changed.  Some newer browsers do
  // not really change the font-size,  instead they zoom the whole page.  This
  // does trigger window resize events on the iframe but the logical pixel size
  // remains the same (the device pixel size changes but that is irrelevant).
  var currentWidth = this.sizeElement_.offsetWidth;
  if (this.lastWidth_ != currentWidth) {
    this.lastWidth_ = currentWidth;
    this.dispatchEvent(goog.dom.FontSizeMonitor.EventType.CHANGE);
  }
};
