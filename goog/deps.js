// Copyright 2006 Google Inc.
// All Rights Reserved.
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

goog.addDependency('array/array.js', ['goog.array'], []);
goog.addDependency('dom/classes.js', ['goog.dom.classes'], ['goog.array']);
goog.addDependency('dom/dom.js', ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType'], ['goog.array', 'goog.dom.TagName', 'goog.dom.classes', 'goog.math.Coordinate', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('dom/fontsizemonitor.js', ['goog.dom.FontSizeMonitor', 'goog.dom.FontSizeMonitor.EventType'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('dom/selection.js', ['goog.dom.selection'], ['goog.string', 'goog.userAgent']);
goog.addDependency('dom/tagname.js', ['goog.dom.TagName'], []);
goog.addDependency('dom/viewportsizemonitor.js', ['goog.dom.ViewportSizeMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size']);
goog.addDependency('dom/xml.js', ['goog.dom.xml'], ['goog.dom']);
goog.addDependency('events/actionhandler.js', ['goog.events.ActionEvent', 'goog.events.ActionHandler', 'goog.events.ActionHandler.EventType', 'goog.events.BeforeActionEvent'], ['goog.events.EventTarget', 'goog.events.KeyCodes']);
goog.addDependency('events/browserevent.js', ['goog.events.BrowserEvent', 'goog.events.BrowserEvent.MouseButton'], ['goog.events.Event', 'goog.userAgent']);
goog.addDependency('events/customevent.js', ['goog.events.CustomEvent'], ['goog.events.Event']);
goog.addDependency('events/event.js', ['goog.events.Event'], ['goog.Disposable']);
goog.addDependency('events/eventhandler.js', ['goog.events.EventHandler'], ['goog.Disposable', 'goog.events', 'goog.object', 'goog.structs.SimplePool']);
goog.addDependency('events/events.js', ['goog.events', 'goog.events.EventType'], ['goog.array', 'goog.debug.errorHandlerWeakDep', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.Listener', 'goog.object', 'goog.structs.SimplePool', 'goog.userAgent']);
goog.addDependency('events/eventtarget.js', ['goog.events.EventTarget'], ['goog.Disposable', 'goog.events']);
goog.addDependency('events/focushandler.js', ['goog.events.FocusHandler'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('events/inputhandler.js', ['goog.events.InputHandler', 'goog.events.InputHandler.EventType'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('events/keycodes.js', ['goog.events.KeyCodes'], ['goog.events']);
goog.addDependency('events/keyhandler.js', ['goog.events.KeyEvent', 'goog.events.KeyHandler', 'goog.events.KeyHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/keynames.js', ['goog.events.KeyNames'], ['goog.events']);
goog.addDependency('events/listener.js', ['goog.events.Listener'], []);
goog.addDependency('events/mousewheelhandler.js', ['goog.events.MouseWheelEvent', 'goog.events.MouseWheelEvent.AxisType', 'goog.events.MouseWheelHandler', 'goog.events.MouseWheelHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('events/onlinehandler.js', ['goog.events.OnlineHandler', 'goog.events.OnlineHandler.EventType'], ['goog.Timer', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('iter/iter.js', ['goog.iter', 'goog.iter.Iterator', 'goog.iter.StopIteration'], ['goog.array']);
goog.addDependency('math/box.js', ['goog.math.Box'], ['goog.math.Coordinate']);
goog.addDependency('math/coordinate.js', ['goog.math.Coordinate'], []);
goog.addDependency('math/math.js', ['goog.math'], ['goog.array', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Range', 'goog.math.Rect', 'goog.math.Size']);
goog.addDependency('math/rect.js', ['goog.math.Rect'], ['goog.math.Box']);
goog.addDependency('math/size.js', ['goog.math.Size'], []);
goog.addDependency('structs/avltree.js', ['goog.structs.AvlTree', 'goog.structs.AvlTree.Node'], ['goog.structs']);
goog.addDependency('structs/circularbuffer.js', ['goog.structs.CircularBuffer'], []);
goog.addDependency('structs/heap.js', ['goog.structs.Heap'], ['goog.array', 'goog.structs.Node']);
goog.addDependency('structs/inversionmap.js', ['goog.structs.InversionMap'], ['goog.array']);
goog.addDependency('structs/linkedmap.js', ['goog.structs.LinkedMap'], ['goog.array', 'goog.structs.Map']);
goog.addDependency('structs/map.js', ['goog.structs.Map'], ['goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.object', 'goog.structs']);
goog.addDependency('structs/node.js', ['goog.structs.Node'], []);
goog.addDependency('structs/pool.js', ['goog.structs.Pool'], ['goog.Disposable', 'goog.iter', 'goog.structs.Queue', 'goog.structs.Set']);
goog.addDependency('structs/prioritypool.js', ['goog.structs.PriorityPool'], ['goog.structs.Pool', 'goog.structs.PriorityQueue']);
goog.addDependency('structs/priorityqueue.js', ['goog.structs.PriorityQueue'], ['goog.structs', 'goog.structs.Heap']);
goog.addDependency('structs/quadtree.js', ['goog.structs.QuadTree', 'goog.structs.QuadTree.Node', 'goog.structs.QuadTree.Point'], ['goog.math.Coordinate']);
goog.addDependency('structs/queue.js', ['goog.structs.Queue'], ['goog.array']);
goog.addDependency('structs/set.js', ['goog.structs.Set'], ['goog.structs', 'goog.structs.Map']);
goog.addDependency('structs/simplepool.js', ['goog.structs.SimplePool'], ['goog.Disposable']);
goog.addDependency('structs/structs.js', ['goog.structs'], ['goog.array', 'goog.object']);
goog.addDependency('structs/trie.js', ['goog.structs.Trie'], ['goog.object', 'goog.structs']);
goog.addDependency('style/cursor.js', ['goog.style.cursor'], ['goog.userAgent']);
goog.addDependency('style/style.js', ['goog.style'], ['goog.array', 'goog.dom', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('useragent/adobereader.js', ['goog.userAgent.adobeReader'], ['goog.userAgent']);
goog.addDependency('useragent/flash.js', ['goog.userAgent.flash'], ['goog.string']);
goog.addDependency('useragent/iphoto.js', ['goog.userAgent.iphoto'], ['goog.userAgent']);
goog.addDependency('useragent/jscript.js', ['goog.userAgent.jscript'], ['goog.string']);
goog.addDependency('useragent/picasa.js', ['goog.userAgent.picasa'], ['goog.userAgent']);
goog.addDependency('useragent/product.js', ['goog.userAgent.product'], ['goog.userAgent']);
goog.addDependency('useragent/useragent.js', ['goog.userAgent'], ['goog.string']);
goog.addDependency('async/delay.js', ['goog.Delay', 'goog.async.Delay'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('disposable/disposable.js', ['goog.Disposable', 'goog.dispose'], []);
goog.addDependency('history/history.js', ['goog.History', 'goog.History.Event'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.string', 'goog.userAgent']);
goog.addDependency('json/json.js', ['goog.json', 'goog.json.Serializer'], []);
goog.addDependency('object/object.js', ['goog.object'], []);
goog.addDependency('string/string.js', ['goog.string', 'goog.string.Unicode'], []);
goog.addDependency('string/stringbuffer.js', ['goog.string.StringBuffer'], ['goog.userAgent.jscript']);
goog.addDependency('string/stringformat.js', ['goog.string.format'], ['goog.string']);
goog.addDependency('throttle/throttle.js', ['goog.Throttle'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('timer/timer.js', ['goog.Timer'], ['goog.events.EventTarget']);
goog.addDependency('uri/uri.js', ['goog.Uri', 'goog.Uri.QueryData'], ['goog.array', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils']);
goog.addDependency('uri/utils.js', ['goog.uri.utils'], ['goog.asserts', 'goog.string']);
goog.addDependency('window/window.js', ['goog.window'], []);
