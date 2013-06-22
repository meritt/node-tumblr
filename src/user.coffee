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

  # Retrieve blog info.
  # This method returns general information about the blog,
  # such as the title, number of posts, and other high-level data.
  @info = (fn) ->
    url = RequestUtils.userUrl 'info', @

    RequestUtils.oauthGet url, @, fn

).call(User.prototype)
