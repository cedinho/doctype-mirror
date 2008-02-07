function htmlattributessuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/html/attributes/a-tabIndex-reflects-tabindex-test.html");
  testSuite.addTestPage("../tests/html/attributes/div-tabIndex-reflects-tabindex-test.html");
  return testSuite;
}
