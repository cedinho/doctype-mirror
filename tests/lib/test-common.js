var encyclopedia = {
    getComputedStyle: function(elem) {
	return document.defaultView.getComputedStyle(elem, null);
    },

    getComputedStyleById: function(id) {
	return this.getComputedStyle(document.getElementById(id));
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
