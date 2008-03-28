import glob, re, sys, os

# these will change regularly
TEST_FILES   = 'css/*/*-test.html'
ERROR_FILES  = [r'c:\work\doctype\trunk\tests\css\css-ie8.txt',
                r'c:\work\doctype\trunk\tests\css\css-ie7.txt',
                r'c:\work\doctype\trunk\tests\css\css-ie6.txt',
                r'c:\work\doctype\trunk\tests\css\css-ff3.txt',
                r'c:\work\doctype\trunk\tests\css\css-ff2.txt',
                r'c:\work\doctype\trunk\tests\css\css-saf3.txt']
#TEST_FILES   = 'html/attributes/*-reflection-test.html'
#ERROR_FILES  = [r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-ie8.txt',
#                r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-ie7.txt',
#                r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-ie6.txt',
#                r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-ff3.txt',
#                r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-ff2.txt',
#                r'c:\work\doctype\trunk\tests\html\attributes\attr-reflection-saf3.txt']

# these will change rarely
TABLE_START    = '|| *Test*'
TABLE_HEADERS  = '|| *Test* || *IE8* || *IE7* || *IE6* || *FF3* || *FF2* || *Saf3* ||'
NUM_COLUMNS    = 6
SECTION_START  = '== Browser compatibility =='
SECTION_END    = '== Further reading =='
TESTURL_PREFIX = 'http://doctype.googlecode.com/svn/trunk/tests/'

# these will never change
class DoctypeException(Exception): pass
class CantFindStartOfBrowserCompatibilitySection(DoctypeException): pass
class CantFindEndOfBrowserCompatibilitySection(DoctypeException): pass
class SectionsInWrongOrder(DoctypeException): pass
class MalformedRow(DoctypeException): pass
class NoLink(DoctypeException): pass
class MalformedLink(DoctypeException): pass
class NoLinkType(DoctypeException): pass

def validateWikiData(wikiData):
    start = wikiData.find(SECTION_START)
    end = wikiData.find(SECTION_END)
    if start == -1:
#        raise CantFindStartOfBrowserCompatibilitySection, wikiFile
        return 0
    if end == -1:
        if wikiData.endswith('\n=='):
            wikiData += ' Further reading ==\n'
            end = wikiData.find(SECTION_END)
            file(wikiFile, 'w').write(wikiData)
            print 'fixed further reading section in', wikiFile
        else:
            raise CantFindEndOfBrowserCompatibilitySection, wikiFile
    if end < start:
        raise SectionsInWrongOrder, wikiFile
    return 1

def loadTable(wikiFile):
    tests = []
    wikiData = file(wikiFile).read()
    if not validateWikiData(wikiData):
        return []
    raw = wikiData.split(SECTION_START, 1)[1].split(SECTION_END, 1)[0]
    start = raw.find(TABLE_START)
    if start == -1:
        return []
    raw = raw.replace('\r\n', '\n').replace('\r', '\n')
    lines = [l.strip() for l in raw.split('\n')]
    lines = [l for l in lines if l.startswith('||') and l.endswith('||')]
    for l in lines:
        if l.startswith(TABLE_START): continue
        if l.count('||') != NUM_COLUMNS + 2:
            raise MalformedRow, wikiFile
        col0 = l.split('||')[1].strip()
        if col0.count('[') != 1:
            raise NoLink, wikiFile
        col0 = col0.split('[', 1)[1].strip()
        if col0.count(']') != 1:
            raise NoLink, wikiFile
        col0 = col0.split(']', 1)[0].strip()
        if not col0.startswith('http://'):
            raise MalformedLink, wikiFile
        if len(col0.split(' ', 1)) != 2:
            raise MalformedLink, wikiFile
        testURL, testName = col0.split(' ', 1)
        values = [col.strip() for col in l.split('||')[2:-1]]
        tests.append({'testURL': testURL, 'testName': testName, 'values': values})
    return tests
    
def testLoadTable():
    wikiFiles = glob.glob(r'../../wiki/*.wiki')
    for f in wikiFiles:
        print loadTable(f)

def saveTable(wikiFile, tests):
    wikiData = file(wikiFile).read()
    if not tests: return wikiData
    validateWikiData(wikiData)
    rawlist = [TABLE_HEADERS]
    for t in tests:
        t['rawvalues'] = ' || '.join(t['values'])
        line = '|| [%(testURL)s %(testName)s] || %(rawvalues)s ||' % t
        rawlist.append(line)
    raw = '\n'.join(rawlist)
    before, after = wikiData.split(SECTION_START, 1)
    after = after.split(SECTION_END, 1)[1]
    wikiData = before + SECTION_START + '\n\n' + raw + '\n\n' + SECTION_END + after
    return wikiData

def testSaveTable():
    wikiFiles = glob.glob(r'../../wiki/*.wiki')
    for f in wikiFiles:
        beforeData = file(f).read()
        tests = loadTable(f)
        afterData = saveTable(f, tests)
        if beforeData != afterData:
            print 'could not round-trip test data in', f

def loadErrors(testFilesGlob, errorFile):
    errors = [l.split(':test', 1)[0].split('///', 1)[1].split('tests/', 1)[1].lower() for l in file(errorFile).readlines() if l.find('. file:///') != -1]
    if not errors:
        errors = [testFilesGlob.split('*', 1)[0] + l.split('.', 1)[1].split(':', 1)[0].strip().lower() for l in file(errorFile).readlines() if re.match('^\d+[.] ', l)]
    return errors

#testLoadTable()
#testSaveTable()
#sys.exit(0)

columnIndex = -1
for errorFile in ERROR_FILES:
    columnIndex += 1
    if (not errorFile) or (not os.path.exists(errorFile)): continue
    errors = loadErrors(TEST_FILES, errorFile)
    #print "\n".join(errors)
    testFiles = glob.glob(TEST_FILES)
    for testFile in testFiles:
        testFile = testFile.replace('\\', '/').replace('//', '/').lower()
        print testFile
        testData = file(testFile).read().replace('\r\n', '\n')
        rawTestData = testData.split('<script type="text/javascript">\n', 1)[1].split('</script>', 1)[0]
        wikiName, testName = rawTestData.split('[', 1)[1].split(']', 1)
        testName = testName.split(',\n', 1)[0]
        testName = testName[:-1].strip()
        wikiFile = '../../wiki/' + wikiName + '.wiki'
        wikiTests = loadTable(wikiFile)
        testAlreadyExists = (testName in [t['testName'] for t in wikiTests])
        if not testAlreadyExists:
            print 'adding', testName, 'to', wikiName
            wikiTests.append({'testURL': TESTURL_PREFIX + testFile,
                              'testName': testName,
                              'values': ['?'] * NUM_COLUMNS})
        for wikiTest in wikiTests:
            if wikiTest['testName'] != testName: continue
            wikiTest['values'][columnIndex] = (testFile in errors) and 'N' or 'Y'
        output = saveTable(wikiFile, wikiTests)
        file(wikiFile, 'w').write(output)
    print 'matched against', len(errors), 'errors'
