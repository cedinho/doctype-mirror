#!/usr/bin/env python

TEMPLATE = '''<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8">
<title>%(elementName)s %(attributeName)s="%(attributeValue)s" vs. %(elementName)s.%(jsName)s - Google Doctype</title>
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
<p id="breadcrumb">You are here: <a href="../../../index.html">Google Doctype</a> &gt; <a href="../../index.html">Tests</a> &gt; <a href="../index.html">HTML</a> &gt; <a href="index.html">Attributes</a> &gt; <b>%(elementName)s %(attributeName)s="%(attributeValue)s" vs. %(elementName)s.%(jsName)s</b></p>

<h1>Google Doctype</h1>
<p id="tagline">Documenting the open web</p>

<hr>

<p>This is a test case that checks how browsers react to specific JavaScript, CSS, or HTML markup.  It does not necessarily correspond to any web standard, so you should not automatically interpret a "fail" result as a bug.</p>

<%(elementName)s id="test" %(attributeName)s="%(attributeValue)s"></%(elementName)s>
<script type="text/javascript">
function testReflection() {
  assertEquals('[%(wikiName)s] %(elementName)s.%(jsName)s reflects <%(elementName)s %(attributeName)s="%(attributeValue)s">',
    %(jsValue)s,
    document.getElementById("test").%(jsName)s);
}
</script>
<pre>
tested.....&lt;%(elementName)s %(attributeName)s="%(attributeValue)s"&gt;
expected...%(elementName)s.%(jsName)s = %(jsValue)s
found......%(elementName)s.%(jsName)s = "<script type="text/javascript">
var actualValue = document.getElementById("test").%(jsName)s;
document.write(actualValue + '"<' + '/pre><p class=');
document.write((actualValue == %(jsValue)s) ? 'pass>PASS' : 'fail>FAIL');
</script></p>
</body>
</html>'''

