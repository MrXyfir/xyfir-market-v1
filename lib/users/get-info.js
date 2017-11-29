/**
 * @typedef {object} UserRow
 * @prop {string} name
 * @prop {string} joined
 * @prop {boolean} ignored
 * @prop {string} statsThread
 * @prop {string} statsThreadExpires
 */
/**
 * Gets a user's information.
 * @async
 * @param {string} user
 * @param {object} db - Connected instance of `lib/mysql`.
 * @return {UserRow}
 */
module.exports = async function(user, db) {

  await db.getConnection();
  const rows = await db.query(
    `SELECT * FROM users WHERE name = ?`,
    [user]
  );

  return rows[0];

}