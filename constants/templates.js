const buildCommandLink = require('lib/messages/build-command-link');
const categories = require('constants/categories');
const config = require('constants/config');

const threadLink = id => `/r/${config.ids.reddit.sub}/comments/${id}`;

const table = (header, body) =>
  header.join(' | ') +
  '\n' +
  header.map(c => '-').join(' | ') +
  '\n' +
  body.map(row => row.join(' | ')).join('\n');

const docs = (section = '') =>
  `https://github.com/Xyfir/Documentation/` +
  `blob/master/xyfir-market/help.md#${section}`;

exports.HOW_TO_REVISE = `\n\nEdit your thread and then comment on it
\`u/${config.ids.reddit.user} revise\`.`;

exports.INVALID_TITLE =
  'Invalid title: it must be 5-200 characters in length.\
 Due to Reddit not allowing titles to be changed, you can add the `**Title**`\
 field to your thread body, and the title provided after it will be used.' +
  exports.HOW_TO_REVISE;

exports.INVALID_TYPE =
  'Invalid type: it must be `Physical/Digital Item/Service`.' +
  exports.HOW_TO_REVISE;

exports.INVALID_CATEGORY = `Invalid category: it must exist within our categories list and be an *exact*
match, even capitalization.

- **Categories**
${Object.keys(categories)
  .map(c => `  - ${c}`)
  .join('\n')}`;

exports.INVALID_DESCRIPTION = 'No description found.' + exports.HOW_TO_REVISE;

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
  'Escrow and/or autobuy require `**Tracking** True`.' + exports.HOW_TO_REVISE;

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

