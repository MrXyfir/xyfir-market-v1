const convertCurrency = require('lib/coinbase/convert-currency');
const orderStatus = require('constants/types/order-statuses');
const orderTypes = require('constants/types/orders');
const createUser = require('lib/users/create');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} PurchaseCommand
 * @prop {boolean} escrow
 * @prop {string} thread
 * @prop {number} quantity
 * @prop {string} currency
 */
/**
 * Begin process of purchasing item(s) from an active sales thread.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage|snoowrap.Comment} message
 * @param {PurchaseCommand} command
 */
module.exports = async function(r, message, command) {

  const db = new MySQL;

  try {
    if (command.escrow) throw templates.ESCROW_DISABLED;

    // Load sales thread's data
    await db.getConnection();
    let rows = await db.query(`
      SELECT author AS seller, data
      FROM sales_threads
      WHERE id = ? AND approved = ? AND removed = ?
    `, [
      command.thread, 1, 0
    ]);

    if (!rows.length) throw templates.NO_MATCHING_THREAD(command.thread);

    const thread = rows[0];
    thread.data = JSON.parse(thread.data);

    if (!thread.data.tracking)
      throw templates.TRACKING_NOT_ENABLED;
    if (!thread.data.addresses[command.currency])
      throw templates.CURRENCY_NOT_ACCEPTED(command.currency);
    if (command.escrow && !thread.data.escrow)
      throw templates.ESCROW_NOT_ACCEPTED;

    // Generate and create order
    const dbRes = await db.query(`
      INSERT INTO orders SET ?
    `, {
      type: orderTypes.PURCHASE,
      buyer: message.author.name,
      thread: command.thread,
      escrow: command.escrow,
      currency: command.currency,
      quantity: command.quantity
    });

    if (!dbRes.insertId) throw templates.UNEXPECTED_ERROR;

    const orderId = dbRes.insertId;
    const address = thread.data.addresses[command.currency];

    // Convert USD price to currency
    let amount = await convertCurrency(
      thread.data.price * command.quantity, 'USD', command.currency
    );

    // Get amounts for recent unpaid orders for the same currency
    // and for threads owned by the creator of this thread
    rows = await db.query(`
      SELECT amount
      FROM orders
      WHERE
        thread IN (SELECT id FROM sales_threads WHERE author = ?) AND
        created > DATE_SUB(NOW(), INTERVAL 1 HOUR) AND
        status = ? AND type = ? AND currency = ?
    `, [
      thread.seller,
      orderStatus.UNPAID, orderTypes.PURCHASE, command.currency
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

    await createUser(message.author.name, db);
    db.release();

    // Notify the buyer how to send payment
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
      return console.error('commands/thread/purchase', err);

    message.reply(err);
  }

}