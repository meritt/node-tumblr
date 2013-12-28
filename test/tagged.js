var Tagged = require('../lib').Tagged;

var oauth = {
  consumer_key: '' // FILL THIS
};

if (process.env.NODE_CKEY) {
  oauth.consumer_key = process.env.NODE_CKEY;
}

module.exports = {
  setUp: function(next) {
    this.tags = new Tagged(oauth);
    next();
  },

  testSearch: function(test) {
    this.tags.search('Zdzisław Beksiński', function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.length);
      test.done();
    });
  },

  testOptions: function(test) {
    this.tags.search("Zdzisław Beksiński", {"limit": 5}, function(err, response) {
      test.ifError(err);
      test.ok(response);
      test.ok(response.length);
      test.done();
    });
  },
};