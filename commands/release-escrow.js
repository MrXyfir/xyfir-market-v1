const orderStatus = require('constants/types/order-statuses');
const sendMoney = require('lib/coinbase/send-money');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * Allows buyer to release owed funds to seller.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {number} orderId
 */
module.exports = async function(r, message, orderId) {

  const db = new mysql;

  try {
    // Make sure order exists, is in escrow, user is buyer
    await db.getConnection();
    const [order] = await db.query(`
      SELECT
        id, thread, buyer, amountForSeller, currency
      FROM orders
      WHERE id = ? AND status = ? AND buyer = ?
    `, [
      orderId, orderStatus.IN_ESCROW, message.author.name
    ]);

    if (!order) throw templates.NO_MATCHING_ORDER(orderId);

    const [thread] = await db.query(
      'SELECT id, author, data FROM sales_threads WHERE id = ?',
      [order.thread]
    );
    thread.data = JSON.parse(thread.data);

    /* Pay seller
    await sendMoney(
      order.amountForSeller,
      order.currency,
      thread.data.addresses[order.currency]
    );*/

    // Set status and completed columns for order
    await db.query(
      'UPDATE orders SET status = ?, completed = NOW() WHERE id = ?',
      [orderStatus.COMPLETE, order.id]
    );
    db.release();

    // Notify users
    await r.composeMessage({
      to: order.buyer,
      text: templates.ESCROW_RELEASED(order.id),
      subject: 'Escrow Released'
    });
    await r.composeMessage({
      to: thread.author,
      text: templates.ESCROW_RELEASED(order.id),
      subject: 'Escrow Released'
    });
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/release-escrow', err);

    message.reply(err);
  }

}