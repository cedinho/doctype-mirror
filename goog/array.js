goog.array = goog.array || {};

/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, for example the arguments object.
 *
 * @param {Array} arr The array to get parts of
 * @param {Number} start Where to start the extraction
 * @param {Number} opt_end Where to end the extraction
 * @return {Array} Returns a new array containing the parts of the original
 *                 array.
 */
goog.array.slice = function (arr, start, opt_end) {
  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return Array.prototype.slice.call(arr, start);
  } else {
  return Array.prototype.slice.call(arr, start, opt_end);
  }
};

/**
 * Adds or removes elements from an array. This is a gereric version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * for example the arguments object.
 *
 * @param {Array} arr The array to modify
 * @param {Number} index Where to start changing the array
 * @param {Number} howMany How many elements to remove (0 means no removal. A
 *                         value below 0 is treated as zero and so is any other
 *                         non number. Numbers are floored.)
 * @param {Object} opt_el The element to insert
 * @return {Array} the removed elements
 */
goog.array.splice = function (arr, index, howMany, opt_el) {
  return Array.prototype.splice.apply(arr, goog.array.slice(arguments, 1));
};

/**
 * Returns the first index of an element inside an array. This returns -1 if
 * the element is not present in the array
 *
 * See {@link http://tinyurl.com/nga8b}
 *
 * @param {Array} arr An array that we are getting the index from
 * @param {Object} obj The object that we are searching for
 * @param {Number) opt_fromIndex The index to start the search at. If left out
 *                               the searching starts at the beginning.
 */
goog.array.indexOf = function(arr, obj, opt_fromIndex) {
  if (arr.indexOf) {
    return arr.indexOf(obj, opt_fromIndex);
  }
  if (Array.indexOf) {
    return Array.indexOf(arr, obj, opt_fromIndex);
  }

  if (opt_fromIndex == null) {
    opt_fromIndex = 0;
  } else if (opt_fromIndex < 0) {
    opt_fromIndex = Math.max(0, arr.length + opt_fromIndex);
  }
  for (var i = opt_fromIndex; i < arr.length; i++) {
    if (i in arr && arr[i] === obj)
      return i;
  }
  return -1;
};

/**
 * Whether the array contains the given object
 * @param {Array} arr The array to test if the element is contained within
 * @param {Object} obj The object to test for
 * @return {Boolean} true if present, false otherwise
 */
goog.array.contains = function(arr, obj) {
  if (arr.contains) {
    return arr.contains(obj);
  }

  return goog.array.indexOf(arr, obj) > -1;
};
