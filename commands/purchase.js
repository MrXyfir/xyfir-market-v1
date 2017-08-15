const convertCurrency = require('lib/coinbase/convert-currency');
const generateAddress = require('lib/coinbase/generate-address');
const orderTypes = require('constants/types/orders');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

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

  const db = new mysql;

  try {
    // Load sales thread's data
    await db.getConnection();
    const rows = await db.query(`
      SELECT author AS seller, data
      FROM sales_threads
      WHERE id = ? AND approved = ? AND removed = ?
    `, [
      command.thread, 1, 0
    ]);

    if (!rows.length) throw templates.NO_MATCHING_THREAD(command.thread);

    const thread = rows[0];
    thread.data = JSON.parse(thread.data);

    if (!thread.data.verifiable)
      throw templates.VERIFIABLE_NOT_ACCEPTED;
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

    // Generate appropriate temporary address
    const {address} = await generateAddress(command.currency, orderId);

    // Convert USD price to currency
    const amount = await convertCurrency(
      thread.data.price * command.quantity, 'USD', command.currency
    );

    // 2.5% fee for seller always
    const amountForSeller = amount - (amount * 0.025);
    // 1% fee for buyer if using escrow
    const amountForBuyer = command.escrow
      ? amount + (amount * 0.01)
      : amount;

    // Update amounts in orders table
    await db.query(`
      UPDATE orders SET
        amountForRefund = ?, amountForSeller = ?, amountForBuyer = ?
      WHERE id = ?
    `, [
      amount, amountForSeller, amountForBuyer,
      orderId
    ]);

    // Create rows in user table for buyer and seller IF they don't exist
    await db.query(`
      INSERT INTO users (name) VALUES (?), (?)
      ON DUPLICATE KEY UPDATE name = name
    `, [
      thread.seller, message.author.name
    ]);
    db.release();

    // Notify the buyer how to send payment
    await message.reply(
      templates.SEND_PAYMENT({
        currency: command.currency,
        address,
        amount: amountForBuyer
      })
    );
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/purchase', err);

    message.reply(err);
  }

}