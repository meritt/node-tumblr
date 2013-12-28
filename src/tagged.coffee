request = require './request'

# Tagged
# ------

# Constructor
module.exports = Tagged = (@oauth) ->

(->

  # Retrieve tagged posts
  # Post are retrieved in a array
  @search = (tag, options, fn) ->
    if not tag
      throw new Error 'The tag is required'

    [fn, options] = [options, {}] if typeof options is 'function'

    options.tag = tag
    url = request.taggedUrl @, options

    request.get url, fn

).call(Tagged.prototype)