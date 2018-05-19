const categories = require('constants/categories');
const createUser = require('lib/users/create');
const templates = require('constants/templates');
const getUser = require('lib/users/get-info');
const config = require('constants/config');
const parse = require('lib/threads/parse');
const build = require('lib/threads/build');
const MySQL = require('lib/mysql');

/**
 * Validate and post a new structured sales thread.
 * @param {Snoowrap} r
 * @param {Snoowrap.Submission} post
 * @param {boolean} [revise=false]
 */
module.exports = async function(r, post, revise = false) {
  const db = new MySQL();

  try {
    const data = parse(post);

    await db.getConnection();
    await createUser(post.author.name, db);
    const user = await getUser(post.author.name, db);

    const category = categories[data.category];

    // Post thread to r/xyMarket
    const repost = await r
      .getSubreddit(config.ids.reddit.sub)
      .submitSelfpost({
        title: data.title,
        text: ''
      })
      .disableInboxReplies()
      .assignFlair({
        text: category.text,
        cssClass: category.css
      })
      .approve()
      .fetch();

    // Thread id was needed to build text
    await repost.edit(build(repost.id, data, user));

    if (data.nsfw) await repost.markNsfw();

    // Add to database as approved / active post
    await db.query(`INSERT INTO sales_threads SET ?`, {
      id: repost.id,
      author: user.name,
      created: repost.created,
      data: JSON.stringify(data),
      approved: true
    });

    // Remove original post from database (might not exist)
    await db.query('DELETE FROM sales_threads WHERE id = ?', [post.id]);
    db.release();

    // We cannot delete another user's thread, but we can remove it
    await post.remove();

    // Send poster the link to their thread
    await post.reply(templates.SALES_THREAD_APPROVED(repost.id));

    // Repost thread to other general marketplace subreddits
    if (data.repost) {
      const subreddits = [
        'BitMarket',
        'redditbay',
        'forsale',
        'Sell',
        'marketplace',
        'REDDITEXCHANGE'
      ];

      for (let sub of subreddits) {
        try {
          await r
            .getSubreddit(sub)
            .submitSelfpost({
              title: sub == 'BitMarket' ? '[WTS] ' + data.title : data.title,
              text: build(repost.id, data, user, true)
            })
            .disableInboxReplies();
        } catch (err) {
          /* we don't care about errors here */
        }
      }
    }
  } catch (err) {
    db.release();

    if (typeof err != 'string') return console.error('lib/threads/create', err);

    // Add to database as non-approved post
    // Save so post listener knows we've seen this thread already
    if (!revise) {
      await db.getConnection();
      await db.query(`INSERT INTO sales_threads SET ?`, {
        id: post.id,
        created: post.created,
        author: post.author.name,
        approved: false
      });
      db.release();
    }

    post.reply(err);
  }
};
