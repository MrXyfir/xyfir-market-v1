/**
 * Checks if a user is a subreddit moderator.
 * @async
 * @param {snoo} r
 * @param {string} username
 * @return {boolean}
 */
module.exports = async function(r, username) {

  const mods = await r
    .getSubreddit('xyMarket')
    .getModerators();

  return mods.findIndex(m => m.name == username) > -1;

}