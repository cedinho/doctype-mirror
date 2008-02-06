goog.math = goog.math || {};

/**
 * Class for representing coordinates and positions.
 * @param {Number} opt_x Left
 * @param {Number} opt_y Top
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type Number
   */
  this.x = goog.isDef(opt_x) ? Number(opt_x) : undefined;

  /**
   * Y-value
   * @type Number
   */
  this.y = goog.isDef(opt_y) ? Number(opt_y) : undefined;

};


/**
 * Returns a new copy of the coordinate.
 * @return {goog.math.Coordinate}
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


/**
 * Returns a nice string representing dimensions.
 * @return {String} In the form (50, 73).
 */
goog.math.Coordinate.prototype.toString = function() {
  return '(' + this.x + ', ' + this.y + ')';
};


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a
 * @param {goog.math.Coordinate} b
 * @return {Boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {goog.math.Coordinate} a
 * @param {goog.math.Coordinate} b
 * @return {Number}
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 * @param {goog.math.Coordinate} a
 * @param {goog.math.Coordinate} b
 * @return {Number}
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {goog.math.Coordinate} a
 * @param {goog.math.Coordinate} b
 * @return {goog.math.Coordinate}
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};
