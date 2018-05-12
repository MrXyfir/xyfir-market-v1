const parseCommand = require('commands/parse');
const templates = require('constants/templates');
const config = require('constants/config');
const snoo = require('snoowrap');

// Command handlers
const requestVerification = require('commands/thread/request-verification');
const clearAutobuyItems = require('commands/thread/autobuy/clear');
const listAutobuyItems = require('commands/thread/autobuy/list');
const addAutobuyItems = require('commands/thread/autobuy/add');
//const requestEscrow = require('commands/order/escrow/request');
//const releaseEscrow = require('commands/order/escrow/release');
const ignoreMyPosts = require('commands/user/ignore-my-posts');
const confirmTrade = require('commands/user/confirm-trade');
const confirmOrder = require('commands/order/confirm');
const giveFeedback = require('commands/order/give-feedback');
const deleteThread = require('commands/thread/delete');
const removeThread = require('commands/thread/remove');
const reviseThread = require('commands/thread/revise');
const statsLookup = require('commands/user/stats-lookup');
const claimThread = require('commands/thread/claim');
const categorize = require('commands/thread/categorize');
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

    // Mark as read immediately, because if this fails it will prevent the
    // same message from being acted on multiple times
    if (messages.length) await r.markMessagesAsRead(messages);

    for (let message of messages) {
      // Ignore user name mentions from outside of subreddit
      if (
        message.was_comment &&
        message.subreddit_name_prefixed != `r/${config.ids.reddit.sub}`
      )
        continue;

      try {
        const command = parseCommand(message);

        switch (command.command) {
          case 'request-verification':
            await requestVerification(r, message, command);
            break;
          case 'clear-autobuy-items':
            await clearAutobuyItems(r, message, command.thread);
            break;
          case 'list-autobuy-items':
            await listAutobuyItems(r, message, command.thread);
            break;
          case 'add-autobuy-items':
            await addAutobuyItems(r, message, command);
            break;
          // case 'release-escrow':
          //   await releaseEscrow(r, message, command.order);
          //   break;
          // case 'request-escrow':
          //   await requestEscrow(r, message, command);
          //   break;
          case 'ignore-my-posts':
            await ignoreMyPosts(r, message);
            break;
          case 'confirm-trade':
            await confirmTrade(r, message, command);
            break;
          case 'confirm-order':
            await confirmOrder(r, message, command);
            break;
          case 'give-feedback':
            await giveFeedback(r, message, command);
            break;
          case 'stats-lookup':
            await statsLookup(r, message, command.user);
            break;
          case 'claim-thread':
            await claimThread(r, message, command.thread);
            break;
          case 'categorize':
            await categorize(r, message, command);
            break;
          case 'purchase':
            await purchase(r, message, command);
            break;
          case 'promote':
            await promote(r, message, command);
            break;
          case 'revise':
            await reviseThread(r, message, command.thread);
            break;
          case 'remove':
            await removeThread(r, message, command.thread);
            break;
          case 'delete':
            await deleteThread(r, message, command.thread);
            break;
          case 'verify':
            await verify(r, message, command);
            break;
          case 'repost':
            await repost(r, message, command.thread);
            break;
          case 'error':
            message.reply(templates.INVALID_COMMAND);
            break;
        }
      } catch (err) {
        console.error('main/messageListener', err);
      }
    }

    console.log('main/message-listener: end');
  } catch (err) {
    console.error('main/messageListener', err);
  }
};
