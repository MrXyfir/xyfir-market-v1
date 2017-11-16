const updateUserStatsThread = require('lib/users/stats-thread/update');
const updateThread = require('lib/threads/update');
const orderStatus = require('constants/types/order-statuses');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * @typedef {object} GiveFeedbackCommand
 * @prop {string} order
 * @prop {number} type - 1|-1
 * @prop {string} feedback
 */
/**
 * Add item(s) to autobuy-enabled sales thread.
 * @param {Snoowrap} r
 * @param {Snoowrap.PrivateMessage} message
 * @param {GiveFeedbackCommand} command
 */
module.exports = async function(r, message, command) {

  const db = new mysql;

  try {
    await db.getConnection();
    let rows = await db.query(`
      SELECT
        thread, buyer, (
          SELECT orderId FROM feedback WHERE orderId = ? AND user = ?
        ) AS feedbackExists
      FROM orders WHERE id = ? AND status = ?
    `, [
      command.order, message.author.name,
      command.order, orderStatus.COMPLETE
    ]);

    if (!rows.length) throw templates.NO_MATCHING_ORDER(command.order);
    if (rows[0].feedbackExists) throw templates.FEEDBACK_ALREADY_GIVEN;

    const [order] = rows;
    const isBuyer = order.buyer == message.author.name;

    rows = await db.query(
      'SELECT author FROM sales_threads WHERE id = ?',
      [order.thread]
    );

    order.seller = rows[0].author;

    if (!isBuyer && order.seller != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    await db.query(`
      INSERT INTO feedback SET ?
    `, {
      feedbackType: command.type,
      feedback: command.feedback,
      userType: isBuyer ? 1 : 2,
      orderId: command.order,
      user: message.author.name
    });

    // Update the stats thread of the user who received the feedback
    await updateUserStatsThread(isBuyer ? order.seller : order.buyer, db);
    db.release();

    await message.reply(templates.FEEDBACK_GIVEN);
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/order/give-feedback', err);

    message.reply(err);
  }

}