// module.exports = {
//   subscribe: function (client) {
//     subscribe(client);
//   }
// }
//const axios = require('got');

function subscribe(client) {
  console.log('\'cancel-payment\' - subscribe');
  client.subscribe('cancel-payment', async function({ task, taskService }) { 
    console.log('\'cancel-payment\' - call');
    try {
      console.log('\'cancel-payment\' - post cancelOrderMessage');
      await got.post('http://localhost:8080/engine-rest/engine/default/message', {
        json: {
          "messageName" : "cancelOrderMessage",
          "businessKey" : task.businessKey,
          "processVariables" : {
            "transactionLimitExceeded" : {"value" : task.variables.get('transactionLimitExceeded')}
          }
        },
        responseType: 'json'
      });
      console.log('\'cancel-payment\' - post cancelOrderMessage sent');
      
      try {
        console.log('\'cancel-payment\' - complete');
        await taskService.complete(task);
        console.log(`${config.workerId} - Payment canceled for payment ID: ${task.businessKey}`);
  
      } catch (e) {
        console.error(`${config.workerId} - Failed completing, ${e}`);
      }
    } catch (rest_err) {
      console.error(`Failed to send paymentMessage, ${rest_err}`);
      await taskService.handleFailure(task, {
        errorMessage: rest_err.toString(),
        errorDetails: `${config.workerId} - Unable to send cancel payment for orderId: ${task.businessKey}`,
        retries: 0,
        retryTimeout: 1000
      });
    }
  });
}
