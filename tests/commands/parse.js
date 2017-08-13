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

  // PURCHASE (on thread)
  actual = parse({
    was_comment: true, body: 'u/xyMarketBot purchase 1 using BTC',
    context: '/r/xyMarket/comments/6s1psl/daily_thread/'
  }),
  expected = {
    command: 'purchase',
    escrow: false, thread: '6s1psl', quantity: 1, currency: 'BTC'
  };
  assert.deepEqual(actual, expected, 'Command: purchase');

  // PURCHASE (in message)
  actual = parse({
    body: 'buy 3 of 6s1psl using LTC and escrow'
  }),
  expected = {
    command: 'purchase',
    escrow: true, thread: '6s1psl', quantity: 3, currency: 'LTC'
  };
  assert.deepEqual(actual, expected, 'Command: purchase');

  // REQUEST ESCROW (without note)
  actual = parse({
    body: 'request escrow for 54321'
  }),
  expected = {
    command: 'request-escrow', order: 54321, note: 'None'
  };
  assert.deepEqual(actual, expected, 'Command: request-escrow');

  // REQUEST ESCROW (with note)
  actual = parse({
    body: 'request escrow for 54321\n\nsome note'
  }),
  expected = {
    command: 'request-escrow', order: 54321, note: 'some note'
  };
  assert.deepEqual(actual, expected, 'Command: request-escrow');

  // GIVE FEEDBACK
  actual = parse({
    body: 'give positive feedback for 54321'
  }),
  expected = {
    command: 'give-feedback', order: 54321, feedback: '', type: 1
  };
  assert.deepEqual(actual, expected, 'Command: give-feedback');

  // GIVE FEEDBACK
  actual = parse({
    body: 'give negative feedback for 54321 very bad!'
  }),
  expected = {
    command: 'give-feedback', order: 54321, feedback: 'very bad!', type: -1
  };
  assert.deepEqual(actual, expected, 'Command: give-feedback');

}