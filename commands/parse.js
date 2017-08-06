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
    message.subject == 'username mention';

  if (message.isMention) {
    message.body = message.body.replace(/\/?u\/xyMarketBot\s+/ig, '');
  }

  message.body = message.body.trim();

  // REVISE
  let match = message.body.match(/^revise$/i);
  if (match && message.isMention) return { command: 'revise' };
  
  // PROMOTE
  match = message.body.match(/^promote$/i);
  if (match && message.isMention) return { command: 'promote' };

  // PURCHASE
  match = message.body.match(
    /^purchase (\d+)( of (\w+))? using (BTC|LTC|ETH)( and escrow)?$/i
  );
  if (match) {
    return {
      escrow: !!match[5],
      thread: match[3] || message.parent_id,
      command: 'purchase',
      quantity: +match[1],
      paymentMethod: match[4]
    };
  }
  
  // RELEASE ESCROW
  match = message.body.match(/^release escrow for (\w+)$/i);
  if (match) return { command: 'release-escrow', order: match[1] };

  // REQUEST ESCROW
  match = message.body.match(
    /^request escrow for (\w+)( because (.+))?$/i
  );
  if (match) {
    return { command: 'request-escrow', order: match[1], reason: match[3] };
  }

  // GIVE FEEDBACK
  match = message.body.match(
    /^give (positive|negative) feedback for (\w+)( .+)?$/i
  );
  if (match) {
    return {
      command: 'give-feedback', type: match[1], order: match[2],
      feedback: match[3]
    };
  }

  // DELETE
  match = message.body.match(/^delete|remove$/i);
  if (match && message.isMention) return { command: 'delete' };

  // REQUEST VERIFICATION
  match = message.body.match(/^request verification( .+)?$/i);
  if (match && message.isMention) {
    return { command: 'request-verification', reason: match[1] || '' };
  }

  // VERIFY
  match = message.body.match(/^verify$/i);
  if (match) return { command: 'verify' };

  // ADD AUTOBUY ITEMS
  match = message.body.match(/^add autobuy items to (\w+)\s/i);
  if (match) {
    return {
      command: 'add-autobuy-items', thread: match[1],
      items: message.body.split('\n\n').slice(1)
    }
  }

  // LIST AUTOBUY ITEMS
  match = message.body.match(/^list autobuy items in (\w+)$/i);
  if (match) {
    return { command: 'list-autobuy-items', thread: match[1] };
  }

  // CLEAR AUTOBUY ITEMS
  match = message.body.match(/^clear autobuy items in (\w+)$/i);
  if (match) {
    return { command: 'clear-autobuy-items', thread: match[1] };
  }

  // REPOST
  match = message.body.match(/^repost (\w{6,})$/i);
  if (match) return { command: 'repost', id: match[1] };

  return { command: 'error', reply: 'Invalid command or syntax' };

}