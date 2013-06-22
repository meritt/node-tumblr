###
  node-tumblr 0.2.0
  (c) 2013 Greg Wang
###

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
    options.api_key = self.consumerKey

    query = qs.stringify options
    params.push query                          # optional params

    params.join ''

  @apikeyGet = (url, fn = ->) ->
    request.get {url, followRedirect: false, json: true}, (err, response, body) ->
      if not err
        err = body.meta.msg if response.statusCode isnt 200 and response.statusCode isnt 301

      fn.call body, err, body.response

).call RequestUtils
