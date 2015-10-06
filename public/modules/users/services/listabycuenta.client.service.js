'use strict';

// Users service used for communicating with the users REST endpoint
angular
    .module('users')
    .factory('Listabycuenta', 
	     [
		 '$resource',
		 function($resource) {
		     return $resource(
			 'users/listbyaccount/:accId',
			 {accId: '@_id'}, 
			 {update: {method: 'PUT'}}
		     );
		 }
	     ]
	    );

