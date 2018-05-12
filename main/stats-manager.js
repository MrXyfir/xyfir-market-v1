const createUserStatsThread = require('lib/users/stats-thread/create');
const updateUserStatsThread = require('lib/users/stats-thread/update');
const templates = require('constants/templates');
const config = require('constants/config');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

module.exports = async function() {
  console.log('main/stats-manager: start');

  const db = new MySQL();

  try {
    await db.getConnection();
    const users = await db.query(`
      SELECT
        u.name, u.statsThread, u.ignored, u.verifiedProfiles, u.baseRep,
        COUNT(o.id) AS orders,
        COUNT(t.id) AS trades,
        COUNT(s.id) AS threads
      FROM users u
      LEFT JOIN orders o ON o.buyer = u.name
      LEFT JOIN sales_threads s ON s.author = u.name AND s.unstructured = 1
      LEFT JOIN trades t ON (t.trader1 = u.name OR t.trader2 = u.name)
      WHERE NOW() > u.statsThreadExpires
      GROUP BY u.name
    `);

    for (let user of users) {
      // Keep user if they're ignored or have any data on xyMarket other than
      // unstructured threads
      if (
        !user.ignored &&
        !user.verifiedProfiles &&
        !user.baseRep &&
        !user.orders &&
        !user.trades &&
        !user.threads
      ) {
        await db.query('DELETE FROM users WHERE name = ?', [user.name]);
        continue;
      }

      // Create new stats thread
      const newThreadId = await createUserStatsThread(user.name);

      // Update statsThread, statsThreadExpires in users table
      await db.query(
        `
        UPDATE users SET
          statsThread = ?,
          statsThreadExpires = DATE_ADD(NOW(), INTERVAL 5 MONTH)
        WHERE
          name = ?
      `,
        [newThreadId, user.name]
      );

      const oldThreadId = user.statsThread;
      user.statsThread = newThreadId;

      // Update new thread
      await updateUserStatsThread(user, db);

      // Update old stats thread to point to new one
      await r
        .getSubmission(oldThreadId)
        .edit(templates.USER_STATS_THREAD_MOVED(newThreadId));
    }

    db.release();
    console.log('main/stats-manager: end');
  } catch (err) {
    db.release();
    console.error('main/stats-manager', err);
  }
};
