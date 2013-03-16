###
  node-tumblr 0.1.1
  (c) 2011-2013 Alexey Simonenko, Serenity LLC.
###

xhr = require 'request'
qs  = require 'querystring'

# Tumblr
# ------

# Constructor
Tumblr = exports.Tumblr = (host, key) ->
  @host = host
  @key  = key

(->

  # Retrieve blog info.
  # This method returns general information about the blog,
  # such as the title, number of posts, and other high-level data.
  @info = (fn) ->
    url = urlFor 'info', @

    request url, fn

  # Retrieve published posts.
  # Posts are returned as an array attached to the posts field.
  @posts = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'

    url = urlFor 'posts', @, options

    request url, fn

  # Create alias for each type of posts and forward this call to @posts method
  alias = (self, type) ->
    self[type] = (options, fn) ->
      options = {} if not options
      options.type = type if not options.type
      @posts options, fn

  # Alias text, quote, link, answer, video, audio and photo posts
  alias @, type for type in ['text', 'quote', 'link', 'answer', 'video', 'audio', 'photo']

  # Prepare url for API call
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

  # Request API and call callback function with response
  request = (url, fn = ->) ->
    xhr {url}, (error, request, body) ->
      try
        body = JSON.parse body
        err  = body.meta.msg if body.meta.status isnt 200
      catch error
        err = "Invalid Response: #{error}";

      fn.call body, err, body.response

).call(Tumblr.prototype)