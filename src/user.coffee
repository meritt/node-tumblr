###
  node-tumblr 0.2.0
  (c) 2013 Greg Wang
###

RequestUtils = require './requestutils'
qs = require 'querystring'

# User
# ------

# Constructor
module.exports = User = (consumer_key, consumer_secret, token, token_secret) ->
  @consumer_key  = consumer_key
  @consumer_secret = consumer_secret
  @token = token
  @token_secret = token_secret

(->

  # Retrieve the user info.
  # This method returns general information about the user,
  # such as the name, number of folloing, and other.
  @info = (fn) ->
    url = RequestUtils.userUrl 'info', @

    RequestUtils.oauthGet url, @, fn

  # Retrieve the user's dashboard.
  # This method returns retrieve the dashboard that matches
  # the OAuth credentials submitted with the request.
  @dashboard = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'
    url = RequestUtils.userUrl 'dashboard', @, options

    RequestUtils.oauthGet url, @, fn

  # Retrieve the user's likes.
  # This method returns retrieve the liked posts that matches
  # the OAuth credentials submitted with the request.
  @likes = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'
    url = RequestUtils.userUrl 'likes', @, options

    RequestUtils.oauthGet url, @, fn

  # Retrieve the user's following blogs.
  # This method returns retrieve the following blogs that matches
  # the OAuth credentials submitted with the request.
  @following = (options, fn) ->
    [fn, options] = [options, null] if typeof options is 'function'
    url = RequestUtils.userUrl 'following', @, options

    RequestUtils.oauthGet url, @, fn

).call(User.prototype)