exports.SALES_THREAD_COMMANDS = id =>
  `# Commands

See xyMarket's [documentation](${docs()}) for more information.

- [Remove](${buildCommandLink(`remove ${id}`)})
- [Repost](${buildCommandLink(`repost ${id}`)}) (if expired or promoted)
- [Promote](${buildCommandLink(`promote ${id} for 2 months using BTC`)})
- [Confirm a Trade](${buildCommandLink([
    `confirm trade of Some Item to u/User for Some Other Item`,
    ,
    `// Update "Some Item", "User", and "Some Other Item"`,
    `// You can optionally confirm trades publicly by commenting the above ` +
      `command anywhere, just prefixed with \`u/${config.ids.reddit.user} \` `
  ])}) (for trades that don't involve a payment tracked by xyMarket)
- [Request Verification](${buildCommandLink([
    `request verification for ${id}`,
    ,
    `// Optionally add a message to the moderators below this line`
  ])})

If your thread has autobuy enabled, you can use the following commands to
manage autobuy items:

- [Add](${buildCommandLink([
    `add autobuy items to ${id}`,
    ,
    `item 1...`,
    ,
    `item 2...`,
    ,
    `item 3...`
  ])})
- [Clear](${buildCommandLink(`clear autobuy items in ${id}`)})
- [List](${buildCommandLink(`list autobuy items in ${id}`)})`;

exports.SALES_THREAD_APPROVED = id =>
  `Your sales thread was approved and reposted at ${threadLink(id)}.

This thread has been removed and will not accept commands. You can now safely
delete this thread if you wish.

---

${exports.SALES_THREAD_COMMANDS(id)}`;

exports.SALES_THREAD_EXPIRED = unstructured =>
  unstructured
    ? `This thread has expired. You may now repost it if you wish.`
    : `This thread has expired. The owner may repost it by commenting on this thread
\`u/${config.ids.reddit.user} repost\`. This thread will remain removed and a
new copy of it will be posted. If this thread has autobuy enabled, any items
in stock will be transferred.`;

exports.NO_MATCHING_THREAD = id =>
  `A sales thread with the id \`${id}\` could not be found. It is possible that
the thread exists but is currently not in a state to accept that command.`;

exports.UNAUTHORIZED_COMMAND =
  'You are not authorized to perform that command.';

exports.AUTOBUY_NOT_ENABLED = 'This thread does not have autobuy enabled.';

exports.NO_AUTOBUY_ITEMS = 'No autobuy items found.';

exports.AUTOBUY_ITEMS_ADDED = count => `(${count}) autobuy items added.`;

exports.AUTOBUY_ITEMS_CLEARED = 'All autobuy items have been removed.';

exports.THREAD_REMOVED_BY_CREATOR = (id, unstructured) =>
  unstructured
    ? `Your thread has been removed.`
    : `Your thread has been removed. You may repost
it by clicking [here](${buildCommandLink('repost ' + id)}).`;

exports.TRACKING_NOT_ENABLED = `This sales thread does not have tracking enabled. You must contact the seller
directly to make a purchase. You will not be able to use escrow or give or
receive feedback on a non-tracked purchase. You *will* however, be able to
confirm trades.`;

exports.CURRENCY_NOT_ACCEPTED = currency =>
  `This sales thread does not accept the currency \`${currency}\`.`;

exports.ESCROW_NOT_ACCEPTED = `This sales thread does not accept escrow.`;

exports.ESCROW_DISABLED = `Escrow is currently disabled while we determine its feasibility and consider
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
  `This order is now complete. Give [positive](${buildCommandLink(
    `give positive feedback for ${id} <your message here>`
  )}) or [negative](${buildCommandLink(
    `give negative feedback for ${id} <your message here>`
  )}) feedback.

**Warning:** Your feedback message (but not your username) will be public! You
will not be able to change your feedback type or message afterwards.`;

exports.SEND_PAYMENT = data =>
  `Send \`${data.amount}\` in \`${data.currency}\` to \`${data.address}\` within
15 minutes of this message being sent. You must send a single payment of the
exact requested amount before the order expires or your payment will not be
counted and the funds sent will be lost.

After sending the payment, you must confirm it by clicking [here](${buildCommandLink(
    `confirm order ${data.orderId} ` +
      `with transaction <your transaction hash here>`
  )}).

You may abandon this order and start a new one at any time by sending the
purchase command again.`;

exports.PAYMENT_AWAITING_CONFIRMATIONS = `
The transaction you provided is valid. You will be notified once the
transaction has reached the required number of confirmations. This process
should take *at most* around 30 minutes depending on the currency used.`;

exports.UNEXPECTED_ERROR = `xyMarketBot has encountered an unexpected error.
You can try sending your command again or contacting a moderator.`;

exports.NO_MATCHING_ORDER = id =>
  `An order with the id \`${id}\` could not be found. It is possible the order
exists but is currently not in a state to accept that particular command.`;

exports.ESCROW_RELEASE_REQUESTED = (id, seller, note) =>
  `u/${seller} is requesting that you release escrow for order \`${id}\`.

You can release escrow by clicking [here](${buildCommandLink(
    `release escrow for ${id}`
  )}).

If you need to respond to the seller you must contact them directly.

---

**Message from seller:** ${note}`;

exports.FEEDBACK_GIVEN = `Your feedback has been saved. You will not be able to update it.`;

exports.FEEDBACK_ALREADY_GIVEN = `You have already given feedback for that order.`;

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

If you're the thread author, only the [remove](${buildCommandLink(
    `remove ${id}`
  )}) and [categorize](${buildCommandLink([
    `categorize ${id} as Uncategorized`,
    ,
    `// Change "Uncategorized" to one of the categories below:  `,
    `// ${Object.keys(categories).join(', ')}  `,
    `// The spelling and capitalization must match exactly!`
  ])}) commands will work on it. For other users, most commands won't work.`;

exports.POST_FINDER_COMMENT = (user, id) =>
  `This is an unstructured thread that was automatically reposted. Contact the
original poster u/${user} if you're interested.

If you're the original poster, click [here](${buildCommandLink([
    `claim thread ${id}`,
    ,
    `// Send this message, and wait shortly for a reply`
  ])}) to claim your thread and receive commands to manage it on xyMarket (remove,
categorize, etc). If you're a normal user, most commands will not work on this
thread because it is unstructured.

*This action was performed automatically by a bot. A xyMarket moderator
may remove this unstructured thread from xyMarket once noticed if it doesn't
meet certain requirements.*`;

exports.THREAD_CLAIMED = id =>
  `You have claimed your thread that was reposted to r/xyMarket: a highly
automated marketplace subreddit.

---

# Info

