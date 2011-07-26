##
# Tumblr API
##

xhr = require 'request'
qs  = require 'querystring'

Tumblr = exports.Tumblr = (host, key) ->
  @host = host
  @key  = key

(->

  @info = (fn) ->
    url = urlFor 'info', @

    request url, fn

  @posts = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'

    url = urlFor 'posts', @, options

    request url, fn

  for type in ['text', 'quote', 'link', 'answer', 'video', 'audio', 'photo']
    alias = (self, type) ->
      self[type] = (options, fn) ->
        options = {} if not options
        options.type = type if not options.type
        @posts options, fn

    alias @, type

  urlFor = (action, self, options = null) ->
    url = [
      'http://api.tumblr.com/v2/blog/'         # Tumblr API URL
      self.host + '/' + action                 # blog host and action
      '/' + options.type if options?.type?     # optional type of post to return
      '?api_key=' + self.key                   # API key
    ]

    delete options.type if options?.type?

    params = qs.stringify options
    url.push '&' + params if params isnt ''    # optional params

    url.join ''

  request = (url, fn = ->) ->
    xhr
      method: 'GET'
      uri:    url
    ,
    (error, request, body) ->
      body = JSON.parse body
      throw new Error body.meta.msg if body.meta.status isnt 200
      fn.call body, body.response

  @

).call(Tumblr.prototype)


##
# Example
##
tumblr = new Tumblr 'simonenko.tumblr.com', 'key'

tumblr.link limit: 2, (response) ->
  console.log response