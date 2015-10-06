'use strict';

//Influencers service used to communicate Influencers REST endpoints
angular.module('influencers').factory('Influencers', ['$resource',
	function($resource) {
		return $resource('influencers/:influencerId', { influencerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);