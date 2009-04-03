// Copyright 2008 Google Inc. All rights reserved.
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
 * @fileoverview Simple utilities for dealing with URI strings.
 *
 * This is intended to be a lightweight alternative to constructing goog.Uri
 * objects.  Whereas goog.Uri adds several kilobytes to the binary regardless
 * of how much of its functionality you use, this is designed to be a set of
 * mostly-independent utilities so that the compiler includes only what is
 * necessary for the task.  Estimated savings of porting is 5k pre-gzip and
 * 1.5k post-gzip.  To ensure the savings remain, future developers should
 * avoid adding new functionality to existing functions, but instead create
 * new ones and factor out shared code.
 *
 * Many of these utilities have limited functionality, tailored to common
 * cases.  The query parameter utilities assume that the parameter keys are
 * already encoded, since most keys are compile-time alphanumeric strings.  The
 * query parameter mutation utilities also do not tolerate fragment identifiers.
 *
 * By design, these functions can be slower than goog.Uri equivalents.
 * Repeated calls to some of functions may be quadratic in behavior for IE,
 * although the effect is somewhat limited given the 2kb limit.
 *
 * One advantage of the limited functionality here is that this approach is
 * less sensitive to differences in URI encodings than goog.Uri, since these
 * functions modify the strings in place, rather than decoding and
 * re-encoding.
 *
 * Uses features of RFC 3986 for parsing/formatting URIs:
 *   http://gbiv.com/protocols/uri/rfc/rfc3986.html
 * Original implementation from google3/javascript by Mike Samuel.
 *
 */

goog.provide('goog.uri.utils');

goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Character codes inlined to avoid object allocations due to charCode.
 * @enum {number}
 * @private
 */
goog.uri.utils.CharCode_ = {
  AMPERSAND: 38,
  EQUAL: 61,
  HASH: 35,
  QUESTION: 63
};


/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {string?} opt_scheme The scheme such as 'http'.
 * @param {string?} opt_userInfo The user name before the '@'.
 * @param {string?} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {string|number|null} opt_port The port number.
 * @param {string?} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {string?} opt_queryData The URI-encoded query data.
 * @param {string?} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo,
    opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];

  if (opt_scheme) {
    out.push(opt_scheme, ':');
  }

  if (opt_domain) {
    out.push('//');

    if (opt_userInfo) {
      out.push(opt_userInfo, '@');
    }

    out.push(opt_domain);

    if (opt_port) {
      out.push(':', opt_port);
    }
  }

  if (opt_path) {
    out.push(opt_path);
  }

  if (opt_queryData) {
    out.push('?', opt_queryData);
  }

  if (opt_fragment) {
    out.push('#', opt_fragment);
  }

  return out.join('');
};


/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * msamuel: I have modified the regular expression slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @private
 */
goog.uri.utils.splitRe_ = new RegExp(
    '^' +
    '(?:' +
      '([^:/?#]+)' +         // scheme
    ':)?' +
    '(?://' +
      '(?:([^/?#]*)@)?' +    // userInfo
      '([^/?#:@]*)' +        // domain
      '(?::([0-9]+))?' +     // port
    ')?' +
    '([^?#]+)?' +            // path
    '(?:\\?([^#]*))?' +      // query
    '(?:#(.*))?' +           // fragment
    '$');


/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
goog.uri.utils.ComponentIndex = {
  SCHEME: 1,
  USER_INFO: 2,
  DOMAIN: 3,
  PORT: 4,
  PATH: 5,
  QUERY_DATA: 6,
  FRAGMENT: 7
};


/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
goog.uri.utils.split = function(uri) {
  return uri.match(goog.uri.utils.splitRe_);
};


/**
 * @param {string?} uri A possibly null string.
 * @return {string?} The string URI-decoded, or null if uri is null.
 * @private
 */
goog.uri.utils.decodeIfPossible_ = function(uri) {
  return uri && decodeURIComponent(uri);
};


/**
 * Gets a URI component by index.
 *
 * It is preferred to use the getPathEncoded() variety of functions ahead,
 * since they are more readable.
 *
 * @param {goog.uri.utils.ComponentIndex} componentIndex The component index.
 * @param {string} uri The URI to examine.
 * @return {string?} The still-encoded component, or null if the component
 *     is not present.
 * @private
 */
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  // Convert undefined, null, and empty string into null.
  return goog.uri.utils.split(uri)[componentIndex] || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The protocol or scheme, or null if none.  Does not
 *     include trailing colons or slashes.
 */
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.SCHEME, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The user name still encoded, or null if none.
 */
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.USER_INFO, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The decoded user info, or null if none.
 */
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getUserInfoEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The domain name still encoded, or null if none.
 */
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.DOMAIN, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The decoded domain, or null if none.
 */
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {number?} The port number, or null if none.
 */
