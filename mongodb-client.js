require('dotenv').config();
const mongodbClient = require("mongodb").MongoClient;
let client;

async function getDb() {
  if (!client) {
    console.log(process.env.MONGODB_URI + " && " + process.env.MONGODB_DB);
    client = await mongodbClient.connect(process.env.MONGODB_URI, {"useNewUrlParser": true, "useUnifiedTopology": true});
    console.log("connected successfully!!");
  }
  return client.db(process.env.MONGODB_DB);
}

async function getCollection(collectionName) {
  const db = await getDb();
  console.log("Getting collection " + collectionName);
  return db.collection(collectionName);
}

module.exports = {
  getCollection
};