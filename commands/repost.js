const templates = require('constants/templates');
const getUser = require('lib/users/get-info');
const build = require('lib/threads/build');
const mysql = require('lib/mysql');

/**
 * Allow a thread creator to repost their expired thread.
 * @param {snoowrap} r
 * @param {snoowrap.Comment} comment
 * @param {string} threadId
 */
module.exports = async function(r, comment, threadId) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [thread] = await db.query(`
      SELECT id, data FROM sales_threads
      WHERE
        id = ? AND author = ? AND approved = ? AND
        (removed = ? OR promoted > NOW())
    `, [
      threadId, comment.author.name, 1, 1
    ]);

    if (!thread) throw templates.NO_MATCHING_THREAD(threadId);

    thread.data = JSON.parse(thread.data);
    const user = await getUser(comment.author.name);

    // Create thread
    const repost = await r
      .getSubreddit('xyMarket')
      .submitSelfpost({
        title: thread.data.title, text: ''
      })
      .disableInboxReplies()
      .approve()
      .fetch();

    await repost.edit(build(repost.id, thread.data, user));

    if (thread.data.nsfw) await repost.markNsfw();

    // Updated id will cascade to other tables
    await db.query(
      'UPDATE sales_threads SET id = ?, created = ? WHERE id = ?',
      [repost.id, repost.created, threadId]
    );
    db.release();

    // In case thread is promoted and still live
    await r.getSubmission(threadId).remove();

    await comment.reply(templates.THREAD_REPOSTED(repost.permalink));
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/repost', err);

    comment.reply(err);
  }

}