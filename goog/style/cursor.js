// Copyright 2005 Google Inc. All Rights Reserved.
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
 * @fileoverview Functions to create special cursor styles, like "draggable"
 * (open hand) or "dragging" (closed hand).
 *
 * @author btaylor@google.com (Bret Taylor) Original implementation in webmaps.
 * @author dgajda@google.com (Damian Gajda) Ported to closure.
 */

goog.provide('goog.style.cursor');

goog.require('goog.userAgent');

/**
 * The file name for the open-hand (draggable) cursor.
 * @type {string}
 */
goog.style.cursor.OPENHAND_FILE = 'openhand.cur';


/**
 * The file name for the close-hand (dragging) cursor.
 * @type {string}
 */
goog.style.cursor.CLOSEDHAND_FILE = 'closedhand.cur';


/**
 * Create the style for the draggable cursor based on browser and OS.
 * The value can be extended to be '!important' if needed.
 *
 * @param {string} absoluteDotCurFilePath The absolute base path of
 *     'openhand.cur' file to be used if the browser supports it.
 * @param {boolean} opt_important Whether to use the '!important' CSS
 *     modifier.
 * @return {string} The "draggable" mouse cursor style value.
 */
goog.style.cursor.getDraggableCursorStyle = function(
    absoluteDotCurFilePath, opt_important) {
  return goog.style.cursor.getCursorStyle_(
      '-moz-grab',
      absoluteDotCurFilePath + goog.style.cursor.OPENHAND_FILE,
      'default',
      opt_important);
};


/**
 * Create the style for the dragging cursor based on browser and OS.
 * The value can be extended to be '!important' if needed.
 *
 * @param {string} absoluteDotCurFilePath The absolute base path of
 *     'closedhand.cur' file to be used if the browser supports it.
 * @param {boolean} opt_important Whether to use the '!important' CSS
 *     modifier.
 * @return {string} The "dragging" mouse cursor style value.
 */
goog.style.cursor.getDraggingCursorStyle = function(
    absoluteDotCurFilePath, opt_important) {
  return goog.style.cursor.getCursorStyle_(
      '-moz-grabbing',
      absoluteDotCurFilePath + goog.style.cursor.CLOSEDHAND_FILE,
      'move',
      opt_important);
};


/**
 * Create the style for the cursor based on browser and OS.
 *
 * @param {string} geckoNonWinBuiltInStyleValue The Gecko on non-Windows OS,
 *     built in cursor style.
 * @param {string} absoluteDotCurFilePath The .cur file absolute file to be
 *     used if the browser supports it.
 * @param {string} defaultStyle The default fallback cursor style.
 * @param {boolean} opt_important Whether to use the '!important' CSS
 *     modifier (not included for FF).
 * @return {string} The computed mouse cursor style value.
 * @private
 */
goog.style.cursor.getCursorStyle_ = function(geckoNonWinBuiltInStyleValue,
    absoluteDotCurFilePath, defaultStyle, opt_important) {
  // Use built in cursors for Gecko on non Windows OS.
  // We prefer our custom cursor, but Firefox Mac and Firefox Linux
  // cannot do custom cursors. They do have a built-in hand, so use it:
  if (goog.userAgent.GECKO && !goog.userAgent.WINDOWS) {
    return geckoNonWinBuiltInStyleValue;
  }

  // Use the custom cursor file.
  var cursorStyleValue = 'url("' + absoluteDotCurFilePath + '")';
  // Change hot-spot for Safari.
  if (goog.userAgent.SAFARI) {
    // Safari seems to ignore the hotspot specified in the .cur file (it uses
    // 0,0 instead).  This causes the cursor to jump as it transitions between
    // openhand and pointer which is especially annoying when trying to hover
    // over the route for draggable routes.  We specify the hotspot here as 7,5
    // in the css - unfortunately ie6 can't understand this and falls back to
    // the builtin cursors so we just do this for safari (but ie DOES correctly
    // use the hotspot specified in the file so this is ok).  The appropriate
    // coordinates were determined by looking at a hex dump and the format
    // description from wikipedia.
    cursorStyleValue += ' 7 5';
  }
  // Add default cursor fallback.
  cursorStyleValue += ', ' + defaultStyle;
  // Force the style. Do not do it for FF on Windows as it breaks the style.
  if (!goog.userAgent.GECKO && opt_important) {
    cursorStyleValue += ' !important';
  }
  return cursorStyleValue;
};

