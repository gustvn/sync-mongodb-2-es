require('dotenv').config();
const {Client} = require('@elastic/elasticsearch')

console.log("******** elasticsearch node: ", process.env.ELASTICSEARCH_NODE);
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

module.exports = client;