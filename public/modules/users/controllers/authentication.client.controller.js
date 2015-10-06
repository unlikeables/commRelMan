'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;
		

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/home');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.login=function(){
			$scope.muestraForm=true;
			$scope.error='';
		};

		$scope.muestraForm=true;

		$scope.mensajeInicio='';
		
		//Funcion para inicio de sesion
		$scope.signin = function() {
			$scope.mensajeInicio='';
			$scope.error = '';
			
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				if(!response.message){
					var revisaSesionFacebook=response.hasOwnProperty('additionalProvidersData');
					// If successful we assign the response to the global user model
					$scope.authentication.user = response;
					// And redirect to the index page
					$location.path('/home');
					//$location.path('/home');
				}
				else{
					
					if(response.message === 'Missing credentials'){
					//$scope.error = 'Campos Requeridos';
					$scope.mensajeInicio='¡Oops!';
						$scope.error='Usuario y/o Contraseña Incorrectos';
					}else{
					$scope.mensajeInicio='¡Oops!';
					$scope.error = response.message;	
					}
					
					
				}
			});
		};	
		//Termina funcion de inicio de sesion	

		//Scope que se manda a llamar al realizar el envio de mail
		$scope.$on('respuestaPassword', function(event, message){
			$scope.muestraForm=false;
			$scope.error =message;
		});
	}
]).controller('modalForgotPassword', function ($scope, $modal, $log,$http) {

  $scope.open = function () {
  	
    var modalInstance = $modal.open({
      		templateUrl: 'modalForgotPassword.html',
      		controller: 'ModalInstanceForgotPassword',
      		size: 200,
      		resolve: {
        		datosInfluencer: function () {
          			//return $scope.datosInfluencer;
        		}
      		}
    	});

    modalInstance.result.then(function (data) {	  
	  $scope.$emit('respuestaPassword', data);
    }, function () {
	console.log('Modal dismissed at: ' + new Date());
    });
  };
  

  
})
.controller('ModalInstanceForgotPassword',function ($scope, $modalInstance,$http) {
		$scope.askForPasswordReset = function() {
			var usuario={
				'username':this.username
			};
			console.log(this.username);
			$scope.success = $scope.error = null;
			$http.post('/auth/forgot', usuario).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				//$scope.success = response.message;
				$scope.ok(response.message);
				//$location.path('/password/message');

			}).error(function(response) {
				// Show user error message and clear form
				$scope.tieneError=true;
				$scope.credentials = null;
				$scope.error = response.message;
			});
		}; 

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.ok = function (req) {
    $modalInstance.close(req);
  };

});



