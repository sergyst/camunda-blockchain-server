module.exports = {
  subscribe: function (client) {
    subscribe(client);
  }
}

function subscribe(client) {
  const axios = require('got');
  console.log('\'confirm-payment\' - subscribe');
  client.subscribe('confirm-payment', async function({ task, taskService }) {
    console.log('\'confirm-payment\' - call');
    const orderId = task.businessKey;
    console.log('\'confirm-payment\' - orderId: '+orderId);
    try {
      console.log('\'confirm-payment\' - post paymentConfirmationMessage');
      await axios.post('http://localhost:8080/engine-rest/engine/default/message', {
        json: {
          "messageName" : "paymentConfirmationMessage",
          "businessKey" : task.businessKey  
        },
        responseType: 'json'
      });
      console.log('\'confirm-payment\' - post paymentConfirmationMessage sent');

      try {
        console.log('\'confirm-payment\' - complete');
        await taskService.complete(task);
        console.log(`${config.workerId} - Payment fulfilled: ${task.businessKey}.`);
        
      } catch (e) {
        console.error(`${config.workerId} - Failed completing, ${e}`);
      }
    } catch (rest_err) {
      console.error(`Failed to send paymentConfirmationMessage, ${rest_err}`);
      await taskService.handleFailure(task, {
        errorMessage: rest_err.toString(),
        errorDetails: `${config.workerId} - Unable to send paymentConfirmationMessage for orderId: ${orderId}`,
        retries: 0,
        retryTimeout: 1000
      });
    }
  });
}
