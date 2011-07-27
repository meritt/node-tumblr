# Tumblr

A Node.JS wrapper for [Tumblr's API v2](http://www.tumblr.com/docs/en/api/v2).

How to use in JavaScript
------------------------

	var Tumblr = require('tumblr').Tumblr;

	var blog = new Tumblr('blog.tumblr.com', 'OAuth Consumer Key');

	blog.text({limit: 2}, function(response) {
		console.log(response.posts);
	});

Or with CoffeeScript
--------------------

	Tumblr = require('tumblr').Tumblr

	blog = new Tumblr 'blog.tumblr.com', 'OAuth Consumer Key'

	blog.text limit: 2, (response) ->
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

Author
------

* Alexey Simonenko, dwarfman@gmail.com