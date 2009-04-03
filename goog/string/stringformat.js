// Copyright 2008 Google Inc.  All Rights Reserved.
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
 * @fileoverview Implementation of sprintf-like, python-%-operator-like,
 * .NET-String.Format-like functionality. Uses JS string's replace method to
 * extract format specifiers and sends those specifiers to a handler function,
 * which then, based on conversion type part of the specifier, calls the
 * appropriate function to handle the specific conversion.
 * For specific functionality implemented, look at formatRe below, or look
 * at the tests.
 */

goog.provide('goog.string.format');

goog.require('goog.string');


/**
 * Performs sprintf-like conversion, ie. puts the values in a template.
 * DO NOT use it instead of built-in conversions in simple cases such as
 * 'Cost: %.2f' as it would introduce unneccessary latency oposed to
 * 'Cost: ' + cost.toFixed(2).
 * @param {string} formatString Template string containing % specifiers.
 * @param {string|number} var_args Values formatString is to be filled with.
 * @return {string} Formatted string.
 */
goog.string.format = function(formatString, var_args) {

  // Convert the arguments to an array (MDC recommended way).
  var args = Array.prototype.slice.call(arguments);

  // Try to get the template.
  var template = args.shift();
  if (typeof template == 'undefined') {
    throw Error('[goog.string.format] Template required');
  }

  // This re is used for matching, it also defines what is supported.
  var formatRe = /%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g;

  /**
   * Chooses which conversion function to call based on type conversion
   * specifier.
   * @param {string} match Contains the re matched string.
   * @param {string} flags Formatting flags.
   * @param {string} width Replacement string minimum width.
   * @param {string} dotp Matched precision including a dot.
   * @param {string} precision Specifies floating point precision.
   * @param {string} type Type conversion specifier.
   * @param {string} offset Matching location in the original string.
   * @param {string} wholeString Has the actualString being searched.
   * @return {string} Formatted parameter.
   */
  function replacerDemuxer(match,
                           flags,
                           width,
                           dotp,
                           precision,
                           type,
                           offset,
                           wholeString) {

    // The % is too simple and doesn't take an argument.
    if (type == '%') {
      return '%';
    }

    // Try to get the actual value from parent function.
    var value = args.shift();

    // If we didn't get any arguments, fail.
    if (typeof value == 'undefined') {
      throw Error('[goog.string.format] Not enough arguments');
    }

    // Patch the value argument to the beginning of our type specific call.
    arguments[0] = value;

    return goog.string.format.demuxes_[type].apply(null, arguments);

  }

  return template.replace(formatRe, replacerDemuxer);
};


/**
 * Contains various conversion functions (to be filled in later on).
 * @type {Object}
 * @private
 */
goog.string.format.demuxes_ = {};


/**
 * Processes %s conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['s'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {
  var replacement = value;
  // If no padding is necessary we're done.
  if (isNaN(width) || replacement.length >= width) {
    return replacement;
  }

  // Otherwise we should find out where to put spaces.
  if (flags.indexOf('-', 0) > -1) {
    replacement =
        replacement + goog.string.repeat(' ', width - replacement.length);
  } else {
    replacement =
        goog.string.repeat(' ', width - replacement.length) + replacement;
  }
  return replacement;
};


/**
 * Processes %f conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['f'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {

  var replacement = value.toString();

  if (!(isNaN(precision) || precision == '')) {
    replacement = value.toFixed(precision);
  }

  // Generates sign string that will be attached to the replacement.
  var sign;
  if (value < 0) {
    sign = '-';
  } else if (flags.indexOf('+') >= 0) {
    sign = '+';
  } else if (flags.indexOf(' ') >= 0) {
    sign = ' ';
  } else {
    sign = '';
  }

  if (value >= 0) {
    replacement = sign + replacement;
  }

  // If no padding is neccessary we're done.
  if (isNaN(width) || replacement.length >= width) {
    return replacement;
  }

  // We need a clean signless replacement to start with
  replacement = isNaN(precision) ?
      Math.abs(value).toString() :
      Math.abs(value).toFixed(precision);

  var padCount = width - replacement.length - sign.length;

  // Find out which side to pad, and if it's left side, then which character to
  // pad, and set the sign on the left and padding in the middle.
  if (flags.indexOf('-', 0) >= 0) {
    replacement = sign + replacement + goog.string.repeat(' ', padCount);
  } else {
    // Decides which character to pad.
    var paddingChar = (flags.indexOf('0', 0) >= 0) ? '0' : ' ';
    replacement =
        sign + goog.string.repeat(paddingChar, padCount) + replacement;
  }

  return replacement;
};


/**
 * Processes %d conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['d'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {

  value = parseInt(value, 10);
  precision = 0;

  return goog.string.format.demuxes_['f'](value, flags, width, dotp, precision,
                                          type, offset, wholeString);
};


// These are additional aliases, for integer conversion.
goog.string.format.demuxes_['i'] = goog.string.format.demuxes_['d'];
goog.string.format.demuxes_['u'] = goog.string.format.demuxes_['d'];

