module.exports = {
  subscribe: function (client) {
    subscribe(client);
  }
}

function subscribe(client) {
  const { Variables } = require('camunda-external-task-client-js');
  console.log('\'charge-account\' - subscribe');
  client.subscribe('charge-account', async function({ task, taskService }) {
    console.log('\'charge-account\' - call');
    var accountBalance = 67.32;
    const amount = task.variables.get('amount');
    console.log('\'charge-account\' - task.variables.getAll(): ', task.variables.getAll());
    console.log('\'charge-account\' - amount: '+amount);
  
    var difference = accountBalance - amount;
    // round discount price to 2 decimal places
    var m = Number((Math.abs(difference) * 100).toPrecision(15));
    difference =  Math.round(m) / 100 * Math.sign(difference);
  
    if(typeof amount == 'undefined') {
      console.log('\'charge-account\' - handleFailure');
      await taskService.handleFailure(task, {
        errorMessage: "Variable amount is undefined",
        errorDetails: "the process variable amount is missing or undefined",
        retries: 0,
        retryTimeout: 1000
      });
    } else {
      console.log('\'charge-account\' - set resultVars');
      const resultVars = new Variables();
      if (difference >= 0) {
        accountBalance = difference
        resultVars.set("creditSufficient", true);
      } else {
        accountBalance = 0
        resultVars.set("remainingAmount", difference);
        resultVars.set("creditSufficient", false);
      }
      console.log('\'charge-account\' - resultVars: '+resultVars, resultVars);
    
      try {
        console.log('\'charge-account\' - complete');
        await taskService.complete(task, resultVars);
        console.log(`${config.workerId} - completed for payment ID: ${task.businessKey}. New blance: ${accountBalance}€`);
  
      } catch (e) {
        console.error(`${config.workerId} - Failed completing, ${e}`);
      }
    }
  });
}
