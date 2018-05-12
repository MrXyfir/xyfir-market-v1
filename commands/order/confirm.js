const validateTransaction = require('lib/blockchain/validate-transaction');
const orderStatus = require('constants/types/order-statuses');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} ConfirmOrderCommand
 * @prop {string} orderId
 * @prop {string} transaction
 */
/**
 * Begin process of confirming an order.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage|snoowrap.Comment} message
 * @param {ConfirmOrderCommand} command
 */
module.exports = async function(r, message, command) {
  const db = new MySQL();

  try {
    // Validate order and retrieve needed data
    await db.getConnection();
    const [order] = await db.query(
      `
      SELECT
        o.amount, o.currency, st.data AS threadData
      FROM
        orders AS o, sales_threads AS st
      WHERE
        o.id = ? AND o.buyer = ? AND o.status = ? AND
        st.id = o.thread AND o.created > DATE_SUB(NOW(), INTERVAL 16 MINUTE)
    `,
      [command.orderId, message.author.name, orderStatus.UNPAID]
    );

    if (!order) throw templates.NO_MATCHING_ORDER(command.orderId);

    // Validate amount and receiving address on proper blockchain
    await validateTransaction({
      transaction: command.transaction,
      receiver: JSON.parse(order.threadData).addresses[order.currency],
      currency: order.currency,
      amount: order.amount
    });

    // Set order status and transaction
    await db.query(
      `
      UPDATE orders SET status = ?, transaction = ?
      WHERE id = ?
    `,
      [orderStatus.AWAITING_CONFIRMATIONS, command.transaction, command.orderId]
    );
    db.release();

    await message.reply(templates.PAYMENT_AWAITING_CONFIRMATIONS);
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/order/confirm', err);

    message.reply(err);
  }
};
