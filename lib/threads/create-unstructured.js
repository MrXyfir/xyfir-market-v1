const categories = require('constants/categories');
const createUser = require('lib/users/create');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * Create an unstructured sales thread.
 * @param {snoowrap.Submission} post
 */
module.exports = async function(post) {
  const db = new MySQL();

  try {
    await db.getConnection();

    await createUser(post.author.name, db);

    await db.query(
      `
      INSERT INTO sales_threads SET ?
    `,
      {
        id: post.id,
        author: post.author.name,
        created: post.created,
        data: JSON.stringify({ title: post.title }),
        approved: true,
        unstructured: true
      }
    );
    db.release();

    await post.approve().assignFlair({
      text: categories.Uncategorized.text,
      cssClass: categories.Uncategorized.css
    });

    await post
      .reply(templates.UNSTRUCTURED_THREAD(post.id))
      .distinguish({ status: true, sticky: true });
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('lib/threads/create-unstructured', err);

    post.reply(err);
  }
};
