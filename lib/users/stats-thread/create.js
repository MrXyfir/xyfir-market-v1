const config = require('constants/config');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Create thread for user in r/xyMarketStats.
 * @param {string} username
 * @return {string} Stats thread id
 */
module.exports = async function(username) {

  const thread = await r
    .getSubreddit('xyMarketStats')
    .submitSelfpost({
      title: username, text: ''
    })
    .lock()
    .approve()
    .assignFlair({
      text: 'User', cssClass: 'user'
    })
    .fetch();

  return thread.id;

}