const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Output autobuy items.
 * @param {Snoowrap} r
 * @param {Snoowrap.PrivateMessage} message
 * @param {string} user
 */
module.exports = async function(r, message, user) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT statsThread FROM users WHERE name = ?',
      [user]
    );
    db.release();

    message.reply(
      templates.USER_STATS_LOOKUP(rows.length ? rows[0].statsThread : null)
    );
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/user/stats-lookup', err);

    message.reply(err);
  }
};
