# Tumblr

A Node.JS wrapper for [Tumblr's API v2](http://www.tumblr.com/docs/en/api/v2).

[The announcement in Russian of this module in my blog.](http://go.simonenko.su/node-tumblr)

How to use in JavaScript
------------------------

	var Tumblr = require('tumblr').Tumblr;

	var blog = new Tumblr('blog.tumblr.com', 'OAuth Consumer Key');

	blog.text({limit: 2}, function(error, response) {
		if (error) {
		  throw new Error(error);
		}
		console.log(response.posts);
	});

Or with CoffeeScript
--------------------

	Tumblr = require('tumblr').Tumblr

	blog = new Tumblr 'blog.tumblr.com', 'OAuth Consumer Key'

	blog.text limit: 2, (error, response) ->
		throw new Error error if error
		console.log response.posts

Install with NPM
----------------

	npm install tumblr

API
---

* info (*callback*)
* posts ([*options*, ]*callback*)
* text ([*options*, ]*callback*)
* quote ([*options*, ]*callback*)
* link ([*options*, ]*callback*)
* answer ([*options*, ]*callback*)
* video ([*options*, ]*callback*)
* audio ([*options*, ]*callback*)
* photo ([*options*, ]*callback*)

[Options list](http://www.tumblr.com/docs/en/api/v2#posts)

Author
------

* Alexey Simonenko, dwarfman@gmail.com