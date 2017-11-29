const categories = require('constants/categories');
const config = require('constants/config');

const buildCommandLink = require('lib/messages/build-command-link');
const threadLink = id => `/r/${config.ids.reddit.sub}/comments/${id}`;

exports.HOW_TO_REVISE =
`

Edit your thread and then comment on it 
\`u/${config.ids.reddit.user} revise\`.`;

exports.INVALID_TITLE =
'Invalid title: it must be 5-200 characters in length.\
 Due to Reddit not allowing titles to be changed, you can add the `**Title**`\
 field to your thread body, and the title provided after it will be used.' +
 exports.HOW_TO_REVISE;

exports.INVALID_TYPE =
'Invalid type: it must be `Physical/Digital Item/Service`.' +
exports.HOW_TO_REVISE;

exports.INVALID_CATEGORY =
`Invalid category: it must exist within our categories list and be an *exact*
match, even capitalization.

- **Categories**
${Object.keys(categories).map(c => `  - ${c}`).join('\n')}`;

exports.INVALID_DESCRIPTION =
'No description found.' +
exports.HOW_TO_REVISE;

exports.INVALID_PRICE =
'Invalid price: it must be like `$X.XX`. Prices must be in USD.' +
exports.HOW_TO_REVISE;

exports.INVALID_CURRENCY =
'Invalid currency: it must be a space-delimited list of currencies like:\
 `BTC PP ETH LTC`.' +
exports.HOW_TO_REVISE;

exports.INVALID_IMAGES =
'Invalid image(s): value must be a space-delimited list of direct image links.\
 Each link must start with `http` or `https` and must end with `.png`, `.jpg`,\
 or `.gif`.\
\n\n\
**Example:** `http://i.imgur.com/XXXXXXXXXXXXXX.jpg\
 https://i.imgur.com/XXXXXXXXXXXXXZ.png`' +
exports.HOW_TO_REVISE;

exports.INVALID_TRACKING =
'Enabling tracking requires accepting `BTC`, `LTC`, or `ETH` currency.' +
exports.HOW_TO_REVISE;

exports.INVALID_ESCROW_OR_AUTOBUY =
'Escrow and/or autobuy require `**Tracking** True`.' +
exports.HOW_TO_REVISE;

exports.INVALID_TYPE_FOR_AUTOBUY =
'`**Type**` must be `Digital Item` when `**Autobuy** True`.' +
exports.HOW_TO_REVISE;

exports.INVALID_ADDRESSES =
'Missing or invalid `**Addresses**` field. This field is required when\
 `**Tracking** True`. You should provide an address for each of the\
 following currencies that you accept: `BTC`, `LTC`, `ETH`.\
\n\n\
**Example:**\
 `BTC=1YourBitcoinAddressObR76b53LETtpyT\
 LTC=3YourLitecoinAddressHXHXEeLygMXoAj\
 ETH=0xYourEthereumAddress32487E1EfdD8729b87445`' +
exports.HOW_TO_REVISE;

exports.PRICE_TOO_LOW =
`Sales threads with \`**Tracking** True\` require \`**Price**\` to be at or
above $5.00 (USD).` + exports.HOW_TO_REVISE;

exports.SALES_THREAD_COMMANDS = id =>
`# Commands

If your thread has autobuy enabled, you can use the following commands to
manage autobuy items:

- [Add autobuy items](${
  buildCommandLink(
    'add autobuy items to ' + id + '\n\n' +
    'item 1...\n\n' +
    'item 2...\n\n' +
    'item 3...'
  )
})
- [Clear autobuy items](${buildCommandLink(`clear autobuy items in ${id}`)})
- [List autobuy items](${buildCommandLink(`list autobuy items in ${id}`)})

You can promote your thread with the [promote](${
  buildCommandLink(`promote ${id} for 2 months using BTC`)
}) command.

The following commands must be commented on the *new* thread:

- \`u/${config.ids.reddit.user} request verification <your message here>\`
- \`u/${config.ids.reddit.user} remove\`
- \`u/${config.ids.reddit.user} repost\` (thread must be expired or promoted)

See xyMarket's documentation for more information.`;

exports.SALES_THREAD_APPROVED = id =>
`Your sales thread was approved and reposted at ${threadLink(id)}.

This thread has been removed and will not accept commands. You can now safely
delete this thread if you wish.

---

${exports.SALES_THREAD_COMMANDS(id)}`;

exports.SALES_THREAD_EXPIRED = unstructured => unstructured ?
`This thread has expired. You may now repost it if you wish.` :
`This thread has expired. The owner may repost it by commenting on this thread
\`u/${config.ids.reddit.user} repost\`. This thread will remain removed and a 
new copy of it will be posted. If this thread has autobuy enabled, any items 
in stock will be transferred.`;

exports.NO_MATCHING_THREAD = id =>
`A sales thread with the id \`${id}\` could not be found. It is possible that
the thread exists but is currently not in a state to accept that command.`;

exports.UNAUTHORIZED_COMMAND =
'You are not authorized to perform that command.';

