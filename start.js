require('app-module-path').addPath(__dirname);

const paymentListener = require('main/payment-listener');
const messageListener = require('main/message-listener');
const threadListener = require('main/thread-listener');
const updateThreads = require('main/update-threads');
const statsManager = require('main/stats-manager');
const postFinder = require('main/post-finder');
const config = require('constants/config');

paymentListener();
messageListener();
threadListener();
updateThreads();
statsManager();

if (config.environment.type != 'dev') {
  setInterval(paymentListener, 60 * 1000); // every minute
  setInterval(messageListener, 60 * 1000); // every minute
  setInterval(threadListener, 60 * 1000);  // every minute
  setInterval(updateThreads, 3600 * 1000); // every hour
  setInterval(statsManager, 86400 * 1000); // every day
  setInterval(postFinder, 3600 * 1000);    // every hour
  postFinder();
}

console.log(`u/${config.ids.reddit.user} | r/${config.ids.reddit.sub}`);