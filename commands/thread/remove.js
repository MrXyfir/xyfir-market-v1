const isModerator = require('lib/users/is-moderator');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Remove an approved sales thread from the subreddit.
 * @param {Snoowrap} r
 * @param {Snoowrap.Comment|Snoowrap.PrivateMessage} message
 * @param {string} thread
 */
module.exports = async function(r, message, thread) {
  const db = new MySQL();

  try {
    const isMod = await isModerator(r, message.author.name);

    await db.getConnection();
    const rows = await db.query(
      'SELECT unstructured, author FROM sales_threads WHERE id = ?',
      [thread]
    );

    if (!rows.length) throw templates.NO_MATCHING_THREAD(thread);
    if (!isMod && rows[0].author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    const result = await db.query(
      'UPDATE sales_threads SET removed = ?, dateRemoved = NOW() WHERE id = ?',
      [1, thread]
    );
    db.release();

    await r.getSubmission(thread).remove();
    await message.reply(
      templates.THREAD_REMOVED_BY_CREATOR(thread, rows[0].unstructured)
    );
  } catch (err) {
    db.release();
    console.error('commands/thread/remove', err);
  }
};