exports.AUTOBUY_NOT_ENABLED =
'This thread does not have autobuy enabled.';

exports.NO_AUTOBUY_ITEMS =
'No autobuy items found.';

exports.AUTOBUY_ITEMS_ADDED = count =>
`(${count}) autobuy items added.`

exports.AUTOBUY_ITEMS_CLEARED =
'All autobuy items have been removed.';

exports.THREAD_REMOVED_BY_CREATOR = (id, unstructured) => unstructured ?
`Your thread has been removed.` :
`Your thread has been removed. You may repost
it by clicking [here](${buildCommandLink('repost ' + id)}).`;

exports.TRACKING_NOT_ENABLED =
`This sales thread does not have tracking enabled. You must contact the seller 
directly to make a purchase. You will not be able to use escrow or give or 
receive feedback on a non-tracked purchase.`;

exports.CURRENCY_NOT_ACCEPTED = currency =>
`This sales thread does not accept the currency \`${currency}\`.`;

exports.ESCROW_NOT_ACCEPTED =
`This sales thread does not accept escrow.`;

exports.ESCROW_DISABLED =
`Escrow is currently disabled while we determine its feasibility and consider 
other implementations of an escrow system.`;

exports.BUYER_SENDS_PAYMENT = order =>
`xyMarket has received your payment! Your order id is \`${order}\`.`;

exports.SELLER_RECEIVES_ORDER = data =>
`You have received an order for your sales thread ${threadLink(data.thread)}.

Your order id is \`${data.order}\`.
u/${data.buyer} has purchased \`${data.quantity}\` item(s).
You will receive \`${data.amount} ${data.currency}\`.`;

exports.GIVE_AUTOBUY_ITEMS = items =>
`**Autobuy Items:**

${items.map(i => `- ${i}`).join('\n')}`;

exports.AUTOBUY_ITEMS_REQUIRED = count =>
`Not enough autobuy items were available to fulfill their order.
Please send \`${count}\` to the buyer.`;

exports.AUTOBUY_ITEMS_OWED = count =>
`There were not enough autobuy items to fulfill your order.
The seller has been notified to send you \`${count}\` item(s).`;

exports.BUYER_ORDER_IN_ESCROW = id =>
`This order is in escrow. You may release the funds to the seller at any time
by clicking [here](${buildCommandLink(`release escrow for ${id}`)}). If there
is a dispute between you and the seller you should contact a moderator.`;

exports.SELLER_ORDER_IN_ESCROW = id =>
`This order is in escrow. You may request that the buyer release the funds to
you by clicking [here](${buildCommandLink(`request escrow for ${id}`)}). Try
not to annoy the buyer by requesting too soon or too often! If there is a
dispute between you and the seller you should contact a moderator.`;

exports.ORDER_COMPLETE = id =>
`This order is now complete. Give [positive](${
  buildCommandLink(`give positive feedback for ${id} <your message here>`)
}) or [negative](${
  buildCommandLink(`give negative feedback for ${id} <your message here>`)
}) feedback.

**Warning:** Your feedback message (but not your username) will be public! You 
will not be able to change your feedback type or message afterwards.`;

exports.SEND_PAYMENT = data =>
`Send \`${data.amount}\` in \`${data.currency}\` to \`${data.address}\` within
15 minutes of this message being sent. You must send a single payment of the
exact requested amount before the order expires or your payment will not be
counted and the funds sent will be lost.

After sending the payment, you must confirm it by clicking [here](${
  buildCommandLink(
    `confirm order ${data.orderId} ` +
    `with transaction <your transaction hash here>`
  )
}).

You may abandon this order and start a new one at any time by sending the
purchase command again.`;

exports.PAYMENT_AWAITING_CONFIRMATIONS =
`The transaction you provided is valid. You will be notified once the 
transaction has reached the required number of confirmations. This process 
should take *at most* around 30 minutes depending on the currency used.`;

exports.UNEXPECTED_ERROR =
`xyMarketBot has encountered an unexpected error.
You can try sending your command again or contacting a moderator.`;

exports.NO_MATCHING_ORDER = id =>
`An order with the id \`${id}\` could not be found. It is possible the order
exists but is currently not in a state to accept that particular command.`;

exports.ESCROW_RELEASE_REQUESTED = (id, seller, note) =>
`u/${seller} is requesting that you release escrow for order \`${id}\`.

You can release escrow by clicking [here](${
  buildCommandLink(`release escrow for ${id}`)
}).

If you need to respond to the seller you must contact them directly.

---

**Message from seller:** ${note}`;

exports.FEEDBACK_GIVEN =
`Your feedback has been saved.
You will not be able to update it.`;

exports.FEEDBACK_ALREADY_GIVEN =
`You have already given feedback for that order.`;

exports.ESCROW_RELEASED = id =>
`Escrow has been released for order \`${id}\`.

${exports.ORDER_COMPLETE(id)}`;

exports.VERIFIED = (mod, note) =>
`This sales thread has been verified by u/${mod}.

---

**Mod note:** ${note}`;

