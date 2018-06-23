/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('calendar_tasks')
	.controller('TodoCtrl', ['$scope', '$interval', '$filter', 'todoStorage', '$http', function TodoCtrl($scope, $interval, $filter, store, $http ) {
		'use strict';

        var store;
        var vm = this;
		vm.todos = [];// = $scope.todos = store.todos;
        vm.currentDate = null;

        vm.newTask = '';

        vm.txMap = {};

        vm.init = function(type = 'active') {
            var dt = $filter('date')(new Date(), "yyyy-MM-dd");
            store.get(dt).then(function(tasks){
                vm.todos = tasks;
            });
        }
        
        vm.addTask = function() {
            var text = vm.newTask.trim();
			if (!text) {
				return;
			}

            var completed = false;
			$scope.saving = true;
            var date = $filter('date')( vm.currentDate || new Date(), "yyyy-MM-dd");

            store.add(text, date, completed)
				.then(function success(block_response) {
                    console.log('[ctrl] on success block_task', block_response);
                    vm.newTask = '';
                    var tmpTask = {'text': text, 'date':date, 'completed':completed, 'id':false, 'hash':block_response['txhash'] };
                    vm.todos.push( tmpTask );
                    vm.txMap[ block_response['txhash'] ] = false; //pending
                    $interval( _checkTxHash, 10000, 3, false, tmpTask );
				})
				.finally(function () {
					$scope.saving = false;
				});
        };

        function _checkTxHash(tmpTask) {
            console.log('[_checkHash]', tmpTask, vm.todos.indexOf(tmpTask));
            store.checkHash( tmpTask.date, tmpTask.hash ).then(function(ret){
                console.log('[_checkHashGET]', ret);
                if (ret.status) {
                    tmpTask.id = Math.random();
                }
            })
        }

		vm.removeTask = function (task) {
			store.delete(task).then( function() {
                vm.todos.splice(vm.todos.indexOf(task), 1);
            });
		};

        vm.onDateChange = function() {
            console.log('changed date', vm.currentDate);
		};

        vm.toggleCompleted = function(task){
            store.complete(task).then(function() {
                console.log('[ctrl] completed', task.completed);
            });
        };

        

	    vm.editTask = function (task) {
			vm.editedTodo = task;
			// Clone the original todo to restore it on demand.
			vm.originalTodo = angular.extend({}, task);
		};
		vm.revertEdits = function (task) {
			vm.todos[vm.todos.indexOf(task)] = vm.originalTodo;
			vm.editedTodo = null;
			vm.originalTodo = null;
			vm.reverted = true;
		};


 /*

		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(vm.todos, { completed: false }).length;
			$scope.completedCount = vm.todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);
   
		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};
		});

		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			todo.title = todo.title.trim();

			if (todo.title === $scope.originalTodo.title) {
				$scope.editedTodo = null;
				return;
			}

			store[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {}, function error() {
					todo.title = $scope.originalTodo.title;
				})
				.finally(function () {
					$scope.editedTodo = null;
				});
		};




		$scope.saveTodo = function (todo) {
			store.put(todo);
		};

		$scope.toggleCompleted = function (todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			store.put(todo, vm.todos.indexOf(todo))
				.then(function success() {}, function error() {
					todo.completed = !todo.completed;
				});
		};

		$scope.clearCompletedTodos = function () {
			store.clearCompleted();
		};

		$scope.markAll = function (completed) {
			vm.todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
		};
        */
	}]);
