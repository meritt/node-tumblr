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

  alias = (self, type) ->
    self[type] = (options, fn) ->
      options = {} if not options
      options.type = type if not options.type
      @posts options, fn

  alias @, type for type in ['text', 'quote', 'link', 'answer', 'video', 'audio', 'photo']

  urlFor = (action, self, options = null) ->
    params = [
      'http://api.tumblr.com/v2/blog/'         # Tumblr API URL
      self.host + '/' + action                 # blog host and action
      '/' + options.type if options?.type?     # optional type of post to return
      '?api_key=' + self.key                   # API key
    ]

    delete options.type if options?.type?

    query = qs.stringify options
    params.push '&' + query if query isnt ''   # optional params

    params.join ''

  request = (url, fn = ->) ->
    xhr {url}, (error, request, body) ->
      body = JSON.parse body
      throw new Error body.meta.msg if body.meta.status isnt 200
      fn.call body, body.response

).call(Tumblr.prototype)