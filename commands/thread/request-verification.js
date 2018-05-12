const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * @typedef {object} RequestVerificationCommand
 * @prop {string} thread
 * @prop {string} note
 */

/**
 * Contact a moderator to request that a thread be verified.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 * @param {RequestVerificationCommand} command
 */
module.exports = async function(r, comment, command) {
  const db = new mysql();

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT id FROM sales_threads WHERE id = ? AND author = ?',
      [command.thread, comment.author.name]
    );
    db.release();

    if (!rows.length) throw templates.UNAUTHORIZED_COMMAND;

    await r.composeMessage({
      to: 'MrXyfir',
      text: templates.VERIFICATION_REQUESTED(command),
      subject: 'Verification Requested'
    });
    await comment.remove();
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/thread/request-verification', err);

    comment.reply(err);
  }
};
