#!/usr/bin/env python

import commands

TEMPLATE = '''<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8">
<title>&amp;%(entityname)s character entity treated as U+%(entityhex)s - Google Doctype</title>
<script type="text/javascript" src="../../../goog/base.js"></script>
<script type="text/javascript" src="../../lib/test-common.js"></script>
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
<p id="breadcrumb">You are here: <a href="../../../index.html">Google Doctype</a> &gt; <a href="../../index.html">Tests</a> &gt; <a href="../index.html">HTML</a> &gt; <a href="index.html">Entities</a> &gt; <b>&amp;%(entityname)s character entity treated as U+%(entityhex)s</b></p>

<h1>Google Doctype</h1>
<p id="tagline">Documenting the open web</p>

<hr>

<p>This is a test case that checks how browsers react to specific JavaScript, CSS, or HTML markup.  It does not necessarily correspond to any web standard, so you should not automatically interpret a "fail" result as a bug.</p>

<div id="control">&#x%(entityhex)s;</div>
<div id="test">&%(entityname)s</div>
<script type="text/javascript">
function testEntity() {
  assertEquals("[%(wikiname)s] %(entityname)s character entity treated as U+%(entityhex)s",
    document.getElementById('control').firstChild.nodeValue,
    document.getElementById('test').firstChild.nodeValue);
}
</script>
<pre>
tested.....&lt;div id="control">&amp;#x%(entityhex)s;&lt;/div>
           &lt;div id="test">&amp;%(entityname)s&lt;/div>
expected...escape(test.firstChild.nodeValue) == "<script type="text/javascript">document.write(escape(document.getElementById('control').firstChild.nodeValue));</script>"
found......escape(test.firstChild.nodeValue) == "<script type="text/javascript">
var actualValue = escape(document.getElementById('test').firstChild.nodeValue);
document.write(actualValue + '"<' + '/pre><p class=');
document.write((actualValue == escape(document.getElementById('control').firstChild.nodeValue)) ? 'pass>PASS' : 'fail>FAIL');
</script></p>
</body>
</html>
'''


INDEXHTML = '''<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HTML Entities Test Suite</title>
<script type="text/javascript" src="../../../jsunit/app/jsUnitCore.js"></script>
<script type="text/javascript" src="index.js"></script>
<script type="text/javascript">
function suite() {
  return htmlentitiessuite();
}
</script>
</head>
<body>
</body>
</html>
'''

WIKIFILE = '''#summary %(wikidescription)"
#labels about-html,from-w3c


'''

INDEXJS = '''function htmlentitiessuite() {
  var testSuite = new top.jsUnitTestSuite();
%(indexjsfiles)s
  return testSuite;
}
'''

INDEXJSFILE = '''  testSuite.addTestPage("../tests/%(testfilename)s");
'''

indexjsfiles = ''
duplicates = {}
commands.getoutput('rm html/entities/*.html')
for entityname, entityhex in [l.split() for l in file('html/entities/character-entities.txt').readlines()]:
    entityhex = entityhex.replace('U+', '')
    wikiname = entityname.replace(';', '').capitalize() + 'CharacterEntity'
    testfilename = entityname
    if testfilename == testfilename.upper():
        testfilename = testfilename.lower() + '-allcaps'
    elif testfilename == testfilename.capitalize():
        testfilename = testfilename.lower() + '-capital'
    else:
        testfilename = testfilename.lower()

    if testfilename.count(';'):
        testfilename = testfilename.replace(';', '')
    else:
        testfilename = testfilename + '-no-semicolon'

    testfilename += '-' + entityhex + '-entity-test.html'
    testfilename = 'html/entities/' + testfilename

    try:
        file(testfilename).read()
        duplicates[testfilename] = duplicates.get(testfilename, 1) + 1
        testfilename = testfilename.replace('-entity-test.html', '-' + str(duplicates[testfilename]) + '-entity-test.html')
    except:
        pass

    output = TEMPLATE % globals()
    print testfilename
    file(testfilename, 'w').write(output)
    indexjsfiles += INDEXJSFILE % globals()

print 'html/entities/index.js'
file('html/entities/index.js', 'w').write(INDEXJS % globals())
print 'html/entities/index.html'
file('html/entities/index.html', 'w').write(INDEXHTML % globals())
