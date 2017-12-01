const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Allow a subreddit moderator to verify the sales thread.
 * @param {Snoowrap} r
 * @param {Snoowrap.Comment|Snoowrap.PrivateMessage} message
 * @param {string} thread
 */
module.exports = async function(r, message, thread) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT author FROM sales_threads WHERE id = ?',
      [thread, message.author.name]
    );
    db.release();

    if (!rows.length)
      throw templates.NO_MATCHING_THREAD;
    else if (rows[0].author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    message.reply(templates.THREAD_CLAIMED(thread));
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      console.error('commands/thread/claim', err);

    message.reply(err);
  }

}