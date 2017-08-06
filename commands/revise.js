const create = require('lib/threads/create');
const mysql = require('lib/mysql');

/**
 * Revise an edited unapproved sales thread and repost it if valid.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 */
module.exports = async function(r, comment) {

  const db = new mysql;

  try {
    // Load the thread that the comment resides in
    const post = await r
      .getSubmission(comment.context.split('/')[4])
      .fetch();

    // Only the creator can revise their own thread
    if (comment.author.name != post.author.name) return;

    create(r, post, true);
  }
  catch (err) {
    db.release();
    comment.reply(err);
  }

}