for wikiName, elementName, attributeName, jsName, jsType in [l.split(' ') for l in file('html/attributes/attributes.txt').readlines() if not l.startswith('#')]:
    jsType = jsType.strip()
    if jsType == 'uri':
        attributeValue = 'http://www.example.com/'
        jsValue = '"http://www.example.com/"'
    elif jsType == 'existencebool':
        attributeValue = attributeName
        jsValue = 'true'
    elif jsType == 'existence2stringbool':
        attributeValue = attributeName
        jsValue = '"true"'
    elif jsType == 'stringbool':
        attributeValue = 'true'
        jsValue = 'true'
    elif jsType == 'integer':
        attributeValue = '42'
        jsValue = '42'
    elif jsType == 'stringint':
        attributeValue = '7'
        jsValue = '"7"'
    elif jsType == 'negativeinteger':
        attributeValue = '-1'
        jsValue = '-1'
    elif jsType == 'encoding':
        attributeValue = 'utf-8'
        jsValue = '"utf-8"'
    elif jsType == 'color':
        attributeValue = '#ffffff'
        jsValue = '"#ffffff"'
    elif jsType == 'textalignment':
        attributeValue = ['absbottom', 'absmiddle', 'baseline', 'bottom', 'left', 'middle', 'right', 'texttop', 'top']
        jsValue = ['"absBottom"', '"absMiddle"', '"baseline"', '"bottom"', '"left"', '"middle"', '"right"', '"textTop"', '"top"']
    elif jsType == 'captionalignment':
        attributeValue = ['bottom', 'center', 'left', 'right', 'top']
        jsValue = ['"bottom"', '"center"', '"left"', '"right"', '"top"']
    elif jsType == 'alignment':
        attributeValue = ['center', 'justify', 'left', 'right']
        jsValue = ['"center"', '"justify"', '"left"', '"right"']
    elif jsType == 'captionvalignment':
        attributeValue = ['top', 'bottom']
        jsValue = ['"top"', '"bottom"']
    elif jsType == 'textvalignment':
        attributeValue = ['top', 'bottom', 'baseline', 'middle']
        jsValue = ['"top"', '"bottom"', '"baseline"', '"middle"']
    elif jsType == 'direction':
        attributeValue = ['ltr', 'rtl']
        jsValue = ['"ltr"', '"rtl"']
    elif jsType == 'language':
        attributeValue = 'en'
        jsValue = '"en"'
    elif jsType == 'char':
        attributeValue = 'C'
        jsValue = '"C"'
    elif jsType == 'clear':
        attributeValue = ['all', 'left', 'right', 'none', 'both']
        jsValue = ['"all"', '"left"', '"right"', '"none"', '"both"']
    elif jsType == 'coordinates':
        attributeValue = '0,0,10,10'
        jsValue = '"0,0,10,10"'
    elif jsType == 'shape':
        attributeValue = ['rect', 'rectangle', 'poly', 'polygon', 'circ', 'circle']
        jsValue = ['"rect"', '"rectangle"', '"poly"', '"polygon"', '"circ"', '"circle"']
    elif jsType == 'shape2upper':
        attributeValue = ['rect', 'rectangle', 'poly', 'polygon', 'circ', 'circle']
        jsValue = ['"RECT"', '"RECT"', '"POLY"', '"POLY"', '"CIRCLE"', '"CIRCLE"']
    elif jsType == 'timecode':
        attributeValue = '00:00:00.00'
        jsValue = '"00:00:00.00"'
    elif jsType == 'datetime':
        attributeValue = '2008-01-01T00:00:00Z'
        jsValue = '"2008-01-01T00:00:00Z"'
    elif jsType == 'bgproperties':
        attributeValue = 'fixed'
        jsValue = '"fixed"'
    elif jsType == 'units':
        attributeValue = 'px'
        jsValue = '"px"'
    elif jsType == 'mimetype':
        attributeValue = 'text/html'
        jsValue = '"text/html"'
    elif jsType == 'httpmethod':
        attributeValue = 'GET'
        jsValue = '"GET"'
    elif jsType == 'httpmethod2lower':
        attributeValue = 'GET'
        jsValue = '"get"'
    elif jsType == 'onoff':
        attributeValue = ['on', 'off']
        jsValue = ['"on"', '"off"']
    elif jsType == 'yesnoauto':
        attributeValue = ['yes', 'no', 'auto']
        jsValue = ['"yes"', '"no"', '"auto"']
    elif jsType == 'yesno':
        attributeValue = ['yes', 'no']
        jsValue = ['true', 'false']
    elif jsType == 'security':
        attributeValue = 'restricted'
        jsValue = '"restricted"'
    elif jsType == 'clipping':
        attributeValue = 'clip'
        jsValue = '"clip"'
    elif jsType == 'showhide':
        attributeValue = 'show'
        jsValue = '"show"'
    elif jsType == 'marqueebehavior':
        attributeValue = ['scroll', 'alternate', 'slide']
        jsValue = ['"scroll"', '"alternate"', '"slide"']
    elif jsType == 'marqueedirection':
        attributeValue = ['left', 'right', 'down', 'up']
        jsValue = ['"left"', '"right"', '"down"', '"up"']
    elif jsType == 'spacertype':
        attributeValue = 'vertical'
        jsValue = '"vertical"'
    elif jsType == 'mediatype':
        attributeValue = ['screen', 'print', 'all']
        jsValue = ['"screen"', '"print"', '"all"']
    elif jsType == 'tableframe':
        attributeValue = ['void', 'above', 'below', 'border', 'box', 'hsides', 'lhs', 'rhs', 'vsides']
        jsValue = ['"void"', '"above"', '"below"', '"border"', '"box"', '"hsides"', '"lhs"', '"rhs"', '"vsides"']
    elif jsType == 'tablerules':
        attributeValue = ['all', 'cols', 'groups', 'none', 'rows']
        jsValue = ['"all"', '"cols"', '"groups"', '"none"', '"rows"']
    elif jsType == 'tablescope':
        attributeValue = ['row', 'col', 'rowgroup', 'colgroup']
        jsValue = ['"row"', '"col"', '"rowgroup"', '"colgroup"']
    elif jsType == 'textwrap':
        attributeValue = ['soft', 'hard', 'off']
        jsValue = ['"soft"', '"hard"', '"off"']
    elif jsType == 'buttontype':
        attributeValue = ['button', 'reset', 'submit']
        jsValue = ['"button"', '"reset"', '"submit"']
    elif jsType == 'listtype':
        attributeValue = ['1', 'a', 'A', 'i', 'I', 'disc', 'circle', 'square']
        jsValue = ['"1"', '"a"', '"A"', '"i"', '"I"', '"disc"', '"circle"', '"square"']
    elif jsType == 'blockquotetype':
        attributeValue = 'jwz'
        jsValue = '"jwz"'
    elif jsType == 'commandtype':
        attributeValue = 'command'
        jsValue = '"command"'
    elif jsType == 'enctype':
        attributeValue = 'application/x-www-form-urlencoded'
        jsValue = '"application/x-www-form-urlencoded"'
    elif jsType == 'imagestarttype':
        attributeValue = ['fileopen', 'mouseover']
        jsValue = ['"fileopen"', '"mouseover"']
    else:
        attributeValue = 'foo'
        jsValue = '"foo"'
    def generateOutput(minimizeExistenceBooleans=1):
        output = TEMPLATE % globals()
        if elementName == 'body':
            output = output.replace('<body>', '').replace('</body>', '').replace("document.getElementById('test')", 'document.body')
        if jsType in ('existencebool', 'existence2stringbool') and minimizeExistenceBooleans:
            output = output.replace(attributeName + '="' + attributeValue + '"', attributeName)
        if elementName in ('frame', 'iframe') and attributeName != 'src':
            output = output.replace('frame id="test"', 'frame id="test" src="blank.html"')
        if elementName == 'frame':
            output = output.replace('''
<frame''', '''
<frameset><frame''').replace('</frame>', '</frame></frameset>')
        if elementName in ('caption', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'):
            output = output.replace('''
<''' + elementName, '''
<table><''' + elementName)
            output = output.replace('</' + elementName + '>', '</' + elementName + '></table>')
        if elementName == 'area':
            output = output.replace('''
<area''', '''
<map><area''').replace('</area>', '</area></map>')
        if elementName in ('option', 'optgroup'):
            output = output.replace('<' + elementName, '<select><' + elementName)
            output = output.replace('</' + elementName + '>', '</' + elementName + '></select>')
        if elementName == 'legend':
            output = output.replace('''
<legend''', '''
<fieldset><legend''').replace('</legend>', '</legend></fieldset>')
        return output
    if type(attributeValue) == type([]):
        attributeValues = attributeValue[:]
        jsValues = jsValue[:]
        for attributeValue, jsValue in map(None, attributeValues, jsValues):
            output = generateOutput()
            testFile = 'html/attributes/' + elementName + '-' + attributeName + '-' + attributeValue + '-reflection-test.html'
            print testFile.lower()
            file(testFile.lower(), 'w').write(output)
    else:
        output = generateOutput()
        testFile = 'html/attributes/' + elementName + '-' + attributeName + '-reflection-test.html'
        print testFile.lower()
        file(testFile.lower(), 'w').write(output)
    if jsType == 'existencebool':
        jsValue = 'false'
        output = generateOutput(minimizeExistenceBooleans=0)
        output = output.replace(' ' + attributeName + '="' + attributeName + '"', '')
        testFile = 'html/attributes/' + elementName + '-' + attributeName + '-absent-reflection-test.html'
        print testFile.lower()
        file(testFile.lower(), 'w').write(output)
