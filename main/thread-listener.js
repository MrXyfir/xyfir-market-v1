const createUnstructured = require('lib/threads/create-unstructured');
const create = require('lib/threads/create');
const config = require('constants/config');
const moment = require('moment');
const mysql = require('lib/mysql');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Listens for new, unapproved, and unchecked threads that have been posted.
 */
module.exports = async function() {

  const db = new mysql;

  try {
    let posts = await r.getSubreddit('xyMarket').getUnmoderated();
    //console.log(posts);

    // Posts by xyMarketBot will eventually be approved by code that
    // originally created the post
    posts = posts.filter(p => p.author.name != 'xyMarketBot');

    if (!posts.length) return;

    // Load posts from database that match post ids
    await db.getConnection();
    const dbItems = await db.query(
      `SELECT id FROM sales_threads WHERE id IN (?)`,
      [posts.map(p => p.id)]
    );
    
    const remove = [];

    for (let post of posts) {
      const expires = moment
        .unix(post.created_utc)
        .utc()
        .add(1, 'hour')
        .unix();

      // Posts over an hour old are considered abandoned
      if (expires < moment.utc().unix()) {
        post.remove();
        remove.push(post.id);
      }
      // Skip if item has already been checked
      // Item has already been parsed and is invalid; awaiting `revise`
      else if (dbItems.findIndex(i => i.id == post.id) > -1) {
        continue;
      }
      // Unstructured sales thread
      else if (/^@unstructured\b/.test(post.selftext)) {
        createUnstructured(post);
      }
      // Structured sales thread
      else {
        create(r, post);
      }
    }

    if (remove.length) {
      await db.query(
        `DELETE FROM sales_threads WHERE id IN (?)`,
        [remove]
      );
    }
    db.release();
  }
  catch (err) {
    db.release();
    console.error('main/threadListener', err);
  }

}