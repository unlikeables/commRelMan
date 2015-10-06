'use strict';

//Charts service used to communicate Charts REST endpoints
angular.module('charts').factory('Charts', ['$resource',
	function($resource) {
		return $resource('charts/:chartId', { chartId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);