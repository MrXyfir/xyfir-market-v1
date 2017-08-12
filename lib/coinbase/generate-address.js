const Coinbase = require('coinbase');
const config = require('constants/config');

const coinbase = new Coinbase.Client({
  apiKey: config.keys.coinbase.pub,
  apiSecret: config.keys.coinbase.prv
});

/**
 * https://developers.coinbase.com/api/v2?javascript#address-resource
 * @typedef {object} CoinbaseAddress
 * @prop {string} id
 * @prop {string} address
 * @prop {string} name
 * @prop {string} created_at
 * @prop {string} network
 */

/**
 * Generate address for BTC, LTC, or ETH.
 * @async
 * @param {string} currency - "BTC|LTC|ETH"`
 * @param {number} order - Order id used for address label.
 * @return {CoinbaseAddress}
 */
module.exports = function(currency, order) {

  const accountId = config.ids.coinbaseAccounts[currency];

  return new Promise((resolve, reject) =>
    coinbase.getAccount(accountId, (err, account) => {
      if (err) return reject(err);

      account.createAddress(
        { name: 'r/xyMarket ' + order },
        (err, address) => err ? reject(err) : resolve(address)
      );
    })
  );

};