const mysql = require('lib/mysql');

/**
 * @typedef {object} UserRow
 * @prop {string} name
 * @prop {number} posFeedback
 * @prop {number} negFeedback
 */

/**
 * Gets a user's information.
 * @async
 * @param {string} user
 * @return {UserRow}
 */
module.exports = async function(user) {

  const db = new mysql;

  await db.getConnection();
  const rows = await db.query(
    `SELECT * FROM users WHERE name = ?`,
    [user]
  );
  db.release();

  if (!rows.length)
    return { posFeedback: 0, negFeedback: 0, name: user };
  else
    return rows[0];

}