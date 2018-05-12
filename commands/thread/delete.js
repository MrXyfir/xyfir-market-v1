const updateThreads = require('main/update-threads');
const isModerator = require('lib/users/is-moderator');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Allows a moderator to delete a sales thread both from both the subreddit
 * and the database, and then forces the daily thread to update.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {string} thread
 */
module.exports = async function(r, message, thread) {
  const db = new MySQL();

  try {
    const isMod = await isModerator(r, message.author.name);

    if (!isMod) throw templates.UNAUTHORIZED_COMMAND;

    await db.getConnection();
    const result = await db.query('DELETE FROM sales_threads WHERE id = ?', [
      thread
    ]);
    db.release();

    if (!result.affectedRows) throw templates.UNEXPECTED_ERROR;

    await r.getSubmission(thread).delete();
    updateThreads();
  } catch (err) {
    db.release();
    console.error('commands/thread/delete', err);
  }
};
