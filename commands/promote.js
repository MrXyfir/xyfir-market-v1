const convertCurrency = require('lib/coinbase/convert-currency');
const generateAddress = require('lib/coinbase/generate-address');
const orderTypes = require('constants/types/orders');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * @typedef {object} PromoteCommand
 * @prop {string} thread
 * @prop {number} months
 * @prop {string} currency
 */

/**
 * Begin process of promoting a sales thread.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage|snoowrap.Comment} message
 * @param {PromoteCommand} command
 */
module.exports = async function(r, message, command) {

  const db = new mysql;

  try {
    // Make sure thread exists, is approved, not removed, user is creator
    await db.getConnection();
    const rows = await db.query(`
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

    // Generate appropriate temporary address
    const {address} = await generateAddress(command.currency, orderId);
    
    // Calculate amount
    const amount = await convertCurrency(
      2 * command.months, 'USD', command.currency
    );

    // Update amount in orders table
    await db.query(
      'UPDATE orders SET amountForBuyer = ? WHERE id = ?',
      [amount, orderId]
    );
    db.release();

    // Send payment info to user
    await message.reply(
      templates.SEND_PAYMENT({
        currency: command.currency,
        address,
        amount
      })
    );
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/promote', err);

    message.reply(err);
  }

}