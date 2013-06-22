###
  node-tumblr 0.1.1
  (c) 2011-2013 Alexey Simonenko, Serenity LLC.
###

request = require 'request'
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

    retrieve url, fn

  # Retrieve blog avatar.
  # Get the blog's avatar in 9 different sizes.
  # The default size is 64x64.
  @avatar = (size, fn) ->
    [fn, size] = [size, null] if typeof size is 'function'
    url = urlFor 'avatar', @, {type:size}

    retrieve url, fn

  # Retrieve blog's likes.
  # Return the publicly exposed likes from the blog.
  @likes = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'
    url = urlFor 'likes', @, options

    retrieve url, fn

  # Retrieve published posts.
  # Posts are returned as an array attached to the posts field.
  @posts = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'

    url = urlFor 'posts', @, options

    retrieve url, fn

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
      '/' + options.type if options.type?      # optional type of post to return
      '?'
    ]

    delete options.type if options.type?
    options.api_key = self.consumerKey

    query = qs.stringify options
    params.push query                          # optional params

    params.join ''

  # Request API and call callback function with response
  retrieve = (url, fn = ->) ->
    request {url, followRedirect: false, json: true}, (err, response, body) ->
      if not err
        err = body.meta.msg if response.statusCode isnt 200 and response.statusCode isnt 301

      fn.call body, err, body.response

).call(Blog.prototype)
