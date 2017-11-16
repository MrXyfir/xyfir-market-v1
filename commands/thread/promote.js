const convertCurrency = require('lib/coinbase/convert-currency');
const orderStatus = require('constants/types/order-statuses');
const orderTypes = require('constants/types/orders');
const templates = require('constants/templates');
const config = require('constants/config');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} PromoteCommand
 * @prop {string} thread
 * @prop {number} months
 * @prop {string} currency
 */
/**
 * Begin process of promoting a sales thread.
 * @param {Snoowrap} r
 * @param {Snoowrap.PrivateMessage|Snoowrap.Comment} message
 * @param {PromoteCommand} command
 */
module.exports = async function(r, message, command) {

  const db = new MySQL;

  try {
    // Make sure thread exists, is approved, not removed, user is creator
    await db.getConnection();
    let rows = await db.query(`
      SELECT id FROM sales_threads
      WHERE id = ? AND author = ? AND approved = ? AND removed = ?
    `, [
      command.thread, message.author.name, 1, 0
    ]);

    if (!rows.length) throw templates.NO_MATCHING_THREAD(command.thread);

    // Create order
    const dbRes = await db.query(`
      INSERT INTO orders SET ?
    `, {
      type: orderTypes.PROMOTE_THREAD,
      buyer: message.author.name,
      thread: command.thread,
      currency: command.currency,
      quantity: command.months
    });
    const orderId = dbRes.insertId;

    if (!orderId) throw templates.UNEXPECTED_ERROR;

    // Get system's payment address for currency
    const address = config.ids.addresses[command.currency];
    
    // Calculate amount: $2.50 per month
    let amount = await convertCurrency(
      2.5 * command.months, 'USD', command.currency
    );

    // Get amounts for recent unpaid 'promote thread' orders for same currency
    rows = await db.query(`
      SELECT amount
      FROM orders
      WHERE
        created > DATE_SUB(NOW(), INTERVAL 1 HOUR) AND
        status = ? AND type = ? AND currency = ?
    `, [
      orderStatus.UNPAID, orderTypes.PROMOTE_THREAD, command.currency
    ]);

    // xyMarket is currently waiting for payments of these amounts to the same
    // address that the buyer will be sending to
    const avoidAmounts = rows.map(r => +r.amount);

    // Increase amount until unique
    while (avoidAmounts.indexOf(amount) > -1) {
      amount += 0.00000001;
      amount = +amount.toFixed(8);
    }

    // Update amount in orders table
    await db.query(
      'UPDATE orders SET amount = ? WHERE id = ?',
      [amount, orderId]
    );
    db.release();

    // Send payment info to user
    await message.reply(
      templates.SEND_PAYMENT({
        currency: command.currency,
        orderId,
        address,
        amount
      })
    );
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/thread/promote', err);

    message.reply(err);
  }

}