const buildCommandLink = require('lib/messages/build-command-link');
const threadLink = id => `/r/xyMarket/comments/${id}`;

const HOW_TO_REVISE =
'\n\nEdit your thread and then comment on it `u/xyMarketBot revise`.';

exports.INVALID_TITLE =
'Invalid title: it must be 5-200 characters in length.\
 Due to Reddit not allowing titles to be changed, you can add the `**Title**`\
 field to your thread body, and the title provided after it will be used.' +
 HOW_TO_REVISE;

exports.INVALID_TYPE =
'Invalid type: it must be `Physical/Digital Item/Service`.' +
HOW_TO_REVISE;

exports.INVALID_CATEGORY =
'Invalid category: it must be within our categories list. It must be an\
 *exact* match, even capitalization.' +
HOW_TO_REVISE;

exports.INVALID_DESCRIPTION =
'No description found.' +
HOW_TO_REVISE;

exports.INVALID_PRICE =
'Invalid price: it must be like `$X.XX`. Prices must be in USD.' +
HOW_TO_REVISE;

exports.INVALID_CURRENCY =
'Invalid currency: it must be a space-delimited list of currencies like:\
 `BTC PP ETH LTC`.' +
HOW_TO_REVISE;

exports.INVALID_IMAGES =
'Invalid image(s): value must be a space-delimited list of direct image links.\
 Each link must start with `http` or `https` and must end with `.png`, `.jpg`,\
 or `.gif`.\
\n\n\
**Example:** `http://i.imgur.com/XXXXXXXXXXXXXX.jpg\
 https://i.imgur.com/XXXXXXXXXXXXXZ.png`' +
HOW_TO_REVISE;

exports.INVALID_VERIFIABLE =
'Verifiable purchases require accepting `BTC`, `LTC`, or `ETH` currency.' +
HOW_TO_REVISE;

exports.INVALID_ESCROW_OR_AUTOBUY =
'Escrow and autobuy require `**Verifiable** True`.' +
HOW_TO_REVISE;

exports.INVALID_TYPE_FOR_AUTOBUY =
'`**Type**` must be `Digital Item` when `**Autobuy** True`.' +
HOW_TO_REVISE;

exports.INVALID_ADDRESSES =
'Missing or invalid `**Addresses**` field. This field is required when\
 `**Verifiable** True`. You should provide an address for each of the\
 following currencies that you accept: `BTC`, `LTC`, `ETH`.\
\n\n\
**Example:**\
 `BTC=1YourBitcoinAddressObR76b53LETtpyT\
 LTC=3YourLitecoinAddressHXHXEeLygMXoAj\
 ETH=0xYourEthereumAddress32487E1EfdD8729b87445`' +
HOW_TO_REVISE;

exports.PRICE_TOO_LOW =
`Sales threads with \`**Verifiable** True\` require \`**Price**\` to be at or
above $5.00 (USD).` + HOW_TO_REVISE;

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

The following commands must be commented on the thread itself:

- \`u/xyMarketBot request verification <your message here>\`
- \`u/xyMarketBot remove\`
- \`u/xyMarketBot repost\` (thread must be expired or promoted)

See xyMarket's documentation for more information.`;

exports.SALES_THREAD_APPROVED = id =>
`Your sales thread was approved and reposted at ${threadLink(id)}.

This thread has been removed and will not accept commands. You can now safely
delete this thread if you wish.

---

${exports.SALES_THREAD_COMMANDS(id)}`;

exports.SALES_THREAD_EXPIRED =
`This thread has expired. The owner may repost it by commenting on this thread
\`u/xyMarketBot repost\`. This thread will remain removed and a new copy of it
will be posted. If this thread has autobuy enabled, any items in stock will be
transfered.`;

exports.NO_MATCHING_THREAD = id =>
`An sales thread with the id \`${id}\` could not be found. It is possible that
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

exports.THREAD_REMOVED_BY_CREATOR = id =>
`Your thread has been removed. You may repost
it by clicking [here](${buildCommandLink('repost ' + id)}).`;

exports.VERIFIABLE_NOT_ACCEPTED =
`This sales thread does not accept verifiable purchases. You must contact
the seller directly to make a purchase. You will not be able to use escrow or
give or receive feedback on a non-verifiable purchase.`;

exports.CURRENCY_NOT_ACCEPTED = currency =>
`This sales thread does not accept the currency \`${currency}\`.`;

exports.ESCROW_NOT_ACCEPTED =
`This sales thread does not accept escrow.`;

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
}) feedback.`;

exports.SEND_PAYMENT = data =>
`Send \`${data.amount}\` in \`${data.currency}\` to \`${data.address}\` within
15 minutes of this message being sent. You must send a single payment of the
exact requested amount before the order expires or your payment will not be
counted and the funds sent will be lost.

You may abandon this order and start a new one at any time by sending the
command again.

You will be notified once your payment has been received.`;

exports.UNEXPECTED_ERROR =
`xyMarketBot ran into an unexpected error.
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

exports.UNSTRUCTURED_THREAD =
`**This is an unstructured thread.**

If you're the thread author, only the
\`u/xyMarketBot remove\` command will work on it. For other users, no commands
will work.`;

exports.POST_FINDER_REPOST = (author, text) =>
`@unstructured

Contact the original poster u/${author} if you're interested.

---

${text}`;

exports.POST_FINDER_REQUEST = link =>
`Hello! I'm a bot from a new marketplace subreddit: /r/xyMarket. Would you be
interested in reposting your thread ${link} to /r/xyMarket? If posted in the
proper format, you can take advantage of some of xyMarket's great features like
verifiable purchases, autobuy, escrow, and more. More information is available
[here](https://www.reddit.com/r/xyMarket/submit?selftext=true).

**Note:** This action was performed automatically by a bot. It's possible that
your post may not be a good fit for xyMarket. If this is the case, simply
disregard this message.

Have a nice day!`;

exports.POST_FINDER_REPOSTED = (oldLink, newLink) =>
`Hello! I'm a bot from a new marketplace subreddit: /r/xyMarket. I've
discovered your thread ${oldLink} and reposted it to xyMarket. You can find
the repost at ${newLink}.

If you don't want your thread in xyMarket or if your item has sold, you can
remove it by commenting on the new post \`u/xyMarketBot remove\`.

Your thread has been reposted as an *unstructured* thread. Unstructured threads
do not have access to some of xyMarket's best features, like verifiable
purchases, autobuy, escrow, and more. If you'd like to take advantage of more of
xyMarket's features, you must post a *structured* thread. You can do this by
posting your own thread directly to xyMarket and using the proper format. More
information is available
[here](https://www.reddit.com/r/xyMarket/submit?selftext=true).

**Note:** This action was performed automatically by a bot. A xyMarket moderator
may remove your unstructured thread from xyMarket once noticed if it doesn't
meet certain requirements.

Have questions, complaints, or feedback? Post them in xyMarket's stickied
Meta thread.

Have a nice day!`;