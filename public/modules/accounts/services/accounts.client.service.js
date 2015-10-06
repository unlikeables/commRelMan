'use strict';

//Accounts service used to communicate Accounts REST endpoints
angular.module('accounts').factory('Accounts', ['$resource',
	function($resource) {
		return $resource('accounts/:accountId', { accountId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);