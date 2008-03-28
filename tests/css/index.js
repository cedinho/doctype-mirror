function csssuite() {
    var testSuite = new top.jsUnitTestSuite();
    testSuite.addTestSuite(csscolorsuite());
    testSuite.addTestSuite(csspropertysuite());
    return testSuite;
}
