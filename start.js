require('app-module-path').addPath(__dirname);

const config = require('constants/config');
const tasks = {
  paymentListener: require('main/payment-listener'),
  messageListener: require('main/message-listener'),
  threadListener: require('main/thread-listener'),
  updateThreads: require('main/update-threads'),
  statsManager: require('main/stats-manager'),
  postFinder: require('main/post-finder')
};

/**
 * Handles the tasks and prevents a task from starting before its previous 
 * run has completed.
 * @param {string} task
 */
async function run(task) {
  // Task is currently running, queue it to run when complete
  if (tasks[task].isRunning) return tasks[task].runOnFinish = true;

  tasks[task].isRunning = true;
  await tasks[task]();
  tasks[task].isRunning = false;

  // Task took too long to complete and must immediately run again
  if (tasks[task].runOnFinish) {
    tasks[task].runOnFinish = false;
    run(task);
  }
}

run('paymentListener');
run('messageListener');
run('threadListener');
run('updateThreads');
run('statsManager');

if (config.environment.type != 'dev') {
  setInterval(() => run('paymentListener'), 60 * 1000); // every minute
  setInterval(() => run('messageListener'), 60 * 1000); // every minute
  setInterval(() => run('threadListener'), 60 * 1000);  // every minute
  setInterval(() => run('updateThreads'), 3600 * 1000); // every hour
  setInterval(() => run('statsManager'), 86400 * 1000); // every day
  setInterval(() => run('postFinder'), 3600 * 1000);    // every hour
  run('postFinder');
}

console.log(`u/${config.ids.reddit.user} | r/${config.ids.reddit.sub}`);