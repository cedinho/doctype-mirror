function jslocationsuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/location/location-assign-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-hash-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-host-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-hostname-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-href-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-pathname-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-port-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-protocol-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-reload-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-replace-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-search-typeof-test.html");
  testSuite.addTestPage("../tests/js/location/location-toString-typeof-test.html");
  return testSuite;
}
