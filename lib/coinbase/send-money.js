const Coinbase = require('coinbase');
const config = require('constants/config');

const coinbase = new Coinbase.Client({
  apiKey: config.keys.coinbase.pub,
  apiSecret: config.keys.coinbase.prv
});

/**
 * Send BTC, LTC, or ETH to address.
 * @async
 * @param {number} amount
 * @param {string} currency - "BTC|LTC|ETH"
 * @param {string} address
 * @return {Coinbase.Transaction}
 */
module.exports = function(amount, currency, address) {

  const accountId = config.ids.coinbaseAccounts[currency];

  return new Promise((resolve, reject) =>
    coinbase.getAccount(accountId, (err, account) => {
      if (err) return reject(err);

      account.sendMoney(
        { to: address, amount, currency },
        (err, transac) => err ? reject(err) : resolve(transac)
      );
    })
  );

};