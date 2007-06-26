function jssuite() {
    var testSuite = new top.jsUnitTestSuite();
    testSuite.addTestSuite(jscryptosuite());
    testSuite.addTestSuite(jsdocumentsuite());
    testSuite.addTestSuite(jsexternalsuite());
    testSuite.addTestSuite(jshistorysuite());
    testSuite.addTestSuite(jslocationsuite());
    testSuite.addTestSuite(jsnavigatorsuite());
    testSuite.addTestSuite(jsscreensuite());
    testSuite.addTestSuite(jssidebarsuite());
    testSuite.addTestSuite(jswindowsuite());
    return testSuite;
}
