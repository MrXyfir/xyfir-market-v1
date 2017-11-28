const assert = require('assert');
const parse = require('lib/threads/parse');

module.exports = function() {

  const data = parse({
    title: 'Some Title',
    selftext: [
      '@structured',
      '**Type** Digital Item',
      '**Category** Digital Goods',
      '**Description** Some description\n\ncontinued description',
      '**Price** $5.10',
      '**Currency** BTC PP ETH',
      '**Images** http://i.imgur.com/XXXXXXXXXXXXXX.jpg https://i.imgur.com/XXXXXXXXXXXXXZ.png',
      '**NSFW** True',
      '**Tracking** True',
      '**Escrow** True',
      '**Autobuy** True',
      '**Repost** True',
      '**Addresses** BTC=1MyAddress ETH=0xMyAddress'
    ].join('\n\n')
  });

  assert.deepEqual(data, {
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
    nsfw: true, tracking: true, escrow: true, autobuy: true, verified: false,
    repost: true,
    stock: 0,
    addresses: {
      BTC: '1MyAddress',
      ETH: '0xMyAddress'
    }
  }, 'Parse thread with all fields');

}