const updateThread = require('lib/threads/update');
const isModerator = require('lib/users/is-moderator');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * @typedef {object} VerifyThreadCommand
 * @prop {string} thread
 * @prop {string} note
 */

/**
 * Allow a subreddit moderator to verify the sales thread.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 * @param {VerifyThreadCommand} command
 */
module.exports = async function(r, comment, command) {
  const db = new mysql();

  try {
    const isMod = await isModerator(r, comment.author.name);

    if (!isMod) throw templates.UNAUTHORIZED_COMMAND;

    await db.getConnection();
    const [thread] = await db.query(
      'SELECT id, data, author FROM sales_threads WHERE id = ?',
      [command.thread]
    );
    db.release();

    thread.data = JSON.parse(thread.data);
    thread.data.verified = true;

    await updateThread(r, thread);

    await r
      .getSubmission(thread.id)
      .reply(templates.VERIFIED(comment.author.name, command.note))
      .distinguish({ status: true, sticky: true });
    await comment.remove();
  } catch (err) {
    db.release();

    if (typeof err != 'string') console.error('commands/thread/verify', err);

    comment.reply(err);
  }
};
