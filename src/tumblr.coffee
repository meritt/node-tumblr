###
  node-tumblr 0.1.1
  (c) 2011-2013 Alexey Simonenko, Serenity LLC.
###

xhr = require 'request'
qs  = require 'querystring'

# Blog
# ------

# Constructor
Blog = exports.Blog = (host, consumerKey, consumerSecret, token, tokenSecret) ->
  @host = host
  @consumerKey  = consumerKey
  @consumerSecret = consumerSecret
  @token = token
  @tokenSecret = tokenSecret

(->

  # Retrieve blog info.
  # This method returns general information about the blog,
  # such as the title, number of posts, and other high-level data.
  @info = (fn) ->
    url = urlFor 'info', @

    request url, fn

  # Retrieve blog avatar.
  # Get the blog's avatar in 9 different sizes.
  # The default size is 64x64.
  @avatar = (size, fn) ->
    [fn, size] = [size, null] if typeof size is 'function'
    url = urlFor 'avatar', @, {type:size}

    request url, fn

  # Retrieve blog's likes.
  # Return the publicly exposed likes from the blog.
  @likes = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'
    url = urlFor 'likes', @, options

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
  urlFor = (action, self, options = {}) ->
    params = [
      'http://api.tumblr.com/v2/blog/'         # Tumblr API URL
      self.host + '/' + action                 # blog host and action
      '/' + options.type if options.type?     # optional type of post to return
      '?'
    ]

    delete options.type if options.type?
    options.api_key = self.consumerKey

    query = qs.stringify options
    params.push query if query isnt ''   # optional params

    params.join ''

  # Request API and call callback function with response
  request = (url, fn = ->) ->
    xhr {url, followRedirect: false}, (error, request, body) ->
      try
        body = JSON.parse body
        err  = body.meta.msg if body.meta.status isnt 200 and body.meta.status isnt 301
      catch error
        err = "Invalid Response: #{error}";

      fn.call body, err, body.response

).call(Blog.prototype)
