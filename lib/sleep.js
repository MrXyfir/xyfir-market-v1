/**
 * Asynchronous sleep using promises and `setTimeout()`.
 * @async
 * @param {number} ms
*/
module.exports = ms => new Promise(resolve => setTimeout(resolve, ms));