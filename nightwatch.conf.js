var SELENIUM_CONFIGURATION = {
  start_process: true,
  server_path: require('selenium-server-standalone-jar').path,
  host: '127.0.0.1',
  port: 4444
};

var FIREFOX_CONFIGURATION = {
  browserName: 'firefox',
  marionette: false,
  javascriptEnabled: true,
  acceptSslCerts: true
};

var DEFAULT_CONFIGURATION = {
  launch_url: 'http://localhost',
  selenium_port: 4444,
  selenium_host: 'localhost',
  desiredCapabilities: FIREFOX_CONFIGURATION
};

var ENVIRONMENTS = {
  default: DEFAULT_CONFIGURATION
};

module.exports = {
  src_folders: ['test/e2e'],
  selenium: SELENIUM_CONFIGURATION,
  test_settings: ENVIRONMENTS
};