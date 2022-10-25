module.exports = {
  subscribe: function (client) {
    subscribe(client);
  }
}

function subscribe(client) {
  const axios = require('got');
  console.log('\'request-payment\' - subscribe');
  client.subscribe('request-payment', async function({ task, taskService }) {
    console.log('\'request-payment\' - call');
    const orderId = task.businessKey;
    const amount = task.variables.get('amount');
    console.log('\'request-payment\' - orderId: '+orderId+', amount: '+amount);
  
    try {
      // const {body} = await axios.post('http://localhost:8080/engine-rest/engine/default/message', {
      console.log('\'request-payment\' - post paymentMessage');
      await axios.post('http://localhost:8080/engine-rest/engine/default/message', {
        json: {
          "messageName" : "paymentMessage",
          "businessKey" : orderId,
          "processVariables" : {
            "amount" : {"value" : amount}   
          }
        },
        responseType: 'json'
      });
      // processEngine.getRuntimeService()
      // .createMessageCorrelation('message_invoiceReceived') // <1>
      // .setVariable("invoiceId", "123456") // <2>
      // .correlate();
      console.log('\'request-payment\' - post paymentMessage sent');

      try {
        console.log('\'request-payment\' - complete');
        await taskService.complete(task);
        console.log(`${config.workerId} - Payment requested: ${orderId}.`);
        
      } catch (e) {
        console.error(`${config.workerId} - Failed completing, ${e}`);
      }
    } catch (rest_err) {
      console.error(`${config.workerId} - Failed to send paymentMessage, ${rest_err}`);
      await taskService.handleFailure(task, {
        errorMessage: rest_err.toString(),
        errorDetails: `${config.workerId} - Unable to send paymentMessage for orderId: ${orderId}`,
        retries: 0,
        retryTimeout: 1000
      });
    }
  }); 
}
