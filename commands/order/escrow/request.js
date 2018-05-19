const orderStatus = require('constants/types/order-statuses');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} RequestEscrowCommand
 * @prop {number} order
 * @prop {string} [note]
 */

/**
 * Notifies a buyer that the seller is requesting them to release escrow.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {RequestEscrowCommand} command
 */
module.exports = async function(r, message, command) {
  const db = new MySQL();

  try {
    // Make sure order exists and is in escrow
    await db.getConnection();
    const [order] = await db.query(
      'SELECT thread, buyer FROM orders WHERE id = ? AND status = ?',
      [command.order, orderStatus.IN_ESCROW]
    );

    if (!order) throw templates.NO_MATCHING_ORDER(command.order);

    // Make sure message author is owner of sales thread
    const rows = await db.query(
      'SELECT id FROM sales_threads WHERE id = ? AND author = ?',
      [order.thread, message.author.name]
    );

    if (!rows.length) throw templates.UNAUTHORIZED_COMMAND;

    // Notify buyer
    await r.composeMessage({
      to: order.buyer,
      subject: 'Escrow Release',
      text: templates.ESCROW_RELEASE_REQUESTED(
        command.order,
        message.author.name,
        command.note
      )
    });
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/order/escrow/request', err);

    message.reply(err);
  }
};
