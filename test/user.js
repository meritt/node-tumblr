var User = require('../lib').User;

var oauth = {
  consumer_key: '',    // FILL THIS
  consumer_secret: '', // FILL THIS
  token: '',           // FILL THIS
  token_secret: ''     // FILL THIS
};

if (process.env.NODE_CKEY) {
  oauth.consumer_key = process.env.NODE_CKEY;
}
if (process.env.NODE_CSEC) {
  oauth.consumer_secret = process.env.NODE_CSEC;
}
if (process.env.NODE_TOKN) {
  oauth.token = process.env.NODE_TOKN;
}
if (process.env.NODE_TSEC) {
  oauth.token_secret = process.env.NODE_TSEC;
}

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