angular.module('calendar_tasks')
	.factory('todoStorage', ['$http', '$injector', '$q', function ($http, $injector, $q) {
		'use strict';

        var blockAPI = new TaskContractApi(); 

        var BlockchainService = {
			get: function (type='active') {
				var deferred = $q.defer();
                var tasks = null;
                blockAPI.get(100, 0, type, function(blockchain_resp){
                    if(blockchain_resp.result) {
                        tasks = JSON.parse(blockchain_resp.result);
                    }
                    deferred.resolve(tasks);
                });
				return deferred.promise;
			},

            add: function(text, date, completed=false) {
                var deferred = $q.defer();
                blockAPI.add(text, date, completed, function(blockchain_resp){
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

            checkHash: function(hash) {
                var deferred = $q.defer();
                blockAPI.getDateTaskIdByTx(hash, function(blockchain_resp){
                    deferred.resolve(blockchain_resp);
                });
				return deferred.promise;
            }
        };

        return BlockchainService;
}]);
