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

goog.dom = goog.dom || {};

/**
 * Enumeration for DOM node types (for reference)
 * @enum {Number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};

/**
 * Returns the first child node that is an element.
 * @private
 * @param {Node} node The node to get the next element from
 * @param {Boolean} forward Whether to look forwards or backwards
 * @return {Element}
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }
  return node;
};


/**
 * Whether the object looks like a DOM node
 * @param {Object} obj
 * @return {Boolean}
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};

/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties
 *
 * @type Object
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  valign: 'vAlign',
  height: 'height',
  width: 'width',
  frameborder: 'frameBorder'
};

/**
 * Sets a number of properties on a node
 * @param {Element} element DOM node to set properties on
 * @param {Object} properties Hash of property:value pairs
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else {
      element[key] = val;
    }
  });
};

/**
 * This is used when calling methods that depend on a document_ instance
 * @private
 * @return {goog.dom.DomHelper}
 */
goog.dom.getDefaultDomHelper_ = function() {
  if (!goog.dom.defaultDomHelper_) {
    goog.dom.defaultDomHelper_ = new goog.dom.DomHelper;
  }
  return goog.dom.defaultDomHelper_;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Element} opt_element If present, gets the DomHelper for this element.
 * @return {goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      goog.dom.getDefaultDomHelper_();
};


/**
 * Create an instance of a DOM helper with a new document object
 * @param {Document} opt_document Document object to associate with this DOM helper
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type Document
   */
  this.document_ = opt_document || window.document || document;
};

/**
 * Set the document object
 * @param {Document} document Document object
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Get the document object being used by the dom library
 * @return {Document} Document object
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};

goog.dom.classes = goog.dom.classes || {};

/**
 * Sets the entire classname of an element
 * @param {Element} element DOM node to set class of
 * @param {String} className Class name(s)
 */
goog.dom.classes.set = function(element, className) {
  element.className = className;
};


/**
 * Gets an array of classnames on an element
 * @param {Element} element DOM node to get class of
 * @return {Array} Classnames
 */
goog.dom.classes.get = function(element) {
  return element.className.split(' ');
};


/**
 * Adds a class or classes to an element
 * @param {Element} element DOM node to add class to
 * @param {String} var_args Class names
 * @return {Boolean} Whether class was added (or all classes were added)
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);

  var rv = 1;

  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv &= 1;
    } else {
      rv &= 0;
    }
  }

  element.className = classes.join(' ');
  return Boolean(rv);
};


/**
 * Removes a class or classes from an element
 * @param {Element} element DOM node to remove class from
 * @param {String} var_args Class name
 * @return {Boolean} Whether class was removed
 */
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);

  var rv = 0;
  for (var i = 0; i < classes.length; i++) {
    if (goog.array.contains(args, classes[i])) {
      goog.array.splice(classes, i--, 1);
      rv++;
    }
  }
  element.className = classes.join(' ');

  return rv == args.length;
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.
 * @param {Element} element DOM node to swap classes on
 * @param {String} fromClass Class to remove
 * @param {String} toClass Class to add
 * @return {Boolean} Whether classes were switched
 */
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);

  var removed = false;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }

  if (removed) {
    classes.push(toClass);
    element.className = classes.join(' ');
  }

  return removed;
};


/**
 * Returns true if an element has a class
 * @param {Element} element DOM node to test
 * @param {String} className Classname to test for
 * @return {Boolean} If element has the class
 */
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};


/**
 * Adds or removes a class depending on the enabled argument.
 * @param {Element} element DOM node to add or remove the class on.
 * @param {String} className Class name to add or remove.
 * @param {Boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 */
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};


/**
 * If an element has a class it will remove it, if it doesn't have it it will
 * add it.  Won't affect other classes on the node.
 * @param {Element} element DOM node to toggle class on
 * @param {String} className Class to toggle
 * @return {Boolean} True if class was added, false if it was removed
 *     (basically whether element has the class after this function has been
 *     called)
 */
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};

