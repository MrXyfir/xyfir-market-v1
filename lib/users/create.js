const createUserStatsThread = require('lib/users/stats-thread/create');
const updateUserStatsThread = require('lib/users/stats-thread/update');

/**
 * Create row in users table.
 * @async
 * @param {string} username
 * @param {object} db - Connected instance of `lib/mysql`.
 */
module.exports = async function(username, db) {
  // Check if user already has an account
  const rows = await db.query('SELECT name FROM users WHERE name = ?', [
    username
  ]);

  if (rows.length) return;

  const threadId = await createUserStatsThread(username);

  // Create row in user table
  await db.query(
    `
      INSERT INTO users (name, statsThread, statsThreadExpires)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MONTH))
    `,
    [username, threadId]
  );

  // Set the thread's content for the first time
  await updateUserStatsThread(username, db);
};
