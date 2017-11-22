const parseCommand = require('commands/parse');
const config = require('constants/config');
const snoo = require('snoowrap');

// Command handlers
const requestVerification = require('commands/thread/request-verification');
const clearAutobuyItems = require('commands/thread/autobuy/clear');
const listAutobuyItems = require('commands/thread/autobuy/list');
const addAutobuyItems = require('commands/thread/autobuy/add');
//const requestEscrow = require('commands/order/escrow/request');
//const releaseEscrow = require('commands/order/escrow/release');
const confirmOrder = require('commands/order/confirm');
const giveFeedback = require('commands/order/give-feedback');
const deleteThread = require('commands/thread/delete');
const removeThread = require('commands/thread/remove');
const reviseThread = require('commands/thread/revise');
const statsLookup = require('commands/user/stats-lookup');
const purchase = require('commands/thread/purchase');
const promote = require('commands/thread/promote');
const verify = require('commands/thread/verify');
const repost = require('commands/thread/repost');

const r = new snoo(config.snoowrap);

/**
 * Listens for unread commands sent as private messages or username mentions.
 */
module.exports = async function() {

  console.log('main/message-listener: start');

  try {
    // Get all messages not marked as read
    const messages = await r.getUnreadMessages();

    for (let message of messages) {
      const command = parseCommand(message);

      switch (command.command) {
        case 'request-verification':
          requestVerification(r, message, command);
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
        case 'confirm-order':
          confirmOrder(r, message, command);
          break;
        // case 'release-escrow':
        //   releaseEscrow(r, message, command.order);
        //   break;
        // case 'request-escrow':
        //   requestEscrow(r, message, command);
        //   break;
        case 'give-feedback':
          giveFeedback(r, message, command);
          break;
        case 'stats-lookup':
          statsLookup(r, message, command.user);
          break;
        case 'purchase':
          purchase(r, message, command);
          break;
        case 'promote':
          promote(r, message, command);
          break;
        case 'revise':
          reviseThread(r, message, command.thread);
          break;
        case 'remove':
          removeThread(r, message, command.thread);
          break;
        case 'delete':
          deleteThread(r, message, command.thread);
          break;
        case 'verify':
          verify(r, message, command);
          break;
        case 'repost':
          repost(r, message, command.thread);
          break;
        case 'error':
          message.reply(command.reply);
          break;
      }
    }
    
    if (messages.length) await r.markMessagesAsRead(messages);

    console.log('main/message-listener: end');
  }
  catch (err) {
    console.error('main/messageListener', err);
  }

}