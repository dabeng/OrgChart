module.exports = {
  'Demo page': function (client) {
    client
      .url('http://localhost:3000')
      .waitForElementVisible('ol', 5000)
      .end();
  }
};