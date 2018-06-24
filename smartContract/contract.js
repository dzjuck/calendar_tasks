"use strict";

//n1pfswmFDwMQiPetJHzdgq3Rr2ZVDpaLdYX

function prepareDate(date) {
    if (typeof date === 'string') {
        let timestamp = Date.parse(date);
        if (isNaN(timestamp) == true) {
            throw new Error("Wrong date format");
        }

        date = new Date(date);
    }

    return date;
}

class Task {
    constructor(data) {
        let obj = data ? JSON.parse(data) : {};
        this.id = obj.id || 0;
        this.text = obj.text;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class DateTask {
    constructor(data) {
        let obj = data ? JSON.parse(data) : {};
        this.id = obj.id || 0;
        this.task_id = obj.task_id;
        this.date = prepareDate(obj.date);
        this.completed = obj.completed || false;
        this.txhash = obj.txhash;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class DailyHabitsContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "tasks", {
            parse: function (data) { return new Task(data); },
            stringify: function (o) { return o.toString(); }
        });
        LocalContractStorage.defineMapProperty(this, "dateTasks", {
            parse: function (data) { return new DateTask(data); },
            stringify: function (o) { return o.toString(); }
        });
        LocalContractStorage.defineMapProperty(this, "userTasks");
        LocalContractStorage.defineMapProperty(this, "userDateTasks");
    }

    init() {}

    _userId() {
        return Blockchain.transaction.from;
    }

    _generateId() {
        return Math.random().toString(36).slice(2);
    }

    _userDateKey(user_id, date) {
        return user_id + "_" + date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear();
    }

    _txHash() {
        return Blockchain.transaction.hash;
    }

    _createTask(text) {
        let task = new Task();
        task.id = this._generateId();
        task.text = text;

        this.tasks.put(task.id, task);

        return task;
    }

    _createDateTask(task, date) {
        let date_task = new DateTask();
        date_task.id = this._generateId();
        date_task.task_id = task.id;
        date_task.date = date;
        date_task.txhash = this._txHash();
        this.dateTasks.put(date_task.id, date_task);

        return date_task;
    }

    _addTaskToUsersTasksList(user_id, task) {
        let user_tasks = this.userTasks.get(user_id) || [];
        if (!user_tasks.includes(task.id)) {
            user_tasks.push(task.id);
            this.userTasks.put(user_id, user_tasks);
        }
    }

    _removeTaskFromUsersTasksList(user_id, task) {
        let user_tasks = this.userTasks.get(user_id) || [];
        if (user_tasks.includes(task.id)) {
            user_tasks = user_tasks.filter(item => item !== task.id);
            this.userTasks.put(user_id, user_tasks);
        }
    }

    _addDateTaskToUsersDateTasksList(user_id, date, date_task) {
        let user_date_key = this._userDateKey(user_id, date);
        let user_date_tasks = this.userDateTasks.get(user_date_key) || [];
        user_date_tasks.push(date_task.id);
        this.userDateTasks.put(user_date_key, user_date_tasks);
    }

    _removeTaskFromUsersDateTasksList(user_id, date_task) {
        let user_date_key = this._userDateKey(user_id, date_task.date);
        let user_date_tasks = this.userDateTasks.get(user_date_key) || [];
        if (user_date_tasks.includes(date_task.id)) {
            user_date_tasks = user_date_tasks.filter(item => item !== date_task.id);
            this.userDateTasks.put(user_date_key, user_date_tasks);
        }
    }

    _userDatePresent(user_date_key) {
        let user_date_tasks = this.userDateTasks.get(user_date_key);
        return (Array.isArray(user_date_tasks));
    }

    _decorateUserDateTasks(date_tasks) {
       for (var i in date_tasks) {
            date_tasks[i].text = this.tasks.get(date_tasks[i].task_id).text;
       }
       return date_tasks;
    }

    addDateTask(date, text) {
        date = prepareDate(date);
        let user_id = this._userId();
        let task = this._createTask(text);
        let date_task = this._createDateTask(task, date);
        this._addTaskToUsersTasksList(user_id, task);
        this._addDateTaskToUsersDateTasksList(user_id, date, date_task);
    }

    getDateTaskIdByDateAndTx(date, txHash) {
        date = prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);

        let user_date_task_ids = this.userDateTasks.get(user_date_key) || [];
        let user_date_tasks = [];
        for (var i in user_date_task_ids) {
            let date_task_id = user_date_task_ids[i];
            user_date_tasks.push(this.dateTasks.get(date_task_id));
        }

        let user_date_task = user_date_tasks.find(o => o.txhash === txHash);
        if (user_date_task === undefined) {
            return null;
        } else {
            return user_date_task.id;
        }
    }

    completeDateTask(date_task_id, completed) {
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        date_task.completed = completed;
        this.dateTasks.put(date_task_id, date_task);
    }

    updateDateTaskText(date_task_id, text) {
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        let task = this.tasks.get(date_task.task_id);
        if (!task) {
            throw new Error("Task not found");
        }
        task.text = text;
        this.tasks.put(task.id, task);
    }

    deleteDateTask(date_task_id) {
        let user_id = this._userId();
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        let task = this.tasks.get(date_task.task_id);
        if (!task) {
            throw new Error("Task not found");
        }
        this._removeTaskFromUsersDateTasksList(user_id, date_task);
        this._removeTaskFromUsersTasksList(user_id, task);
    }

    getDateTasks(date) {
        date = prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let date_present = this._userDatePresent(user_date_key);
        if (date_present) {
            let user_date_task_ids = this.userDateTasks.get(user_date_key) || [];
            let user_date_tasks = [];
            for (var i in user_date_task_ids) {
                let date_task_id = user_date_task_ids[i];
                user_date_tasks.push(this.dateTasks.get(date_task_id));
            }
            return {"daily": this._decorateUserDateTasks(user_date_tasks)};
        } else {
            let user_task_ids = this.userTasks.get(user_id) || [];
            let user_tasks = [];
            for (var i in user_task_ids) {
                let task_id = user_task_ids[i];
                let task = this.tasks.get(task_id);
                user_tasks.push(task);
            }
            return {"default": user_tasks};
        }
    }

    createDateTasks(date) {
        date = prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let date_present = this._userDatePresent(user_date_key);
        if (date_present) {
            throw new Error("Date tasks already created");
        } else {
            let user_task_ids = this.userTasks.get(user_id) || [];
            let user_date_task_ids = [];
            let user_date_tasks = [];
            for (var i in user_task_ids) {
                let task_id = user_task_ids[i];
                let task = this.tasks.get(task_id);
                let date_task = this._createDateTask(task, date, true);
                user_date_task_ids.push(date_task.id);
                user_date_tasks.push(date_task);
                this.dateTasks.put(date_task.id, date_task);
            }
            this.userDateTasks.put(user_date_key, user_date_task_ids);
        }
    }
}

module.exports = DailyHabitsContract;
