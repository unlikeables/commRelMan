'use strict';

//Accounts service used to communicate Accounts REST endpoints
angular.module('users').factory('GetMarca', ['$resource',
	function($resource) {
		return $resource('marca/:marcaId', {marcaId: '@_id'
	}, {
			update: {
				method: 'PUT'
		}
	});
	}
]);