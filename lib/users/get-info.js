/**
 * @typedef {object} UserRow
 * @prop {string} name
 * @prop {string} joined
 * @prop {string} statsThread
 * @prop {string} statsThreadExpires
 * @prop {boolean} ignored
 * @prop {string} [verifiedProfiles] - JSON string of key/value object
 * @prop {string} [baseRep] - JSON string of object
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