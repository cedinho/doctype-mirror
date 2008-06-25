import glob, re

def crumb(wikifile, crumbList):
    lines = file(wikifile).readlines()
    breadcrumb = 'You are here: ' + ' > '.join([wikiname and '[%s %s]' % (wikiname, wikititle) or '*%s*' % wikititle for wikiname, wikititle in crumbList]) + '\n'
    output = []
    done = 0
    pragma = 1
    next = 0
    for line in lines:
        if not line.startswith('#'):
            pragma = 0
        if (not pragma) and (not done) and (line.strip()):
            if line.startswith('You are here: ['):
                line = breadcrumb
            else:
                output.append(breadcrumb)
                output.append('\n')
            done = 1
        output.append(line)
    outputString = ''.join(output)
    print wikifile
#    print outputString
    file(wikifile, 'w').write(outputString)

# HTML elements
for wikiname, parent, element in [e.strip().split(' ', 2) for e in file('html/elements/elements.txt').readlines()]:
    if parent != 'null': continue
    crumb('../../wiki/%s.wiki' % wikiname,
          [('Welcome', 'Home'), ('HTMLReference', 'HTML Reference'), ('HTMLElements', 'Elements'), ('', '<%s> element' % element)])

# HTML attributes
for line in file('html/attributes/attributes.txt').readlines():
    if line.startswith('#'): continue
    wikiname, element, attrname, jsname, jstype = line.split(' ', 4)
    crumb('../../wiki/%s.wiki' % wikiname,
          [('Welcome', 'Home'), ('HTMLReference', 'HTML Reference'), ('HTMLElements', 'Elements'), ('%sElement' % element.capitalize(), '<%s> element' % element), ('', '%s attribute' % attrname)])

# character entities

# CSS colors
for colorname, colorhex, colorrgb in [e.split() for e in file('css/colors/colorlist.txt').readlines()]:
    wikifile = colorname.capitalize() + 'CSSColor.wiki'
    crumb('../../wiki/%s' % wikifile,
          [('Welcome', 'Home'), ('CSSReference', 'CSS Reference'), ('CSSColors', 'Colors'), ('', '%s' % colorname)])
          
# CSS properties
for line in file('css/properties/cssproperties.txt').readlines():
    wikiname, element, propname, z = line.split(' ', 3)
    crumb('../../wiki/%s.wiki' % wikiname,
          [('Welcome', 'Home'), ('CSSReference', 'CSS Reference'), ('CSSProperties', 'Properties'), ('', '%s' % propname)])

# CSS pseudo-classes and pseudo-elements

# DOM objects

# DOM properties and methods

# DOM events