/**
 * Returns the compatMode of the document
 * @return {String} The result is either CSS1Compat or BackCompat.
 */
goog.dom.DomHelper.prototype.getCompatMode = function() {
  if (this.document_.compatMode) {
    return this.document_.compatMode;
  }
  if (goog.userAgent.SAFARI) {
    // Create a dummy div and set the width without a unit. This is invalid in
    // CSS but quirks mode allows it.
    var el = this.createDom('div', {'style': 'position:absolute;width:0;height:0;width:1'});
    var val = el.style.width == '1px' ? 'BackCompat' : 'CSS1Compat';
    // There is no way to change the compatMode after it has been set so we
    // set it here so that the next call is faster
    return this.document_.compatMode = val;
  }
  return 'BackCompat';
};

/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {String} tagName Tag to create
 * @param {Object} opt_attributes Map of name-value pairs for attributes
 * @param {Object|Array} var_args Further DOM nodes or strings for text nodes.
 *     If one of the var_args is an array, its children will be added as
 *     childNodes instead.
 * @return {Element} Reference to a DOM node
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  var dh = goog.dom.getDefaultDomHelper_();
  return dh.createDom.apply(dh, arguments);
};


/**
 * Alias for createDom
 * @type Function
 */
goog.dom.$dom = goog.dom.createDom;

/**
 * Create a new element
 * @param {String} name Tag name
 * @return {Element}
 */
goog.dom.createElement = function(name) {
  return goog.dom.getDefaultDomHelper_().createElement(name);
};


/**
 * Create a new text node
 * @param {String} content Content
 * @return {Element}
 */
goog.dom.createTextNode = function(content) {
  return goog.dom.getDefaultDomHelper_().createTextNode(content);
};


/**
 * Converts an HTML string into a document fragment.
 *
 * @param {String} htmlString The HTML string to convert.
 * @return {DocumentFragment} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.getDefaultDomHelper_().htmlToDocumentFragment(htmlString);
};

/**
 * Appends a child to a node
 * @param {Node} parent Parent
 * @param {Node} child Child
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Removes all the child nodes on a DOM node
 * @param {Node} node Node to remove children from
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert
 * @param {Node} refNode Reference node to insert before
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert
 * @param {Node} refNode Reference node to insert after
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Removes a node from its parent
 * @param {Node} node The node to remove
 * @return {Node|Null} The node removed if removed; else, null
 */
goog.dom.removeNode = function(node) {
  return node.parentNode ? node.parentNode.removeChild(node) : null;
};

/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search
 * @param {function(Node) : Boolean} p The filter function
 * @return {Node|Undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, true);
  return rv.length ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search
 * @param {function(Node) : Boolean} p The filter function
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that matches the filter function.
 * This does a depth first search.
 * @param {Node} root The root of the tree to search
 * @param {function(Node) : Boolean} p The filter function
 * @param {Array.<Node>} rv The found nodes or added to this array.
 * @param {Boolean} findOne If true we exit after the first found node.
 */
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    for (var i = 0, child; child = root.childNodes[i]; i++) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return;
        }
      }
      goog.dom.findNodes_(child, p, rv, findOne);
    }
  }
};

/**
 * Cross browser function for getting the document element of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element
 * @return {HTMLDocument}
 */
goog.dom.getFrameContentDocument = function(frame) {
  return goog.userAgent.SAFARI ?
          (frame.document || frame.contentWindow.document) :
          (frame.contentDocument || frame.contentWindow.document);
};

/**
 * Does a getElementsByTagName and checks class as well
 * @param {String} opt_tag Element id
 * @param {String} opt_class Optional classname
 * @param {Element} opt_el Optional element to look in
 * @return {Array} Array of elements
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getDefaultDomHelper_().getElementsByTagNameAndClass(
      opt_tag, opt_class, opt_el);
};


/**
 * Alias for getElementsByTagNameAnd Class
 * @type Function
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;

/**
 * Returns the first child node that is an element.
 * @private
 * @param {Node} node The node to get the next element from
 * @param {Boolean} forward Whether to look forwards or backwards
 * @return {Element}
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }
  return node;
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of
 * @return {Element}
 */
