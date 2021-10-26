const {getCollection} = require("./mongodb-client");
const {getResumeToken} = require("./token-provider");

async function getUpsertChangeStream(collectionName) {
  const resumeToken = await getResumeToken(collectionName);
  console.log("resumeToken", resumeToken);

  const changeStream = (await getCollection(collectionName)).watch([
    {
      "$match": {
        "operationType": {
          "$in": ["insert", "update", "replace"]
        }
      }
    },
    {
      "$project": {
        "documentKey": false
      }
    }
  ], {"resumeAfter": resumeToken, "fullDocument": "updateLookup"});

  return changeStream;
}

async function getDeleteChangeStream(collectionName) {
  console.log("@@@@@@@@@@@@@@@@@@@@");
  const resumeToken = await getResumeToken(collectionName);
  console.log("resumeToken", resumeToken);
  const changeStream = (await getCollection(collectionName)).watch([
    {
      "$match": {
        "operationType": {
          "$in": ["delete"]
        }
      }
    },
    {
      "$project": {
        "documentKey": true
      }
    }
  ], {"resumeAfter": resumeToken});

  return changeStream;
}

module.exports = {
  getUpsertChangeStream,
  getDeleteChangeStream
};