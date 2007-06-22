var encyclopedia = {
    getComputedStyle: function(elem) {
	return document.defaultView.getComputedStyle(elem, null);
    },

    getComputedStyleById: function(id) {
	return this.getComputedStyle(document.getElementById(id));
    }
};
