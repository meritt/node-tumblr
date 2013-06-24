var User = require('../lib').User;

var oauth = {
  consumer_key: 'OAuth Consumer Key',
  consumer_secret: 'OAuth Consumer Secret',
  token: 'OAuth Access Token',
  token_secret: 'OAuth Access Token Secret'
};

module.exports = {
  setUp: function(callback) {
    this.user = new User(oauth);

    callback();
  },
  testInfo: function(test) {
    this.user.info(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.user);
      test.done();
    });
  },
  testDashboard: function(test) {
    this.user.dashboard(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.posts);
      test.done();
    });
  },
  testLikes: function(test) {
    this.user.likes(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.liked_posts);
      test.done();
    });
  },
  testFollowing: function(test) {
    this.user.following(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.blogs);
      test.done();
    });
  }
};