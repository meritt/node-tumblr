var User = require('../lib').User;

module.exports = {
  setUp: function(callback) {
    this.user = new User('consumer_key',
                         'consumer_secret',
                         'token',
                         'token_secret');
    callback();
  },
  testInfo: function(test) {
    this.user.info(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.user);
      test.done();
    });
  }
};
