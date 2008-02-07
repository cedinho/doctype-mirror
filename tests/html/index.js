function htmlsuite() {
    var testSuite = new top.jsUnitTestSuite();
    testSuite.addTestSuite(htmlattributessuite());
    testSuite.addTestSuite(htmlelementappliesstylesuite());
    testSuite.addTestSuite(htmlelementappearsindomsuite());
    return testSuite;
}