exports.THREAD_REPOSTED = id =>
`This sales thread has been reposted at ${threadLink(id)}.

---

${exports.SALES_THREAD_COMMANDS(id)}`;

exports.VERIFICATION_REQUESTED = data =>
`Verification has been requested for ${threadLink(data.thread)}.

---

${data.note}`;

exports.THREAD_PROMOTED = (thread, months) =>
`Your thread ${threadLink(thread)} has been promoted for the next
${months} month(s).`;

exports.UNSTRUCTURED_THREAD = id =>
`**This is an unstructured thread.**

If you're the thread author, only the \`u/${config.ids.reddit.user} remove\` 
and [categorize](${
  buildCommandLink([
    `categorize ${id} as Uncategorized`,,
    `// Change "Uncategorized" to one of the categories below:  `,
    `// ${Object.keys(categories).join(', ')}  `,
    `// The spelling and capitalization must match exactly!`
  ])
}) commands will work on it. For other users, no commands will work.`;

exports.POST_FINDER_REPOST = (oldLink, text) =>
`*[This thread has been automatically reposted. Contact the 
original poster if you're interested.](${oldLink})*

${text}`;

exports.POST_FINDER_REPOSTED = (oldLink, newId) =>
`Hello! I'm a bot for r/xyMarket, a new, highly automated marketplace subreddit.

I've discovered your [thread](${oldLink}) and reposted it [here](/r/${
  `${config.ids.reddit.sub}/comments/${newId}`
}). If you don't want your thread on xyMarket, you can remove it by commenting 
on the new post \`u/${config.ids.reddit.user} remove\`.

Your thread has been reposted as an *unstructured* thread. Unstructured threads
miss out on most of xyMarket's special features. You can optionally post a 
structured thread to xyMarket using [this form](https://xyfir.com/#/market).

Some of the benefits that structured sales threads offer are:

- If you accept BTC, LTC, or ETH, and add payment addresses to your structured 
thread, payments using those currencies will be tracked by xyMarketBot and 
you'll be notified when a buyer makes a purchase. Payments go directly from 
the buyer to your receiving address, so there are no added fees.
- You can build your reputation by receiving feedback on sales, and you can 
give feedback to buyers.
- Your thread will be categorized and easier to find in xyMarket's daily thread.
- You can enable 'Autobuy' and have your items automatically sent out to a 
buyer after a successful purchase.

If you decide to post a structured thread, be sure to remove the unstructured 
one from xyMarket. You should also update your original thread that was 
reposted, and point it to your structured thread so more people can take 
advantage of its features!

Don't want to bother with structured threads? You can at least increase your 
unstructured thread's visibility by categorizing it using [this link](${
  buildCommandLink([
    `categorize ${newId} as Uncategorized`,,
    `// Change "Uncategorized" to one of the categories below:  `,
    `// ${Object.keys(categories).join(', ')}  `,
    `// The spelling and capitalization must match exactly!`
  ])
}).

Have questions, complaints, or feedback? Post them in r/xyMarketMeta.

Have a nice day!

*This action was performed automatically by a bot. A xyMarket moderator
may remove your unstructured thread from xyMarket once noticed if it doesn't
meet certain requirements.*`;

exports.USER_STATS_THREAD = stats =>
`
# Stats

Name | Value
- | -
Joined xyMarket | ${stats.joined}
Reputation | ${
  (stats.feedback.seller.positive - stats.feedback.seller.negative) +
  (stats.feedback.buyer.positive - stats.feedback.buyer.negative)
} points
Completed Orders | ${stats.sales} sales, ${stats.buys} buys
Seller Feedback | +${
  stats.feedback.seller.positive
}, -${
  stats.feedback.seller.negative
}
Buyer Feedback | +${
  stats.feedback.buyer.positive
}, -${
  stats.feedback.buyer.negative
}

# Feedback

Up to 30 seller and 10 buyer feedback are displayed in order of newest to oldest. Usernames are obscured for privacy.

## Received as seller:

* | Buyer | Date | Message
- | - | - | -
${stats.feedback.seller.list
  .map(fb => [
    fb.type == 1 ? '+' : '-',
    fb.user,
    fb.given,
    fb.message
  ]
  .join(' | '))
  .join('\n')
}

## Received as buyer:

* | Seller | Date | Message
- | - | - | -
${stats.feedback.buyer.list
  .map(fb => [
    fb.type == 1 ? '+' : '-',
    fb.user,
    fb.given,
    fb.message
  ]
  .join(' | '))
  .join('\n')
}`;

exports.USER_STATS_THREAD_MOVED = id =>
`This thread has moved: /r/xyMarketStats/comments/${id}`;

exports.USER_STATS_LOOKUP = id => id ?
`/r/xyMarketStats/comments/${id}` :
`That user is not in my database.`;

exports.DAILY_THREAD_HEADER =
`This thread's categories and posts are updated and randomized every hour. 
Large categories are broken into multiple sections.\n\n`;