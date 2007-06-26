function jssidebarsuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/sidebar/sidebar-addMicrosummaryGenerator-typeof-test.html");
  testSuite.addTestPage("../tests/js/sidebar/sidebar-addPanel-typeof-test.html");
  testSuite.addTestPage("../tests/js/sidebar/sidebar-addPersistentPanel-typeof-test.html");
  testSuite.addTestPage("../tests/js/sidebar/sidebar-addSearchEngine-typeof-test.html");
  return testSuite;
}
