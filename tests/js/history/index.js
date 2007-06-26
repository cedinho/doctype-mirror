function jshistorysuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/history/history-back-typeof-test.html");
  testSuite.addTestPage("../tests/js/history/history-forward-typeof-test.html");
  testSuite.addTestPage("../tests/js/history/history-go-typeof-test.html");
  testSuite.addTestPage("../tests/js/history/history-length-typeof-test.html");
  return testSuite;
}
