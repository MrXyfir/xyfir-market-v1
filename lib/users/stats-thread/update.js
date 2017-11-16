const templates = require('constants/templates');
const getUser = require('lib/users/get-info');
const config = require('constants/config');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Load a user's stats and update their r/xyMarketStats thread.
 * @param {string|UserRow} user
 * @param {object} db - Connected `lib/mysql` instance
 */
module.exports = async function(user, db) {

  try {
    // Convert username to UserRow object if needed
    if (typeof user == 'string') user = await getUser(user, db);

    // Count completed sales and buys
    let rows = await db.query(`
      SELECT
        COUNT(id) AS orders, buyer = ? AS isBuyer
      FROM orders
      WHERE
        (buyer = ? OR thread IN (
          SELECT id FROM sales_threads WHERE author = ?
        )) AND
        completed != '0000-00-00 00:00:00'
      GROUP BY isBuyer
    `, [
      user.name, user.name, user.name
    ]);

    // Passed to templates.USER_STATS_THREAD()
    const stats = {
      sales: 0, buys: 0, joined: user.joined,
      feedback: {
        seller: {
          positive: 0, negative: 0, list: []
        },
        buyer: {
          positive: 0, negative: 0, list: []
        }
      }
    };

    // Get the counts for completed sales and buys
    if (rows.length) {
      let i = rows.findIndex(r => r.isBuyer == 0);
      if (i > -1) stats.sales = rows[i].orders;

      i = rows.findIndex(r => r.isBuyer == 1);
      if (i > -1) stats.buys = rows[i].orders;
    }

    // Select all feedback ever given to user
    rows = await db.query(`
      SELECT
        user, userType, feedback AS message, feedbackType AS type,
        DATE_FORMAT(given, '%Y-%m-%d') AS given
      FROM feedback
      WHERE
        orderId IN (
          SELECT id FROM orders
          WHERE
            buyer = ? OR thread IN (
              SELECT id FROM sales_threads WHERE author = ?
            )
        ) AND
        user != ?
      ORDER BY given DESC
    `, [
      user.name, user.name, user.name
    ]);

    // Calculate positive|negative seller|buyer feedback
    stats.feedback.seller.positive = rows.reduce((sum, row) =>
      row.userType == 2 && row.type == 1 ? sum + 1 : sum,
    0),
    stats.feedback.seller.negative = rows.reduce((sum, row) =>
      row.userType == 2 && row.type == -1 ? sum + 1 : sum,
    0),
    stats.feedback.buyer.positive = rows.reduce((sum, row) =>
      row.userType == 1 && row.type == 1 ? sum + 1 : sum,
    0),
    stats.feedback.buyer.negative = rows.reduce((sum, row) =>
      row.userType == 1 && row.type == -1 ? sum + 1 : sum,
    0);

    // Obscure usernames
    rows = rows.map(row => {
      row.user =
        row.user[0] +
        Array(row.user.length - 2).fill('*').join('') +
        row.user[row.user.length - 1];
      return row;
    });

    // Only use 30/10 most recent seller/buyer feedback
    stats.feedback.seller.list = rows
      .filter(r => r.userType == 2)
      .slice(0, 30),
    stats.feedback.buyer.list = rows
      .filter(r => r.userType == 1)
      .slice(0, 10),
    rows = null;

    // Build and update the thread's text
    await r
      .getSubmission(user.statsThread)
      .edit(templates.USER_STATS_THREAD(stats));
  }
  catch (err) {
    console.error('lib/users/stats-thread/update', err);
  }

}