const messages = require('constants/messages');
const getUser = require('lib/users/get-info');
const parse = require('lib/threads/parse');
const build = require('lib/threads/build');
const mysql = require('lib/mysql');

/**
 * Validate and repost a new sales thread.
 * @param {snoowrap} r
 * @param {snoowrap.Submission} post
 * @param {boolean} [revise=false]
 */
module.exports = async function(r, post, revise = false) {

  const db = new mysql;

  try {
    const data = parse(post);
    const user = await getUser(post.author.name);

    // Post thread to r/xyMarket
    const repost = await r
      .getSubreddit('xyMarket')
      .submitSelfpost({
        title: data.title,
        text: build(data, user)
      })
      .approve()
      .fetch();

    if (data.nsfw) await repost.markNsfw();

    // Add to database as approved / active post
    await db.getConnection();
    await db.query(`
      INSERT INTO sales_threads SET ?
    `, {
      id: repost.id, author: post.author.name, created: repost.created,
      data: JSON.stringify(data), approved: true
    });

    // Remove original post from database (might not exist)
    await db.query(
      'DELETE FROM sales_threads WHERE id = ?',
      [post.id]
    );
    db.release();

    // We cannot delete another user's thread, but we can remove it
    await post.remove();
    
    // Send poster the link to their thread
    await post.reply(
      messages.SALES_THREAD_APPROVED(repost.permalink)
    );
  }
  catch (err) {
    if (typeof err != 'string')
      return console.error('lib/threads/create', err);

    // Add to database as non-approved post
    // Only save its id so post listener knows we've seen this thread already
    if (!revise) {
      await db.getConnection();
      await db.query(
        `INSERT INTO sales_threads SET ?`,
        { id: post.id, approved: false }
      );
    }

    db.release();
    post.reply(err);
  }

}