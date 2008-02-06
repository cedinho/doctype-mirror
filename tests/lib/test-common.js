var encyclopedia = {
    getComputedStyle: function(elem, style) {
	return goog.style.getStyle_(elem, style);
    },

    getComputedStyleById: function(id, style) {
	return this.getComputedStyle(document.getElementById(id), style);
    },

    typeOf: function(value) {
	/* typeOf function from http://javascript.crockford.com/remedial.html */
	var s = typeof value;
	if (s === 'object') {
	    if (value) {
		if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length')) &&
                    typeof value.splice === 'function') {
		    s = 'array';
		}
	    } else {
		s = 'null';
	    }
	}
	return s;
    }
};
