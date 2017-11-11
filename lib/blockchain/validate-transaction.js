const request = require('superagent');

/**
 * @typedef {object} ValidateTransactionData
 * @prop {boolean} [confirmed]
 * @prop {string} transaction
 * @prop {string} receiver
 * @prop {string} currency
 * @prop {number} amount
 */
/**
 * Validate that the provided transaction matches the provided data. Throws an 
 * error if the transaction is invalid or unconfirmed (if `data.confirmed`).
 * @async
 * @param {ValidateTransactionData} data
 */
module.exports = async function(data) {

  const {body: tx} = await request.get(
    `https://api.blockcypher.com/v1/${data.currency.toLowerCase()}/main` +
    `/txs/${data.transaction}`
  );

  // Find output that only has single address (receiver's)
  const output = tx.outputs.find(o =>
    o.addresses.length == 1 && o.addresses[0] == data.receiver
  );

  if (!output) throw 'Invalid transaction: bad outputs';

  const amount = output.value / (
    data.currency == 'ETH' ? 1000000000000000000 : 100000000
  );

  if (data.amount != amount) throw 'Invalid transaction: bad value';

  if (
    data.confirmed && (
    (data.currency == 'ETH' && 12 > tx.confirmations) ||
    (data.currency != 'ETH' && 3 > tx.confirmations)
  )) throw 'Transaction is unconfirmed';

}