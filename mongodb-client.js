require('dotenv').config();
const mongodbClient = require("mongodb").MongoClient;
let client;

async function getDb() {
  if (!client || !client.isConnected()) {
    client = await mongodbClient.connect(process.env.MONGODB_URI, {"useNewUrlParser": true, "useUnifiedTopology": true});
    console.log("connected successfully!!");
  }
  return client.db();
}

async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

module.exports = {
  getCollection
};