goog.uri.utils.getPort = function(uri) {
  // Coerce to a number.  If the result of getComponentByIndex_ is null or
  // non-numeric, the number coersion yields NaN.  This will then return
  // null for all non-numeric cases (though also zero, which isn't a relevant
  // port number).
  return Number(goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The path still encoded, or null if none. Includes the
 *     leading slash, if any.
 */
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PATH, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The decoded path, or null if none.  Includes the leading
 *     slash, if any.
 */
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The query data still encoded, or null if none.  Does not
 *     include the question mark itself.
 */
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The fragment identifier, or null if none.  Does not
 *     include the hash mark itself.
 */
goog.uri.utils.getFragmentEncoded = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1);
};


/**
 * @param {string} uri The URI to examine.
 * @return {string?} The decoded fragment identifier, or null if none.  Does
 *     not include the hash mark.
 */
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getFragmentEncoded(uri));
};


/**
 * Extracts everything up to the port of the URI.
 * @param {string} uri The URI string.
 * @return {string} Everything up to and including the port.
 */
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(
      pieces[goog.uri.utils.ComponentIndex.SCHEME],
      pieces[goog.uri.utils.ComponentIndex.USER_INFO],
      pieces[goog.uri.utils.ComponentIndex.DOMAIN],
      pieces[goog.uri.utils.ComponentIndex.PORT]);
};


/**
 * Extracts the path of the URL and everything after.
 * @param {string} uri The URI string.
 * @return {string?} The URI, starting at the path and including the query
 *     parameters and fragment identifier.
 */
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null,
      pieces[goog.uri.utils.ComponentIndex.PATH],
      pieces[goog.uri.utils.ComponentIndex.QUERY_DATA],
      pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};


/**
 * Gets the URI with the fragment identifier removed.
 * @param {string} uri The URI to examine.
 * @return {string} Everything preceding the hash mark.
 */
goog.uri.utils.removeFragment = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex);
};


/**
 * Ensures that two URI's have the exact same domain, scheme, and port.
 *
 * Unlike the version in goog.Uri, this checks protocol, and therefore is
 * suitable for checking against the browser's same-origin policy.
 *
 * @param {string} uri1 The first URI.
 * @param {string} uri2 The second URI.
 * @return {boolean} Whether they have the same domain and port.
 */
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] ==
             pieces2[goog.uri.utils.ComponentIndex.DOMAIN] &&
         pieces1[goog.uri.utils.ComponentIndex.SCHEME] ==
             pieces2[goog.uri.utils.ComponentIndex.SCHEME] &&
         pieces1[goog.uri.utils.ComponentIndex.PORT] ==
             pieces2[goog.uri.utils.ComponentIndex.PORT];
};


/**
 * Asserts that there are no fragment identifiers, only in uncompiled mode.
 * @param {string} uri The URI to examine.
 * @private
 */
goog.uri.utils.assertNoFragments_ = function(uri) {
  // NOTE: would use goog.asserts here, but jscompiler doesn't know that
  // indexOf has no side effects.
  if (!COMPILED && uri.indexOf('#') >= 0) {
    throw Error('goog.uri.utils: Framgment identifiers are not supported: [' +
        uri + ']');
  }
};


/**
 * Appends a URI and query data in a string buffer with special preconditions.
 *
 * Internal implementation utility.  This performs no object allocations other
 * than the final concatenation if the compiler aliases the string literals.
 *
 * @param {Array.<string|undefined>} buffer A string buffer.  The first element
 *     must be the base URI.  If the array contains more than one element, the
 *     second element must be an ampersand, and may be overwritten, depending
 *     on the base URI.
 * @return {string} The concatenated URI and query data.
 * @private
 */
goog.uri.utils.appendQueryData_ = function(buffer) {
  goog.uri.utils.assertNoFragments_(buffer[0]);

  if (buffer[1]) {
    // At least one query parameter was added, so we need to check the
    // punctuation mark, which is currently an ampersand.
    var questionIndex = buffer[0].indexOf('?');
    if (questionIndex < 0) {
      // No question mark, so we need a question mark instead of an ampersand.
      buffer[1] = '?';
    } else if (questionIndex == buffer[0].length - 1) {
      // Question mark is the very last character of the existing URI, so don't
      // append an additional delimiter.
      buffer[1] = '';
    }
  }

  return buffer.join('');
};


