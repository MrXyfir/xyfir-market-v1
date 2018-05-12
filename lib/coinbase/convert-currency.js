const Coinbase = require('coinbase');
const config = require('constants/config');

const coinbase = new Coinbase.Client({
  apiKey: config.keys.coinbase.pub,
  apiSecret: config.keys.coinbase.prv
});

/**
 * Convert amount in one currency to another.
 * @async
 * @param {number} amount
 * @param {string} from - "USD|BTC|LTC|ETH"
 * @param {string} to - "USD|BTC|LTC|ETH"
 * @return {number}
 */
module.exports = function(amount, from, to) {
  return new Promise((resolve, reject) =>
    coinbase.getExchangeRates(
      { currency: from },
      (err, res) => (err ? reject(err) : resolve(+amount * +res.data.rates[to]))
    )
  );
};
