angular.module('calendar_tasks')
	.factory('todoStorage', ['$http', '$injector', '$q', function ($http, $injector, $q) {
		'use strict';

        var blockAPI = new TaskContractApi(); 

        var BlockchainService = {
			get: function (type='active') {
				var deferred = $q.defer();
                var tasks = null;
                blockAPI.get(100, 0, type, function(resp){
                    if(resp.result) {
                        tasks = JSON.parse(resp.result);
                    }
                    deferred.resolve(tasks);
                });
				return deferred.promise;
			},

            add: function(text, date, completed=false) {
                var deferred = $q.defer();
                blockAPI.add(text, date, completed, function(resp){
                    console.log('ADD RET:');
                    console.log(resp);
                    /*
                    if(resp.result) {
                        deferred.resolve(JSON.parse(resp.result));
                    }
                    else {
                        deferred.reject();
                    }
                    */
                });
				return deferred.promise;
            },

            delete: function(task) {
                /*
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);
				return store.api.delete({ id: todo.id },
					function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
                */
                var deferred = $q.defer();
                blockAPI.delete(task.id, function(resp){
                    console.log('DEL RET:');
                    console.log(resp);
                    if(resp.result) {

                        deferred.resolve(JSON.parse(resp.result));
                    }
                    else {
                        deferred.reject();
                    }
                });
				return deferred.promise;
			}
        };

        return BlockchainService;
}]);
