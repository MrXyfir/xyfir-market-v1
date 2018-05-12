const config = require('constants/config');
const assert = require('assert');
const build = require('lib/threads/build');

module.exports = function() {
  const { user } = config.ids.reddit;

  const actual = build(
      '6tb80h',
      {
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
        nsfw: true,
        tracking: true,
        escrow: true,
        autobuy: true,
        verified: false,
        stock: 0,
        addresses: {
          BTC: '1MyAddress',
          ETH: '0xMyAddress'
        }
      },
      {
        name: user,
        statsThread: '6tb80z'
      }
    ),
    expected =
      '\n\n\n' +
      '**Price** $5.1 USD\n\n' +
      `**Sold By** u/${user} \n` +
      '[[view stats](/r/xyMarketStats/comments/6tb80z)]\n\n' +
      '**Description** Some description\n\ncontinued description\n\n' +
      '**Type** Digital Item\n\n' +
      '**Category** Digital Goods\n\n' +
      '**Currency** BTC, PP, ETH\n\n' +
      '**Images** [Image 1](http://i.imgur.com/XXXXXXXXXXXXXX.jpg), [Image 2](https://i.imgur.com/XXXXXXXXXXXXXZ.png)\n\n' +
      '**Stock** 0' +
      '\n\n---\n\n' +
      '**Tracking** Yes \n' +
      '**Verified** No \n' +
      '**Autobuy** Yes \n' +
      '**Escrow** Yes' +
      '\n\n---\n\n' +
      '**Purchase Links**\n\n' +
      `- [Purchase with BTC](/message/compose?to=${user}&subject=command&message=purchase%201%20of%206tb80h%20using%20BTC)\n` +
      `- [Purchase with BTC + Escrow](/message/compose?to=${user}&subject=command&message=purchase%201%20of%206tb80h%20using%20BTC%20and%20escrow)\n` +
      `- [Purchase with ETH](/message/compose?to=${user}&subject=command&message=purchase%201%20of%206tb80h%20using%20ETH)\n` +
      `- [Purchase with ETH + Escrow](/message/compose?to=${user}&subject=command&message=purchase%201%20of%206tb80h%20using%20ETH%20and%20escrow)`;

  assert.equal(actual, expected, 'Build thread with all fields');
};
