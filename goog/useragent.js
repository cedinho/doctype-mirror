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

goog.userAgent = goog.userAgent || {};

/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;

(function() {
  var isOpera = false;
  var isIe = false;
  var isSafari = false;
  var isGecko = false;
  var isCamino = false;
  var isKonqueror = false;
  var isKhtml = false;
  var isMac = false;
  var isWindows = false;
  var isLinux = false;
  var platform = '';

  if (goog.global['navigator']) {
    var ua = navigator.userAgent;

    // Browser
    isOpera = typeof opera != 'undefined';
    isIe = !isOpera && ua.indexOf('MSIE') != -1;
    isSafari = !isOpera && ua.indexOf('WebKit') != -1;
    // Safari also gives navigator.product string equal to 'Gecko'.
    isGecko = !isOpera && navigator.product == 'Gecko' && !isSafari;
    isCamino = isGecko && navigator.vendor == 'Camino';
    isKonqueror = !isOpera && ua.indexOf('Konqueror') != -1;
    isKhtml = isKonqueror || isSafari;

    // Version
    // All browser have different ways to detect the version and they all have
    // different naming schemes
    // version is a string because it may contain 'b', 'a' and so on
    var version, re;
    if (isOpera) {
      version = opera.version();
    } else {
      if (isGecko) {
        re = /rv\:([^\);]+)(\)|;)/;
      } else if (isIe) {
        re = /MSIE\s+([^\);]+)(\)|;)/;
      } else if (isSafari) {
        // WebKit/125.4
        re = /WebKit\/(\S+)/;
      } else if (isKonqueror) {
        // Konqueror/3.1;
        re = /Konqueror\/([^\);]+)(\)|;)/;
      }
      if (re) {
        re.test(ua);
        version = RegExp.$1;
      }
    }

    // Platform
    platform = navigator.platform;
    isMac = platform.indexOf('Mac') != -1;
    isWindows = platform.indexOf('Win') != -1;
    isLinux = platform.indexOf('Linux') != -1;
  }


  /**
   * Whether the user agent is Opera.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.OPERA = isOpera;


  /**
   * Whether the user agent is Internet Explorer. This includes other browsers
   * using Trident as its rendering engine. For example AOL and Netscape 8
   * @public
   * @type {Boolean}
   */
  goog.userAgent.IE = isIe;


  /**
   * Whether the user agent is Gecko. Gecko is the rendering engine used by
   * Mozilla, Mozilla Firefox, Camino and many more.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.GECKO = isGecko;


  /**
   * Whether the user agent is Camino.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.CAMINO = isCamino;


  /**
   * Whether the user agent is Konqueror. If this is true then KHTML is also
   * true. KHTML is the rendering engine that Konqueror and Safari uses.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.KONQUEROR = isKonqueror;


  /**
   * Whether the user agent is Safari. If this is true then KHTML is also
   * true. KHTML is the rendering engine that Konqueror and Safari uses.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.SAFARI = isSafari;


  /**
   * Whether the user agent is using KHTML as its rendering engine.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.KHTML = isKhtml;


  /**
   * The version of the user agent. This is a string because it might contain
   * 'b' (as in beta) as well as multiple dots.
   * @public
   * @type {String}
   */
  goog.userAgent.VERSION = version;


  /**
   * The platform (operating system) the user agent is running on.
   * @public
   * @type {String}
   */
  goog.userAgent.PLATFORM = platform;


  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.MAC = isMac;


  /**
   * Whether the user agent is running on a Windows operating system.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.WINDOWS = isWindows;


  /**
   * Whether the user agent is running on a Linux operating system.
   * @public
   * @type {Boolean}
   */
  goog.userAgent.LINUX = isLinux;

})();


/**
 * Compares two version numbers
 *
 * @param {String} v1 Version of first item
 * @param {String} v2 Version of second item
 *
 * @returns {Number}  1 if first argument is higher
 *                    0 if arguments are equal
 *                   -1 if second argument is higher
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Whether the user agent version is higher or the same as the given version.
 * @param {String} version The version to check
 * @return {Boolean}
 */
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.compare(goog.userAgent.VERSION, version) >= 0;
};

(function() {
  /**
   * Derived from Apple's suggested sniffer.
   * @param {String} desc e.g. Shockwave Flash 7.0 r61
   * @return {String} 7.0.61
   */
  function getFlashVersion(desc) {
    var matches = desc.match(/[\d]+/g);
    matches.length = 3;  // To standardize IE vs FF
    return matches.join('.');
  }

  var hasFlash = false;
  var flashVersion = '';

  if (navigator.plugins && navigator.plugins.length) {
    var plugin = navigator.plugins['Shockwave Flash'];
    if (plugin) {
      hasFlash = true;
      if (plugin.description) {
        flashVersion = getFlashVersion(plugin.description);
      }
    }

    if (navigator.plugins['Shockwave Flash 2.0']) {
      hasFlash = true;
      flashVersion = '2.0.0.11';
    }

  } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
    var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
    hasFlash = mimeType && mimeType.enabledPlugin;
    if (hasFlash) {
      flashVersion = getFlashVersion(mimeType.enabledPlugin.description);
    }

  } else {
    try {
      // Try 7 first, since we know we can use GetVariable with it
      var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
      hasFlash = true;
      flashVersion = getFlashVersion(ax.GetVariable('$version'));
    } catch (e) {
      // Try 6 next, some versions are known to crash with GetVariable calls
      try {
        var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
        hasFlash = true;
        flashVersion = '6.0.21';  // First public version of Flash 6
      } catch (e) {
        try {
          // Try the default activeX
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          hasFlash = true;
          flashVersion = getFlashVersion(ax.GetVariable('$version'));
        } catch (e) {
          // No flash
        }
      }
    }
  }

  goog.userAgent.flash = goog.userAgent.flash || {};

  /**
   * Whether we can detect that the browser has flash
   * @type Boolean
   */
  goog.userAgent.flash.HAS_FLASH = hasFlash;


  /**
   * Full version information of flash installed, in form 7.0.61
   * @type String
   */
  goog.userAgent.flash.VERSION = flashVersion;

})();


/**
 * Whether the installed flash version is as new or newer than a given version.
 * @param {String} version The version to check.
 * @return {Boolean}
 */
goog.userAgent.flash.isVersion = function(version) {
  return goog.userAgent.compare(goog.userAgent.flash.VERSION, version) >= 0;
};
