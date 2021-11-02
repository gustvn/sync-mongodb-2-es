require('dotenv').config();
const Queue = require('bull');

async function getQueue(collectionName) {
  if (collectionName == undefined)
    throw new Error('collectionName must a string');
  
  console.log("******** redis uri : " + process.env.REDIS_URI + " && collectionName : " + collectionName);
  return new Queue("sync_" + collectionName, process.env.REDIS_URI);
}

module.exports = {
  getQueue
}
