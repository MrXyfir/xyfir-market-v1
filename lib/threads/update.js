const getUser = require('lib/users/get-info');
const build = require('lib/threads/build');
const mysql = require('lib/mysql');

/**
 * @typedef {object} ThreadUpdateObject
 * @prop {string} id
 * @prop {object} data
 * @prop {string} author
 */

/**
 * Updates a sales thread's text and data column in database.
 * @async
 * @param {snoowrap} r
 * @param {ThreadUpdateObject} thread
 */
module.exports = async function(r, thread) {

  const db = new mysql;

  try {
    await db.getConnection();
    const res = await db.query(
      'UPDATE sales_threads SET data = ? WHERE id = ?',
      [JSON.stringify(thread.data), thread.id]
    );
    db.release();

    if (!res.affectedRows) throw 'Could not update sales thread';

    const user = await getUser(thread.author);
    await r
      .getSubmission(thread.id)
      .edit(build(thread.id, thread.data, user));
  }
  catch (err) {
    db.release();
    throw err;
  }

}