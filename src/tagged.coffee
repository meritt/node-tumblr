request = require './request'

# Tagged
# ------

# Constructor
module.exports = Tagged = (@oauth) ->
  self = @

  # Retrieve tagged posts
  # Post are retrieved in a array
  (options, fn)->
    if typeof options == 'string'
      options = 
        tag: options 
 
    url = request.taggedUrl self, options

    request.get url, fn