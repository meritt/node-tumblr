# Tumblr

A Node.JS wrapper for the [Tumblr API v2](http://www.tumblr.com/docs/en/api/v2).

# Usage

## Install with NPM

	npm install node-tumblr

## Run the Unit Test

Fill in the authentication information in `test/user.js`, then run

	nodeunit test

Obviously you must have `nodeunit` installed.

## How to use with JavaScript

```javascript
var oauth = {
	consumer_key: 'OAuth Consumer Key',
	consumer_secret: 'OAuth Consumer Secret',
	token: 'OAuth Access Token',
	token_secret: 'OAuth Access Token Secret'
};

var Blog = require('tumblr').Blog;
var blog = new Blog('blog.tumblr.com', oauth);

blog.text({limit: 2}, function(error, response) {
	if (error) {
		throw new Error(error);
	}
	
	console.log(response.posts);
});

var User = require('tumblr').User;
var user = new User(oauth);

user.info(function(error, response) {
	if (error) {
		throw new Error(error);
	}
	
	console.log(response.user);
});
```

## Or with CoffeeScript

```coffeescript
{Blog, User} = require 'tumblr'

oauth =
	consumer_key: 'OAuth Consumer Key'
	consumer_secret: 'OAuth Consumer Secret'
	token: 'OAuth Access Token'
	token_secret: 'OAuth Access Token Secret'

blog = new Blog 'blog.tumblr.com', oauth

blog.text limit: 2, (error, response) ->
	throw new Error error if error
	console.log response.posts

user = new User oauth

user.info (error, response) ->
	throw new Error error if error
	console.log response.user
```

# API

## Blog

* info (callback)
* avatar ([size, ]callback)
* likes ([options, ]callback)
* posts ([options, ]callback)
* text ([options, ]callback)
* quote ([options, ]callback)
* link ([options, ]callback)
* answer ([options, ]callback)
* video ([options, ]callback)
* audio ([options, ]callback)
* photo ([options, ]callback)

Options list please refer to [Tumblr API v2 - Blog Methods](http://www.tumblr.com/docs/en/api/v2#blog_methods)

## User

* info (callback)
* dashboard ([options, ]callback)
* likes ([options, ]callback)
* following ([options, ]callback)

Options list please refer to [Tumblr API v2 - User Methods](http://www.tumblr.com/docs/en/api/v2#user-methods)

## Contributors

* [Alexey Simonenko](mailto:alexey@simonenko.su), [simonenko.su](http://simonenko.su)
* [Greg Wang](https://github.com/gregwym), <http://gregwym.info>