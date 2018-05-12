const updateThread = require('lib/threads/update');
const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * @typedef {object} AddAutobuyItemsCommand
 * @prop {string} thread - The id of the sales thread.
 * @prop {string[]} items - The items to add to the thread.
 */

/**
 * Add item(s) to autobuy-enabled sales thread.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {AddAutobuyItemsCommand} command
 */
module.exports = async function(r, message, command) {
  const db = new mysql();

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT id, author, data FROM sales_threads WHERE id = ?',
      [command.thread]
    );

    if (!rows.length) throw templates.NO_MATCHING_THREAD(command.thread);

    const thread = rows[0];
    thread.data = JSON.parse(thread.data);

    if (thread.author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;
    if (!thread.data.autobuy) throw templates.AUTOBUY_NOT_ENABLED;
    if (!command.items.length) throw templates.NO_AUTOBUY_ITEMS;

    // Add items to database
    const sql =
        'INSERT INTO autobuy_items (thread, item) VALUES ' +
        command.items.map(i => '(?, ?)').join(', '),
      vars = [];
    command.items.forEach(item => vars.push(command.thread, item));
    const result = await db.query(sql, vars);
    db.release();

    // Notify user that items were added
    await message.reply(templates.AUTOBUY_ITEMS_ADDED(result.affectedRows));

    // Update stock count
    thread.data.stock += result.affectedRows;
    await updateThread(r, thread);
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/thread/autobuy/add', err);

    message.reply(err);
  }
};
