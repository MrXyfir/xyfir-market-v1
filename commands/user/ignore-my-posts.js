const MySQL = require('lib/mysql');

/**
 * Allow a user to have their posts in other subreddits ignored by 
 * `main/post-finder`.
 * @param {Snoowrap} r
 * @param {Snoowrap.PrivateMessage} message
 */
module.exports = async function(r, message) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const rows = await db.query(
      'UPDATE users SET ignored = ? WHERE name = ?',
      [1, message.author.name]
    );
    db.release();
  }
  catch (err) {
    db.release();
    console.error('commands/user/ignore-my-posts', err);
  }

}