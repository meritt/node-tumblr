# tumblr

[![NPM version](https://badge.fury.io/js/tumblr.svg)](http://badge.fury.io/js/tumblr) [![Build Status](https://travis-ci.org/meritt/node-tumblr.svg?branch=master)](https://travis-ci.org/meritt/node-tumblr) [![Dependency Status](https://david-dm.org/meritt/node-tumblr.svg?theme=shields.io)](https://david-dm.org/meritt/node-tumblr) [![devDependency Status](https://david-dm.org/meritt/node-tumblr/dev-status.svg?theme=shields.io)](https://david-dm.org/meritt/node-tumblr#info=devDependencies)

A node.js wrapper for the [Tumblr API v2](http://www.tumblr.com/docs/en/api/v2).

## Installation

```bash
$ npm install tumblr
```

## Examples

```js
var tumblr = require('tumblr');

var oauth = {
  consumer_key: 'OAuth Consumer Key',
  consumer_secret: 'OAuth Consumer Secret',
  token: 'OAuth Access Token',
  token_secret: 'OAuth Access Token Secret'
};

var blog = new tumblr.Blog('blog.tumblr.com', oauth);

blog.text({limit: 2}, function(error, response) {
  if (error) {
    throw new Error(error);
  }

  console.log(response.posts);
});

var user = new tumblr.User(oauth);

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

## API

#### Blog

* `info(callback)`
* `avatar([size, ]callback)`
* `followers([options, ]callback)`
* `likes([options, ]callback)`
* `posts([options, ]callback)`
* `text([options, ]callback)`
* `quote([options, ]callback)`
* `link([options, ]callback)`
* `answer([options, ]callback)`
* `video([options, ]callback)`
* `audio([options, ]callback)`
* `photo([options, ]callback)`

Options list please refer to [Tumblr API v2 - Blog Methods](http://www.tumblr.com/docs/en/api/v2#blog_methods)

#### User

* `info(callback)`
* `dashboard([options, ]callback)`
* `likes([options, ]callback)`
* `following([options, ]callback)`

Options list please refer to [Tumblr API v2 - User Methods](http://www.tumblr.com/docs/en/api/v2#user-methods)

#### Tagged

* `search(tag[, options], callback)`

Options list please refer to [Tumblr API v2 - Tagged Methods](http://www.tumblr.com/docs/en/api/v2#tagged-method)

## Contributing

**DO NOT directly modify the `lib` files.** These files are automatically built from CoffeeScript sources located under the `src` directory.

To do build run:

```bash
npm run build
```

## Credits

Big thanks to all [contributors](https://github.com/meritt/node-tumblr/graphs/contributors).

## License

The MIT License, see the included `license.md` file.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/meritt/node-tumblr/trend.png)](https://bitdeli.com/free "Bitdeli Badge")