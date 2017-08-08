const threadId = context => context.split('/')[4];

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

  message.isMention =
    message.was_comment &&
    /^\/?u\/xyMarketBot\s+/i.test(message.body);

  if (message.isMention) {
    message.body = message.body.replace(/^\/?u\/xyMarketBot\s+/i, '');
  }

  message.body = message.body.trim();

  // REVISE
  let match = message.body.match(/^revise$/i);
  if (match && message.isMention) {
    return { command: 'revise', thread: threadId(message.context) };
  }
  
  // PROMOTE
  match = message.body.match(/^promote$/i);
  if (match && message.isMention) {
    return { command: 'promote', thread: threadId(message.context) };
  }

  // PURCHASE
  match = message.body.match(
    /^purchase (\d+)( of (\w+))? using (BTC|LTC|ETH)( and escrow)?$/i
  );
  if (match) {
    return {
      escrow: !!match[5],
      thread: match[3] || threadId(message.context),
      command: 'purchase',
      quantity: +match[1],
      paymentMethod: match[4]
    };
  }
  
  // RELEASE ESCROW
  match = message.body.match(/^release escrow for (\w{6,})$/i);
  if (match) return { command: 'release-escrow', order: match[1] };

  // REQUEST ESCROW
  match = message.body.match(
    /^request escrow for (\w{6,})( because (.+))?$/i
  );
  if (match) {
    return { command: 'request-escrow', order: match[1], reason: match[3] };
  }

  // GIVE FEEDBACK
  match = message.body.match(
    /^give (positive|negative) feedback for (\w{6,})( .+)?$/i
  );
  if (match) {
    return {
      command: 'give-feedback', type: match[1], order: match[2],
      feedback: match[3]
    };
  }

  // REMOVE
  match = message.body.match(/^delete|remove$/i);
  if (match && message.isMention) {
    return { command: 'remove', thread: threadId(message.context) };
  };

  // REQUEST VERIFICATION
  match = message.body.match(/^request verification( .+)?$/i);
  if (match && message.isMention) {
    return {
      command: 'request-verification',
      thread: threadId(message.context),
      reason: match[1] || ''
    };
  }

  // VERIFY
  match = message.body.match(/^verify$/i);
  if (match) return { command: 'verify', thread: threadId(message.context) };

  // ADD AUTOBUY ITEMS
  match = message.body.match(/^add autobuy items to (\w{6,})\s/i);
  if (match) {
    return {
      command: 'add-autobuy-items', thread: match[1],
      items: message.body.split('\n\n').slice(1)
    }
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

  // REPOST
  match = message.body.match(/^repost (\w{6,})$/i);
  if (match) return { command: 'repost', id: match[1] };

  return { command: 'error', reply: 'Invalid command or syntax' };

}