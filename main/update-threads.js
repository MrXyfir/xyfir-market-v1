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
      SELECT id, unstructured FROM sales_threads
      WHERE created < ? AND removed = 0 AND NOW() > promoted
    `, [
      moment().subtract(1, 'week').utc().unix()
    ]);

    if (rows.length) {
      // Mark threads as 'removed'
      await db.query(`
        UPDATE sales_threads
        SET removed = 1, dateRemoved = NOW()
        WHERE id IN (?)
      `, [
        rows.map(r => r.id)
      ]);

      for (let row of rows) {
        const thread = await r.getSubmission(row.id);

        // Remove (not delete) thread from subreddit
        await thread.remove();

        // Notify creator that their thread has expired and that they can repost
        await thread.reply(templates.SALES_THREAD_EXPIRED(row.unstructured));
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
      let { title, category = 'Uncategorized' } = JSON.parse(row.data);

      title = title
        .replace(/\[/g, '(')
        .replace(/\]/g, ')')
        .replace(/\)\s+\(/g, ')(');

      row.data = { title, category };
      return row;
    });

    // Categorize threads
    let categories = {};

    rows.forEach(row => {
      let category = row.data.category;
      const base = category;

      // Check if first group of category exists
      // Initialize values
      if (!categories[base]) {
        categories[base] = [],
        categories[base].groups = 1,
        categories[base].currentGroupLength =
          base.length + row.id.length + row.data.title.length + 39;
      }
      // Fit row into last category group
      else if (categories[base].currentGroupLength < 9500) {
        categories[base].currentGroupLength +=
          row.id.length + row.data.title.length + 30;
        category = row.data.category + (
          categories[base].groups > 1 ? ` (#${categories[base].groups})` : ''
        );
      }
      // Create a new group for the category
      else {
        categories[base].groups++,
        categories[base].currentGroupLength =
          category.length + row.id.length + row.data.title.length + 39,
        category = row.data.category + ` (#${categories[base].groups})`;

        categories[category] = [];
      }

      categories[category].push(row);
    });

    const header = templates.DAILY_THREAD_HEADER(
      // 5 random promoted threads
      rows
        .filter(r => r.promoted)
        .sort(() => Math.floor(Math.random()) ? 1 : -1)
        .slice(0, 5),
      // 5 random non-promoted threads
      rows
        .filter(r => !r.promoted)
        .sort(() => Math.floor(Math.random()) ? 1 : -1)
        .slice(0, 5)
    );

    rows = null;

    let text = Object
      .keys(categories)
      // Sort the categories randomly
      .sort(() => Math.round(Math.random()) ? 1 : -1)
      // Build list of categories
      .map(category =>
        `\n## ${category}\n` +
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
            '- ' +
            (thread.promoted ? '💎' : '') +
            `[${thread.data.title}](/r/${sub}/comments/${thread.id})`
          )
          .join('\n')
      )
      .join('\n');

    categories = null;

    let posts = [''];

    if (text.length > 40000) {
      posts = text
        .split(/^\##/gm)
        .slice(1)
        .reduce((posts, section) => {
          const i = posts.length - 1;

          // A new post will be needed
          // First post (index 0), has 40K character limit
          if (posts[i].length + section.length > (i ? 10000 : 40000))
            return posts.concat('##' + section);
          // Add section to last post
          else
            posts[i] += '##' + section;

          return posts;
        }, [
          header
        ]);
    }
    else {
      posts[0] = header + text;
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