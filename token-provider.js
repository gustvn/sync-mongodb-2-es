const {getCollection} = require("./mongodb-client");

async function getResumeToken(collectionName) {
  console.log("Getting resume token", collectionName);
  const tokensCollection = await getCollection("change_tokens");
  const result = await tokensCollection.findOne({"_id": collectionName});
  return result ? result.resumeToken : null;
}

async function saveResumeToken(collectionName, resumeToken) {
  console.log("Saving resume token");
  const tokensCollection = await getCollection("change_tokens");
  return tokensCollection.updateOne(
    {"_id": collectionName},
    {"$set": {resumeToken, "lastModifiedDate": new Date()}},
    {"upsert": true}
  );
}

module.exports = {getResumeToken, saveResumeToken};