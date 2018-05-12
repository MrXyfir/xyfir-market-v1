const isModerator = require('lib/users/is-moderator');
const categories = require('constants/categories');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} CategorizeCommand
 * @prop {string} thread
 * @prop {string} category
 */
/**
 * Allows a moderator or the creator of an unstructured thread to categorize
 * the thread and update its flair.
 * @param {snoowrap} r
 * @param {snoowrap.PrivateMessage} message
 * @param {CategorizeCommand} command
 */
module.exports = async function(r, message, command) {
  const db = new MySQL();

  try {
    const isMod = await isModerator(r, message.author.name);

    await db.getConnection();
    const [thread] = await db.query(
      'SELECT unstructured, author, data FROM sales_threads WHERE id = ?',
      [command.thread]
    );

    if (!thread || !thread.unstructured)
      throw templates.NO_MATCHING_THREAD(command.thread);
    if (!isMod && thread.author != message.author.name)
      throw templates.UNAUTHORIZED_COMMAND;
    if (!categories[command.category]) throw templates.INVALID_CATEGORY;

    thread.data = JSON.parse(thread.data);
    thread.data.category = command.category;

    await db.query('UPDATE sales_threads SET data = ? WHERE id = ?', [
      JSON.stringify(thread.data),
      command.thread
    ]);
    db.release();

    const category = categories[command.category];

    await r.getSubmission(command.thread).assignFlair({
      text: category.text,
      cssClass: category.css
    });
  } catch (err) {
    db.release();
    console.error('commands/thread/categorize', err);
  }
};
