'use strict';

angular.module('core')
    .controller('HeaderController', ['$scope','$location','Authentication', 'Menus',
	function($scope, Authentication, Menus,$location) {
		console.log($scope);
	    $scope.authentication = Authentication;
	    $scope.tieneHeader=Authentication.user.hasOwnProperty('_id');
	    $scope.isCollapsed = false;
	    $scope.menu = Menus.getMenu('topbar');
	    //Validacion del header, para saber si se muestra o no
	    $scope.toggleCollapsibleMenu = function() {
		$scope.isCollapsed = !$scope.isCollapsed;
	    };

	    // Collapsing the menu after navigation
	    $scope.$on('$stateChangeSuccess', function() {
		$scope.isCollapsed = false;
	    });
	}
])
    .controller('MenuLateral', ['$scope', 'Authentication', 'Menus','$http', '$resource', '$location', 
        function($scope, Authentication, Menus, $http, $resource, $location) {

	    $scope.authentication = Authentication;
	    var tieneSesion=$scope.authentication.user.hasOwnProperty('_id');
	    if(tieneSesion===false){
	    	$location.path('/');
	    }

		$scope.getClass = function(path) {
			if($location.path() === '/home') {
				$scope.active_menu = 'active';
			}else{
				$scope.active_menu = '';
			}
    		if ($location.path().substr(0, path.length) === path) {
      			return 'active';
    		} else {
      			return '';
    		}
		};

		$scope.obtieneDesempenioDiario = function(){
	    	/*$scope.totalDesempenioDiario = 0;
			setInterval(function(){
				$http.post('/obtieneDesempenioDiario', {idUsuario:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data, status, headers, config){
					$scope.totalDesempenioDiario = data;
				});
			},3000);*/
		};
	}
]);

