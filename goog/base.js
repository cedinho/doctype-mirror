// Copyright (c) 2007-2008, Google
// All rights reserved.
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
 * Base namespace for library.  Checks to see goog is already defined in the
 * current scope before assigning to prevent clobbering if base.js is loaded
 * more than once.
 */
var goog = goog || {}; // Check to see if already defined in current scope


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;

/**
 * Enum of types compatable with typeof.
 * @enum {String}
 * @private
 */
goog.JsType_ = {
  UNDEFINED: 'undefined',
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  FUNCTION: 'function',
  OBJECT: 'object'
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is defined
 */
goog.isDef = function(val) {
  return typeof val != goog.JsType_.UNDEFINED;
};

/**
 * Returns true if the specified value is |null|
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is null
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is defined and not null
 */
goog.isDefAndNotNull = function(val) {
  return goog.isDef(val) && !goog.isNull(val);
};


/**
 * Returns true if the specified value is an array
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is an array
 */
goog.isArray = function(val) {
  // we cannot us constructor == Array or instanceof Array because different
  // frames have different Array objects.
  return val instanceof Array || goog.isObject(val) &&
      // in IE6, if the iframe where the array was created is destroyed, the
      // array loses its prorotype. Then dereferencing val.join here throws an
      // exception, so we can't use goog.isFunction. Calling typeof directly
      // returns 'unknown' so that will work. In this case, this function will
      // return false and most array functions will still work because the array
      // is still array-like (supports length and []) even though it has lost
      // its prototype
      typeof val.join == goog.JsType_.FUNCTION &&
      typeof val.reverse == goog.JsType_.FUNCTION;
};


/**
 * Returns true if the object looks like an array. T o qualify as array like
 * the value needs to be an object and have a Number length property
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is an array
 */
goog.isArrayLike = function(val) {
  // do not use isNumber here because it might raise a strict warning
  return goog.isObject(val) && typeof val.length == goog.JsType_.NUMBER;
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is a like a Date
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && goog.isFunction(val.getFullYear);
};


/**
 * Returns true if the specified value is a string
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is a string
 */
goog.isString = function(val) {
  return typeof val == goog.JsType_.STRING;
};


/**
 * Returns true if the specified value is a boolean
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is boolean
 */
goog.isBoolean = function(val) {
  return typeof val == goog.JsType_.BOOLEAN;
};


/**
 * Returns true if the specified value is a number
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is a number
 */
goog.isNumber = function(val) {
  return typeof val == goog.JsType_.NUMBER;
};


/**
 * Returns true if the specified value is a function
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is a function
 */
goog.isFunction = function(val) {
  // IE in cross-window calls does not correctly marshal the
  // function type (it appears just as an object) so we cannot use
  // just typeof val == goog.JsType_.FUNCTION. However, if the object
  // has a call property, it is a function.
  return typeof val == goog.JsType_.FUNCTION || !!(val && val.call);
};


/**
 * Returns true if the specified value is an object
 * @param {Object} val Variable to test
 * @return {Boolean} Whether variable is an object
 */
goog.isObject = function(val) {
  // NOTE(arv): We need the first half to be of type Boolean
  return val != null && typeof val == goog.JsType_.OBJECT;
};
