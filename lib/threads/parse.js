const categories = require('constants/categories');
const templates = require('constants/templates');

const supportedCurrencies = ['BTC', 'LTC', 'ETH'];

/**
 * Handle a new unmoderated sales thread posted to the subreddit.
 * @param {snoowrap.Submission} post
 */
module.exports = function parseThread(post) {

  const data = { title: post.title };
  let description = false;

  post.selftext
    .split('\n\n')
    .forEach(line => {
      const match = line.match(/^\*\*(\w+)\*\*\s+(.+)$/);

      if (match && match[1] && match[2]) {
        match[1] = match[1].toLowerCase(),
        description = false,
        data[match[1]] = match[2].trim();

        if (match[1] == 'description') description = true;
      }
      else if (description) {
        // **Description** Some description
        //
        // that continues onto another paragraph
        data.description += '\n\n' + line;
      }
    });

  // Validate data object
  
  // Required values
  
  if (!/^.{5,200}$/.test(data.title))
    throw templates.INVALID_TITLE;
  if (!/^(physical|digital) (item|service)$/i.test(data.type))
    throw templates.INVALID_TYPE;
  if (categories.findIndex(c => data.category == c) == -1)
    throw templates.INVALID_CATEGORY;
  if (!data.description)
    throw templates.INVALID_DESCRIPTION;
  if (!/^\$\d+\.\d{2}$/.test(data.price))
    throw templates.INVALID_PRICE;
  if (!data.currency)
    throw templates.INVALID_CURRENCY;
    
  data.currency = data.currency.toUpperCase().split(' '),
  data.price = +data.price.substr(1);

  // Optional values

  if (data.images) {
    data.images = data.images
      .split(' ')
      .map((image, i) => {
        if (!/https?:\/\/.+\.(png|jpg|gif)/i.test(image))
          throw templates.INVALID_IMAGES;
        return `[Image ${i + 1}](${image})`;
      })
      .join(', ');
  }

  data.nsfw = /^true$/i.test(data.nsfw),
  data.escrow = /^true$/i.test(data.escrow),
  data.autobuy = /^true$/i.test(data.autobuy),
  data.verified = false,
  data.verifiable = /^true$/i.test(data.verifiable);

  if (data.verifiable) {
    let match = data.currency.findIndex(
      c => supportedCurrencies.indexOf(c) > -1
    );

    if (match == -1) throw templates.INVALID_VERIFIABLE;
    if (!data.addresses) throw templates.INVALID_ADDRESSES;

    const temp = {};

    data.addresses
      .split(' ')
      .forEach(e => {
        e = e.split('=');
        temp[e[0].toUpperCase()] = e[1];
      });
    data.addresses = temp;

    supportedCurrencies.forEach(c => {
      if (!data.addresses[c] && data.currency.indexOf(c) > -1)
        throw templates.INVALID_ADDRESSES;
    });
  }
  else if (data.escrow || data.autobuy) {
    throw templates.INVALID_ESCROW_OR_AUTOBUY;
  }

  if (data.autobuy) {
    if (!/^Digital Item$/i.test(data.type))
      throw templates.INVALID_TYPE_FOR_AUTOBUY;

    data.stock = 0;
  }

  return data;

}