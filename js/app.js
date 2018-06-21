function loadTasks(type = 'active') {
    $('.task-list').empty();    
    let api = new TaskContractApi(); 
    api.get(100, 0, type, resp => {
        if(resp.result) {
            let tasks = JSON.parse(resp.result);
            for (const task of tasks) {
                showTask(task);
            }
        }
    })
}

function showTask(task) {
    let innerHtml = `<div class="d-flex justify-content-start task" data-task-id="${task.id}">
                        <button class="task-toggle" data-completed="${task.completed}">
                            <i class="far fa-${(task.completed ? "check-square" : "square")}"></i>
                        </button>
                        <div class="task-content">${task.text}</div>
                        <button class="task-remove">
                            &times;
                        </button>
                    </div>`;
    let div = document.createElement('div');
    div.innerHTML = innerHtml;
    $(div.firstChild).find('.task-toggle').click(function() {
        let task = $(this).closest('.task');
        let taskId = task.data('task-id');
        let text = task.find('.task-content').text();
        let completed = $(this).data('completed')

        let api = new TaskContractApi();
        api.update(taskId, text, !completed)
    });

    $(div.firstChild).find('.task-remove').click(function() {
        let taskId = $(this).closest('.task').data('task-id');
        let api = new TaskContractApi();
        api.delete(taskId);
    });

    $(".task-list").append(div.firstChild);
}