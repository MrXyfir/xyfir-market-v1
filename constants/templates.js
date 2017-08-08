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
'A sales thread with the id `' + id + '` could not be found. If you are sure\
 that the id is correct, check if the thread has expired.';

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