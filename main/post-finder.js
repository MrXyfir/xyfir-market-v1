const createUser = require('lib/users/create');
const templates = require('constants/templates');
const config = require('constants/config');
const moment = require('moment');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Finds posts in similar subreddits, contacts the posters, and optionally 
 * reposts to xyMarket as unstructured.
 */
module.exports = async function() {

  const db = new MySQL;

  try {
    // Most to least active (kind of)
    const subreddits = [
      'BitMarket', 'redditbay', 'barter', 'REDDITEXCHANGE', 'forsale',
      'Sell', 'marketplace'
    ];

    let posts = [], mods = [];

    for (let sub of subreddits) {
      // Load new posts
      let _posts = await r.getSubreddit(sub).getNew();

      // Filter out posts over 2 hours old (should already have been seen)
      _posts = _posts.filter(post =>
        moment.utc().subtract(2, 'hours').unix() < post.created_utc
      );
      posts = posts.concat(_posts);

      // Load moderators
      let _mods = await r.getSubreddit(sub).getModerators();

      // Filter out moderators already in array
      _mods = _mods.filter(mod => mods.indexOf(mod) == -1);
      mods = mods.concat(_mods);
    }

    posts = posts
      // Ignore posts made by users in mods[]
      .filter(post =>
        mods.findIndex(m => post.author.name == m.name) == -1
      )
      // Ignore link and empty selftext posts
      .filter(post => !!post.selftext)
      // BitMarket threads must start with [WTS]
      .filter(post => !(
        post.subreddit.display_name == 'BitMarket' &&
        !/\[WTS\]/.test(post.title)
      ));

    if (!posts.length) return;

    await db.getConnection();

    for (let post of posts) {
      const author = await post.author.fetch();

      // Author must have positive comment and link karma and over 10 karma total
      if (
        author.comment_karma < 0 || author.link_karma < 0 ||
        author.comment_karma + author.link_karma < 10
      ) continue;

      // Thread must not already exist in database
      const rows = await db.query(`
        SELECT id FROM sales_threads
        WHERE author = ? AND unstructured = ? AND created > ?
      `, [
        author.name, 1, moment.utc().subtract(2, 'hours').unix()
      ]);

      if (rows.length) continue;

      let text = '';

      // Post to r/xyMarket as unstructured
      const repost = await r
        .getSubreddit(config.ids.reddit.sub)
        .submitSelfpost({
          title: post.title,
          text: templates.POST_FINDER_REPOST(author.name, post.selftext)
        })
        .disableInboxReplies()
        .approve()
        .assignFlair({
          text: 'Unstructured', cssClass: 'unstructured'
        })
        .fetch();

      text = templates.POST_FINDER_REPOSTED(
        post.permalink, repost.permalink
      );

      await createUser(author.name, db);

      await db.query(`
        INSERT INTO sales_threads SET ?
      `, {
        id: repost.id, author: post.author.name, created: repost.created_utc,
        data: '{}', unstructured: true, approved: true
      });

      // Notify author
      await r.composeMessage({
        to: author.name,
        text,
        subject: 'r/xyMarket'
      });
    }

    db.release();
  }
  catch (err) {
    db.release();
    console.error('main/post-finder', err);
  }
  
}