goog.dom.getFirstElementChild = function(node) {
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of
 * @return {Element}
 */
goog.dom.getLastElementChild = function(node) {
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of
 * @return {Element}
 */
goog.dom.getNextElementSibling = function(node) {
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of
 * @return {Element}
 */
goog.dom.getPreviousElementSibling = function(node) {
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};

/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare
 * @param {Node} node2 The second node to compare
 * @return {Number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if it's parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    var index1 = isElement1 ? node1.sourceIndex : node1.parentNode.sourceIndex;
    var index2 = isElement2 ? node2.sourceIndex : node2.parentNode.sourceIndex;

    if (index1 != index2) {
      return index1 - index2;
    } else {
      if (isElement1) {
        // Since they are not equal, we can deduce that node2 is a child of
        // node1 and therefore node1 comes first.
        return -1;
      }

      if (isElement2) {
        // Similarly, we know node1 is a child of node2 in this case.
        return 1;
      }

      // If we get here, we know node1 and node2 are both child nodes of the
      // same parent element.
      var s = node2;
      while ((s = s.previousSibling)) {
        if (s == node1) {
          // We just found node1 before node2.
          return -1;
        }
      }

      // Since we didn't find it, node1 must be after node2.
      return 1;
    }
  }

  // For Safari, we cheat and compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2, compare;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(Range.START_TO_END, range2);
};

/**
 * Safari contains is broken, but appears to be fixed in WebKit 522+
 * @type {Boolean}
 * @private
 */
goog.dom.BAD_CONTAINS_SAFARI_ = goog.userAgent.SAFARI &&
    goog.userAgent.compare(goog.userAgent.VERSION, '521') <= 0;

/**
 * Whether a node contains another node
 * @param {Node} parent The node that should contain the other node
 * @param {Node} descendant The node to test presence of
 * @return {Boolean}
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE / Safari(some) DOM
  if (typeof parent.contains != 'undefined' && !goog.dom.BAD_CONTAINS_SAFARI_ &&
      descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};

/**
 * Returns the owner document for a node
 * @param {Node} node The node to get the document for
 * @return {Document} The document owning the node
 */
goog.dom.getOwnerDocument = function(node) {
  // IE5 uses document instead of ownerDocument
  return node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document;
};

/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window} opt_window Optional window element to test.
 * @return {goog.math.Coordinate} Object with values 'x' and 'y'
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  var doc = win.document;

  var x, y;
  // Safari (2 and 3) needs body.scrollLeft in both quirks mode and strict mode
  if (!goog.userAgent.SAFARI && doc.compatMode == 'CSS1Compat') {
    x = doc.documentElement.scrollLeft;
    y = doc.documentElement.scrollTop;
  } else {
    x = doc.body.scrollLeft;
    y = doc.body.scrollTop;
  }

  return new goog.math.Coordinate(x, y);
};

/**
 * Gets the window object associated with the given document.
 *
 * This method will fail in Safari and other WebKit powered browsers. There's
 * currently no way to get the window for a given document in Safari.
 *
 * For now something like the code below is the best option for safari support.
 * var win = goog.dom.getWindow(doc) || window;
 *
 * @param {Document} doc Document object to get window for.
 * @return {Window}
 */
goog.dom.getWindow = function(doc) {
  return doc.parentWindow || doc.defaultView
};

/**
 * Cross browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of
 * @param {String} text The string that should replace the current element
 *                      content with.
 */
goog.dom.setTextContent = function(element, text) {
  if ('textContent' in element) {
    element.textContent = text;
  } else if (element.firstChild &&
             element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // if the first child is a text node we just change its data and remove the
    // rest of the children
    while (element.lastChild != element.firstChild) {
      element.removeChild(element.lastChild);
    }
    element.firstChild.data = text;
  } else {
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
    var doc = goog.dom.getOwnerDocument(element);
    element.appendChild(doc.createTextNode(text));
  }
};
