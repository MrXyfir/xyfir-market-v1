const buildCommandLink = require('lib/messages/build-command-link');

function boolHandler(bool) {
  return bool ? 'Yes' : 'No';
}

function purchaseLinks(id, data) {
  if (!data.tracking) return '';

  const links = [];

  for (let currency in data.addresses) {
    let link = buildCommandLink(`purchase 1 of ${id} using ${currency}`);

    links.push(`- [Purchase with ${currency}](${link})`);

    if (data.escrow) {
      link = buildCommandLink(
        `purchase 1 of ${id} using ${currency} and escrow`
      );
  
      links.push(`- [Purchase with ${currency} + Escrow](${link})`);
    }
  }

  return '\n\n---\n\n**Purchase Links**\n\n' + links.join('\n');
}

/**
 * Build the text body for a thread.
 * @param {string} id
 * @param {object} data
 * @param {object} user
 * @param {boolean} [offsite] Sales thread will be posted to another subreddit 
 * other than r/xyMarket.
 * @return {string}
 */
module.exports = (id, data, user, offsite) =>
`
${offsite ?
`*[This sales thread has been automatically reposted from r/xyMarket. Please 
comment on the original thread or contact the seller directly. Comments here 
may be ignored.](/r/xyMarket/comments/${id})*`
: ''}

**Price** $${data.price} USD

**Sold By** u/${user.name} 
[[view stats](/r/xyMarketStats/comments/${user.statsThread})]

**Description** ${data.description}

**Type** ${data.type}

**Category** ${data.category}

**Currency** ${data.currency.join(', ')}

${data.images ? `**Images** ${data.images}` : ''}

${data.stock != undefined ? `**Stock** ${data.stock}` : ''}

---

**Tracking** ${boolHandler(data.tracking)} 
**Verified** ${boolHandler(data.verified)} 
**Autobuy** ${boolHandler(data.autobuy)} 
**Escrow** ${boolHandler(data.escrow)}` +
purchaseLinks(id, data);