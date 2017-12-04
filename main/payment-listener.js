const updateUserStatsThread = require('lib/users/stats-thread/update');
const validateTransaction = require('lib/blockchain/validate-transaction');
const updateThread = require('lib/threads/update');
const orderStatus = require('constants/types/order-statuses');
const orderTypes = require('constants/types/orders');
const templates = require('constants/templates');
const config = require('constants/config');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Handles payments that are awaiting confirmation.
 */
module.exports = async function() {

  console.log('main/payment-listener: start');

  const db = new MySQL;

  try {
    await db.getConnection();
    const orders = await db.query(`
      SELECT
        id, type, thread, buyer, escrow, quantity, currency,
        amount, transaction
      FROM orders
      WHERE
        status = ? AND created > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `, [
      orderStatus.AWAITING_CONFIRMATIONS
    ]);

    if (!orders.length) {
      db.release();
      return console.log('main/payment-listener: end1');
    }

    for (let order of orders) {
      // Get needed data from thread
      const [thread] = await db.query(
        'SELECT id, author, data FROM sales_threads WHERE id = ?',
        [order.thread]
      );
      thread.data = JSON.parse(thread.data);

      /* Handle thread promotion */
      if (order.type == orderTypes.PROMOTE_THREAD) {
        try {
          // Validate confirmations of transaction
          await validateTransaction({
            transaction: order.transaction,
            confirmed: true,
            receiver: config.ids.addresses[order.currency],
            currency: order.currency,
            amount: order.amount
          });
        }
        catch (err) { continue; }

        // Mark order as complete
        await db.query(
          'UPDATE orders SET status = ?, completed = NOW() WHERE id = ?',
          [orderStatus.COMPLETE, order.id]
        );

        // Mark thread as promoted
        await db.query(`
          UPDATE sales_threads
          SET promoted = DATE_ADD(NOW(), INTERVAL ? MONTH)
          WHERE id = ?
        `, [
          order.quantity, thread.id
        ]);

        // Notify user their thread has been promoted
        await r.composeMessage({
          subject: 'Thread Promoted',
          text: templates.THREAD_PROMOTED(thread.id, order.quantity),
          to: order.buyer
        });
      }
      /* Handle normal purchase */
      else if (order.type == orderTypes.PURCHASE) {
        try {
          // Validate confirmations of transaction
          await validateTransaction({
            transaction: order.transaction,
            confirmed: true,
            receiver: thread.data.addresses[order.currency],
            currency: order.currency,
            amount: order.amount
          });
        }
        catch (err) { continue; }

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
            currency: order.currency,
            amount: order.amount,
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
    
            messagesToSeller.push(
              templates.AUTOBUY_ITEMS_REQUIRED(itemsMissing)
            );
            messagesToBuyer.push(templates.AUTOBUY_ITEMS_OWED(itemsMissing));
          }
    
          thread.data.stock -= thread.autobuyItems.length;
          await updateThread(r, thread);
        }
    
        if (order.escrow) {
          messagesToSeller.push(templates.SELLER_ORDER_IN_ESCROW(order.id));
          messagesToBuyer.push(templates.BUYER_ORDER_IN_ESCROW(order.id));
    
          await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [orderStatus.IN_ESCROW, order.id]
          );
        }
        else {
          messagesToSeller.push(templates.ORDER_COMPLETE(order.id));
          messagesToBuyer.push(templates.ORDER_COMPLETE(order.id));
    
          await db.query(
            'UPDATE orders SET status = ?, completed = NOW() WHERE id = ?',
            [orderStatus.COMPLETE, order.id]
          );

          // Update seller's and buyer's stats threads
          await updateUserStatsThread(thread.author, db);
          await updateUserStatsThread(order.buyer, db);
        }
    
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
      }
    }

    db.release();
    return console.log('main/payment-listener: end2');
  }
  catch (err) {
    db.release();
    console.error('main/payment-listener', err);
  }

}