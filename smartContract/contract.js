"use strict";

//n1uBWSw2d9mrpUcbFTXqLhbKWNNBRPBL4Zj

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
        this.date = obj.date;
        this.completed = obj.completed || false;
        this.recurrent = obj.recurrent || false;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class CalendarTasksContract {
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
        LocalContractStorage.defineMapProperty(this, "userDates");
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

    _prepareDate(date) {
        if (typeof date === 'string') {
            let timestamp = Date.parse(date);
            if (isNaN(timestamp) == true) {
                throw new Error("Wrong date format");
            }

            date = new Date(date);
        }

        return date;
    }

    _createTask(text) {
        let task = new Task();
        task.id = this._generateId();
        task.text = text;

        this.tasks.put(task.id, task);

        return task;
    }

    _createDateTask(task, date, recurrent) {
        let date_task = new DateTask();
        date_task.id = this._generateId();
        date_task.task_id = task.id;
        date_task.date = date;
        date_task.recurrent = recurrent;
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
            this.userTasks.put(user_date_key, user_date_tasks);
        }
    }

    // addTask(text) {
    //     let user_id = this._userId();
    //     let task = this._createTask(text);
    //     let date_task = this._createDateTask(task);
    //     this._addTaskToUsersTasksList(user_id, task);
    //     this._addDateTaskToUsersDateTasksList(user_id, date_task);
    // }

    addDateTask(date, text, recurrent = true) {
        date = this._prepareDate(date);
        let user_id = this._userId();
        let task = this._createTask(text);
        let date_task = this._createDateTask(task, date, recurrent);
        if (recurrent) {
            this._addTaskToUsersTasksList(user_id, task);
        }
        this._addDateTaskToUsersDateTasksList(user_id, date, date_task);
    }

    completeDateTask(date_task_id, completed) {
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        date_task.completed = true;
        this.dateTasks.put(date_task_id, date_task);
    }

    updateDateTaskText(date_task_id, text) {
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        date_task.text = text;
        this.dateTasks.put(date_task_id, date_task);
    }

    updateDateTaskRecurrentability(date_task_id, recurrent) {
        let date_task = this.dateTasks.get(date_task_id);
        if (!date_task) {
            throw new Error("Date task not found");
        }
        let task = this.tasks.get(date_task.task_id);
        if (!task) {
            throw new Error("Task not found");
        }
        if (recurrent) {
            this._addTaskToUsersTasksList(user_id, task);
        } else {
            this._removeTaskFromUsersTasksList(user_id, task);
        }
    }

    deleteDateTask(date_task_id) {
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

    // For tests
    getAllTasks() {
        return this.tasks;
    }

    // For tests
    getAllDateTasks() {
        return this.dateTasks;
    }

    // For tests
    getAllUserTasks() {
        return this.userTasks;
    }

    // For tests
    getAllUserDateTasks() {
        return this.userDateTasks;
    }

    // For tests
    getAllUserDates() {
        return this.userDates;
    }

    // For tests
    getTask(task_id) {
        return this.tasks.get(task_id);
    }

    // For tests
    getDateTask(date_task_id) {
        return this.dateTasks.get(date_task_id);
    }

    // For tests
    getUserTaskIds() {
        let user_id = this._userId();
        let user_task_ids = this.userTasks.get(user_id);
        return user_task_ids;
    }

    // For tests
    getUserTasks() {
        let user_id = this._userId();
        let user_task_ids = this.userTasks.get(user_id);

        let user_tasks = [];
        for (var i in user_task_ids) {
            let task_id = user_task_ids[i];
            let task = this.tasks.get(task_id);
            user_tasks.push(task);
        }
        return user_tasks;
    }

    // For tests
    getUserDateTaskIds(date) {
        date = this._prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let user_date_task_ids = this.userDateTasks.get(user_date_key);
        return user_date_task_ids;
    }

    // For tests
    getUserDateTasks(date) {
        date = this._prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let user_date_task_ids = this.userDateTasks.get(user_date_key);
        let user_date_tasks = [];
        for (var i in user_date_task_ids) {
            let date_task_id = user_date_task_ids[i];
            user_date_tasks.push(this.dateTasks.get(date_task_id));
        }
        return user_date_tasks;
    }

    // For tests
    getUserDates(date) {
        date = this._prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let date_present = this.userDates.get(user_date_key);
        return date_present;
    }

    getDateTasks(date) {
        date = this._prepareDate(date);
        let user_id = this._userId();
        let user_date_key = this._userDateKey(user_id, date);
        let date_present = this.userDates.get(user_date_key) || false;
        if (date_present) {
            let user_date_task_ids = this.userDateTasks.get(user_date_key) || [];
            let user_date_tasks = [];
            for (var i in user_date_task_ids) {
                let date_task_id = user_date_task_ids[i];
                user_date_tasks.push(this.dateTasks.get(date_task_id));
            }
            return user_date_tasks;
        } else {
            let user_task_ids = this.userTasks.get(user_id) || [];
            let user_date_task_ids = [];
            let user_date_tasks = [];
            for (var i in user_task_ids) {
                let task_id = user_task_ids[id];
                let task = this.tasks.get(task_id);
                let date_task = this._createDateTask(task, date, true);
                user_date_task_ids.push(date_task.id);
                user_date_tasks.push(date_task);
                this.dateTasks.put(date_task.id, date_task);
            }
            this.userDateTasks.put(user_date_key, user_date_task_ids);
            this.userDates.put(user_date_key, true);
            return user_date_tasks;
        }
    }

}

module.exports = CalendarTasksContract;
