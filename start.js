require('app-module-path').addPath(__dirname);

const messageListener = require('main/message-listener');
const threadListener = require('main/thread-listener');
const updateThreads = require('main/update-threads');
const config = require('constants/config');

messageListener();
threadListener();
updateThreads();

if (config.environment.type != 'dev') {
  setInterval(messageListener, 60 * 1000); // every minute
  setInterval(threadListener, 60 * 1000);  // every minute
  setInterval(updateThreads, 3600 * 1000); // every hour
}