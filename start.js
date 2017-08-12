require('app-module-path').addPath(__dirname);

const paymentListener = require('main/payment-listener');
const messageListener = require('main/message-listener');
const threadListener = require('main/thread-listener');
const updateThreads = require('main/update-threads');
const express = require('express');
const parser = require('body-parser');
const config = require('constants/config');
const app = express();

messageListener();
threadListener();
updateThreads();

if (config.environment.type != 'dev') {
  setInterval(messageListener, 60 * 1000); // every minute
  setInterval(threadListener, 60 * 1000);  // every minute
  setInterval(updateThreads, 3600 * 1000); // every hour
}

app.use(parser.json({ limit: '5mb' }));
app.use(parser.urlencoded({ extended: true, limit: '5mb' }));

app.post('/coinbase-notifications', paymentListener);

app.listen(
  config.environment.port,
  () => console.log('Server running on port', config.environment.port)
);