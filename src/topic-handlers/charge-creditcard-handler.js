module.exports = {
  subscribe: function (client) {
    subscribe(client);
  }
}

function subscribe(client) {
  const { Variables } = require('camunda-external-task-client-js');
  console.log('\'charge-creditcard\' - subscribe');
  client.subscribe('charge-creditcard', async function({ task, taskService }) {
    console.log('\'charge-creditcard\' - call');
    const amount = task.variables.get('remainingAmount');
    const resultVars = new Variables(); 
    var newId = task.businessKey.toString().substring(9);
    resultVars.set("transactionId", 'trns-' + newId);

    console.log('\'charge-creditcard\' - amount: '+amount+', businessKey: '+businessKey+', newId: '+newId);
      
    const transactionLimit = 150;
    //check if transaction limit has been exceeded
    if (Math.abs(amount) > transactionLimit) {
      var diff = Math.abs(amount) - transactionLimit
      resultVars.set('transactionLimitExceeded', true);
  
      console.log('\'charge-creditcard\' - handleBpmnError');
      await taskService.handleBpmnError(task, "err_transactionLimit", `Transaction limit exceeded by ${diff}`, resultVars);
      console.log(`${config.workerId} - Credit card limit exceeded. Value: ${amount} Transaction limit: ${transactionLimit}`);
    } else {
      try {
        console.log('\'charge-creditcard\' - complete');
        await taskService.complete(task, resultVars);
        console.log(`${config.workerId} - completed for payment ID: ${task.businessKey}. Charged ${Math.abs(amount)}€`);
        
      } catch (e) {
        console.error(`${config.workerId} - Failed completing, ${e}`);
      }
    }
  });
}
