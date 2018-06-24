angular.module('calendar_tasks')
	.factory('todoStorage', ['$http', '$injector', '$q', function ($http, $injector, $q) {
		'use strict';

        var blockAPI = new DailyHabitsContractApi(); 

        var BlockchainService = {
			get: function (date) {
				var deferred = $q.defer();
                var tasks = null;
                blockAPI.getByDate(date, function(blockchain_resp){
                    if(blockchain_resp.result) {
                        tasks = JSON.parse(blockchain_resp.result);
                    }
                    deferred.resolve(tasks);
                });
				return deferred.promise;
			},

            add: function(text, date) {
                var deferred = $q.defer();
                blockAPI.add(text, date, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
            },

            delete: function(task) {
                var deferred = $q.defer();
                blockAPI.delete(task.id, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
			},

            complete: function(task) {
                var deferred = $q.defer();
                blockAPI.complete(task.id, task.completed, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
            },

            update: function(task) {
                var deferred = $q.defer();
                blockAPI.updateText(task.id, task.text, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
            },

            initDate: function(date) {
                var deferred = $q.defer();
                blockAPI.createByDate(date, function(blockchain_resp) {
                    deferred.resolve(blockchain_resp);
                });
                return deferred.promise;
            },

            checkHash: function(date, txhash) {
                var deferred = $q.defer();
                blockAPI.getIdByDateAndTx(date, txhash, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
            }
        };

        return BlockchainService;
}]);
