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

WIKIFILE = '''#summary %(entityname)s character entity
#labels about-html,from-w3c

== Value ==

%(wikivalue)s

[HTMLCharacterEntities List of HTML character entities]

== Browser compatibility ==

(coming soon)

== Further reading ==

  * [http://www.whatwg.org/specs/web-apps/current-work/multipage/named.html Named character references in HTML 5]
  * [http://www.w3.org/TR/html4/sgml/entities.html Character entity references in HTML 4]
  * [http://blooberry.com/indexdot/html/tagpages/text.htm Text in HTML (blooberry.com)]
'''

FULLLIST = '''#summary List of HTML character entities
#labels about-html,from-w3c

Web authors can use [http://www.w3.org/TR/html4/sgml/entities.html character entities] to display certain pre-defined non-ASCII characters.  Evolt.org has a nice chart of [http://www.evolt.org/article/ala/17/21234/ the most common character entities].

Here is the complete list of [http://www.whatwg.org/specs/web-apps/current-work/multipage/named.html character entities defined in HTML 5]:

|| *Name* || *Value* || *Test* ||
%(entitytable)s

== Further reading ==

  * [http://www.whatwg.org/specs/web-apps/current-work/multipage/named.html Named character references in HTML 5]
  * [http://www.w3.org/TR/html4/sgml/entities.html Character entity references in HTML 4]
  * [http://www.evolt.org/article/ala/17/21234/ Chart of common character entities]
'''

INDEXJS = '''function htmlentitiessuite() {
  var testSuite = new top.jsUnitTestSuite();
%(indexjsfiles)s
  return testSuite;
}
'''

INDEXJSFILE = '''  testSuite.addTestPage("../tests/%(testfilename)s");
'''

def buildEntityHexLink(entityhex):
    entityhexupper = entityhex.upper()
    entityhexlower = entityhex.lower()
    last4 = entityhexlower[-4:]
    if entityhex[0] == '0':
        return '[http://www.fileformat.info/info/unicode/char/%(last4)s/index.htm U+%(entityhexupper)s]' % locals()
    else:
        return 'U+' + entityhexupper

indexjsfiles = ''
duplicates = {}
wikivalues = {}
entitytable = ''
commands.getoutput('rm html/entities/*.html')
for entityname, entityhex in [l.split() for l in file('html/entities/character-entities.txt').readlines()]:
    entityhex = entityhex.replace('U+', '')
    wikiname = entityname.replace(';', '').capitalize() + 'CharacterEntity'
    if wikivalues.has_key(wikiname):
        wikivalues[wikiname].append((entityname, entityhex))
    else:
        wikivalues[wikiname] = [(entityname, entityhex)]
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
    entitytable += '|| `&%s` || %s || [http://doctype.googlecode.com/svn/trunk/tests/%s test]\n' % (entityname, buildEntityHexLink(entityhex), testfilename)

for wikiname, valuelist in wikivalues.items():
    if len(valuelist) == 1:
        entityname, entityhex = valuelist[0]
        if entityhex[0] == '0':
            wikivalue = '`&%s` maps to the Unicode character %s.' % (entityname, buildEntityHexLink(entityhex))
    else:
        wikivalue = 'There are %s variations of this entity:\n' % (len(valuelist),)
        for entityname, entityhex in valuelist:
            wikivalue += '\n  * `&%s` maps to the Unicode character %s.' % (entityname, buildEntityHexLink(entityhex))
    wikifilename = '../../wiki/%s.wiki' % wikiname
    print wikifilename
    file(wikifilename, 'w').write(WIKIFILE % globals())

print '../../wiki/HTMLCharacterEntities.wiki'
file('../../wiki/HTMLCharacterEntities.wiki', 'w').write(FULLLIST % globals())
print 'html/entities/index.js'
file('html/entities/index.js', 'w').write(INDEXJS % globals())
print 'html/entities/index.html'
file('html/entities/index.html', 'w').write(INDEXHTML % globals())
