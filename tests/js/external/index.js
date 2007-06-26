function jsexternalsuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/external/external-AddChannel-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-AddDesktopComponent-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-AddFavorite-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-AddSearchProvider-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-AutoCompleteSaveForm-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-AutoScan-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-ImportExportFavorites-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-IsSearchProviderInstalled-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-IsSubscribed-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-NavigateAndFind-typeof-test.html");
  testSuite.addTestPage("../tests/js/external/external-ShowBrowserUI-typeof-test.html");
  return testSuite;
}
