const templates = require('constants/templates');
const config = require('constants/config');
const moment = require('moment');
const MySQL = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Updates the daily thread and removes expired sales threads.
 */
module.exports = async function() {

  console.log('main/update-threads: start');

  const db = new MySQL, {sub} = config.ids.reddit;

  try {
    // Get ids of all active threads that are over a week old
    await db.getConnection();
    let rows = await db.query(`
      SELECT id FROM sales_threads
      WHERE created < ? AND removed = 0 AND NOW() > promoted
    `, [
      moment().subtract(1, 'week').utc().unix()
    ]);

    if (rows.length) {
      // Mark threads as 'removed'
      await db.query(
        'UPDATE sales_threads SET removed = 1 WHERE id IN (?)',
        [rows.map(r => r.id)]
      );

      for (let row of rows) {
        const thread = await r.getSubmission(row.id);

        // Remove (not delete) thread from subreddit
        await thread.remove();

        // Notify creator that their thread has expired and that they can repost
        await thread.reply(templates.SALES_THREAD_EXPIRED);
      }
    }

    // Grab full data for all active threads
    rows = await db.query(`
      SELECT id, data, unstructured, promoted > NOW() AS promoted
      FROM sales_threads
      WHERE approved = 1 AND removed = 0 AND data != '{}'
    `);
    db.release();

    if (!rows.length) return console.log('main/update-threads: end1');

    rows = rows.map(row => {
      const { title, category = 'Uncategorized' } = JSON.parse(row.data);
      row.data = { title, category };
      return row;
    });
  
    // Categorize threads
    let categories = {};

    rows.forEach(row => {
      if (!categories[row.data.category])
        categories[row.data.category] = [];

      categories[row.data.category].push(row);
    });

    rows = null;

    let text = Object
      .keys(categories)
      // Remove 'Uncategorized' category
      .filter(category => category != 'Uncategorized')
      // Sort the categories randomly
      .sort(() => Math.round(Math.random()) ? 1 : -1)
      // Build list of categories
      .map(category =>
        `- **${category}**\n` +
        categories[category]
          // Promoted threads go to top
          // Both promoted and normal are randomly sorted (but separate)
          .sort((a, b) => {
            if (!a.promoted && b.promoted)
              return 1;
            else if (a.promoted && !b.promoted)
              return -1;
            else
              return Math.round(Math.random()) ? 1 : -1;
          })
          // Convert to string for post
          .map(thread =>
            '  - ' +
            (thread.promoted ? '💎' : '') +
            `[${thread.data.title}](/r/${sub}/comments/${thread.id})` +
            (thread.unstructured ? '^unstructured' : '')
          )
          .join('\n')
      )
      .join('\n');

    // **Uncategorized** is always added to the very bottom
    if (categories.Uncategorized) {
      text +=
        '\n- **Uncategorized**\n' +
        categories.Uncategorized
          .sort(() => Math.round(Math.random()) ? 1 : -1)
          .map(thread =>
            '  - ' +
            (thread.promoted ? '💎' : '') +
            `[${thread.data.title}](/r/${sub}/comments/${thread.id})` +
            (thread.unstructured ? '^unstructured' : '')
          )
          .join('\n')
    }

    categories = null;

    let posts = [''];

    if (text.length > 40000) {
      posts = text
        .split(/^\-/gm)
        .slice(1)
        .reduce((posts, section) => {
          const i = posts.length - 1;

          // A new post will be needed
          // First post (index 0), has 40K character limit
          if (posts[i].length + section.length > (i ? 10000 : 40000))
            return posts.concat('-' + section);
          // Add section to last post
          else
            posts[i] += '-' + section;

          return posts;
        }, ['']);
    }
    else {
      posts[0] = text;
    }

    text = null;

    // Get age of daily thread
    let daily = await r
      .getSubreddit(sub)
      .getSticky({ num: 1 })
      .fetch(),
    expires = moment
      .unix(daily.created_utc)
      .utc()
      .add(1, 'day')
      .unix();

    // Remove current daily thread and create a new one
    if (expires < moment.utc().unix()) {
      await daily.remove();

      daily = await r
        .getSubreddit(sub)
        .submitSelfpost({
          text: posts.shift(),
          title: `Categorized Sales Threads (${
            moment.utc().subtract(12, 'hours').format('MM/DD')
          } - ${
            moment.utc().add(12, 'hours').format('MM/DD')
          })`,
          sendReplies: false
        })
        .disableInboxReplies()
        .lock()
        .approve()
        .sticky({ num: 1 });
    }
    // Edit current daily thread
    else {
      await daily.edit(posts.shift());

      // Delete all comments
      for (let comment of daily.comments) {
        await comment.delete();
      }
    }

    // Add comments if needed
    for (let post of posts) {
      await daily.reply(post);
    }

    console.log('main/update-threads: end2');
  }
  catch (err) {
    db.release();
    console.error('main/updateThreads', err);
  }
  
}