Your thread has been reposted as an *unstructured* thread. Unstructured threads
miss out on most of xyMarket's special features. You can optionally post a
structured thread to xyMarket using [this form](https://xyfir.com/#/market).

Some of the benefits that structured sales threads offer are:

- If you accept BTC, LTC, or ETH, and add payment addresses to your structured
thread, payments using those currencies will be tracked by xyMarketBot and
you'll be notified when a buyer makes a purchase. Payments go directly from
the buyer to your receiving address, so there are no added fees.
- You can easily build your reputation by receiving feedback on sales, and you can
give feedback to buyers.
- Your thread will be categorized and easier to find in xyMarket's daily thread.
- You can enable 'Autobuy' and have your items automatically sent out to a
buyer after a successful purchase.

If you decide to post a structured thread, be sure to remove the unstructured
one from xyMarket. You should also update your original thread that was
reposted, and point it to your structured thread so more people can take
advantage of its features!

---

# Commands

If you wish to remove your thread from xyMarket, you can do so [here](${buildCommandLink(
    `remove ${id}`
  )}).

If you don't want your threads to ever be automatically reposted to xyMarket
again in the future, click [here](${buildCommandLink(`ignore my posts`)}).

Don't want to bother with structured threads? You can at least increase your
unstructured thread's visibility by categorizing it using [this link](${buildCommandLink(
    [
      `categorize ${id} as Uncategorized`,
      ,
      `// Change "Uncategorized" to one of the categories below:  `,
      `// ${Object.keys(categories).join(', ')}  `,
      `// The spelling and capitalization must match exactly!`
    ]
  )}).

You can start building your reputation on xyMarket by [confirming trades](${buildCommandLink(
    [
      `confirm trade of Some Item to u/User for Some Other Item`,
      ,
      `// Update "Some Item", "User", and "Some Other Item"`,
      `// You can optionally confirm trades publicly by commenting the above ` +
        `command anywhere, just prefixed with \`u/${config.ids.reddit.user} \` `
    ]
  )}) you've made with other users.

---

Have a nice day!`;

exports.POST_FINDER_MESSAGE = id =>
  `Your thread was automatically [reposted](${threadLink(id)}) to r/xyMarket:
a highly automated marketplace subreddit. You will only receive this
message once!

---

# Info

