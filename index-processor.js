const esClient = require("./elasticsearch-client");
const {getQueue} = require("./bull-queue");

const express = require('express');
const actuator = require('express-actuator');

var args = process.argv.slice(2);
const collectionName = args[0];

(async () => {
  const queue = await getQueue(collectionName);

  queue.process(3, function (job, done) {
    // transcode image asynchronously and report progress
    job.progress(42);

    var esAction = job.data.esAction;
    delete job.data['esAction'];

    console.log("esAction: " + esAction + " && mongo_id:" + job.data.mongo_id);
    
    if (esAction == "delete") {
      esClient.delete(
        { id: job.data.mongo_id, index: collectionName},
        function(error, response) {
          if(error) throw error;

          console.log("elasticsearch delete response code: " + response.statusCode);
          if (response.statusCode != 200)
            throw new Error('can not delete index ' + job.data.mongo_id);
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

  const app = express();
  app.use(actuator());
  app.listen(3300);

})();