const request = require('superagent');
const config = require('constants/config');

module.exports = () =>
  request
    .post(
      'https://hooks.slack.com/services/' +
        'T4KMR0724/BATP691KQ/wmk2LqpHqfRt685PkEQgVpW1'
    )
    .send({
      text:
        'xyMarket Reddit Bot has launched' +
        '\n\n' +
        '```' +
        JSON.stringify(config, null, 2) +
        '```'
    })
    .end(() => 1);
