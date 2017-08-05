const parseCommand = require('commands/parse');
const config = require('constants/config');
const revise = require('commands/revise');
const snoo = require('snoowrap');

const r = new snoo(config.snoowrap);

/**
 * Listens for unread commands sent as private messages or username mentions.
 */
module.exports = async function() {

  try {
    // Get all messages not marked as read
    const messages = await r.getUnreadMessages();

    for (let message of messages) {
      const command = parseCommand(message);

      switch (command.command) {
        case 'request-verification':
        case 'remove-autobuy-items':
        case 'list-autobuy-items':
        case 'add-to-autobuy':
        case 'release-escrow':
        case 'request-escrow':
        case 'give-feedback':
        case 'purchase':
        case 'promote':
          break;
        case 'revise':
          revise(r, message);
          break;
        case 'delete':
        case 'verify':
          break;
        case 'error':
          message.reply(command.message);
      }
    }
    
    if (messages.length) await r.markMessagesAsRead(messages);
  }
  catch (err) {
    console.error('main/messageListener', err);
  }

}