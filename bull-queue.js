require('dotenv').config();
const Queue = require('bull');

const syncTransactionQueue = new Queue(process.env.SYNC_TRANSACTION_Q, process.env.REDIS_URI);

module.exports = {
  syncTransactionQueue
};