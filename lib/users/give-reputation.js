const mysql = require('lib/mysql');

/**
 * Updates a user's reputation and any active threads they have.
 * @async
 * @param {string} username
 * @param {number} rep - 1|-1
 */
module.exports = async function(username, rep) {

  const db = new mysql;

  try {
    // Get user's current reputation
    await db.getConnection();
    const [user] = await db.query(
      'SELECT name, posFeedback, negFeedback FROM users WHERE name = ?',
      [username]
    );

    // Update reputation
    user[rep == 1 ? 'posFeedback' : 'negFeedback']++;

    await db.query(
      'UPDATE users SET posFeedback = ?, negFeedback = ? WHERE name = ?',
      [user.posFeedback, user.negFeedback, user.name]
    );
    db.release();
  }
  catch (err) {
    db.release();
    throw err;
  }

}