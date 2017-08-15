/**
 * Create row in users table.
 * @async
 * @param {string} username
 * @param {object} db - Connected instance of `lib/mysql`.
 */
module.exports = async function(username, db) {

  // Create row in user table if it doesn't exist
  await db.query(`
    INSERT INTO users (name) VALUES (?)
    ON DUPLICATE KEY UPDATE name = name
  `, [
    username
  ]);

}