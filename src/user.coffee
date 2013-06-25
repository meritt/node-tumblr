request = require './request'

# User
# ------

# Constructor
module.exports = User = (@oauth) ->

(->

  # Retrieve the user info.
  # This method returns general information about the user,
  # such as the name, number of folloing, and other.
  @info = (fn) ->
    url = request.userUrl 'info'

    request.oauthGet url, @oauth, fn

  # Create alias for each type of user actions
  alias = (self, action) ->
    self[type] = (options, fn) ->
      [fn, options] = [options, null] if typeof options is 'function'
      url = request.userUrl action, options

      request.oauthGet url, @oauth, fn

  # Alias for dashboard, likes, following requests
  # This methods returns retrieve the following blogs that matches
  # the OAuth credentials submitted with the request.
  alias @, type for type in ['dashboard', 'likes', 'following']

).call(User.prototype)