Your thread has been reposted as an *unstructured* thread. Unstructured threads
miss out on most of xyMarket's special features. You can optionally post a
structured thread to xyMarket using [this form](https://www.xyfir.com/market).

Some of the benefits that structured sales threads offer are:

- If you accept BTC, LTC, or ETH, and add payment addresses to your structured
thread, payments using those currencies will be tracked by xyMarketBot and
you'll be notified when a buyer makes a purchase. Payments go directly from
the buyer to your receiving address, so there are no added fees.
- You can easily build your reputation by receiving feedback on sales, and you can
give feedback to buyers.
- Your thread will be categorized and easier to find in xyMarket's daily thread.
- You can enable 'Autobuy' and have your items automatically sent out to a
buyer after a successful purchase.

If you decide to post a structured thread, be sure to remove the unstructured
one from xyMarket. You should also update your original thread that was
reposted, and point it to your structured thread so more people can take
advantage of its features!

---

# Commands

If you wish to remove your thread from xyMarket, you can do so
[here](${buildCommandLink(`remove ${id}`)}).

If you don't want your threads to ever be automatically reposted to xyMarket
again in the future, click [here](${buildCommandLink(`ignore my posts`)}).

Don't want to bother with structured threads? You can at least increase your
unstructured thread's visibility by categorizing it using
[this link](${buildCommandLink([
    `categorize ${id} as Uncategorized`,
    ,
    `// Change "Uncategorized" to one of the categories below:  `,
    `// ${Object.keys(categories).join(', ')}  `,
    `// The spelling and capitalization must match exactly!`
  ])}).

You can start building your reputation on xyMarket by
[confirming trades](${buildCommandLink([
    `confirm trade of Some Item to u/User for Some Other Item`,
    ,
    `// Update "Some Item", "User", and "Some Other Item"`,
    `// You can optionally confirm trades publicly by commenting the above ` +
      `command anywhere, just prefixed with \`u/${config.ids.reddit.user} \` `
  ])}) you've made with other users.

---

Have a nice day!

*This action was performed automatically by a bot. A xyMarket moderator
may remove your thread from xyMarket once noticed if it doesn't meet certain
requirements.*`;

exports.USER_STATS_THREAD = stats =>
  `
# Stats

${table(
    [`Name`, `Value`],
    [
      [`Joined xyMarket`, stats.joined],
      [`Reputation`, `${stats.reputation} points`],
      [
        `Completed Orders ^[[?]](${docs('completed-orders')})`,
        `${stats.sales} sales, ${stats.buys} buys`
      ],
      [`Completed Trades ^[[?]](${docs('completed-trades')})`, stats.trades],
      [
        `Seller Feedback`,
        `+${stats.feedback.seller.positive}, -${stats.feedback.seller.negative}`
      ],
      [
        `Buyer Feedback`,
        `+${stats.feedback.buyer.positive}, -${stats.feedback.buyer.negative}`
      ]
    ]
  )}

${
    stats.verifiedProfiles
      ? `# Verified Profiles ^^[[?]](${docs('verified-profiles')})

${Object.keys(stats.verifiedProfiles)
          .map(p => `- [${p}](${stats.verifiedProfiles[p]})`)
          .join('\n')}`
      : ''
  }

# Feedback

Up to 30 seller and 10 buyer feedback from tracked orders (not trades) are
displayed in order of newest to oldest. Usernames are obscured for privacy.

## Received as seller:

${table(
    [`*`, `Buyer`, `Date`, `Message`],
    stats.feedback.seller.list.map(fb => [
      fb.type == 1 ? '+' : '-',
      fb.user,
      fb.given,
      fb.message
    ])
  )}

## Received as buyer:

${table(
    [`*`, `Seller`, `Date`, `Message`],
    stats.feedback.buyer.list.map(fb => [
      fb.type == 1 ? '+' : '-',
      fb.user,
      fb.given,
      fb.message
    ])
  )}`;

exports.USER_STATS_THREAD_MOVED = id =>
  `This thread has moved: /r/xyMarketStats/comments/${id}`;

exports.USER_STATS_LOOKUP = id =>
  id ? `/r/xyMarketStats/comments/${id}` : `That user is not in my database.`;

exports.DAILY_THREAD_HEADER = (promoted, spotlight) =>
  `This thread's categories and posts are updated and randomized every hour.
Large categories are broken into multiple sections.

${
    promoted.length
      ? `
# Promoted
${promoted.map(t => `- [${t.data.title}](${threadLink(t.id)})`).join('\n')}
`
      : ''
  }

${
    spotlight.length
      ? `
# Spotlight
${spotlight.map(t => `- [${t.data.title}](${threadLink(t.id)})`).join('\n')}
`
      : ''
  }

# Categorized\n`;

exports.CATEGORY_SEARCH = category =>
  `[[view all]](/r/${
    config.ids.reddit.sub
  }/search?q=flair%3${encodeURIComponent(category)}&sort=new&restrict_sr=on)`;

exports.CONFIRM_TRADE_REQUEST = data =>
  `u/${data.user} is attempting to confirm a trade with you of *${data.item1}*
for *${data.item2}*.

Click [here](${buildCommandLink(
    `confirm trade ${data.id} with u/${data.user}`
  )}) to confirm the trade privately. Optionally, you can also confirm the trade
publicly by pasting the following command as a comment somewhere:
\`u/${config.ids.reddit.user} confirm trade ${data.id} with u/${data.user}\`.`;

exports.CONFIRM_TRADE_REQUEST_SENT = data =>
  `A request to confirm the trade of *${data.item1}* for *${
    data.item2
  }* has been
sent to u/${data.user}.`;

exports.TRADE_CONFIRMED = trade =>
  `A trade (#${trade.id}) of *${trade.item1}* for *${trade.item2}* between
u/${trade.trader1} and u/${trade.trader2} has been confirmed.`;

exports.TRADE_CONFIRMATION_LIMIT_HIT = `You cannot confirm more than one trade every 24 hours with this user.`;

exports.INVALID_COMMAND = `Invalid command or syntax.

I'm a bot that only understands certain preconfigured commands. See my
[documentation](${docs()}) for more information.

If you're inquiring about one of the sales threads I've posted, please send
your message to the original poster mentioned in the post itself, or in the
stickied comment.`;
