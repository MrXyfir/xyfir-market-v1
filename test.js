require('app-module-path').addPath(__dirname);

require('tests/lib/threads/parse')();
require('tests/lib/threads/build')();
require('tests/commands/parse')();

console.log('Tests complete');