/**
 * Appends key=value pairs to an array, supporting multi-valued objects.
 * @param {string} key The key prefix.
 * @param {*|Array.<*>} value The value or list of values.  Nothing is appended
 *     if this is null or undefined.
 * @param {Array.<string>} pairs The array to which the 'key=value' strings
 *     should be appended.
 * @private
 */
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if (goog.isArray(value)) {
    // It's an array, so append all elements.  Here, we must convince
    // jscompiler that it is, indeed, an array.
    value = /** @type {Array} */ (value);
    for (var j = 0; j < value.length; j++) {
      pairs.push('&', key, '=', goog.string.urlEncode(value[j]));
    }
  } else if (value != null) {
    // Not null or undefined, so safe to append.
    pairs.push('&', key, '=', goog.string.urlEncode(value));
  }
};


/**
 * Builds a buffer of query data from a sequence of alternating keys and values.
 *
 * @param {Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {Array|Arguments} keysAndValues An array with data
 *     with alternating keys and values.  Keys are assumed to be URI encoded
 *     already.  Values can be any type, or an array, which will be converted
 *     to strings and URI-encoded.  Keys with a null value are dropped.
 * @param {number} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBuffer_ = function(
    buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert((keysAndValues.length - (opt_startIndex || 0)) % 2 == 0,
      'goog.uri.utils: Key/value lists must be even in length.');

  for (var i = opt_startIndex || 0; i < keysAndValues.length; i += 2) {
    goog.uri.utils.appendKeyValuePairs_(
        keysAndValues[i], keysAndValues[i + 1], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a sequence of alternating keys and values.
 *
 * Currently generates "&key=&" for empty args; there is no way to generate
 * "&key&" arguments with no equal sign.
 *
 * @param {Array.<*|Array.<*>>} keysAndValues An array with data
 *     with alternating keys and values.  Keys are assumed to be URI encoded
 *     already.  Values can be any type, or an array, which will be converted
 *     to strings and URI-encoded.  Keys with a null value are dropped.
 * @param {number} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_(
      [], keysAndValues, opt_startIndex);
  buffer[0] = '';
  return buffer.join('');
};


/**
 * Builds a buffer of query data from a map.
 *
 * @param {Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for (var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a map.
 *
 * Currently generates "&key=&" for empty args; there is no way to generate
 * "&key&" arguments with no equal sign.
 *
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = '';
  return buffer.join('');
};


/**
 * Appends URI parameters to an existing URI.
 *
 * The variable arguments msay contain alternating keys and values.  Keys are
 * assumed to be already URI encoded.  The values should not be URI-encoded,
 * and will instead be encoded by this function.
 * <pre>
 * appendParams('http://www.foo.com?existing=true',
 *     'key1', 'value1',
 *     'key2', 'value?willBeEncoded',
 *     'key3', ['valueA', 'valueB', 'valueC'],
 *     'key4', null);
 * result: 'http://www.foo.com?existing=true&' +
 *     'key1=value1&' +
 *     'key2=value%3FwillBeEncoded&' +
 *     'key3=valueA&key3=valueB&key3=valueC'
 * </pre>
 *
 * A single call to this function will not exhibit quadratic behavior in IE,
 * whereas multiple repeated calls may, although the effect is limited by
 * fact that URL's generally can't exceed 2kb.
 *
 * @param {string} uri The original URI, which may already have query data.
 *     Must not contain a fragment identifier.
 * @param {string|*|Array.<*>} var_args Alternating key strings (which are
 *     already encoded) and values.  Keys with a null or undefined value will
 *     be skipped entirely.  Keys with a non-array value will have the values
 *     converted to a string, encoded, and emitted as key=value, whereas keys
 *     with an array value will have each element emitted as a value.
 * @return {string} The URI with all query parameters added.
 */
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1));
};


/**
 * Appends query parameters from a map.
 *
 * @param {string} uri The original URI, which may already have query data.
 *     Must not contain a fragment identifier.
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The new parameters.
 */
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(
      goog.uri.utils.buildQueryDataBufferFromMap_([uri], map));
};


