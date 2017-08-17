const templates = require('constants/templates');
const mysql = require('lib/mysql');

/**
 * Create an unstructured sales thread.
 * @param {snoowrap.Submission} post
 */
module.exports = async function(post) {

  const db = new mysql;

  try {
    await db.getConnection();
    await db.query(`
      INSERT INTO sales_threads SET ?
    `, {
      id: post.id, author: post.author.name, created: post.created,
      data: '{}', approved: true, unstructured: true
    });
    db.release();

    await post
      .approve()
      .assignFlair({
        text: 'Unstructured', cssClass: 'unstructured'
      });

    await post
      .reply(templates.UNSTRUCTURED_THREAD)
      .distinguish({ status: true, sticky: true });
  }
  catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('lib/threads/create-unstructured', err);

    post.reply(err);
  }

}