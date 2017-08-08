const assert = require('assert');
const parse = require('commands/parse');

module.exports = function() {

  let actual = {}, expected = {};

  // REVISE
  actual = parse({
    was_comment: true, body: 'u/xyMarketBot revise',
    context: '/r/xyMarket/comments/6s1psl/daily_thread/'
  }),
  expected = {
    command: 'revise', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: revise');

  // ADD AUTOBUY ITEMS
  actual = parse({
    body: [
      'add autobuy items to 6s1psl',
      'item 1',
      'item 2'
    ].join('\n\n')
  }),
  expected = {
    command: 'add-autobuy-items',
    thread: '6s1psl',
    items: [
      'item 1', 'item 2'
    ]
  };
  assert.deepEqual(actual, expected, 'Command: add-autobuy-items');

  // LIST AUTOBUY ITEMS
  actual = parse({
    body: 'list autobuy items in 6s1psl'
  }),
  expected = {
    command: 'list-autobuy-items', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: list-autobuy-items');

  // CLEAR AUTOBUY ITEMS
  actual = parse({
    body: 'clear autobuy items in 6s1psl'
  }),
  expected = {
    command: 'clear-autobuy-items', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: clear-autobuy-items');

  // REMOVE
  actual = parse({
    was_comment: true, body: 'u/xyMarketBot remove',
    context: '/r/xyMarket/comments/6s1psl/daily_thread/'
  }),
  expected = {
    command: 'remove', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: remove');

}