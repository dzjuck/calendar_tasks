// n1yyDZPdSTcvbMFEfkX98YusEqEfjJ7pip8
// n1xyme5jpymvhQFU8N8EVQ3JFx8ReuBrNfB
"use strict";

class TestContract {
    init() {
        // this.count = new BigNumber(1);
    }

    _userId() {
        return Blockchain.transaction.from;
    }

    test() {
        return this._userId();
    }
}

module.exports = TestContract;
