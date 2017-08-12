const updateThread = require('lib/threads/update');
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
      'SELECT author, data FROM sales_threads WHERE id = ?',
      [thread]
    );

    if (!rows.length)
      throw templates.NO_MATCHING_THREAD(thread);

    rows[0].data = JSON.parse(rows[0].data);
    const { data, author } = rows[0];

    if (author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;

    await db.query(
      'DELETE FROM autobuy_items WHERE thread = ?',
      [thread]
    );
    db.release();

    await message.reply(templates.AUTOBUY_ITEMS_CLEARED);

    // Update stock count
    data.stock = 0;
    await updateThread(r, { id: thread, data, author });
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/list-autobuy-items', err);

    message.reply(err);
  }

}