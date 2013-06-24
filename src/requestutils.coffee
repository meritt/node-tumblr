module.exports = RequestUtils = {}
request = require 'request'
qs  = require 'querystring'

(->
  @blogUrl = (action, self, options = {}) ->
    params = [
      'http://api.tumblr.com/v2/blog/'         # Tumblr API URL
      self.host + '/' + action                 # blog host and action
      '/' + options.type if options.type?      # optional type of post to return
      '?'
    ]

    delete options.type if options.type?
    options.api_key = self.consumer_key

    query = qs.stringify options
    params.push query                          # optional params

    params.join ''

  @userUrl = (action, self, options = {}) ->
    params = [
      'http://api.tumblr.com/v2/user/'         # Tumblr API URL
      action                                   # action
      '?'
    ]

    query = qs.stringify options
    params.push query                          # optional params

    params.join ''

  # Send requests with API_KEY
  @req = (url, method = 'GET', fn, oauth) ->
    options = {url, method, followRedirect: false, json: true}
    options.oauth = oauth if oauth?
    request options, (err, response, body) ->
      if not err
        err = response.statusCode + ' ' + body.meta.msg if response.statusCode isnt 200 and response.statusCode isnt 301

      if fn?
        fn.call body, err, body.response

  @get = (url, fn) -> @req url, 'GET', fn
  @post = (url, fn) -> @req url, 'POST', fn

  # Send requests with OAuth
  @oauthGet = (url, oauth, fn) -> @req url, 'GET', fn, oauth
  @oauthPost = (url, oauth, fn) -> @req url, 'POST', fn, oauth

).call RequestUtils