const threadId = context => context.split('/')[4];
const note = body => body.split('\n\n').slice(1).join('\n\n').trim();

/**
 * Takes in the content from a username mention or private message and returns 
 * a usable object with data pulled out of the content to be passed to the 
 * appropriate command handler. 
 * Only basic validation is done here, more will likely be done in the command 
 * handler.
 * @param {snoowrap.PrivateMessage|snoowrap.Comment}
 * @return {object}
 */
module.exports = function(message) {

  // Strip comments and whitespace off both ends
  message.body = message.body.replace(/^\/\/ .+$/gm, '').trim();

  message.isMention =
    message.was_comment &&
    /^\/?u\/xyMarket(Dev)?Bot\s+/i.test(message.body);

  if (message.isMention) {
    message.body = message.body.replace(/^\/?u\/xyMarket(Dev)?Bot\s+/i, '');
  }

  // REVISE
  let match = message.body.match(/^revise$/i);
  if (match && message.isMention) {
    return { command: 'revise', thread: threadId(message.context) };
  }
  
  // PROMOTE
  match = message.body.match(
    /^promote( (\w{6,}))? for (\d+) months? using (BTC|LTC|ETH)$/i
  );
  if (match) {
    return {
      thread: match[2] || threadId(message.context),
      months: +match[3],
      command: 'promote',
      currency: match[4].toUpperCase()
    };
  }

  // PURCHASE
  match = message.body.match(
    /^(purchase|buy) (\d+)( of (\w+))? using (BTC|LTC|ETH)( and escrow)?$/i
  );
  if (match) {
    return {
      escrow: !!match[6],
      thread: match[4] || threadId(message.context),
      command: 'purchase',
      quantity: +match[2],
      currency: match[5].toUpperCase()
    };
  }

  match = message.body.match(
    /^confirm order (\d+) with transaction (\w+)$/i
  );
  if (match) {
    return {
      command: 'confirm-order',
      orderId: +match[1],
      transaction: match[2]
    };
  }
  
  // RELEASE ESCROW
  match = message.body.match(/^release escrow for (\d+)$/i);
  if (match) return { command: 'release-escrow', order: +match[1] };

  // REQUEST ESCROW
  match = message.body.match(
    /^request escrow for (\d+)\b/i
  );
  if (match) {
    return {
      command: 'request-escrow',
      order: +match[1],
      note: note(message.body) || 'None'
    };
  }

  // GIVE FEEDBACK
  match = message.body.match(
    /^give (positive|negative) feedback for (\d+)( .+)?$/i
  );
  if (match) {
    return {
      feedback: (match[3] || '').trim(),
      command: 'give-feedback', 
      order: match[2],
      type: match[1].toLowerCase() == 'positive' ? 1 : -1
    };
  }

  // REMOVE
  match = message.body.match(/^remove$/i);
  if (match && message.isMention) {
    return { command: 'remove', thread: threadId(message.context) };
  };

  // DELETE
  match = message.body.match(/^delete (\w+)$/i);
  if (match) return { command: 'delete', thread: match[1] };

  // REQUEST VERIFICATION
  match = message.body.match(/^request verification\b/i);
  if (match && message.isMention) {
    return {
      command: 'request-verification',
      thread: threadId(message.context),
      note: note(message.body)
    };
  }

  // VERIFY
  match = message.body.match(/^verify\b/i);
  if (match && message.isMention) {
    return {
      command: 'verify',
      thread: threadId(message.context),
      note: note(message.body) || ''      
    };
  }

  // ADD AUTOBUY ITEMS
  match = message.body.match(/^add autobuy items to (\w{6,})\s/i);
  if (match) {
    return {
      command: 'add-autobuy-items', thread: match[1],
      items: message.body.split('\n\n').slice(1)
    };
  }

  // LIST AUTOBUY ITEMS
  match = message.body.match(/^list autobuy items in (\w{6,})$/i);
  if (match) {
    return { command: 'list-autobuy-items', thread: match[1] };
  }

  // CLEAR AUTOBUY ITEMS
  match = message.body.match(/^clear autobuy items in (\w{6,})$/i);
  if (match) {
    return { command: 'clear-autobuy-items', thread: match[1] };
  }

  // REPOST (on thread)
  match = message.body.match(/^repost$/i);
  if (match && message.isMention)
    return { command: 'repost', thread: threadId(message.context) };

  // REPOST (in private message)
  match = message.body.match(/^repost (\w+)$/i);
  if (match) return { command: 'repost', thread: match[1] };

  // USER STATS LOOKUP
  match = message.body.match(/^get stats for u\/(\w+)$/);
  if (match) return { command: 'stats-lookup', user: match[1] };

  // CATEGORIZE SALES THREAD
  match = message.body.match(/^categorize (\w{6,}) as (.+)$/i);
  if (match) {
    return { command: 'categorize', thread: match[1], category: match[2] };
  }
  
  return { command: 'error', reply: 'Invalid command or syntax' };

}