const updateThread = require('lib/threads/update');
const orderStatus = require('constants/types/order-statuses');
const sendMoney = require('lib/coinbase/send-money');
const templates = require('constants/templates');
const config = require('constants/config');
const moment = require('moment');
const mysql = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/*
  POST coinbase-notifications
  REQUIRED
    https://developers.coinbase.com/api/v2?javascript#notifications
    {
      data: {
        name: string, created_at: date-string
      },
      additional_data: {
        amount: string, currency: string
      }
    }
  RETURN
    HTTP status 200 or 400
  DESCRIPTION
    Handles new payments received by any of the Coinbase addresses
*/
module.exports = async function(req, res) {

  const { body } = req;
  const db = new mysql;

  try {
    if (body.type != 'wallet:addresses:new-payment')
      throw 'ignore - unwanted type';

    const { name, created_at: created } = body.data;
    const { amount, currency } = body.additional_data.amount;

    // Payment isn't for xyMarket
    if (!name || name.indexOf('r/xyMarket') != 0)
      throw 'ignore - non-xyMarket address';

    await db.getConnection();
    let rows = await db.query(`
      SELECT
        id, thread, buyer, escrow, quantity, created, amountForSeller
      FROM orders
      WHERE
        id = ? AND currency = ? AND amountForBuyer <= ? AND status = ?
    `, [
      name.split(' ')[1], currency, amount, orderStatus.UNPAID
    ]);

    if (!rows.length) throw 'ignore - no matching order';

    const order = rows[0];

    if (
      // Convert order creation date from current timezone, to UTC
      // Add 16 minutes to get expiration date and then convert to unix time
      moment(order.created).utc().add(16, 'minutes').unix() <
      // Convert Coinbase's UTC timestamp to unix
      moment.utc(created).unix()
    ) throw 'ignore - order expired';

    // Get needed data from thread
    rows = await db.query(
      'SELECT id, author, data FROM sales_threads WHERE id = ?',
      [order.thread]
    );

    const thread = rows[0];
    thread.data = JSON.parse(thread.data);

    if (thread.data.autobuy) {
      // Load enough autobuy items to satisfy order
      rows = await db.query(`
        SELECT id, item FROM autobuy_items WHERE thread = ?
        ORDER BY added ASC LIMIT ?
      `, [
        thread.id,
        order.quantity
      ]);

      // Delete autobuy items from database
      if (rows.length) {
        await db.query(
          'DELETE FROM autobuy_items WHERE id IN (?)',
          [rows.map(r => r.id)]
        );
      }

      thread.autobuyItems = rows.map(r => r.item);
    }

    const messagesToSeller = [
      templates.SELLER_RECEIVES_ORDER({
        quantity: order.quantity,
        currency,
        amount: order.amountForSeller,
        thread: thread.id,
        order: order.id,
        buyer: order.buyer
      })
    ],
    messagesToBuyer = [
      templates.BUYER_SENDS_PAYMENT(order.id)
    ];

    if (thread.data.autobuy) {
      // Add autobuy items to buyer's message
      if (thread.autobuyItems.length) {
        messagesToBuyer.push(
          templates.GIVE_AUTOBUY_ITEMS(thread.autobuyItems)
        );
      }

      // Not enough autobuy items to complete order
      if (thread.autobuyItems.length < order.quantity) {
        const itemsMissing = order.quantity - thread.autobuyItems.length;

        messagesToSeller.push(templates.AUTOBUY_ITEMS_REQUIRED(itemsMissing));
        messagesToBuyer.push(templates.AUTOBUY_ITEMS_OWED(itemsMissing));
      }

      thread.data.stock -= thread.autobuyItems.length;
      await updateThread(r, thread);
    }

    let status = 0;

    if (order.escrow) {
      messagesToSeller.push(templates.ORDER_IN_ESCROW);
      messagesToBuyer.push(templates.ORDER_IN_ESCROW);

      status = orderStatus.IN_ESCROW;
    }
    else {
      messagesToSeller.push(templates.ORDER_COMPLETE);
      messagesToBuyer.push(templates.ORDER_COMPLETE);

      status = orderStatus.COMPLETE;

      // Pay seller
      await sendMoney(
        order.amountForSeller, currency,
        thread.data.addresses[currency]
      );
    }

    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, order.id]
    );
    db.release();

    await r.composeMessage({
      to: order.buyer,
      subject: 'Order ' + order.id,
      text: messagesToBuyer.join('\n\n')
    });

    await r.composeMessage({
      to: thread.author,
      subject: 'Order ' + order.id,
      text: messagesToSeller.join('\n\n')
    });

    res.status(200).send();
  }
  catch (err) {
    db.release();

    if (/^ignore/.test(err))
      res.status(200).send();
    else 
      res.status(400).send();
  }

}