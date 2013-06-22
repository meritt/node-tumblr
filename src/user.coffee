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
  @dashboard = (fn) ->
    url = RequestUtils.userUrl 'dashboard', @

    RequestUtils.oauthGet url, @, fn

  # Retrieve the user's likes.
  # This method returns retrieve the liked posts that matches
  # the OAuth credentials submitted with the request.
  @likes = (fn) ->
    url = RequestUtils.userUrl 'likes', @

    RequestUtils.oauthGet url, @, fn

  # Retrieve the user's following blogs.
  # This method returns retrieve the following blogs that matches
  # the OAuth credentials submitted with the request.
  @following = (fn) ->
    url = RequestUtils.userUrl 'following', @

    RequestUtils.oauthGet url, @, fn

).call(User.prototype)
