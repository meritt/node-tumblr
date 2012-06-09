(function() {
  /*
    node-tumblr 0.0.3
    (c) 2011 Alexey Simonenko, Serenity LLC.
    For all details and documentation:
    http://go.simonenko.su/node-tumblr
  */  var Tumblr, qs, xhr;
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
    _ref = ['text', 'quote', 'link', 'answer', 'video', 'audio', 'photo'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      alias(this, type);
    }
    urlFor = function(action, self, options) {
      var params, query;
      if (options == null) {
        options = null;
      }
      params = ['http://api.tumblr.com/v2/blog/', self.host + '/' + action, (options != null ? options.type : void 0) != null ? '/' + options.type : void 0, '?api_key=' + self.key];
      if ((options != null ? options.type : void 0) != null) {
        delete options.type;
      }
      query = qs.stringify(options);
      if (query !== '') {
        params.push('&' + query);
      }
      return params.join('');
    };
    return request = function(url, fn) {
      if (fn == null) {
        fn = function() {};
      }
      return xhr({
        url: url
      }, function(error, request, body) {
        var err;
        try {
          body = JSON.parse(body);
          if (body.meta.status !== 200) {
            err = body.meta.msg;
          }
        } catch(e) {
          err = "Invalid Response";
        }
        return fn.call(body, err, body.response);
      });
    };
  }).call(Tumblr.prototype);
}).call(this);
