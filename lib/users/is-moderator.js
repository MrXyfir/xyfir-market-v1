const config = require('constants/config');

/**
 * Checks if a user is a subreddit moderator.
 * @async
 * @param {snoo} r
 * @param {string} username
 * @return {boolean}
 */
module.exports = async function(r, username) {
  const mods = await r.getSubreddit(config.ids.reddit.sub).getModerators();

  return mods.findIndex(m => m.name == username) > -1;
};
