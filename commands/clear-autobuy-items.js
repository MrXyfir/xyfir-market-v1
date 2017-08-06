const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * Delete all autobuy items.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {string} thread - The id of the sales thread.
 */
module.exports = async function(r, message, thread) {

  const db = new mysql;

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT author FROM sales_threads WHERE id = ?',
      [thread]
    );

    if (!rows.length)
      throw templates.NO_MATCHING_THREAD(thread);
    if (rows[0].author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    await db.query(
      'DELETE FROM autobuy_items WHERE thread = ?',
      [thread]
    );
    db.release();

    await message.reply(templates.AUTOBUY_ITEMS_CLEARED);
  }
  catch (err) {
    if (typeof err != 'string')
      return console.error('commands/list-autobuy-items', err);

    db.release();
    message.reply(err);
  }

}