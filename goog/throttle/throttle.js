// Copyright 2007 Google Inc.
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
 * @fileoverview Definition of the goog.util.Throttle class.
 *
 */

goog.provide('goog.Throttle');

goog.require('goog.Disposable');
goog.require('goog.Timer');

/**
 * Throttle will perform an action that is passed in no more than once
 * per interval (specified in milliseconds). If it gets multiple signals
 * to perform the action while it is waiting, it will only perform the action
 * once at the end of the interval.
 * @param {Function} listener Function to callback when the action is triggered.
 * @param {number} interval Interval over which to throttle. The handler can
 *     only be called once per interval.
 * @param {Object} opt_handler Object in who's scope to call the listener.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.Throttle = function(listener, interval, opt_handler) {
  goog.Disposable.call(this);

  /**
   * Function to callback
   * @type {Function}
   * @private
   */
  this.listener_ = listener;

  /**
   * Interval for the throttle time
   * @type {number}
   * @private
   */
  this.interval_ = interval;

  /**
   * "this" context for the listener
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;

  /**
   * Cached callback function invoked after the throttle timeout completes
   * @type {Function}
   * @private
   */
  this.callback_ = goog.bind(this.onTimer_, this);
};
goog.inherits(goog.Throttle, goog.Disposable);


/**
 * Indicates that the action is pending and needs to be fired.
 * @type {boolean}
 * @private
 */
goog.Throttle.prototype.shouldFire_ = false;


/**
 * Indicates the count of nested pauses currently in effect on the throttle.
 * When this count is not zero, fired actions will be postponed until the
 * throttle is resumed enough times to drop the pause count to zero.
 * @type {number}
 * @private
 */
goog.Throttle.prototype.pauseCount_ = 0;


/**
 * Timer for scheduling the next callback
 * @type {number?}
 * @private
 */
goog.Throttle.prototype.timer_ = null;


/**
 * Notifies the throttle that the action has happened. It will throttle the call
 * so that the callback is not called too often according to the interval
 * parameter passed to the constructor.
 */
goog.Throttle.prototype.fire = function() {
  if (!this.timer_ && !this.pauseCount_) {
    this.doAction_();
  } else {
    this.shouldFire_ = true;
  }
};


/**
 * Cancels any pending action callback. The throttle can be restarted by
 * calling {@link #fire}.
 */
goog.Throttle.prototype.stop = function() {
  if (this.timer_) {
    goog.Timer.clear(this.timer_);
    this.timer_ = null;
    this.shouldFire_ = false;
  }
};


/**
 * Pauses the throttle.  All pending and future action callbacks will be
 * delayed until the throttle is resumed.  Pauses can be nested.
 */
goog.Throttle.prototype.pause = function() {
  this.pauseCount_++;
};


/**
 * Resumes the throttle.  If doing so drops the pausing count to zero, pending
 * action callbacks will be executed as soon as possible, but still no sooner
 * than an interval's delay after the previous call.  Future action callbacks
 * will be executed as normal.
 */
goog.Throttle.prototype.resume = function() {
  this.pauseCount_--;
  if (!this.pauseCount_ && this.shouldFire_ && !this.timer_) {
    this.shouldFire_ = false;
    this.doAction_();
  }
};


/** {@inheritDoc} */
goog.Throttle.prototype.disposeInternal = function() {
  goog.Throttle.superClass_.disposeInternal.call(this);
  this.stop();
};


/**
 * Handler for the timer to fire the throttle
 * @private
 */
goog.Throttle.prototype.onTimer_ = function() {
  this.timer_ = null;

  if (this.shouldFire_ && !this.pauseCount_) {
    this.shouldFire_ = false;
    this.doAction_();
  }
};


/**
 * Calls the callback
 * @private
 */
goog.Throttle.prototype.doAction_ = function() {
  this.timer_ = goog.Timer.callOnce(this.callback_, this.interval_);
  this.listener_.call(this.handler_);
};
