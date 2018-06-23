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
            store.get().then(function(tasks){
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
            var date = vm.currentDate || Date.now();
            store.add(text, date, completed)
				.then(function success(block_response) {
                    console.log('[ctrl] on success block_task', block_response);
                    vm.newTask = '';
                    var tmpTask = {'text': text, 'date':date, 'completed':completed, 'id':false, 'hash':block_response['txhash'] };
                    vm.todos.push( tmpTask );
                    vm.txMap[ block_response['txhash'] ] = false; //pending
                    $interval( _checkTxHash, 5000, 3, false, tmpTask );
				})
				.finally(function () {
					$scope.saving = false;
				});
        };

        function _checkTxHash(tmpTask) {
            console.log('[_checkHash]', tmpTask, vm.todos.indexOf(tmpTask));
            store.checkHash( tmpTask.hash ).then(function(ret){
                console.log('[_checkHashGET]', ret);
                if (ret.status) {
                    tmpTask.id = Math.random();
                }
            })
        }

		vm.removeTask = function (todo) {
			store.delete(todo).then( function() {
                vm.todos.splice(vm.todos.indexOf(todo), 1);
            });
		};

        vm.onDateChange = function () {
            console.log('changed date', vm.currentDate);
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

		$scope.addTodo = function () {
			var newTodo = {
				title: $scope.newTodo.trim(),
				completed: false
			};

			if (!newTodo.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newTodo)
				.then(function success() {
					$scope.newTodo = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

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

		$scope.revertEdits = function (todo) {
			vm.todos[vm.todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
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
