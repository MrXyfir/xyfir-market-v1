const parseCommand = require('commands/parse');
const config = require('constants/config');
const snoo = require('snoowrap');

// Command handler
const clearAutobuyItems = require('commands/clear-autobuy-items');
const listAutobuyItems = require('commands/list-autobuy-items');
const addAutobuyItems = require('commands/add-autobuy-items');
const revise = require('commands/revise');

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
          break;
        case 'clear-autobuy-items':
          clearAutobuyItems(r, message, command.thread);
          break;
        case 'list-autobuy-items':
          listAutobuyItems(r, message, command.thread);
          break;
        case 'add-autobuy-items':
          addAutobuyItems(r, message, command);
          break;
        case 'release-escrow':
          break;
        case 'request-escrow':
          break;
        case 'give-feedback':
          break;
        case 'purchase':
          break;
        case 'promote':
          break;
        case 'revise':
          revise(r, message);
          break;
        case 'delete':
          break;
        case 'verify':
          break;
        case 'error':
          message.reply(command.reply);
          break;
      }
    }
    
    if (messages.length) await r.markMessagesAsRead(messages);
  }
  catch (err) {
    console.error('main/messageListener', err);
  }

}