require('dotenv').config();

const esClient = require("./elasticsearch-client");
const {getQueue} = require("./bull-queue");

var args = process.argv.slice(2);
const collectionName = args[0];

(async () => {
  const queue = await getQueue(collectionName);

  queue.process(3, function (job, done) {
    // transcode image asynchronously and report progress
    job.progress(42);

    console.log(job.data);
    var esAction = job.data.esAction;
    delete job.data['esAction'];
    
    if (esAction == "delete") {
      var response = await esClient.delete({
        "id": job.data.mongo_id,
        "index": collectionName
      });
      console.log("document deleted successsfully with status code", response.statusCode);
    } else {
      var response = await esClient.index({
        "id": job.data.mongo_id,
        "index": collectionName,
        "body": job.data
      });
      console.log("document upserted successsfully with status code", response.statusCode);
    }

    // call done when finished
    done();
  });

})();