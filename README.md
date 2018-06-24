# Daily Habits

The application allows you to manage your daily tasks.

### Smart contract

- `addDateTask(date, text)` - Adds a new task.
- `getDateTaskIdByDateAndTx(date, txHash)` - Returns task's id by date and transaction hash.
- `completeDateTask(date_task_id, completed)` - Set completed status to a task.
- `updateDateTaskText(date_task_id, text)` - Updates task's text.
- `deleteDateTask(date_task_id)` - Deletes a task.
- `getDateTasks(date)` - Returns user's tasks by date.
- `createDateTasks(date)` - Create user's routine tasks.
