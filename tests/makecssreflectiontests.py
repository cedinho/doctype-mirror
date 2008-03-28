#!/usr/bin/env python

TEMPLATE = """<!DOCTYPE HTML>
<html lang='en'>
<head>
<meta charset="utf-8">
<title>%(elementname)s style='%(cssname)s: %(cssvalue)s' vs. style.%(jsname)s - Google Doctype</title>
<script type="text/javascript" src='../../../goog/base.js'></script>
<script type="text/javascript" src='../../../goog/array.js'></script>
<script type="text/javascript" src='../../../goog/math.js'></script>
<script type="text/javascript" src='../../../goog/string.js'></script>
<script type="text/javascript" src='../../../goog/useragent.js'></script>
<script type="text/javascript" src='../../../goog/dom.js'></script>
<script type="text/javascript" src='../../../goog/style.js'></script>
<script type="text/javascript" src='../../lib/test-common.js'></script>
<script type="text/javascript" src='../../../jsunit/app/jsUnitCore.js'></script>
<style type='text/css'>
body { font-size: 100%%; background-color: white; color: black }
p#breadcrumb { font-size: smaller }
h1 { margin-bottom: 0 }
p#tagline { margin-top: 0; font-style: italic }
p.pass { background: transparent; color: green }
p.fail { background: transparent; color: red }
</style>
</head>
<body>
<p id='breadcrumb'>You are here: <a href="../../../index.html">Google Doctype</a> &gt; <a href="../../index.html">Tests</a> &gt; <a href="../index.html">CSS</a> &gt; <a href="index.html">Properties</a> &gt; <b>%(elementname)s style='%(cssname)s: %(cssvalue)s' vs. style.%(jsname)s</b></p>

<h1>Google Doctype</h1>
<p id='tagline'>Documenting the open web</p>

<hr>

<p>This is a test case that checks how browsers react to specific JavaScript, CSS, or HTML markup.  It does not necessarily correspond to any web standard, so you should not automatically interpret a "fail" result as a bug.</p>

<%(elementname)s id='test' style='%(cssname)s: %(cssvalue)s'></%(elementname)s>
<script type="text/javascript">
function testReflection() {
  assertEquals("[%(wikiname)s] style.%(jsname)s reflects <div style='%(cssname)s: %(cssvalueescaped)s'>",
    '%(jsvalue)s',
    encyclopedia.getComputedStyleById('test', '%(jsname)s'));
}
</script>
<pre>
tested.....&lt;%(elementname)s style='%(cssname)s: %(cssvalue)s'&gt;
expected...style.%(jsname)s = '%(jsvalue)s'
found......style.%(jsname)s = '<script type="text/javascript">
var actualValue = encyclopedia.getComputedStyleById('test', '%(jsname)s');
document.write(actualValue + '\\'<' + '/pre><p class=');
document.write((actualValue == '%(jsvalue)s') ? 'pass>PASS' : 'fail>FAIL');
</script></p>
</body>
</html>"""

for wikiname, elementname, cssname, jsname in [l.split(' ', 3) for l in file('css/properties/cssproperties.txt').readlines() if not l.startswith('#')]:
    if jsname.find(' ') != -1:
        jsname, values = jsname.split(' ', 1)
        values = eval(values)
    else:
        continue
    for item in values:
        cssvalue, jsvalue = item
        cssvalueescaped = cssvalue.replace('"', '\\"')
        output = TEMPLATE % globals()
        testFile = cssvalue + '-equals-' + jsvalue
        testFile = testFile.replace(' ', '-')
        testFile = testFile.replace('"', '-qu-')
        testFile = testFile.replace("'", '-ap-')
        testFile = testFile.replace('(', '-lp-')
        testFile = testFile.replace(')', '-rp-')
        testFile = testFile.replace(':', '-cl-')
        testFile = testFile.replace('/', '-sl-')
        testFile = testFile.replace('.', '-dt-')
        testFile = testFile.replace('%', '-pt-')
        testFile = testFile.replace('#', '-hs-')
        testFile = testFile.replace(',', '-cm-')
        testFile = testFile.replace(';', '-sc-')
        testFile = testFile.replace(':', '-cl-')
        testFile = 'css/properties/' + cssname + '-' + testFile + '-reflection-test.html'
        print testFile
        file(testFile.lower(), 'w').write(output)
