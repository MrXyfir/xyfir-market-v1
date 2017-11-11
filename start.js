require('app-module-path').addPath(__dirname);

const paymentListener = require('main/payment-listener');
const messageListener = require('main/message-listener');
const threadListener = require('main/thread-listener');
const updateThreads = require('main/update-threads');
const postFinder = require('main/post-finder');
const config = require('constants/config');

paymentListener();
messageListener();
threadListener();
updateThreads();

if (config.environment.type != 'dev') {
  setInterval(paymentListener, 60 * 1000); // every minute
  setInterval(messageListener, 60 * 1000); // every minute
  setInterval(threadListener, 60 * 1000);  // every minute
  setInterval(updateThreads, 3600 * 1000); // every hour
  setInterval(postFinder, 3600 * 1000);    // every hour

  postFinder();
}