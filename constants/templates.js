const buildCommandLink = require('lib/messages/build-command-link');

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

exports.SALES_THREAD_APPROVED = link =>
'Your sales thread was approved and reposted at ' + link + '.\
\n\n\
This thread has been removed and will not accept commands. \
You can now safely delete this thread if you wish.';

exports.SALES_THREAD_EXPIRED = id =>
'This thread has expired after being live for one week. The owner may repost\
 it by clicking [here](' + buildCommandLink('repost ' + id) + '). This thread\
 will remain removed and a new copy of it will be posted. If this thread has\
 autobuy enabled, any items in stock will be transfered.';

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
'Your thread has been removed. You may repost\
 it by clicking [here](' + buildCommandLink('repost ' + id) + ').';

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
`You have received an order for your sales thread:
[${data.thread}](/r/xyMarket/comments/${data.thread}).

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

exports.ORDER_IN_ESCROW =
`This order is in escrow.
See the documentation for escrow-related commands.`;

exports.ORDER_COMPLETE =
`This order is complete.
Remember to give feedback or it will automatically be given after seven days.`;

exports.SEND_PAYMENT = data =>
`Send \`${data.amount}\` in \`${data.currency}\` to \`${data.address}\` within
15 minutes of this message being sent. You must send a single payment of the
exact requested amount before the order expires or your payment will not be
counted and the funds sent will be lost.

You may abandon this order and start a new one at any time by sending the
purchase command again.

You will be notified once your payment has been received.`;

exports.UNEXPECTED_ERROR =
`xyMarketBot ran into an unexpected error.
You can try sending your command again or contacting a moderator.`;

exports.NO_MATCHING_ORDER = id =>
`An order with the id \`${id}\` could not be found. It is possible the order
exists but is currently not in a state to accept that particular command.`;

exports.ESCROW_RELEASE_REQUESTED = (id, seller, note) =>
`u/${seller} is requesting that you release escrow for order \`${id}\`.

You can release escrow with following command: \`release escrow for ${id}\`.

If you need to respond to the seller you must contact them directly.

---

**Message from seller:** ${note}`;