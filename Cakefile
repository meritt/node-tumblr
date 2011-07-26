require.paths.unshift "#{__dirname}/node_modules"

require.paths.unshift __dirname + '/lib'

{print} = require 'sys'
{spawn} = require 'child_process'

build = (callback) ->
  coffee = spawn 'coffee', ['-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()

task 'build', 'Build lib/ from src/', ->
  build()