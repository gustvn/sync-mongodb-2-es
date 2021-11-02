const mongoConnectionString = 'mongodb+srv://visikard_readonly:UwNbzzehQQFRafNs@kanootaskforce.2dqx2.mongodb.net';
const mongoDbName = 'kanoo_vkreporting_prod02';
const mongoCollectionName = 'transaction';

const esHost = 'https://kanoo-staging2-elasticsearch.kardsys.com';
const esIndexName = 'transaction';

const Limit = 500;

// setup client for elasticsearch: npm install @elastic/elasticsearch
// documentation: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
const elasticsearch = require('@elastic/elasticsearch');
const EsClient = new elasticsearch.Client({ node: esHost, log: 'info' });


// setup driver for MongoDB: npm install mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var mongoClient = null;

var minTime = 1569436481085;
// var minTime = 1615900532348;
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
    var item = { ...result[i] };
    item['mongo_id'] = id;
    var id = item._id.toString() + item.timestamp;
    delete item['_id'];
    
    EsClient.index(
      {index: esIndexName, id: id, body: item },
      function(error, response) {
        if(err) throw err;

        if (response.statusCode != 200) {
          console.log(response);
          console.log("error id: " + item['mongo_id']);
        }
      }
    );

    await sleep(5);
  }

  minTime = result[result.length - 1].timestamp;
  console.log("2. minTime = " + minTime);
  
  if (result.length == Limit) queryMongo(minTime);
  else mongoClient.close();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
