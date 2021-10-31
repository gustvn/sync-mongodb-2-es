# Capture data change from mongodb and index to elasticsearch

## Prerequisites 
- Mongodb 3.6+ in replica set mode.  
- Elasticsearch 6+  
- Redis 5+  
  
You can use docker compose to start them on development. See details in docker-compose.yaml  

## How to run?
- Create collection `change_tokens`  
- Install node modules: `npm install`  
- Config mongodb, elasticsearch and redis in `.env` file  
- Run: `node index.js [collection_name]`  
  
This tool will watch changes from mongodb collection, push it into Bull queue and save change token to resumable. After that, the processors of Bull queue will consume the job and index/delete data to elasticsearch

