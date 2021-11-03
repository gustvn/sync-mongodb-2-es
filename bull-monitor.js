require('dotenv').config();
const { BullMonitorExpress } = require('@bull-monitor/express');
const Express = require('express');
const Queue = require('bull');

var args = process.argv.slice(2);
const collectionName = args[0];

(async () => {
  const app = Express();

  const monitor = new BullMonitorExpress({
    queues: [ new Queue("sync_" + collectionName, process.env.REDIS_URI) ],
    // enables graphql playground at /my/url/graphql. true by default
    gqlPlayground: true,
    // enable metrics collector. false by default
    // metrics are persisted into redis as a list
    // with keys in format "bull_monitor::metrics::{{queue}}"
    metrics: {
      // collect metrics every X
      // where X is any value supported by https://github.com/kibertoad/toad-scheduler
      collectInterval: { hours: 1 },
      maxMetrics: 100,
      // disable metrics for specific queues
      blacklist: ['1'],
    },
  });
  await monitor.init();
  app.use('/bull-monitor', monitor.router);
  app.listen(3333);
  console.log("bull monitor started")
})();