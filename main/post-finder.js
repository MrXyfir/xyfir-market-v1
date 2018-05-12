const categories = require('constants/categories');
const createUser = require('lib/users/create');
const templates = require('constants/templates');
const config = require('constants/config');
const moment = require('moment');
const sleep = require('lib/sleep');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Finds posts in similar subreddits, contacts the posters, and optionally
 * reposts to xyMarket as unstructured.
 */
module.exports = async function() {
  console.log('main/post-finder: start');

  const db = new MySQL();

  try {
    const subreddits = [
      'BitMarket',
      'redditbay',
      'barter',
      'forsale',
      'Sell',
      'marketplace',
      'REDDITEXCHANGE',
      'giftcardexchange',
      'appleswap',
      'GameSale',
      'SteamGameSwap',
      'CryptoTrade',
      'slavelabour'
    ];
    const subredditCategory = {
      giftcardexchange: 'Vouchers and Gift Cards',
      SteamGameSwap: 'Games and Virtual Items',
      CryptoTrade: 'Cryptocurrency',
      slavelabour: 'Services',
      appleswap: 'Electronics',
      GameSale: 'Games and Virtual Items'
    };

    let posts = [],
      mods = [];

    for (let sub of subreddits) {
      // Load new posts
      let _posts = await r.getSubreddit(sub).getNew();

      _posts = _posts
        // Filter out posts over 2 hours old (should already have been seen)
        .filter(
          post =>
            moment
              .utc()
              .subtract(2, 'hours')
              .unix() < post.created_utc
        )
        // Ignore link and empty selftext posts
        .filter(post => !!post.selftext)
        // Ignore posts marked as completed or closed
        .filter(
          post =>
            !post.link_flair_text ||
            !/complete|close/i.test(post.link_flair_text)
        )
        // BitMarket threads must start with [WTS]
        .filter(post => !(sub == 'BitMarket' && !/\[WTS\]/.test(post.title)))
        // Ignore threads with 'scammer' in the title
        .filter(post => !/scammer/i.test(post.title))
        // Ignore [META] threads
        .filter(post => !/\[META\]/.test(post.title))
        // Make sure posts in trade subreddits with strict title formats are
        // looking to receive some known currency
        .filter(post => {
          if (subreddits.indexOf(sub) < 6) return true;

          // Title must be [H] <something> [W] <something>
          if (!/\[H\].+\[W\]/.test(post.title)) return false;

          const want = post.title.split('[W]')[1];

          if (/\bPayPal|BTC|Bitcoin|ETH|Ethereum|LTC|Litecoin\b/i.test(want))
            return true;
        })
        // slavelabour threads must start with [OFFER]
        .filter(post => sub != 'slavelabour' || /\[OFFER\]/.test(post.title));
      posts = posts.concat(_posts);

      // Load moderators
      let _mods = await r.getSubreddit(sub).getModerators();

      _mods = _mods
        // Just get their username
        .map(mod => mod.name)
        // Filter out moderators already in array
        .filter(mod => mods.indexOf(mod) == -1);
      mods = mods.concat(_mods);
    }

    // Ignore posts made by users in mods[]
    posts = posts.filter(
      post => mods.findIndex(mod => post.author.name == mod) == -1
    );

    if (!posts.length) return console.log('main/post-finder: end1');

    await db.getConnection();

    posts
      // Sort oldest to newest
      .sort((a, b) => a.created_utc - b.created_utc)
      // Limit to 45 posts
      .splice(45, 999);

    for (let post of posts) {
      const author = await post.author.fetch();

      // Author must have positive comment and link karma
      if (author.comment_karma < 0 || author.link_karma < 0) continue;

      // Thread must not already exist in database
      const [res] = await db.query(
        `
          SELECT (
            SELECT COUNT(id) FROM sales_threads
            WHERE author = ? AND unstructured = ? AND created > ?
          ) AS recentThreads, (
            SELECT ignored FROM users WHERE name = ?
          ) AS userIsIgnored, (
            SELECT contacted FROM users WHERE name = ?
          ) AS userHasBeenContacted
        `,
        [
          author.name,
          1,
          moment
            .utc()
            .subtract(2, 'hours')
            .unix(),
          author.name,
          author.name
        ]
      );

      if (res.recentThreads > 0 || res.userIsIgnored) continue;

      // Sleep so that there is not more than one post every 30 seconds
      await sleep(30 * 1000);

      const category =
        categories[
          subredditCategory[post.subreddit.display_name] || 'Uncategorized'
        ];

      // Crosspost to r/xyMarket
      const repost = await post
        .submitCrosspost({
          subredditName: config.ids.reddit.sub,
          sendReplies: false,
          title: post.title
        })
        .assignFlair({
          text: category.text,
          cssClass: category.css
        })
        .approve()
        .fetch();

      await createUser(author.name, db);

      await db.query(`INSERT INTO sales_threads SET ?`, {
        id: repost.id,
        author: author.name,
        created: repost.created_utc,
        unstructured: true,
        approved: true,
        data: JSON.stringify({
          category: category.text,
          title: repost.title
        })
      });

      if (res.userHasBeenContacted) continue;

      await r.composeMessage({
        // to: author.name,
        to: 'MrXyfir',
        subject: 'Your post has been reposted to r/xyMarket',
        text: templates.POST_FINDER_MESSAGE(repost.id)
      });

      await db.query(`UPDATE users SET contacted = 1 WHERE name = ?`, [
        author.name
      ]);
    }

    db.release();
    console.log('main/post-finder: end2');
  } catch (err) {
    db.release();
    console.error('main/post-finder', err);
  }
};
