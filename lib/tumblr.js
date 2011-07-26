(function() {
  var Tumblr, qs, xhr;
  xhr = require('request');
  qs = require('querystring');
  Tumblr = exports.Tumblr = function(host, key) {
    this.host = host;
    return this.key = key;
  };
  (function() {
    var alias, request, type, urlFor, _i, _len, _ref;
    this.info = function(fn) {
      var url;
      url = urlFor('info', this);
      return request(url, fn);
    };
    this.posts = function(options, fn) {
      var url, _ref;
      if (typeof options === 'function') {
        _ref = [options, null], fn = _ref[0], options = _ref[1];
      }
      url = urlFor('posts', this, options);
      return request(url, fn);
    };
    _ref = ['text', 'quote', 'link', 'answer', 'video', 'audio', 'photo'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      alias = function(self, type) {
        return self[type] = function(options, fn) {
          if (!options) {
            options = {};
          }
          if (!options.type) {
            options.type = type;
          }
          return this.posts(options, fn);
        };
      };
      alias(this, type);
    }
    urlFor = function(action, self, options) {
      var params, url;
      if (options == null) {
        options = null;
      }
      url = ['http://api.tumblr.com/v2/blog/', self.host + '/' + action, (options != null ? options.type : void 0) != null ? '/' + options.type : void 0, '?api_key=' + self.key];
      if ((options != null ? options.type : void 0) != null) {
        delete options.type;
      }
      params = qs.stringify(options);
      if (params !== '') {
        url.push('&' + params);
      }
      return url.join('');
    };
    request = function(url, fn) {
      if (fn == null) {
        fn = function() {};
      }
      return xhr({
        method: 'GET',
        uri: url
      }, function(error, request, body) {
        body = JSON.parse(body);
        if (body.meta.status !== 200) {
          throw new Error(body.meta.msg);
        }
        return fn.call(body, body.response);
      });
    };
    return this;
  }).call(Tumblr.prototype);
}).call(this);
