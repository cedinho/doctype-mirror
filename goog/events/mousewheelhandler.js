// Copyright 2006 Google Inc.
// All Rights Reserved
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
 * @fileoverview This event wrapper will dispatch an event when the user uses
 * the mouse wheel to scroll an element. You can get the direction by checking
 * the details property of the event.
 *
 */

goog.provide('goog.events.MouseWheelEvent');
goog.provide('goog.events.MouseWheelEvent.AxisType');
goog.provide('goog.events.MouseWheelHandler');
goog.provide('goog.events.MouseWheelHandler.EventType');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.userAgent');


/**
 * This event handler allows you to catch mouse wheel events in a consistent
 * manner.
 * @param {Element|Document} element  The element to listen to the mouse wheel
 *     event on.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.MouseWheelHandler = function(element) {
  goog.events.EventTarget.call(this);

  /**
   * This is the element that we will listen to the real mouse wheel events on.
   * @type {Element|Document}
   * @private
   */
  this.element_ = element;

  var type = goog.userAgent.GECKO ? 'DOMMouseScroll' : 'mousewheel';
  this.listenKey_ = goog.events.listen(this.element_, type, this);
};
goog.inherits(goog.events.MouseWheelHandler, goog.events.EventTarget);


/**
 * Enum type for the events fired by the mouse wheel handler.
 * @enum {string}
 */
goog.events.MouseWheelHandler.EventType = {
  MOUSEWHEEL: 'mousewheel'
};


/**
 * The key returned from the goog.events.listen.
 * @type {string}
 * @private
 */
goog.events.MouseWheelHandler.prototype.listenKey_;


/**
 * Handles the events on the element.
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 */
goog.events.MouseWheelHandler.prototype.handleEvent = function(e) {
  var detail = 0;
  var be = e.getBrowserEvent();
  var axis = goog.events.MouseWheelEvent.AxisType.VERTICAL;
  if (be.type == 'mousewheel') {
    // in IE we get a multiple of 120
    // Moz returns multiple of 3 (representing the number of lines scrolled)
    detail = - be.wheelDelta / 40;

    // Browser vendors suck
    if (goog.userAgent.WEBKIT) {
      if (!goog.userAgent.isVersion('530.4')) {
        // https://bugs.webkit.org/show_bug.cgi?id=24368
        detail /= 3; // 3 times larger, see bug.
      }

      // Webkit uses wheelDeltaX and wheelDeltaY to indicate the direction
      // of scroll.
      if (be.wheelDeltaX) {
        axis = goog.events.MouseWheelEvent.AxisType.HORIZONTAL;
      }
    }
    // Historical note: Opera (pre 9.5) used to negate the detail value.
  } else {
    detail = be.detail;
  }

  // Firefox 3.1 adds an axis field to the event to indicate direction of
  // scroll.  See https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
  if (typeof be.axis != 'undefined' &&
      typeof be.HORIZONTAL_AXIS != 'undefined' &&
      be.axis == be.HORIZONTAL_AXIS) {
    axis = goog.events.MouseWheelEvent.AxisType.HORIZONTAL;
  }

  // Gecko sometimes returns really big values if the user changes settings to
  // scroll a whole page per scroll
  if (detail > 100) {
    detail = 3;
  } else if (detail < -100) {
    detail = -3;
  }

  var newEvent = new goog.events.MouseWheelEvent(detail, be, axis);
  try {
    this.dispatchEvent(newEvent);
  } finally {
    newEvent.dispose();
  }
};


/**
 * Stops listening to the underlying mouse wheel event, and cleans up state.
 */
goog.events.MouseWheelHandler.prototype.disposeInternal = function() {
  goog.events.MouseWheelHandler.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKey_);
  delete this.listenKey_;
};


/**
 * A base class for mouse wheel events. This is used with the
 * MouseWheelHandler.
 *
 * @param {number} detail The number of rows the user scrolled.
 * @param {Event} browserEvent Browser event object.
 * @param {goog.events.MouseWheelEvent.AxisType} opt_axis Axis of scroll.
 *     Vertical by default.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
goog.events.MouseWheelEvent = function(detail, browserEvent, opt_axis) {
  goog.events.BrowserEvent.call(this, browserEvent);

  this.type = goog.events.MouseWheelHandler.EventType.MOUSEWHEEL;

  /**
   * The axis that the user scrolled along. Vertical by default. Note that not
   * all browsers provide enough information to distinguish horizontal and
   * vertical scroll events, so for these unsupported browsers axis will be set
   * to vertical even if the user scrolled their mouse wheel sideways.
   *
   * Currently supported browsers are Webkit and Firefox 3.1 or later.
   *
   * @type {goog.events.MouseWheelEvent.AxisType}
   */
  this.axis = opt_axis || goog.events.MouseWheelEvent.AxisType.VERTICAL;

  /**
   * The number of lines the user scrolled
   * @type {number}
   */
  this.detail = detail;
};
goog.inherits(goog.events.MouseWheelEvent, goog.events.BrowserEvent);


/**
 * Enum type for the axis of the scroll.
 * @enum {string}
 */
goog.events.MouseWheelEvent.AxisType = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};
