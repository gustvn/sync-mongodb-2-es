require('dotenv').config();

const {getUpsertChangeStream, getDeleteChangeStream} = require("./change-streams");
const {saveResumeToken} = require("./token-provider");
const esClient = require("./elasticsearch-client");
const {getQueue} = require("./bull-queue");

var args = process.argv.slice(2);
const collectionName = args[0];

(async () => {
  const queue = await getQueue(collectionName);

  const upsertChangeStream = await getUpsertChangeStream(collectionName);
  upsertChangeStream.on("change", async change => {
    console.log("Pushing data to elasticsearch with id", change.fullDocument._id);
    change.fullDocument.mongo_id = change.fullDocument._id;
    change.fullDocument.esAction = "index";
    Reflect.deleteProperty(change.fullDocument, "_id");
    
    queue.add(change.fullDocument);
    await saveResumeToken(collectionName, change._id);
  });
  
  upsertChangeStream.on("error", error => {
    console.error(error);
  });

  const deleteChangeStream = await getDeleteChangeStream(collectionName);
  deleteChangeStream.on("change", async change => {
    console.log("Deleting data from elasticsearch with id", change.documentKey._id);
    
    queue.add({ esAction: "delete", mongo_id: change.documentKey._id });

    await saveResumeToken(collectionName, change._id);
  });
  
  deleteChangeStream.on("error", error => {
    console.error(error);
  });

  queue.process(3, function (job, done) {
    // transcode image asynchronously and report progress
    job.progress(42);

    console.log(job.data);
    var esAction = job.data.esAction;
    delete job.data['esAction'];
    
    if (esAction == "delete") {
      esClient.delete(
        { id: job.data.mongo_id, index: collectionName},
        function(error, response) {
          if(error) throw error;

          console.log("elasticsearch delete response code: " + response.statusCode);
          if (response.statusCode != 200)
            throw new Error('can not delete ' + job.data.mongo_id);
        }
      );
    } else {
      esClient.index(
        { id: job.data.mongo_id, index: collectionName, body: job.data },
        function(error, response) {
          if(error) throw error;

          console.log("elasticsearch index response code: " + response.statusCode);
          if (response.statusCode != 200 && response.statusCode != 201)
            throw new Error('can not index ' + job.data.mongo_id, job.data);
        }
      );
    }
    
    // call done when finished
    done();
  });

})();