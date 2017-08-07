const boolHandler = bool => bool ? 'Yes' : 'No';

/**
 * Build the text body for a thread.
 * @param {object} data
 * @param {object} user
 * @return {string}
 */
module.exports = (data, user) =>
`
**Price:** $${data.price} USD

**Sold By:** u/${user.name} (+${user.posFeedback}, -${user.negFeedback})

**Description:** ${data.description}

**Type:** ${data.type}

**Category:** ${data.category}

**Currency:** ${data.currency.join(', ')}

${data.images ? `**Images:** ${data.images}` : ''}

${data.stock != undefined ? `**Stock:** ${data.stock}` : ''}

---

**Verifiable:** ${boolHandler(data.verifiable)} 
**Verified:** ${boolHandler(data.verified)} 
**Autobuy:** ${boolHandler(data.autobuy)} 
**Escrow:** ${boolHandler(data.escrow)}
`;