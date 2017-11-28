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

  // DELETE
  actual = parse({
    body: 'delete 6s1psl'
  }),
  expected = {
    command: 'delete', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: delete');

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
    body: 'buy 3 of 6s1psl using LTC'
  }),
  expected = {
    command: 'purchase',
    escrow: false, thread: '6s1psl', quantity: 3, currency: 'LTC'
  };
  assert.deepEqual(actual, expected, 'Command: purchase');

  // REQUEST ESCROW (without note)
  // actual = parse({
  //   body: 'request escrow for 54321'
  // }),
  // expected = {
  //   command: 'request-escrow', order: 54321, note: 'None'
  // };
  // assert.deepEqual(actual, expected, 'Command: request-escrow');

  // REQUEST ESCROW (with note)
  // actual = parse({
  //   body: 'request escrow for 54321\n\nsome note'
  // }),
  // expected = {
  //   command: 'request-escrow', order: 54321, note: 'some note'
  // };
  // assert.deepEqual(actual, expected, 'Command: request-escrow');

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

  // RELEASE ESCROW
  // actual = parse({
  //   body: 'release escrow for 54321'
  // }),
  // expected = {
  //   command: 'release-escrow', order: 54321
  // };
  // assert.deepEqual(actual, expected, 'Command: release-escrow');

  // VERIFY
  actual = parse({
    was_comment: true, context: '/r/xyMarket/comments/6s1psl/daily_thread/',
    body: 'u/xyMarketBot verify\n\nsome message\n\ncontinued'
  }),
  expected = {
    command: 'verify', thread: '6s1psl', note: 'some message\n\ncontinued'
  };
  assert.deepEqual(actual, expected, 'Command: verify');

  // REPOST
  actual = parse({
    was_comment: true, context: '/r/xyMarket/comments/6s1psl/daily_thread/',
    body: 'u/xyMarketBot repost'
  }),
  expected = {
    command: 'repost', thread: '6s1psl'
  };
  assert.deepEqual(actual, expected, 'Command: repost');

  // REQUEST VERIFICATION
  actual = parse({
    was_comment: true, context: '/r/xyMarket/comments/6s1psl/daily_thread/',
    body: 'u/xyMarketBot request verification\n\nsome note'
  }),
  expected = {
    command: 'request-verification', thread: '6s1psl', note: 'some note'
  };
  assert.deepEqual(actual, expected, 'Command: request-verification');

  // PROMOTE (on thread)
  actual = parse({
    was_comment: true, context: '/r/xyMarket/comments/6s1psl/daily_thread/',
    body: 'u/xyMarketBot promote for 2 months using BTC'
  }),
  expected = {
    currency: 'BTC',
    command: 'promote',
    thread: '6s1psl',
    months: 2
  };
  assert.deepEqual(actual, expected, 'Command: promote');

  // PROMOTE (in message)
  actual = parse({
    body: 'promote 6s1psl for 1 month using ETH'
  }),
  expected = {
    currency: 'ETH',
    command: 'promote',
    thread: '6s1psl',
    months: 1
  };
  assert.deepEqual(actual, expected, 'Command: promote');

  // CONFIRM ORDER
  actual = parse({
    body: 'confirm order 54321 with transaction abcDEF123'
  }),
  expected = {
    command: 'confirm-order',
    orderId: 54321,
    transaction: 'abcDEF123'
  };
  assert.deepEqual(actual, expected, 'Command: confirm-order');

  // USER STATS LOOKUP
  actual = parse({
    body: 'get stats for u\/MrXyfir'
  }),
  expected = {
    command: 'stats-lookup',
    user: 'MrXyfir'
  },
  assert.deepEqual(actual, expected, 'Command: stats-lookup');

  // CATEGORIZE
  actual = parse({
    body: 'categorize 6s1psl as Games & Virtual Items'
  }),
  expected = {
    category: 'Games & Virtual Items',
    command: 'categorize',
    thread: '6s1psl'
  },
  assert.deepEqual(actual, expected, 'Command: categorize');

}