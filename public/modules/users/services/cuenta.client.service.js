'use strict';

//Accounts service used to communicate Accounts REST endpoints
angular
    .module('users')
    .factory('Cuenta', 
	     [
		 '$resource', 
		 function($resource) { 
		     return $resource(
			 'cuentas/', 
			 {cuentaId: '@_id'}, 
			 {update: {method: 'PUT'}}
		     ); 
		 }
	     ]
	    );
