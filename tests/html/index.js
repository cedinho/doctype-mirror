function htmlsuite() {
    var testSuite = new top.jsUnitTestSuite();
    testSuite.addTestSuite(htmlattributessuite());
    testSuite.addTestSuite(htmlelementssuite());
    return testSuite;
}
