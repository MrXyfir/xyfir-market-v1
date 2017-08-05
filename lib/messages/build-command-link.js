/**
 * Builds a link that when clicked takes the user to a pre-filled 'send 
 * private message' form addressed to xyMarketBot.
 * @param {string} message
 * @return {string}
 */
module.exports = message =>
  '/message/compose?to=xyMarketBot&subject=command&message=' +
  encodeURIComponent(message);