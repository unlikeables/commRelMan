'use strict';

//Feeds service used to communicate Feeds REST endpoints
angular.module('feeds').factory('Feeds', ['$resource',
	function($resource) {
		return $resource('feeds/:feedId', { feedId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);