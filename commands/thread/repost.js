const categories = require('constants/categories');
const templates = require('constants/templates');
const getUser = require('lib/users/get-info');
const config = require('constants/config');
const build = require('lib/threads/build');
const MySQL = require('lib/mysql');

/**
 * Allow a thread creator to repost their expired structured sales thread.
 * @param {Snoowrap} r
 * @param {Snoowrap.Comment} comment
 * @param {string} threadId
 */
module.exports = async function(r, comment, threadId) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const [thread] = await db.query(`
      SELECT id, data FROM sales_threads
      WHERE
        id = ? AND author = ? AND approved = ? AND unstructured = ? AND
        (removed = ? OR promoted > NOW())
    `, [
      threadId, comment.author.name, 1, 0,
      1
    ]);

    if (!thread) throw templates.NO_MATCHING_THREAD(threadId);

    thread.data = JSON.parse(thread.data);
    const user = await getUser(comment.author.name, db);

    const category = categories[thread.data.category];

    // Create thread
    const repost = await r
      .getSubreddit(config.ids.reddit.sub)
      .submitSelfpost({
        title: thread.data.title, text: ''
      })
      .disableInboxReplies()
      .assignFlair({
        text: category.text, cssClass: category.css
      })
      .approve()
      .fetch();

    await repost.edit(build(repost.id, thread.data, user));

    if (thread.data.nsfw) await repost.markNsfw();

    // Updated id will cascade to other tables
    await db.query(
      'UPDATE sales_threads SET id = ?, created = ?, removed = ? WHERE id = ?',
      [repost.id, repost.created, 0, threadId]
    );
    db.release();

    // In case thread is promoted and still live
    await r.getSubmission(threadId).remove();

    await comment.reply(templates.THREAD_REPOSTED(repost.id));
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/thread/repost', err);

    comment.reply(err);
  }

}