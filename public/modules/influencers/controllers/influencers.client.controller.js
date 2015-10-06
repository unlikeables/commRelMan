'use strict';
// Influencers controller
angular.module('influencers')
.controller('InfluencersController', ['$scope', '$stateParams','$http', '$resource', '$location', 'Authentication', 'Influencers',
	function($scope, $stateParams,$http, $resource, $location, Authentication, Influencers ) {
		$scope.authentication = Authentication;
	    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
		}	
		/*si no esta logueado en face*/		
		$scope.imagen = function(){};
		
		/*$scope.listaIndustry = ['Advertising & Marketing','Arts & Entertainment','Auto','Business','Computers & Consumer Electronics',
		'Consumer Packaged Goods','Dating','Family & Parenting','Financial Services','Fitness & Weightloss','Food & Drink','Gaming',
		'Hobbies / Interests','Home & Garden','Jobs & Education','Law, Government & Politics','Media','Non-profit','Gifts & Occasions',
		'Pets','Pharma & Healthcare','Real Estate','Religion & Spirituality','Retail','Software','Style, Fashion & Beauty','Telecom',
		'Travel','Sports','Other'
		];*/
		
		$scope.listaIndustry = [
		'Anuncios & Marketing','Artes & Entretenimiento','Auto','Negocios','Computadoras & Electronicos','Bienes de consumo envasados','Citas',
		'Familia y Maternidad','Servicios Financieros','Fitness & Perdida de peso','Comida & Bebidas','Juegos','Hobbies / Intereses','Casa & Jardin',
		'Trabajos & Educación','Ley, Gobierno & Politicas','Media','Sin fines de lucro','Regalos','Mascotas','Farmaceutica & Cuidado de la Salud',
		'Real Estate','Religion & Espiritualidad','Retail','Software','Estilo, Moda & Belleza','Telecomunicaciones','Viajes','Deportes'
		];

		$scope.listaIndustry.sort();
		$scope.listaIndustry.push('Otro');

		//Variables para usar
		$scope.formInfluencer=false;

		//Funcion para agregar un nuevo influencer
		$scope.muestraFormInfluencer=function(){
			$scope.formInfluencer=true;
		};

		$scope.ocultaFormInfluencer=function(){
			$scope.formInfluencer=false;
		};

		$scope.getInfluencers=function(){	
			$http.post('/getInfluencer/', {cuenta:$scope.authentication.user.cuenta.marca}).success(function(data, status, headers, config){
				$scope.influencers=data;
				$scope.descripcion=data[0].descripcion;
				$scope.nombreCompleto=data[0].nombre+' '+data[0].apellidos;
				$scope.categoria=data[0].categoria;
				$scope.idInf=data[0].idUser;
				$scope.username=data[0].username;
				$scope.nombre=data[0].nombre;
				$scope.apellido=data[0].apellidos;
				$scope.imagen_influencer = data[0].imagen_influencer;		
			});
		};

		$scope.recibeID=function(idInfluencer){
			$scope.idSeleccionado=idInfluencer;
		};

		$scope.activaForm=function(infoUsuario) {
			if($scope.authentication.user.roles[0]!== 'community-manager' && $scope.authentication.user.roles[0]!=='directivo'){
				$scope.idEdicion=infoUsuario;
			}else{
				console.log($scope.authentication.user.roles[0]+' no tiene permisos');
			}
		};

		$scope.desactivaForm=function(){
			$scope.idEdicion='';
		};

		$scope.informacionInfluencer=function(infoInfluencer){
			$scope.descripcion=infoInfluencer.descripcion;
			$scope.nombreCompleto=infoInfluencer.nombre+' '+infoInfluencer.apellidos;
			$scope.categoria=infoInfluencer.categoria;
			$scope.idInf=infoInfluencer.idUser;
			$scope.username=infoInfluencer.username;
			$scope.nombre=infoInfluencer.nombre;
			$scope.apellido=infoInfluencer.apellidos;
			$scope.imagen_influencer = infoInfluencer.imagen_influencer;
		};

	    $scope.guardaDatos=function() {
  			var idInfluencer=$scope.idInf;
  			var nombre=$scope.nombre;
  			var apellido=$scope.apellido;
  			var categoria=$scope.categoria;
  			var username=$scope.username;
  			var descripcion=$scope.descripcion;
			$http.post('/updateInfluencer/', {cuenta:$scope.authentication.user.cuenta.marca,idInfluencer:idInfluencer,nombre:nombre,categoria:categoria,username:username,apellido:apellido,descripcion:descripcion}).success(function(data){
				$scope.influencers=data;
			    $scope.idEdicion='';
			    //$scope.ok(data);
			});
  	    };

		$scope.guardaInfluencer=function(){
			var nombreInfluencer=$scope.nombre;
			var apellidoInfluencer=$scope.apellido;
			var descripcionInfluencer=$scope.descripcion;
			var categoriaInfluencer=$scope.categoria;
			var usernameInfluencer=$scope.username;
			var error=0;
			$scope.mensajeErrores = '';
			//console.log(descripcionInfluencer);
			//Validaciones para eliminar la excepcion cuando estan vacios
			if(typeof nombreInfluencer==='undefined'){
				nombreInfluencer='';
			}
			if(typeof apellidoInfluencer==='undefined'){
				apellidoInfluencer='';
			}
			if(typeof categoriaInfluencer==='undefined'){
				categoriaInfluencer='';
			}
			if(typeof descripcionInfluencer==='undefined'){
				descripcionInfluencer='';
			}
			if(typeof usernameInfluencer==='undefined'){
				usernameInfluencer='';
			}

			//Validaciones para revisar que todo este correctamente completo
			if(nombreInfluencer.length===0){
				$scope.errorNombre='Por favor llene el campo NOMBRE';
				error++;
			}else{
				$scope.errorNombre='';	
			}	

			if(apellidoInfluencer.length===0){
				$scope.errorApellido='Por favor llene el campo APELLIDOS';
				error++;
			}else{
				$scope.errorApellido='';	
			}
		
			if(categoriaInfluencer.length===0 || categoriaInfluencer==='#'){
				$scope.errorCategoria='Por favor seleccione una CATEGORÍA';
				error++;
			}else{
				$scope.errorCategoria='';
			}
		
			if(usernameInfluencer.length===0){
				$scope.errorUsername='Por favor llene el USERNAME';
				error++;
			}else{
				$scope.errorUsername='';
			}
		
			if(error!==0){
				$scope.mensajeErrores = 'Favor de llenar los campos requeridos';
				//window.alert('Favor de revisar los errores');
			}else{
				var nombreUsuario=usernameInfluencer.replace('@','');
				$scope.muestraBarra=true;
				//,descripcion:descripcionInfluencer
				$http.post('/addInfluencer/', {apellido:apellidoInfluencer,nombre:nombreInfluencer,categoria:categoriaInfluencer,username:nombreUsuario,cuenta:$scope.authentication.user.cuenta.marca,descripcion:descripcionInfluencer}).success(function(data, status, headers, config){
					//console.log(data);
					if(data===1){
						window.alert('El usuario de twitter no existe');
						//$scope.muestraBarra='';
					}
					else if(data===2){
						window.alert('Ocurrió un error al validar la información');
						//$scope.muestraBarra='';
					}  
					else if(data===3){
						window.alert('Ocurrió un error al agregar el influencer');
						//$scope.muestraBarra='';
					}

					else if(data===5){
						window.alert('El influencer ya existe');
						//$scope.muestraBarra='';
					}
					else{
						//window.alert('Influencer agregado correctamente');
						//$scope.influencers=data;
 		 				$scope.$emit('someEvent', data);
 		 				$scope.muestraBarra=false;
					}
    			});			
			}
		};

		$scope.$on('informacionInfluencers', function(event, message){
			$scope.influencers=message;
			$scope.descripcion='';
			$scope.nombreCompleto='';
			$scope.categoria='';
			$scope.idInf='';
			$scope.username='';
			$scope.nombre='';
			$scope.apellido='';			
		});
	}]).controller('ModalInfluencers', function ($scope, $modal, $log,$resource,Authentication, Influencers) {

  		$scope.open = function (idInfluencer) {
  			$scope.idInfluencer=idInfluencer;
    		var modalInstance = $modal.open({
      			templateUrl: 'modalInfluencers.html',
      			controller: 'ModalInstanceInfluencers',
      			size: 150,
      			resolve: {
        			idInfluencer: function () {
          				return $scope.idInfluencer;
        			}
      			}
    		});
    		modalInstance.result.then(function (data) {	  
		 		$scope.$emit('informacionInfluencers', data);
    		}, function () {
      			$log.info('Modal dismissed at: ' + new Date());
    		});
  		};
  
		$scope.openNuevo = function (idInfluencer) {
  			$scope.idInfluencer=idInfluencer;
    		var modalInstance = $modal.open({
      			templateUrl: 'nuevoInfluencers.html',
      			controller: 'ModalInstanceInfluencers',
      			size: 150,
      			resolve: {
        			idInfluencer: function () {
          				return $scope.idInfluencer;
        			}
      			}
    		});
    		modalInstance.result.then(function (data) {	  
	  			$scope.$emit('informacionInfluencers', data);
    		}, function () {
      			$log.info('Modal dismissed at: ' + new Date());
    		});
  		}; 
	}).controller('ModalInstanceInfluencers',function (idInfluencer,$scope, $modalInstance,$resource,$http,Accounts,Authentication,Influencers) {

		/*$scope.listaIndustry = ['Advertising & Marketing','Arts & Entertainment','Auto','Business','Computers & Consumer Electronics',
		'Consumer Packaged Goods','Dating','Family & Parenting','Financial Services','Fitness & Weightloss','Food & Drink','Gaming',
		'Hobbies / Interests','Home & Garden','Jobs & Education','Law, Government & Politics','Media','Non-profit','Gifts & Occasions',
		'Pets','Pharma & Healthcare','Real Estate','Religion & Spirituality','Retail','Software','Style, Fashion & Beauty','Telecom',
		'Travel','Sports','Other'
		];*/
		
		$scope.listaIndustry = [
		'Anuncios & Marketing','Artes & Entretenimiento','Auto','Negocios','Computadoras & Electronicos','Bienes de consumo envasados','Citas',
		'Familia y Maternidad','Servicios Financieros','Fitness & Perdida de peso','Comida & Bebidas','Juegos','Hobbies / Intereses','Casa & Jardin',
		'Trabajos & Educación','Ley, Gobierno & Politicas','Media','Sin fines de lucro','Regalos','Mascotas','Farmaceutica & Cuidado de la Salud',
		'Real Estate','Religion & Espiritualidad','Retail','Software','Estilo, Moda & Belleza','Telecomunicaciones','Viajes','Deportes'
		];

		$scope.listaIndustry.sort();
		$scope.listaIndustry.push('Otro');	 

    	//Scope que sirve para cerrar el modal, y actualizar la informacion
    	$scope.$on('someEvent', function(event, args) {
    		$modalInstance.close(args);
    	});
    	$scope.idInfluencer=idInfluencer;

  		$scope.eliminaInfluencer=function(){
			$http.post('/deleteInfluencer/', {cuenta:$scope.authentication.user.cuenta.marca,idInfluencer:$scope.idInfluencer}).success(function(data, status, headers, config){
				$scope.ok(data);
				//$scope.influencers=data;
			});
		};
  
  		$scope.authentication = Authentication;

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};

  		$scope.ok = function (req) {
    		$modalInstance.close(req);
  		};
});