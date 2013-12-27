var  Tagged = require('../lib').Tagged
    ,oauth  = {};

if(process.env.NODE_CKEY) oauth.consumer_key    = process.env.NODE_CKEY; // FILL THIS
if(process.env.NODE_CSEC) oauth.consumer_secret = process.env.NODE_CSEC; // FILL THIS

module.exports = {
  setUp: function(next) {
    this.tags = new Tagged(oauth);
    next();
  },

  testString: function(test) {
    this.tags('Zdzisław Beksiński', function(e, r) {
      test.ifError(e);
      test.ok(r);
      test.ok(r.length);
      test.done();
    });
  },

  testObject: function(test) {
    this.tags({ "tag": "Zdzisław Beksiński", "limit": 5 }, function(e, r) {
      test.ifError(e);
      test.ok(r);
      test.ok(r.length);
      test.done();
    });
  },
};