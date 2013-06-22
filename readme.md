# Tumblr

A Node.JS wrapper for the [Tumblr API v2](http://www.tumblr.com/docs/en/api/v2).

Forked from Alexey Simonenko. Refactor and enhanced by Greg Wang.

## Contributors

* [Alexey Simonenko](mailto:alexey@simonenko.su), [simonenko.su](http://simonenko.su)
* [Greg Wang](https://github.com/gregwym), <http://gregwym.info>

# Usage

## Install with NPM

	npm install https://github.com/gregwym/node-tumblr/archive/master.tar.gz


## How to use with JavaScript

```
var Blog = require('tumblr').Blog;
var blog = new Blog('blog.tumblr.com', 'OAuth Consumer Key');

blog.text({limit: 2}, function(error, response) {
	if (error) {
		throw new Error(error);
	}

	console.log(response.posts);
});

var User = require('tumblr').User;
var user = new User('Consumer Key', 'Consumer Secret', 'Token', 'Token Secret');

user.info(function(error, response) {
	if (error) {
		throw new Error(error);
	}
	
	console.log(response.user);
});
```

## Or with CoffeeScript

```
{Blog} = require 'tumblr'
blog = new Blog 'blog.tumblr.com', 'OAuth Consumer Key'

blog.text limit: 2, (error, response) ->
	throw new Error error if error
	console.log response.posts

{User} = require 'tumblr'
user = new User 'Consumer Key', 'Consumer Secret', 'Token', 'Token Secret'

user.info (error, response) ->
	throw new Error error if error
	console.log response.user
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

## User::

* info (*callback*)
* dashboard ([*options*, ]*callback*)
* likes ([*options*, ]*callback*)
* following ([*options*, ]*callback*)

Options list please refer to [Tumblr API v2 - User Methods](http://www.tumblr.com/docs/en/api/v2#user-methods)
