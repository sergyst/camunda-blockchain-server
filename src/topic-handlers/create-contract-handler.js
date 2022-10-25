module.exports = {
  subscribe: function (client) {
    subscribe(client);
  }
}

function subscribe(client) {
  console.log('\'create-contract\' - subscribe');
  client.subscribe('create-contract', async function({ task, taskService }) {
    console.log('\'create-contract\' - call');
    console.log('\'create-contract\' - task:', task);
    console.log('\'create-contract\' - task variables:', task.variables.getAll());
    /*
      firstName: 'Sergey',
      lastName: 'Steblin',
      items: 'shampane',
      email: 'sergey.steblin@gmail.com'
    */
    const orderId = task.businessKey;
    const firstName = task.variables.get('firstName');
    console.log('\'create-contract\' - orderId: '+orderId+', firstName: '+firstName);
  
    try {
      try {
        console.log('\'create-contract\' - complete');
        await taskService.complete(task);
        console.log('\'create-contract\' - completed');
        
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
