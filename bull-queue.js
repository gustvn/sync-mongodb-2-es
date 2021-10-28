require('dotenv').config();
const Queue = require('bull');

async function getQueue(collectionName) {
  console.log("******** redis uri : " + process.env.REDIS_URI);
  return new Queue("sync_" + collectionName, process.env.REDIS_URI);
}

module.exports = {
  getQueue
}
