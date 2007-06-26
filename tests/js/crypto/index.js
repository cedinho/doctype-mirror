function jscryptosuite() {
  var testSuite = new top.jsUnitTestSuite();
  testSuite.addTestPage("../tests/js/crypto/crypto-alert-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-disableRightClick-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-enableSmartCardEvents-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-generateCRMFRequest-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-importUserCertificates-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-logout-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-popChallengeResponse-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-random-typeof-test.html");
  testSuite.addTestPage("../tests/js/crypto/crypto-signText-typeof-test.html");
  return testSuite;
}
