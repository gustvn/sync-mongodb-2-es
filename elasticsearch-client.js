require('dotenv').config();
const {Client} = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

module.exports = client;