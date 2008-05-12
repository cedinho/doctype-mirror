function jsscreensuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/screen/screen-availHeight-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-availLeft-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-availTop-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-availWidth-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-bufferDepth-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-colorDepth-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-deviceXDPI-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-deviceYDPI-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-fontSmoothingEnabled-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-height-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-left-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-logicalXDPI-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-logicalYDPI-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-pixelDepth-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-top-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-updateInterval-typeof-test.html");
  testSuite.addTestPage("../tests/js/screen/screen-width-typeof-test.html");
  return testSuite;
}
