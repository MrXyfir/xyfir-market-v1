const createUserStatsThread = require('lib/users/stats-thread/create');
const updateUserStatsThread = require('lib/users/stats-thread/update');
const templates = require('constants/templates');
const config = require('constants/config');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

module.exports = async function() {

  console.log('main/stats-manager: start');

  const db = new MySQL;

  try {
    await db.getConnection();
    const users = await db.query(`
      SELECT name, joined, statsThread
      FROM users
      WHERE NOW() > statsThreadExpires
    `);

    for (let user of users) {
      // Create new stats thread
      const newThreadId = await createUserStatsThread(user.name);

      // Update statsThread, statsThreadExpires in users table
      await db.query(`
        UPDATE users SET
          statsThread = ?,
          statsThreadExpires = DATE_ADD(NOW(), INTERVAL 5 MONTH)
        WHERE
          name = ?
      `, [
        newThreadId,
        user.name
      ]);

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
    console.log('main/post-finder: end');
  }
  catch (err) {
    db.release();
    console.error('main/stats-manager', err);
  }

}