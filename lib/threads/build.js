const buildCommandLink = require('lib/messages/build-command-link');

function boolHandler(bool) {
  return bool ? 'Yes' : 'No';
}

function purchaseLinks(id, data) {
  if (!data.verifiable) return '';

  const links = [];

  for (let currency in data.addresses) {
    let link = buildCommandLink(`purchase 1 of ${id} using ${currency}`);

    links.push(`- [${currency}](${link})`);

    if (data.escrow) {
      link = buildCommandLink(
        `purchase 1 of ${id} using ${currency} and escrow`
      );
  
      links.push(`- [${currency} + Escrow](${link})`);
    }
  }

  return '\n\n---\n\n**Purchase Links**\n\n' + links.join('\n');
}

/**
 * Build the text body for a thread.
 * @param {string} id
 * @param {object} data
 * @param {object} user
 * @return {string}
 */
module.exports = (id, data, user) =>
`
**Price** $${data.price} USD

**Sold By** u/${user.name} (+${user.posFeedback}, -${user.negFeedback})

**Description** ${data.description}

**Type** ${data.type}

**Category** ${data.category}

**Currency** ${data.currency.join(', ')}

${data.images ? `**Images** ${data.images}` : ''}

${data.stock != undefined ? `**Stock** ${data.stock}` : ''}

---

**Verifiable** ${boolHandler(data.verifiable)} 
**Verified** ${boolHandler(data.verified)} 
**Autobuy** ${boolHandler(data.autobuy)} 
**Escrow** ${boolHandler(data.escrow)}` +
purchaseLinks(id, data);