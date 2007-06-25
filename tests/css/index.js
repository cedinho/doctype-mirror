function csssuite() {
    var testSuite = new top.jsUnitTestSuite();
    testSuite.addTestSuite(csscolorsuite());
    return testSuite;
}
