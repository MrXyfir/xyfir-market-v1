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
    const rows = await db.query(
      'SELECT unstructured FROM sales_threads WHERE id = ? AND author = ?',
      [thread, comment.author.name]
    );

    if (!rows.length) throw templates.UNAUTHORIZED_COMMAND;

    const result = await db.query(
      'UPDATE sales_threads SET removed = 1 WHERE id = ?',
      [thread]
    );
    db.release();

    await r.getSubmission(thread).remove();
    await comment.reply(
      templates.THREAD_REMOVED_BY_CREATOR(thread, rows[0].unstructured)
    );
  }
  catch (err) {
    db.release();
    console.error('commands/thread/remove', err);
  }

}