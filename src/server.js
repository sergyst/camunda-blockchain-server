const config = require('./config/config.json');
const { Client, logger } = require('camunda-external-task-client-js');

//import createContractHandler from './topic-handlers/create-contract-handler';
const createContractHandler = require('./topic-handlers/create-contract-handler');

const clientConfig = {
  baseUrl: config.engineUrl,
  workerId: config.clientConfig.workerId,
  maxTasks: config.clientConfig.maxTasks,
  asyncResponseTimeout: config.clientConfig.asyncResponseTimeout,
  use : logger
};

const client = new Client(clientConfig);
// const fs = require('fs');
// const folder = './src/topic-handlers';
// fs.readdir(folder, (err, files) => {
//   files.forEach(file => {
//     console.log('file: ', file);
//     const sub = require('./topic-handlers/'+file);
//     console.log('sub: ', sub);
//     sub.subscribe(client);
//   });
// });

createContractHandler.subscribe(client);