/**
 * Appends a single URI parameter.
 *
 * Repeated calls to this can exhibit quadratic behavior in IE6 due to the
 * way string append works, though it should be limited given the 2kb limit.
 *
 * @param {string} uri The original URI, which may already have query data.
 *     Must not contain a fragment identifier.
 * @param {string} key The key, which must already be URI encoded.
 * @param {string} value The value, which should NOT be URI-encoded.
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.appendParam = function(uri, key, value) {
  return goog.uri.utils.appendQueryData_(
      [uri, '&', key, '=', goog.string.urlEncode(value)]);
};


/**
 * Finds the next instance of a query parameter with the specified name.
 *
 * Does not instantiate any objects.
 *
 * @param {string} uri The URI to search.  May contain a fragment identifier
 *     if opt_hashIndex is specified.
 * @param {number} startIndex The index to begin searching for the key at.  A
 *     match may be found even if this is one character after the ampersand.
 * @param {string} keyEncoded The URI-encoded key.
 * @param {number} hashOrEndIndex Index to stop looking at.  If a hash
 *     mark is present, it should be its index, otherwise it should be the
 *     length of the string.
 * @return {number} The position of the first character in the key's name,
 *     immediately after either a question mark or a dot.
 * @private
 */
goog.uri.utils.findParam_ = function(
    uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;

  // Search for the key itself and post-filter for surronuding punctuation,
  // rather than expensively building a regexp.
  while ((index = uri.indexOf(keyEncoded, index)) >= 0 &&
      index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    // Ensure that the preceding character is '&' or '?'.
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND ||
        precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      // Ensure the following character is '&', '=', '#', or NaN
      // (end of string).
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar ||
          followingChar == goog.uri.utils.CharCode_.EQUAL ||
          followingChar == goog.uri.utils.CharCode_.AMPERSAND ||
          followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }

  return -1;
};


/**
 * Regular expression for finding a hash mark or end of string.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.hashOrEndRe_ = /#|$/;


/**
 * Determines if the URI contains a specific key.
 *
 * Performs no object instantiations.
 *
 * @param {string} uri The URI to process.  May contain a fragment
 *     identifier.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {boolean} Whether the key is present.
 */
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded,
      uri.search(goog.uri.utils.hashOrEndRe_)) >= 0;
};


/**
 * Gets the first value of a query parameter.
 * @param {string} uri The URI to process.  May contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {string?} The first value of the parameter (URI-decoded), or null
 *     if the parameter is not found.
 */
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(
      uri, 0, keyEncoded, hashOrEndIndex);

  if (foundIndex < 0) {
    return null;
  } else {
    var endPosition = uri.indexOf('&', foundIndex);
    if (endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex;
    }
    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > endPosition.
    return goog.string.urlDecode(
        uri.substr(foundIndex, endPosition - foundIndex));
  }
};


/**
 * Gets all values of a query parameter.
 * @param {string} uri The URI to process.  May contain a framgnet.
 * @param {string} keyEncoded The URI-encoded key.  Case-snsitive.
 * @return {!Array.<string>} All URI-decoded values with the given key.
 *     If the key is not found, this will have length 0, but never be null.
 */
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];

  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Find where this parameter ends, either the '&' or the end of the
    // query parameters.
    position = uri.indexOf('&', foundIndex);
    if (position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }

    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > position.
    result.push(goog.string.urlDecode(uri.substr(
        foundIndex, position - foundIndex)));
  }

  return result;
};


/**
 * Regexp to find trailing question marks and ampersands.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]$/;


/**
 * Removes all instances of a query parameter.
 * @param {string} uri The URI to process.  Must not contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.
 * @return {string} The URI with all instances of the parameter removed.
 */
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  goog.uri.utils.assertNoFragments_(uri);

  var length = uri.length;
  var position = 0;
  var foundIndex;
  var buffer = [];

  // Look for a query parameter.
  while ((foundIndex =
      goog.uri.utils.findParam_(uri, position, keyEncoded, length)) >= 0) {
    // Get the portion of the query string, skipping the delimiter character
    // itself.
    buffer.push(uri.substring(position, foundIndex));
    // Progress to immediately after the '&'.  If not found, go to the end.
    position = (uri.indexOf('&', foundIndex) + 1) || length;
  }

  // Append everything that is remaining.
  buffer.push(uri.substr(position));

  // Join the buffer, and remove trailing punctuation that remains.
  return buffer.join('').replace(
      goog.uri.utils.trailingQueryPunctuationRe_, '');
};
