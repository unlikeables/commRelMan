'use strict';

angular.module('core')
    .controller('NotificationController', ['$scope','$location','Authentication','Socket',
	function($scope, Authentication,$location,Socket) {
	    $scope.authentication = Authentication;
	    	    
	}
]);