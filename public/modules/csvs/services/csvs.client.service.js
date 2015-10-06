'use strict';

//Csvs service used to communicate Csvs REST endpoints
angular.module('csvs').factory('Csvs', ['$resource',
	function($resource) {
		return $resource('csvs/:csvId', { csvId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);