'use strict';


angular.module('core')



.controller('HomeController', ['$scope', 'Authentication','ui.bootstrap',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}

]);