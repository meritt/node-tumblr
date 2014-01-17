var Blog = require('../lib').Blog;

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
    this.blog = new Blog('node-travis.tumblr.com', oauth);
    callback();
  },

  testInfo: function(test) {
    this.blog.info(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.blog);
      test.done();
    });
  },

  testAvatar: function(test) {
    this.blog.avatar(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.avatar_url);
      test.done();
    });
  },

  testAvatarSize: function(test) {
    this.blog.avatar(512, function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.avatar_url);
      test.done();
    });
  },

  testFollowers: function(test) {
    this.blog.followers(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.total_users);
      test.ok(response.users);
      test.ok(response.users[0].name);
      test.ok(response.users[0].url);
      test.ok(response.users[0].updated);
      test.done();
    });
  },

  testLikes: function(test) {
    this.blog.likes(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.liked_posts);
      test.ok(response.liked_count);
      test.done();
    });
  },

  testPosts: function(test) {
    this.blog.posts(function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.blog);
      test.ok(response.posts);
      test.done();
    });
  }
};