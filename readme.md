# Tumblr

A Node.JS wrapper for the [Tumblr API v2](http://www.tumblr.com/docs/en/api/v2).

Forked from Alexey Simonenko. Refactor and enhanced by Greg Wang.

## Contributors

* [Alexey Simonenko](mailto:alexey@simonenko.su), [simonenko.su](http://simonenko.su)
* [Greg Wang](https://github.com/gregwym), <http://gregwym.info>

# Usage

## Install with NPM

	npm install tumblr


## How to use with JavaScript

```javascript
var Tumblr = require('tumblr').Tumblr;

var blog = new Tumblr('blog.tumblr.com', 'OAuth Consumer Key');

blog.text({limit: 2}, function(error, response) {
	if (error) {
		throw new Error(error);
	}

	console.log(response.posts);
});
```

## Or with CoffeeScript

```coffeescript
{Tumblr} = require 'tumblr'

blog = new Tumblr 'blog.tumblr.com', 'OAuth Consumer Key'

blog.text limit: 2, (error, response) ->
	throw new Error error if error
	console.log response.posts
```

# API

## Blog::

* info (*callback*)
* avatar ([*size*, ]*callback*)
* likes ([*options*, ]*callback*)
* posts ([*options*, ]*callback*)
* text ([*options*, ]*callback*)
* quote ([*options*, ]*callback*)
* link ([*options*, ]*callback*)
* answer ([*options*, ]*callback*)
* video ([*options*, ]*callback*)
* audio ([*options*, ]*callback*)
* photo ([*options*, ]*callback*)

Options list please refer to [Tumblr API v2 - Blog Methods](http://www.tumblr.com/docs/en/api/v2#blog_methods)
