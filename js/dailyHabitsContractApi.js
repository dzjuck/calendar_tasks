const CONTRACT_ADDRESS = "n1gbGKZ9A7i5um23xFZncWt7hu64pirSQaB"; //testnet

class SmartContractApi {
    constructor(contractAdress) {
        let NebPay = require("nebpay");
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this.contractAdress;
    }

    _simulateCall({ value = "0", callArgs = "[]", callFunction , callback }) {
        this.nebPay.simulateCall(this._contractAdress, value, callFunction, callArgs, {
            callback: function(resp){
                console.log(resp);
                if(callback){
                    callback(resp);
                }
            }
        });
    }

    _call({ value = "0", callArgs = "[]", callFunction , callback }) {
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {
            callback: function(resp){
                if(callback){
                    callback(resp);
                }
            }
        });
    }
}

class DailyHabitsContractApi extends SmartContractApi{
    add(text, date, cb) {
        this._call({
            callArgs : `["${date}", "${text}"]`,
            callFunction : "addDateTask",
            callback: cb
        });
    }

    getIdByDateAndTx(date,  tx, cb) {
        this._simulateCall({
            callArgs : `["${date}", "${tx}"]`,
            callFunction : "getDateTaskIdByDateAndTx",
            callback: cb
        });
    }

    updateText(taskId, text, cb) {
        this._call({
            callArgs : `["${taskId}", "${text}"]`,
            callFunction : "updateDateTaskText",
            callback: cb
        });
    }

    complete(taskId, completed, cb) {
        this._call({
            callArgs : `["${taskId}", ${completed}]`,
            callFunction : "completeDateTask",
            callback: cb
        });
    }

    delete(taskId, cb) {
        this._call({
            callArgs: `["${taskId}"]`,
            callFunction : "deleteDateTask",
            callback: cb
        });
    }

    getByDate(date, cb) {
        this._simulateCall({
            callArgs : `["${date}"]`,
            callFunction : "getDateTasks",
            callback: cb
        });
    }

    createByDate(date, cb) {
        this._call({
            callArgs : `["${date}"]`,
            callFunction : "createDateTasks",
            callback: cb
        });
    }
}
