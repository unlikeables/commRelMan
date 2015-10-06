'use strict';
angular
    .module('users')
    
/*ESTA DIRECTIVA ES PARA ASEGURAR QUE LA IMAGEN DE FONDO EXISTA*/    

.directive('backImg', function($http) {
	return function(scope, element, attrs) {
		var url = attrs.backImg;
		var imagenDefecto = 'data:image/png;base64,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';
		$http.get(url).success(function(data, status, headers, config) {
			element.css({
				'background-image' : 'url(' + url + ')',
				'background-size' : 'cover'
			});
		}).error(function(data, status, headers, config) {
			element.css({
				'background-image' : 'url(' + imagenDefecto + ')',
				'background-size' : 'cover'
			});
		});
	};
})
/*ESTA DIRECTIVA ES PARA ASEGURAR QUE LA IMAGEN DE FONDO EXISTA*/ 
.controller('SettingsController', ['$scope', '$stateParams', '$http', '$resource', '$location', 'Users', 'Lista', 'Authentication', 'Cuenta', 'Listabycuenta',
	function($scope,$stateParams,$http,$resource,$location,Users,Lista,Authentication,Cuenta,Listabycuenta) {
	$scope.authentication = Authentication;
	var tieneSesion=$scope.authentication.user.hasOwnProperty('_id');
	if(tieneSesion===false){
		$location.path('/');
	}


	    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook2 = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook2 = true;	
		}	
		/*si no esta logueado en face*/
			
	//imagen por defecto
	$scope.imagenDefecto = 'data:image/png;base64,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';
	// rellenamos el usuario
	$scope.user = Authentication.user;
	// obtenemos las cuentas

	
	
	Cuenta.query(function(){}).$promise.then(function(data){ 
		$scope.cuentas = data;
	});

	// generamos la variable de roles para el alta de usuarios

	switch($scope.user.roles[0]){
		case 'app-manager':
		    $scope.losroles = [
				{name:'App Manager', value:'app-manager'},
				{name:'Account Manager', value:'account-manager'},
				{name:'Community Manager',value:'community-manager'},
				{name:'Directivo',value:'directivo'}
		    ];
		break;
		case 'account-manager':
		    $scope.losroles = [
				{name:'Account Manager', value:'account-manager'},
				{name:'Community Manager',value:'community-manager'},
				{name:'Directivo',value:'directivo'}
		    ];
		break; 
		default:
		    $scope.losroles = null;		
		break;
	}

	// vaciamos la variable editeduser
	$scope.editeduser = {};	
	
	$scope.solicitaNameCuenta=function(idCuenta) {
		$http.post('/nombreCuenta/', {idCuenta:idCuenta}).success(function(data, status, headers, config){	
			var variable=data.replace(/"/g,'');
			$scope.marcaCuenta=variable;
   		});	
	};
		
	//Lista cuentas
	$scope.listAccounts=function(){
		$http.post('/listAccounts/', {}).success(function(data, status, headers, config){
			if(data===0){
				console.log('Ha ocurrido un error con la carga de cuentas');
			}else{
				var imagenDefecto = 'data:image/png;base64,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';
				var cuentas = [];
		    	for(var i = 0; i < data.length; i++){
		    		cuentas[i] = data[i];	    			
		    		if(data[i].imagen_src === '' || typeof data[i].imagen_src === 'undefined'){
		   				cuentas[i].imagen_src = imagenDefecto;	
		   			}
		 		}
		    	var byName = cuentas.slice(0);
				byName.sort(function(a,b) {
    				var x = a.marca.toLowerCase();
    				var y = b.marca.toLowerCase();
    				return x < y ? -1 : x > y ? 1 : 0;
				});				
				$scope.cuentasTeam=byName;
			}
    	});			
	};

	$scope.usuariosTeam=function(idCuenta,nombreCuenta){
		$scope.idCuentaSelect=idCuenta;
		$scope.nombreCuentadefault=nombreCuenta;
		$http.post('/listadoEquipo/', {cuenta:nombreCuenta,idCuenta:idCuenta}).success(function(data){
			$scope.usersbyaccount = data;
    	});				
		$scope.imagenPerfil='';
		$scope.idUsuario='';
		$scope.nombreCompleto='';
		$scope.nombreUsuario='';
		$scope.apellidosUsuario='';
		$scope.correoUsuario='';
		$scope.rolUsuario='';
		$scope.nicknameUsuario='';
		$scope.mensajeActualizacion='';
	};

	// creamos un usuario
	$scope.create = function() {
		var cuentaid = this.cuenta._id; //['_id'];
		var obj_cuenta = {};
		var nombre = this.firstName, apellido = this.lastName, completo = this.firstName+' '+this.lastName, 
		correo= this.email, login = this.username, passwd = this.password, elrol = this.rol;
		$resource('/marca/:marcaId', {marcaId: '@id'})
		.get({marcaId:cuentaid}, function(data){
			obj_cuenta = {'_id':data._id, 'marca':data.marca};
		}).$promise.then(function() {
			var user = new Lista ({
				firstName: nombre,
				lastName: apellido,
				displayName: completo,
				email: correo,
				username: login,
				password: passwd,
				provider: 'local',
				roles: elrol,
				cuenta: obj_cuenta
			});
			user.$save(function(response) {
				$location.path('equipo/');
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				//console.log($scope.error);
		    });	      
		});
	};

	$scope.activaForm=function(infoUsuario) {
		if($scope.user.roles[0]!== 'community-manager' && $scope.user.roles[0]!=='directivo'){
			$scope.idEdicion=infoUsuario;
		}
	};

	$scope.desactivaForm=function(){
		$scope.idEdicion='';
	};

	$scope.updateProfile=function(idUsuario){
		var nombre=$scope.nombreUsuario;
  		var apellidos=$scope.apellidosUsuario;
  		var rol=$scope.rolUsuario;
 		var email=$scope.correoUsuario;
  		var nickname=$scope.nicknameUsuario;
  		var notificaciones = $scope.enable_notifications;
  		console.log('Updeteando profile');
  		console.log($scope.enable_notifications);
		$http.post('/actualizaPerfil/', {nombre:nombre,apellido:apellidos,correo:email,rol:rol,idUsuario:idUsuario,nickname:nickname, notificaciones:$scope.enable_notifications}).success(function(data){
			if(data===0){
				$scope.mensajeActualizacion='Ha ocurrido un error al actualizar';
			}
			else{
				delete data[0].password;
    			delete data[0].salt;
				$scope.mensajeActualizacion='Perfil Actualizado';
				$scope.muestraAct=true;
				Authentication.user=data[0];
				$scope.user = Authentication.user;	
			}
    	});
	};		

	$scope.actualizaUsuarioAdmin=function(){
		var nombreActualizado=$scope.nombreUsuario;
		var apellidoActualizado=$scope.apellidosUsuario;
		var correoActualizado=$scope.correoUsuario;
		var rolActualizado=$scope.rolUsuario;
		var nickActualizado=$scope.nicknameUsuario;
		var idUsuarioActualizado=$scope.idUsuario;
		$http.post('/actualizaEquipo/', {nombre:nombreActualizado,apellido:apellidoActualizado,correo:correoActualizado,rol:rolActualizado,idUsuario:$scope.idUsuario,nickname:nickActualizado}).success(function(data){
			if(data===0){
				$scope.mensajeActualizacion='Ocurrio un error al eliminar el usuario';
			}else if(data===1){
				$scope.mensajeActualizacion='Usuario Actualizado';
				$scope.listadoUsuarios();
				$scope.idEdicion='';
			}
   		});
	};

	$scope.actualizaUsuario=function(){
		var nombreActualizado=$scope.nombreUsuario;
		var apellidoActualizado=$scope.apellidosUsuario;
		var correoActualizado=$scope.correoUsuario;
		var rolActualizado=$scope.rolUsuario;
		var nickActualizado=$scope.nicknameUsuario;
		var idUsuarioActualizado=$scope.idUsuario;
		$http.post('/actualizaEquipo/', {nombre:nombreActualizado,apellido:apellidoActualizado,correo:correoActualizado,rol:rolActualizado,idUsuario:$scope.idUsuario,nickname:nickActualizado}).success(function(data, status, headers, config){
			if(data===0){
				$scope.mensajeActualizacion='Ocurrio un error al eliminar el usuario';
			}else if(data===1){
				$scope.mensajeActualizacion='Usuario Actualizado';
				$scope.listadoEquipo();
				$scope.idEdicion='';
			}
		});
	};

	// Update existing Account
	$scope.update = function() {
	    var id_marca = $scope.editeduser.cuenta._id;
	    var obj_cuenta = {};
	    delete $scope.editeduser.password;
	    delete $scope.editeduser.salt;
	    $scope.editeduser.cuenta = {};
	    $resource('/marca/:marcaId', {marcaId: '@id'}).get({marcaId: id_marca}, function(data){
		    obj_cuenta = {'_id':data._id, 'marca':data.nombreSistema};
		}).$promise.then(function() {
		    	$scope.editeduser.cuenta = obj_cuenta;
		    	var usuario = new Users($scope.editeduser);
				usuario.$update(function(){
					$location.path('usuario/' + usuario._id);
				}, function(errorResponse){
					$scope.error = errorResponse.data.message;
				}
			);
		});
	};
		
	// Find existing Accounts
	$scope.findOne = function() {
	    delete $scope.editeduser;
	    $scope.editeduser = {};
	    Lista.get({userId: $stateParams.usuarioID}, function(data) {
			$scope.editeduser = data;
		});
	};
		
	// If user is not signed in then  back home
	if (!$scope.user) $location.path('/');
		
	// Check if there are additional accounts 
	$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
	    for (var i in $scope.user.additionalProvidersData) {
			return true;
   		}
	    return false;
	};
		
	// Check if provider is already in use with current user
	$scope.isConnectedSocialAccount = function(provider) {
	    return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
	};
		
	// Remove a user social account
	$scope.removeUserSocialAccount = function(provider) {
		console.log('removeUserSocialAccount');
	    $scope.success = $scope.error = null;
		$http.delete('/users/accounts', {
			params: {
				provider: provider
			}
		}).success(function(response) {
		    $scope.success = true;
		    $scope.user = Authentication.user = response;
		    $scope.statusLoginFacebook2 = false;
		    console.log('success');
		}).error(function(response) {
			$scope.error = response.message;
			$scope.statusLoginFacebook2 = true;
			console.log('error');
		}); 
		console.log('status facebook');
		console.log($scope.statusLoginFacebook2);
	};
		
	//Obtener la marca de la cuenta
	$scope.getMarca = function(){
	    return Cuenta.query();
	};
		
	// Update a user profile
	$scope.updateUserProfile = function(isValid) {
	    if (isValid){
			$scope.success = $scope.error = null;
			var user = new Users($scope.user);
			user.$update(function(response) {
			    $scope.success = true;
			    Authentication.user = response;
			}, function(response) {
			    $scope.error = response.data.message;
			});
		} else {
			$scope.submitted = true;
		}
	};

	//Funciones que sirven para cargar imagen
	$scope.submit = function(idUsuario){
		//agregamos la clase para mostrar carga
		var elemento1 = angular.element(document.querySelector('#foto-perfil'));
		elemento1.addClass('loader_image');
		var elemento2 = angular.element(document.querySelector('#foto-perfil-lateral'));
		elemento2.addClass('loader_image');
		var idUser=$scope.user._id;
	  	var fd = new FormData();
	  	var f = document.getElementById('file').files[0];
  		fd.append('idUsuario',idUser);
  		//fd.append('idUsuario',idUsuario);
  		fd.append('file',f);
  		fd.append('nombre', $scope.nombre);
  		fd.append('nombre_corto',$scope.nombre_corto);
  		$http.post('/actualizaFoto',fd,{transformRequest:angular.identity,headers:{'Content-Type':undefined}}).success(function(response) {
	  		if(response===1){
	  			$scope.errorImagen='No se pudo cargar la imagen';
	  		}
	  		else if(response===2){
	  			$scope.errorImagen='No se pudo actualizar la imagen';
	  		}
	  		else{
	  			Authentication.user=response[0];
				$scope.user = Authentication.user;
	  			elemento1.removeClass('loader_image');
				elemento2.removeClass('loader_image');
	  		}
		});
  	};
  
  	$scope.cambiaImagen = function(){
  		var f = document.getElementById('file').files[0];
    	var r = new FileReader();
	  	r.onloadend = function(e){
	    	var data = e.target.result;
	    	$scope.image = data;
	    	var fileDisplayArea = document.getElementById('fileDisplayArea');
	    	fileDisplayArea.innerHTML = '';
	    	// Create a new image.
	    	var img = new Image();
	    	// Set the img src property using the data URL.
	    	img.src = r.result;
	    	var aux = r.result;
	    	var image = aux.replace('data:image/jpeg;base64,', '');
   	 		image = image.replace(' ', '+');
	    	fileDisplayArea.appendChild(img);
	    };
  		r.readAsDataURL(f); 
  	};
		
	// Find a list of Accounts
	$scope.find = function() {
		$scope.users = Lista.query();
	};
		
	// Obtiene lista de usuarios de la misma marca que el usuario que está trabajando
	$scope.findByCuenta = function() {
	    Listabycuenta.get({accId: $scope.user.cuenta._id}, function(data) {
		$scope.usersbyaccount = data;
		// setTimeout(function() {//console.log($scope.cuentas);}, 3000);
	    });	
	};

	$scope.listadoEquipo=function(){
		$http.post('/listadoEquipo/', {cuenta:$scope.user.cuenta.marca,idCuenta:$scope.user.cuenta._id}).success(function(data, status, headers, config){
			$scope.usersbyaccount = data;
    	});			
	};

	$scope.listadoUsuarios=function(){
		$http.post('/listadoUsuarios/', {}).success(function(data, status, headers, config){
			$scope.usersbyaccount = data;   
		});			
	};

	$scope.informacionEquipo=function(infoUsuario){
		$scope.idEdicion='';
		$scope.infoUser=infoUsuario;
		$scope.imagenPerfil=infoUsuario.imagen_src;
		if (infoUsuario.imagen_src === '' || typeof infoUsuario.imagen_src === 'undefined') {
			$scope.imagenPerfil = $scope.imagenDefecto;
		} else {
			$http.get($scope.imagenPerfil).success(function(data) {}).error(function(data) {
				$scope.imagenPerfil = $scope.imagenDefecto;
			});
		}
		$scope.idUsuario=infoUsuario._id;
		$scope.nombreCompleto=infoUsuario.firstName+' '+infoUsuario.lastName;
		$scope.nombreUsuario=infoUsuario.firstName;
		$scope.apellidosUsuario=infoUsuario.lastName;
		$scope.correoUsuario=infoUsuario.email;
		$scope.rolUsuario=infoUsuario.roles[0];
		$scope.nicknameUsuario=infoUsuario.username;
		$scope.mensajeActualizacion='';
	};

	// Remove existing Account
	$scope.remove = function() {
	    $scope.user = Lista.remove({ 
			userId: $stateParams.usuarioID
		});
	   $location.path('/settings/list');
	};
		
	// Change user password
	$scope.changeUserPassword = function() {
	    $scope.success = $scope.error = null;
	    $http.post('/users/password', $scope.passwordDetails).success(function(response) {
		    $scope.success = true;
		    $scope.passwordDetails = null;
		}).error(function(response) {
		    $scope.error = response.message;
		});
	};

	$scope.$on('agregaUsuario', function(event, message){
		$scope.usuariosTeam($scope.idCuentaSelect,$scope.nombreCuentadefault);	
		$scope.imagenPerfil='';
		$scope.idUsuario='';
		$scope.nombreCompleto='';
		$scope.nombreUsuario='';
		$scope.apellidosUsuario='';
		$scope.correoUsuario='';
		$scope.rolUsuario='';
		$scope.nicknameUsuario='';
		$scope.mensajeActualizacion='';
	});

	$scope.$on('actualizaUsuarios', function(event, message){
		$scope.usuariosTeam($scope.idCuentaSelect,$scope.nombreCuentadefault);	
	});

	$scope.$on('cambiaPassword', function(event, message){
		$scope.mensajeActualizacion=message;	
	});

	$scope.$on('actualizaUsuario', function(event, message){
		$scope.mensajeActualizacion='Perfil Actualizado';
		Authentication.user=message;
		$scope.user = Authentication.user;
	});
}]).controller('TooltipDemoCtrl', function ($scope) {
	$scope.htmlTooltip = '<a href="">I\'ve been made <b>bold</b>!</a>';
}).controller('ModalEquipo', function ($scope, $modal, $log,$resource,Authentication, Users,Lista) {
	
	    $scope.authentication = Authentication;
	    
	    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
		}	
		/*si no esta logueado en face*/
			
	$scope.open = function (usuario,rolActual,idCuenta,nombreCuenta) {
  		$scope.rolUsuarioActual=rolActual;
  		$scope.idUsuario=usuario._id;
	   	$scope.cuentaDefault=nombreCuenta;
	 	$scope.idCuenta=idCuenta;
    	var modalInstance = $modal.open({
      		templateUrl: 'agregaUsuario.html',
      		controller: 'ModalInstanceEquipo',
      		size: 150,
      		resolve: {
        		cuentaDefault:function(){
        			return $scope.cuentaDefault;
        		},
        		idCuenta:function(){
        			return $scope.idCuenta;
        		},
        		idUsuario:function(){
        			return $scope.idUsuario;
        		},
        		rolDefault:function(){
        			return $scope.rolUsuarioActual;
        		}
      		}
    	});

    	modalInstance.result.then(function(data) {
	  		$scope.$emit('agregaUsuario', data);	
    	}, function () {
    	  $log.info('Modal dismissed at: ' + new Date());
    	});
  	};
 
 	$scope.openEditarContrasena = function (idUsuario) {
  		var modalInstance = $modal.open({
      		templateUrl: 'editarContrasena.html',
      		controller: 'ModalInstancePassword',
      		size: 150,
      		resolve:{
      			idUsuario:function(){
      				return idUsuario;
      			}
      		}
    	});
    	modalInstance.result.then(function(data) {
			$scope.$emit('cambiaPassword', data);	
    	}, function () {
    		$log.info('Modal dismissed at: ' + new Date());
    	});
  	};

    $scope.openFoto = function (idUsuario) {
    	$scope.idUsuario=idUsuario;
    	var modalInstance = $modal.open({
      		templateUrl: 'fotoPerfil.html',
      		controller: 'ModalInstanceFoto',
      		size: 150,
      		resolve:{
      			idUsuario:function(){
      				return idUsuario;
      			}
      		}
    	});

	   	modalInstance.result.then(function(data) {
			delete data[0].password;
	    	delete data[0].salt;
		  	$scope.$emit('actualizaUsuario', data[0]);
		}, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });
  	};  

 	$scope.openEliminacion = function (usuario,rolActual) {
  		$scope.rolUsuarioActual=rolActual;
 		$scope.idUsuario=usuario._id;
  		$scope.cuentaDefault=usuario.cuenta.marca;
 		$scope.idCuenta=usuario.cuenta._id;
    	var modalInstance = $modal.open({
      		templateUrl: 'eliminaUsuario.html',
      		controller: 'ModalInstanceEquipo',
      		size: 150,
      		resolve: {
        		cuentaDefault:function(){
        			return $scope.cuentaDefault;
        		},
        		idCuenta:function(){
        			return $scope.idCuenta;
        		},
        		idUsuario:function(){
        			return $scope.idUsuario;
        		},
        		rolDefault:function(){
        			return $scope.rolUsuarioActual;
        		}
      		}
    	});

    	modalInstance.result.then(function(data) {
    		if(data==='equipo'){
	  			$scope.$emit('agregaUsuario', data);	
    		}
    		else if(data==='borraAdmin'){
	  			$scope.$emit('actualizaUsuarios', data);	    		
    		}
    	}, function () {
      		$log.info('Modal dismissed at: ' + new Date());
    	});
  	};
}).controller('ModalInstanceEquipo',function ($scope, $modalInstance,cuentaDefault,rolDefault,idCuenta,idUsuario,$resource,$http,Accounts,Authentication,Users,Lista) {	
  	$scope.cuentaDefault=cuentaDefault;
  	$scope.idCuenta=idCuenta;
  	$scope.idUsuario=idUsuario;

  	// generamos la variable de roles para el alta de usuarios
	switch(rolDefault){
		case 'app-manager':
		    $scope.losroles = [
				{name:'App Manager', value:'app-manager'},
				{name:'Account Manager', value:'account-manager'},
				{name:'Community Manager',value:'community-manager'},
				{name:'Directivo',value:'directivo'}
		    ];
		break;
		case 'account-manager':
		    $scope.losroles = [
				{name:'Account Manager', value:'account-manager'},
				{name:'Community Manager',value:'community-manager'},
				{name:'Directivo',value:'directivo'}
		    ];
		break; 
		default:
		    $scope.losroles = null;		
		break;
	}

  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(respuesta){
    	$modalInstance.close(respuesta);
  	};

	$scope.createUsuario = function() {
		var cuentaid=$scope.idCuenta;
		var obj_cuenta = {};
		var nombre = this.firstName, apellido = this.lastName, completo = this.firstName+' '+this.lastName, 
			correo= this.email, login = this.username, passwd = this.password, elrol = this.rol;
			////console.log('el rol: '+elrol);
		$resource('/marca/:marcaId', {marcaId: '@id'}).get({marcaId:cuentaid}, function(data){
			//obj_cuenta = {'_id':data._id, 'marca':data.marca};
			obj_cuenta = {'_id':$scope.idCuenta, 'marca':$scope.cuentaDefault};
		}).$promise.then(function() {
			var user = new Lista ({
				firstName: nombre,
				lastName: apellido,
				displayName: completo,
				email: correo,
				username: login,
				password: passwd,
				provider: 'local',
				roles: elrol,
				//cuenta: obj_cuenta
			    cuenta: obj_cuenta
			});
			user.$save(function(response) {
			    $scope.ok('equipo');
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				////console.log($scope.error);
			});	      
		});
	};

	$scope.createUsuarioAdmin = function() {
		var cuentaid=$scope.idCuenta;
		var obj_cuenta = {};
		var nombre = this.firstName, apellido = this.lastName, completo = this.firstName+' '+this.lastName, 
			correo= this.email, login = this.username, passwd = this.password, elrol = this.rol;
			////console.log('el rol: '+elrol);
		$resource('/marca/:marcaId', {marcaId: '@id'}).get({marcaId:cuentaid}, function(data){
			obj_cuenta = {'_id':$scope.idCuenta, 'marca':$scope.cuentaDefault};
		}).$promise.then(function() {
			var user = new Lista ({
				firstName: nombre,
				lastName: apellido,
				displayName: completo,
				email: correo,
				username: login,
				password: passwd,
				provider: 'local',
				roles: elrol,
				//cuenta: obj_cuenta
			    cuenta: obj_cuenta
			});
			user.$save(function(response) {
			    $scope.ok('borraAdmin');
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				//console.log($scope.error);
			});	      
		});
	};		

	$scope.borraUsuario=function(){
		$http.post('/eliminaEquipo/', {cuenta:cuentaDefault,idUsuario:$scope.idUsuario}).success(function(data){
			if(data===0){
				$scope.errorEliminar='An error occurred when deleting the user';
			}else if(data===1){
				$scope.ok('equipo');
			}
    	});	
	};

		$scope.borraUsuarioAdmin=function(){
			$http.post('/eliminaEquipo/', {cuenta:cuentaDefault,idUsuario:$scope.idUsuario}).success(function(data){
				if(data===0){
					$scope.errorEliminar='An error occurred when deleting the user';
				}else if(data===1){
					$scope.ok('borraAdmin');
				}
    		});	
		};		
}).controller('ModalInstancePerfil',function ($scope, datosUsuario,$modalInstance,$resource,$http,Accounts,Authentication,Users,Lista) {
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(respuesta){
    	$modalInstance.close(respuesta);
  	};

  	$scope.updateProfile=function(){
  		var nombre=datosUsuario.nombre;
  		var apellidos=datosUsuario.apellidos;
  		var rol=datosUsuario.rol;
  		var email=datosUsuario.email;
  		var nickname=datosUsuario.nickname;
  		var idUsuario=datosUsuario.idUser;
		$http.post('/actualizaPerfil/', {nombre:nombre,apellido:apellidos,correo:email,rol:rol,idUsuario:idUsuario,nickname:nickname}).success(function(data, status, headers, config){
			if(data==='0'){
				$scope.mensajeActualizacion='An error occurred while updating user data';
			}
			else{
				$scope.ok(data);
			}
    	});
  	};
}).controller('ModalInstancePassword',function (idUsuario,$scope,$modalInstance,$resource,$http,$stateParams,Accounts,Authentication,Users,Lista) {
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(respuesta){
    	$modalInstance.close(respuesta);
  	};

  	$scope.updatePassword=function(){	
  		var textos = {
  			'Please fill out all marked boxes':'Favor de llenar los campos vacíos',
  			'The entered password is too short, please try again':'La contraseña ingresada es muy corta, por favor intente nuevamente',
  			'The current password is incorrect':'La contraseña actual es incorrecta',
  			'The new passwords you entered did not match, please try again':'Las contraseñas no coinciden, por favor intentalo nuevamente',
  			'The password has been successfully updated':'La contraseña se actualizó',
  			'User not found':'Usuario no encontrado',
  			'Please enter a different password':'Ingresa una contraseña distinta',
  			'The user is not logged':'El usuario no esta logueado',
  			'There was an unknown error please try again later':'Error Desconocido'
  			};
  		
  		var passwordActual=$scope.password;
  		var passNuevo=$scope.newPassword;
  		var confirmaPass=$scope.confirmPassword;
  		var passwordDetails ={};
  		passwordDetails.newPassword = passNuevo;
  		passwordDetails.verifyPassword = confirmaPass;
  		passwordDetails.currentPassword = passwordActual;
		$scope.success = $scope.error = null;
		

		$scope.errorValidacion = 0;
		$scope.mensajeValidacion = textos['Please fill out all marked boxes'];
		$scope.passwordActualVacio = false;
		$scope.passwordNuevoVacio1 = false;
		$scope.passwordNuevoVacio2 = false;
				
		if(($scope.password === '') || (typeof $scope.password === 'undefined')){
			$scope.passwordActualVacio = true;
			$scope.errorValidacion++;
		}	

		if(($scope.newPassword === '') || (typeof $scope.newPassword === 'undefined')){
			$scope.passwordNuevoVacio1 = true;
			$scope.errorValidacion++;
		}
			
		if($scope.confirmPassword === '' || (typeof $scope.confirmPassword === 'undefined')){
			$scope.passwordNuevoVacio2 = true;
			$scope.errorValidacion++;
		}	
				
		if($scope.errorValidacion <= 0){//si todos los campos estan llenos
			$http.post('/users/password/', passwordDetails).success(function(response) {
				if(response===1){
					$scope.mensajePassword=textos['The entered password is too short, please try again'];
				}
				else if(response===2){
					$scope.mensajePassword=textos['The current password is incorrect'];
				}
				else if(response===3){
					$scope.mensajePassword=textos['The new passwords you entered did not match, please try again'];
				}
				else if(response===4){
					$scope.mensajePassword=textos['The password has been successfully updated'];
					$scope.ok();
					$scope.passwordDetails = null;
				}
				else if(response===5){
					$scope.mensajePassword=textos['User not found'];
				}
				else if(response===6){
					$scope.mensajePassword=textos['Please enter a different password'];
				}
				else if(response===7){
					$scope.mensajePassword=textos['The user is not logged'];
				}
				else{
					$scope.mensajePassword=textos['There was an unknown error please try again later'];
				}
			});					
		}				
  	};

  	$scope.changePassword=function(){
  		var textos = {
  			'The entered password is too short, please dial another':'La contraseña ingresada es muy corta, por favor intente nuevamente',
  			'The current password is incorrect':'La contraseña actual es incorrecta',
  			'The new passwords you entered did not match, please try again':'Las contraseñas no coinciden, intentalo nuevamente',
  			'The password has been successfully updated':'La contraseña se actualizó',
  			'User not found':'Usuario no encontrado',
  			'Please enter a different password':'Por favor ingresa una contraseña distinta',
  			'The user is not logged':'El usuario no esta logueado',
  			'There was an unknown error please try again later':'Error desconocido, intentalo nuevamente'
  		};
		//var passwordActual=$scope.password;
  		var passNuevo=$scope.newPassword;
  		var confirmaPass=$scope.confirmPassword;
  		var passwordDetails ={};
  		passwordDetails.newPassword = passNuevo;
  		passwordDetails.verifyPassword = confirmaPass;
  		//passwordDetails.currentPassword = passwordActual;
		$scope.success = $scope.error = null;
		$http.post('/users/AdminPassword/', {passwordDetails:passwordDetails,idUsuario:idUsuario}).success(function(response) {
			//console.log(response);
			if(response===1){
				$scope.errorPassword=textos['The entered password is too short, please dial another'];
			}
			else if(response===2){
				$scope.errorPassword=textos['The current password is incorrect'];
			}
			else if(response===3){
				$scope.errorPassword=textos['The new passwords you entered did not match, please try again'];
			}
			else if(response===4){
				$scope.errorPassword=textos['The password has been successfully updated'];
				$scope.ok($scope.errorPassword);
				$scope.passwordDetails = null;
			}
			else if(response===5){
				$scope.errorPassword=textos['User not found'];
			}
			else if(response===6){
				$scope.errorPassword=textos['Please enter a different password'];
			}
			else if(response===7){
				$scope.errorPassword=textos['The user is not logged'];
			}
			else{
				$scope.errorPassword=textos['There was an unknown error please try again later'];
			}
		});
  	};  	
}).controller('ModalInstanceFoto',function (idUsuario,$scope,$modalInstance,$resource,$http,$stateParams,Accounts,Authentication,Users,Lista) {
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(respuesta){
    	$modalInstance.close(respuesta);
  	};

  	$scope.submit = function(req,res){
  		var textos = {
  			'Failed to load image':'Failed to load image',
  			'Could not update image':'Could not update image'
  		};
  		////console.log(idUsuario);
  		var fd = new FormData();
  		var f = document.getElementById('file').files[0];
  		fd.append('idUsuario',idUsuario);
  		fd.append('file',f);
  		fd.append('nombre', $scope.nombre);
  		fd.append('nombre_corto',$scope.nombre_corto);
  		$http.post('/actualizaFoto',fd,{transformRequest:angular.identity,headers:{'Content-Type':undefined}}).success(function(response) {
	  		if(response===1){
	  			$scope.errorImagen=textos['Failed to load image'];
	  		}
	  		else if(response===2){
	  			$scope.errorImagen=textos['Could not update image'];
	  		}
	  		else{
	  			$scope.ok(response);
	  		}
		});
  	};
  
  	$scope.cambiaImagen = function(){
  		var f = document.getElementById('file').files[0];
    	var r = new FileReader();
  		//console.log(f);
  		r.onloadend = function(e){
	    	var data = e.target.result;
	    	$scope.image = data;
	    	var fileDisplayArea = document.getElementById('fileDisplayArea');
	    	fileDisplayArea.innerHTML = '';
	    	// Create a new image.
	    	var img = new Image();
	    	// Set the img src property using the data URL.
	    	img.src = r.result;
	    	var aux = r.result;
	    	var image = aux.replace('data:image/jpeg;base64,', '');
   	 		image = image.replace(' ', '+');
	    	fileDisplayArea.appendChild(img);
	    };
  		r.readAsDataURL(f); 
  	};
});