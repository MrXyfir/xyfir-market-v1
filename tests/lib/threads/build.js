const assert = require('assert');
const build = require('lib/threads/build');

module.exports = function() {

  const actual = build({
    title: 'Some Title',
    type: 'Digital Item',
    category: 'Digital Goods',
    description: 'Some description\n\ncontinued description',
    price: 5.1,
    currency: ['BTC', 'PP', 'ETH'],
    images: [
      '[Image 1](http://i.imgur.com/XXXXXXXXXXXXXX.jpg)',
      '[Image 2](https://i.imgur.com/XXXXXXXXXXXXXZ.png)'
    ].join(', '),
    nsfw: true, verifiable: true, escrow: true, autobuy: true, verified: false,
    stock: 0,
    addresses: {
      BTC: '1MyAddress',
      ETH: '0xMyAddress'
    }
  }, {
    name: 'xyMarketBot', posFeedback: 25, negFeedback: 2
  }),
  expected =
    '\n' +
    '**Price:** $5.1 USD\n\n' +
    '**Sold By:** u/xyMarketBot (+25, -2)\n\n' +
    '**Description:** Some description\n\ncontinued description\n\n' +
    '**Type:** Digital Item\n\n' +
    '**Category:** Digital Goods\n\n' +
    '**Currency:** BTC, PP, ETH\n\n' +
    '**Images:** [Image 1](http://i.imgur.com/XXXXXXXXXXXXXX.jpg), [Image 2](https://i.imgur.com/XXXXXXXXXXXXXZ.png)\n\n' +
    '**Stock:** 0\n\n' +
    '---\n\n' +
    '**Verifiable:** Yes \n' +
    '**Verified:** No \n' +
    '**Autobuy:** Yes \n' +
    '**Escrow:** Yes' +
    '\n';

  assert.equal(actual, expected, 'Build thread with all fields');

}