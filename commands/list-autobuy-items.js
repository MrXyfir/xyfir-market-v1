const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * Output autobuy items.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {string} thread - The id of the sales thread.
 */
module.exports = async function(r, message, thread) {

  const db = new mysql;

  try {
    await db.getConnection();
    let rows = await db.query(
      'SELECT author FROM sales_threads WHERE id = ?',
      [thread]
    );

    if (!rows.length)
      throw templates.NO_MATCHING_THREAD(thread);
    if (rows[0].author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    rows = await db.query(
      'SELECT item FROM autobuy_items WHERE thread = ? ORDER BY added ASC',
      [thread]
    );
    db.release();

    if (!rows.length) throw templates.NO_AUTOBUY_ITEMS;

    await message.reply(
      rows.map(r => r.item).join('\n\n')
    );
  }
  catch (err) {
    if (typeof err != 'string')
      return console.error('commands/list-autobuy-items', err);

    db.release();
    message.reply(err);
  }

}