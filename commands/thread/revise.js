const create = require('lib/threads/create');

/**
 * Revise an edited unapproved sales thread and repost it if valid.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 * @param {string} thread
 */
module.exports = async function(r, comment, thread) {
  try {
    // Load the thread that the comment resides in
    const post = await r.getSubmission(thread).fetch();

    // Only the creator can revise their own thread
    if (comment.author.name != post.author.name) return;

    create(r, post, true);
  } catch (err) {
    comment.reply(err);
  }
};
