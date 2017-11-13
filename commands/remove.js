const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Remove an approved sales thread from the subreddit.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 * @param {string} thread
 */
module.exports = async function(r, comment, thread) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const result = await db.query(
      'UPDATE sales_threads SET removed = 1 WHERE id = ? AND author = ?',
      [thread, comment.author.name]
    );
    db.release();

    if (!result.affectedRows) return;

    await comment.reply(templates.THREAD_REMOVED_BY_CREATOR(thread));
    await r.getSubmission(thread).remove();
  }
  catch (err) {
    db.release();
    console.error('commands/remove', err);
  }

}