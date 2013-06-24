var Blog = require('../lib').Blog;

module.exports = {
  setUp: function(callback) {
    this.blog = new Blog('musiclover261.tumblr.com', {consumer_key: '0S8LLINIwPsMy8dFgsAyUInDAxUrKn52YXy0ez4930hwfhO3LF'});
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