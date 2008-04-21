#!/usr/bin/env python

TEMPLATE = '''<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8">
<title>&lt;%(elementname)s&gt; element appears in DOM%(aschildof)s - Google Doctype</title>
<script type="text/javascript" src="../../../jsunit/app/jsUnitCore.js"></script>
<style type="text/css">
body { font-size: 100%%; background-color: white; color: black }
p#breadcrumb { font-size: smaller }
h1 { margin-bottom: 0 }
p#tagline { margin-top: 0; font-style: italic }
p.pass { background: transparent; color: green }
p.fail { background: transparent; color: red }
</style>
</head>
<body>
<p id="breadcrumb">You are here: <a href="../../../index.html">Google Doctype</a> &gt; <a href="../../index.html">Tests</a> &gt; <a href="../index.html">HTML</a> &gt; <a href="index.html">Elements</a> &gt; <b>&lt;%(elementname)s&gt; element appears in DOM%(aschildof)s</b></p>

<h1>Google Doctype</h1>
<p id="tagline">Documenting the open web</p>

<hr>

<p>This is a test case that checks how browsers react to specific JavaScript, CSS, or HTML markup.  It does not necessarily correspond to any web standard, so you should not automatically interpret a "fail" result as a bug.</p>

<%(parentelementname)s><%(elementname)s id="test"></%(elementname)s></%(parentelementname)s>
<script type="text/javascript">
function testDOM() {
  assertNotEquals("[%(wikiname)s] appears in DOM%(aschildof)s",
    document.getElementById('test'),
    null);
}
</script>
<pre>
tested.....&lt;%(parentelementname)s&gt;&lt;%(elementname)s id="test"&gt;&lt;/%(parentelementname)s&gt;
expected...document.getElementById("test") != null
found......document.getElementById("test") <script type="text/javascript">
var actualValue = (document.getElementById("test") != null);
document.write(actualValue ? '!=' : '==');
document.write(' null<' + '/pre><p class=');
document.write(actualValue ? 'pass>PASS' : 'fail>FAIL');
</script></p>
</body>
</html>
'''

for wikiname, parentelementname, elementname in [l.strip().split(' ', 2) for l in file('html/elements/elements.txt').readlines() if not l.startswith('#')]:
    testFile = 'html/elements/' + elementname.replace(' ', '-').replace('=', '-') + '-element-'
    if parentelementname != 'null':
        testFile += 'as-child-of-' + parentelementname + '-'
        aschildof = ' as child of ' + parentelementname
    else:
        aschildof = ''
    testFile += 'appears-in-dom-test.html'
    output = TEMPLATE % globals()
    output = output.replace('<null>', '').replace('</null>', '')
    output = output.replace('&lt;null&gt;', '').replace('&lt;/null&gt;', '')
    print testFile
    file(testFile, 'w').write(output)
