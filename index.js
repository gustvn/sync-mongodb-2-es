require('dotenv').config();

const {getUpsertChangeStream, getDeleteChangeStream} = require("./change-streams");
const {saveResumeToken} = require("./token-provider");
const esClient = require("./elasticsearch-client");

const collectionName = "transaction";

(async () => {
  const upsertChangeStream = await getUpsertChangeStream(collectionName);
  upsertChangeStream.on("change", async change => {
    console.log("Pushing data to elasticsearch with id", change.fullDocument._id);
    change.fullDocument.id = change.fullDocument._id;
    Reflect.deleteProperty(change.fullDocument, "_id");
    const response = await esClient.index({
      "id": change.fullDocument.id,
      "index": collectionName,
      "body": change.fullDocument
    });
    console.log("document upserted successsfully with status code", response.statusCode);
    await saveResumeToken(collectionName, change._id);
  });
  
  upsertChangeStream.on("error", error => {
    console.error(error);
  });

  const deleteChangeStream = await getDeleteChangeStream(collectionName);
  deleteChangeStream.on("change", async change => {
    console.log("Deleting data from elasticsearch with id", change.documentKey._id);
    const response = await esClient.delete({
      "id": change.documentKey._id,
      "index": collectionName
    });
    console.log("document deleted successsfully with status code", response.statusCode);
    await saveResumeToken(collectionName, change._id);
  });
  
  deleteChangeStream.on("error", error => {
    console.error(error);
  });
})();
