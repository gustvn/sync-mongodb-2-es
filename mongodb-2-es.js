require('dotenv').config();

const mongoConnectionString = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB;

var args = process.argv.slice(2);
const mongoCollectionName = args[0];
if (mongoCollectionName == undefined)
  throw new Error('collection name must a string');

const esHost = process.env.ELASTICSEARCH_NODE;
const esIndexName = mongoCollectionName;

const Limit = 1000;

// setup client for elasticsearch: npm install @elastic/elasticsearch
// documentation: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
const elasticsearch = require('@elastic/elasticsearch');
const EsClient = new elasticsearch.Client({ node: esHost, log: 'info' });


// setup driver for MongoDB: npm install mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var mongoClient = null;

var minTime = 1569436481085;
// var minTime = 1627442930246;
console.log("1. minTime = " + minTime);

var collection = null;

// connect to Mongodb
MongoClient.connect(mongoConnectionString, function(err, client) {
  if(err) throw err;

  mongoClient = client;
   
  // for each object in a collection
  const db = client.db(mongoDbName);
  collection = db.collection(mongoCollectionName);

  queryMongo(minTime);
});

function queryMongo(minTime) {
  collection.find({ timestamp: { $gte: minTime } }).sort({ timestamp: 1 }).limit(Limit).toArray(indexES);
}

async function indexES(err, result) {
  if(err) throw err;

  for (i in result) {
    result[i]['mongo_id'] = result[i]._id.toString();
    delete result[i]['_id'];
    
    EsClient.index(
      {index: esIndexName, id: result[i].mongo_id, body: result[i] },
      function(error, response) {
        if(err) throw err;

        if (response.statusCode != 200 && response.statusCode != 201) {
          console.log("error id: " + result[i].mongo_id);
          console.log(response);
        }
      }
    );

    await sleep(15);
  }

  minTime = result[result.length - 1].timestamp;
  console.log("2. minTime = " + minTime);
  
  if (result.length == Limit) queryMongo(minTime);
  else mongoClient.close();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
