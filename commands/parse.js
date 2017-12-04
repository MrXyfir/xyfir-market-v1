const threadId = context => context.split('/')[4];
const note = body => body.split('\n\n').slice(1).join('\n\n').trim();

/**
 * Takes in the content from a username mention or private message and returns 
 * a usable object with data pulled out of the content to be passed to the 
 * appropriate command handler. 
 * Only basic validation is done here, more will likely be done in the command 
 * handler.
 * @param {snoowrap.PrivateMessage|snoowrap.Comment}
 * @param {boolean} [decode=false] Determines whether the message should be 
 * URL decoded. Used only if the first attempt to parse fails. Some Reddit 
 * clients don't seem to decode the message properly.
 * @return {object}
 */
function parseCommand(message, decode = false) {

  const { context, was_comment: wasComment} = message;
  let {body: text} = message;

  text = decode ? decodeURIComponent(text) : text;

  // Strip comments and whitespace off both ends
  text = text.replace(/^\/\/ .+$/gm, '').trim();

  const isMention = wasComment && /^\/?u\/xyMarket(Dev)?Bot\s+/i.test(text);

  if (isMention) {
    text = text.replace(/^\/?u\/xyMarket(Dev)?Bot\s+/i, '');
  }

  // REVISE
  let match = text.match(/^revise$/i);
  if (match && isMention) {
    return { command: 'revise', thread: threadId(context) };
  }
  
  // PROMOTE
  match = text.match(
    /^promote( (\w{6,}))? for (\d+) months? using (BTC|LTC|ETH)$/i
  );
  if (match) {
    return {
      thread: match[2] || threadId(context),
      months: +match[3],
      command: 'promote',
      currency: match[4].toUpperCase()
    };
  }

  // PURCHASE
  match = text.match(
    /^(purchase|buy) (\d+)( of (\w+))? using (BTC|LTC|ETH)( and escrow)?$/i
  );
  if (match) {
    return {
      escrow: !!match[6],
      thread: match[4] || threadId(context),
      command: 'purchase',
      quantity: +match[2],
      currency: match[5].toUpperCase()
    };
  }

  match = text.match(
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
  match = text.match(/^release escrow for (\d+)$/i);
  if (match) return { command: 'release-escrow', order: +match[1] };

  // REQUEST ESCROW
  match = text.match(
    /^request escrow for (\d+)\b/i
  );
  if (match) {
    return {
      command: 'request-escrow',
      order: +match[1],
      note: note(text) || 'None'
    };
  }

  // GIVE FEEDBACK
  match = text.match(
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
  match = text.match(/^remove( (\w{6,}))?$/i);
  if (match) {
    return {
      command: 'remove',
      thread: match[2] || threadId(context)
    };
  };

  // DELETE
  match = text.match(/^delete (\w+)$/i);
  if (match) return { command: 'delete', thread: match[1] };

  // REQUEST VERIFICATION
  match = text.match(/^request verification for (\w{6,})\b/i);
  if (match) {
    return {
      command: 'request-verification',
      thread: match[1],
      note: note(text)
    };
  }

  // VERIFY
  match = text.match(/^verify\b/i);
  if (match && isMention) {
    return {
      command: 'verify',
      thread: threadId(context),
      note: note(text) || ''      
    };
  }

  // ADD AUTOBUY ITEMS
  match = text.match(/^add autobuy items to (\w{6,})\s/i);
  if (match) {
    return {
      command: 'add-autobuy-items', thread: match[1],
      items: text.split('\n\n').slice(1)
    };
  }

  // LIST AUTOBUY ITEMS
  match = text.match(/^list autobuy items in (\w{6,})$/i);
  if (match) {
    return { command: 'list-autobuy-items', thread: match[1] };
  }

  // CLEAR AUTOBUY ITEMS
  match = text.match(/^clear autobuy items in (\w{6,})$/i);
  if (match) {
    return { command: 'clear-autobuy-items', thread: match[1] };
  }

  // REPOST (on thread)
  match = text.match(/^repost$/i);
  if (match && isMention)
    return { command: 'repost', thread: threadId(context) };

  // REPOST (in private message)
  match = text.match(/^repost (\w+)$/i);
  if (match) return { command: 'repost', thread: match[1] };

  // USER STATS LOOKUP
  match = text.match(/^get stats for u\/(\w+)$/);
  if (match) return { command: 'stats-lookup', user: match[1] };

  // CATEGORIZE SALES THREAD
  match = text.match(/^categorize (\w{6,}) as (.+)$/i);
  if (match) {
    return { command: 'categorize', thread: match[1], category: match[2] };
  }

  // IGNORE MY POSTS
  match = text.match(/^ignore my posts$/i);
  if (match) return { command: 'ignore-my-posts' };

  // CONFIRM TRADE (step 1)
  match = text.match(/^confirm trade of (.+) to \/?u\/(\w{1,20}) for (.+)$/i);
  if (match) {
    return {
      command: 'confirm-trade',
      item1: match[1],
      item2: match[3],
      user: match[2],
      step: 1
    };
  }

  // CONFIRM TRADE (step 2)
  match = text.match(/^confirm trade (\d+) with \/?u\/(\w{1,20})$/i);
  if (match) {
    return {
      command: 'confirm-trade',
      trade: +match[1],
      user: match[2],
      step: 2
    };
  }

  // CLAIM THREAD
  match = text.match(/^claim thread (\w{6,})$/i);
  if (match) return { command: 'claim-thread', thread: match[1] };

  if (decode)
    return { command: 'error' };
  else
    return parseCommand(message, true);

}

module.exports = parseCommand;