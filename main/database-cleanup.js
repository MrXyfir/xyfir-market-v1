const orderStatus = require('constants/types/order-statuses');
const orderTypes = require('constants/types/orders');
const MySQL = require('lib/mysql');

/**
 * Cleans up the database by removing unneeded data.
 */
module.exports = async function() {
  console.log('main/database-cleanup: start');

  const db = new MySQL();

  try {
    await db.getConnection();

    // Delete unconfirmed/unpaid orders over a day old
    await db.query(
      `
        DELETE FROM orders
        WHERE status IN (?) AND created < DATE_SUB(NOW(), INTERVAL 1 DAY)
      `,
      [[orderStatus.UNPAID, orderStatus.AWAITING_CONFIRMATIONS]]
    );

    // Delete unconfirmed trades over a day old
    await db.query(`
      DELETE FROM trades
      WHERE confirmed = 0 AND created < DATE_SUB(NOW(), INTERVAL 1 DAY)
    `);

    // ** Update `users.baseRep` / delete trades+feedback+orders+sales threads
    // over two months old

    db.release();
    console.log('main/database-cleanup: end2');
  } catch (err) {
    db.release();
    console.error('main/database-cleanup', err);
  }
};
