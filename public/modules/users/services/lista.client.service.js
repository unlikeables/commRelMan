'use strict';

// Users service used for communicating with the users REST endpoint
angular
    .module('users')
    .factory('Lista', 
	     [
		 '$resource',
		 function($resource) {
		     return $resource(
			 'users/list/:userId', 
			 {userId: '@_id'}, 
			 {update: {method: 'PUT'}}
		     );
		 }
	     ]
	    );

