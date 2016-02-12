'use strict';

// Themes controller
angular.module('themes')

/*directiva para agregar autofocus a un elemento*/
.directive('autofocus', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link : function($scope, $element) {
      $timeout(function() {
        $element[0].focus();
      });
    }
  };
}])
/*directiva para agregar autofocus a un elemento*/
.controller('ThemesController', ['$scope', '$stateParams','$http', '$resource','$timeout','$location', 'Authentication', 'Themes',
	function($scope, $stateParams, $http, $resource,$timeout, $location, Authentication, Themes ) {
		$scope.authentication = Authentication;
	    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
		}	
		/*si no esta logueado en face*/
		//Scope inicial de los subtemas, se encuentra vacia debido a que no se ha seleccionado ningun tema aun.
		$scope.subtemasPagina = [];

		//Scopes que ayudaran a saber cual es el tema y subtema actual seleccionado
		$scope.temaEscogido = '';
		$scope.subtemaEscogido = '';
		$scope.resTemas = '';
		$scope.resSubtemas = '';
		$scope.MuestraTemas = '';

		//Scope que sirve paras obtener todos los temas Actuales de la cuenta que se tenga seleccionada
		$scope.getTemas = function(){
			var cuenta = $scope.authentication.user.cuenta.marca;
			// console.log('Entro aqui');
			$http.post('/getTemasPantalla/', {cuenta : cuenta}).success(function(data){
				$scope.temasActuales = data;   
    		});
		};

		//Scope que obtiene los subtemas dependiendo el tema seleccinado
		$scope.obtenerSubtemas=function(temaAhora,idTemaAhora){
			$scope.idtemaSeleccionado = idTemaAhora;	
			//Variables que sirven para ocultar el div de agregar tema.
			$scope.muestraDivAddTema = false;
			$scope.tema_nuevo = '';
			$scope.mensajeTema = '';
			//Fin variables agregar tema
			$scope.muestraDivRes = false;
			$scope.muestraDivAddSub = false;
			$scope.mensajeRespuesta = '';
			$scope.subtema_nuevo = '';
			$scope.mensajeSubtema = '';	
			$scope.obtieneResTemas(temaAhora);
  			$scope.temaEscogido = temaAhora;
  			var temaSeleccionado = temaAhora;
  			var cuenta = $scope.authentication.user.cuenta.marca;
			$http.post('/getSubtemasPantalla/', {tema : temaAhora, cuenta : cuenta}).success(function(data){
				var subtemas = [];
				for(var j in data){
  					subtemas[j] = {'idSubtema':data[j].idSubtema,'nombre':data[j].subtema};
  				}
  				$scope.subtemasPagina = subtemas;
    		});
		};

		//Funcion que sirve para obtener las respuestas que se han asignado a los temas
		$scope.obtieneResTemas = function(tema){
			var cuenta = $scope.authentication.user.cuenta.marca;
			$http.post('/getResTemas/', {temaActual : tema, cuenta : cuenta}).success(function(data){
				$scope.resTemas = data;
				$scope.MuestraTemas = data;
				$scope.subtemaEscogido = '';
    		});
		};

		//Funcion que sirve para obtener las repuestas que se han asignado a los subtemas
		$scope.obtieneResSubtemas = function(otraVariable){
			$scope.mensajeRespuesta = '';			
			$scope.muestraDivRes = false;
			$scope.muestraDivAddSub = false;		
			$scope.subtemaEscogido = '';
			$scope.subtemaEscogido = otraVariable;
			var temaEscogido = $scope.temaEscogido;
			var cuenta = $scope.authentication.user.cuenta.marca;
			$http.post('/getResSubtemas', {temaActual : temaEscogido, subtemaActual : otraVariable, cuenta : cuenta}).success(function(data){
				if(data.length===0){
			    	// $scope.MuestraTemas=$scope.resTemas;
					$scope.MuestraTemas = '';
				}
				else{
					$scope.MuestraTemas = data;
				}
    		});
		};

		//Variable que mantiene oculto el div de agregar respuesta
		$scope.muestraDivRes = false;

		//Funcion que muestra el div para agregar una respuesta
		$scope.showResponse = function(){
			$scope.muestraDivRes = true;
			$scope.respuesta = '';
			$scope.mensajeRespuesta = '';	
		};

		//Funcion que oculta el div para agregar una respuesta
		$scope.hideResponse = function(){
			$scope.muestraDivRes = false;
			$scope.respuesta = '';
			$scope.mensajeRespuesta = '';
		};

		//Variable que mantiene oculto el div de agregar respuesta
		$scope.muestraDivAddSub = false;

		//Funcion que muestra el div para agregar una respuesta
		$scope.showAddSub = function(){
			$scope.muestraDivAddSub = true;
			$scope.subtema_nuevo = '';
			$scope.mensajeSubtema = '';	
		};
	
		//Funcion que oculta el div para agregar una respuesta
		$scope.hideAddSub = function(){
			$scope.muestraDivAddSub = false;
			$scope.subtema_nuevo = '';
			$scope.mensajeSubtema = '';
		};

		//Variable que mantiene oculto el div de agregar tema
		$scope.muestraDivAddTema = false;

		//Funcion que muestra el div para agregar un tema
		$scope.showAddTema = function(){
			$scope.muestraDivAddTema = true;
			$scope.tema_nuevo = '';
			$scope.mensajeTema = '';	
		};
	
		//Funcion que oculta el div para agregar un tema
		$scope.hideAddTema = function(){
			$scope.muestraDivAddTema = false;
			$scope.tema_nuevo = '';
			$scope.mensajeTema = '';
		};

		//Funciones para la edicion de tema, subtema y respuestas
		$scope.showEditTema = function(idCampo){
			var idTema = 'edita_'+this.themesNow._id;
			var ocultaTema = 'ocultaTema_'+this.themesNow._id;
			$scope[ocultaTema] = true;
			$scope[idTema] = true;
			$scope.formData = {};
			$scope.mensajeEdicionTema = '';

			$timeout(function() {
				$(angular.element(document.querySelector('#input_'+idCampo))).focus();
			});	
		};

		$scope.hideEditTema = function(idT){
			var idTema = 'edita_'+idT;
			var ocultaTema = 'ocultaTema_'+idT;
			$scope[ocultaTema] = false;
			$scope[idTema] = false;
			$scope.formData = {};
			$scope.mensajeEdicionTema = '';
		};

		$scope.formData = {};

		$scope.editaTema = function(){
			var idTema = this.themesNow._id;
			var tema = this.themesNow.tema;
			//var cambioTema = $scope.formData[idTema];
			console.log(this);
			var cambioTema = this.edita;
			console.log(cambioTema);
			if(typeof cambioTema==='undefined'){
				cambioTema = '';
			}
			if(cambioTema.length===0){
				$scope.comodin = idTema;	
				$scope.mensajeEdicionTema = 'The entered topic is empty';
			}else{
				var cuenta = $scope.authentication.user.cuenta.marca;
				console.log('POST');
				console.log(tema);
				console.log(cambioTema);
				console.log(idTema);
				console.log(cuenta);
				$http.post('/editaTema', {tema : tema, edicion : cambioTema, idTema : idTema, cuenta : cuenta}).success(function(data){
					//console.log(data);
					if(data===1){
						$scope.comodin = idTema;	
						$scope.mensajeEdicionTema = 'Error en la conexión';
					}else if(data===2){
						$scope.comodin = idTema;			
						$scope.mensajeEdicionTema = 'El tema ya existe';
					}else if(data===3){
						$scope.comodin = idTema;
						$scope.mensajeEdicionTema = 'Error al realizar la actualización';
					}else{
						$scope.temasActuales = data;
						var identificador = 'edita_'+idTema;
						var ocultaTema = 'ocultaTema_'+idTema;
						$scope[ocultaTema] = false;
						$scope[identificador] = false;
						$scope.formData = {};
						$scope.comodin = idTema;
						$scope.mensajeEdicionTema = 'Tema actualizado correctamente';
					}
				});
			}
		};
		
		$scope.showEditSubtema = function(idCampo){
			var idSubtema = 'editaSubtema_'+this.subthemesNow.idSubtema;
			var ocultaSubtema = 'ocultaSubtema_'+this.subthemesNow.idSubtema;
			$scope[ocultaSubtema] = true;
			$scope[idSubtema] = true;
			$scope.mensajeEdicionSubtema = '';
			$scope.textoSubtema = {};
			$timeout(function() {
				$(angular.element(document.querySelector('#input_'+idCampo))).focus();
			});	
		};

		$scope.hideEditSubtema = function(idT){
			var idSubtema = 'editaSubtema_'+idT;
			var ocultaSubtema = 'ocultaSubtema_'+idT;
			$scope[ocultaSubtema] = false;
			$scope[idSubtema] = false;
			$scope.mensajeEdicionSubtema = '';
			$scope.textoSubtema = {};
		};

		$scope.textoSubtema = {};

		$scope.editaSubtema = function(){
			var idTema = $scope.idtemaSeleccionado;
			var idSubtema = this.subthemesNow.idSubtema;
			var tema = $scope.temaEscogido;
			//var cambioSubtema = $scope.textoSubtema[idSubtema];
			var cambioSubtema = this.editasub;
			if(typeof cambioSubtema==='undefined'){
				cambioSubtema = '';
			}
			if(cambioSubtema.length===0){
				$scope.comodinSubtema = idSubtema;
				$scope.mensajeEdicionSubtema = 'El subtema está vacío';
			}else{
				var cuenta = $scope.authentication.user.cuenta.marca;
				$http.post('/editaSubtema', {tema : tema, edicion : cambioSubtema, idTema : idTema, idSubtema : idSubtema, cuenta : cuenta}).success(function(data){
					if(data===1){
						$scope.comodinSubtema = idSubtema;	
						$scope.mensajeEdicionSubtema = 'Error en la conexión';
					}else if(data===2){
						$scope.comodinSubtema = idSubtema;			
						$scope.mensajeEdicionSubtema = 'El subtema ya existe';
					}else if(data===3){
						$scope.comodinSubtema = idSubtema;
						$scope.mensajeEdicionSubtema = 'Error al realizar la actualización';
					}else{
						var subtemas = {};
						for(var j in data){
  							subtemas[j] = {'idSubtema':data[j].idSubtema,'nombre':data[j].subtema};
  						}
						$scope.subtemasPagina = subtemas;
						var identificador = 'editaSubtema_'+idSubtema;
						var ocultaSubtema = 'ocultaSubtema_'+idSubtema;
						$scope[ocultaSubtema] = false;
						$scope[identificador] = false;
						$scope.textoSubtema = {};
						$scope.comodinSubtema = idSubtema;
						$scope.mensajeEdicionSubtema = 'Subtema actualizado correctamente';
					}
				});
			}
		};

		$scope.showRespuestas = function(idCampo){
			var idRespuesta = 'editaRespuesta_'+this.respuestas.idRespuesta;
			var ocultaRes = 'ocultaRespuestas_'+this.respuestas.idRespuesta;
			$scope[ocultaRes] = true;
			$scope[idRespuesta] = true;
			$timeout(function() {
				$(angular.element(document.querySelector('#id_'+idCampo))).focus();
			});
		};

		$scope.hideRespuestas = function(){
			var idRespuesta = 'editaRespuesta_'+this.respuestas.idRespuesta;
			var ocultaRes = 'ocultaRespuestas_'+this.respuestas.idRespuesta;
			$scope[ocultaRes] = false;
			$scope[idRespuesta] = false;
			$scope.textoRespuesta[this.respuestas.idRespuesta] = '';
			$scope.mensajeEdicionRespuesta = '';
		};

		$scope.textoRespuesta = {};

		$scope.editaRespuestas = function(){
			var temaSeleccionado = $scope.temaEscogido;
			var subtemaSeleccionado = $scope.subtemaEscogido;
			//var idTema=$scope.idtemaSeleccionado;
			var idRespuesta = this.respuestas.idRespuesta;
			//var tema=$scope.temaEscogido;
			//var cambioRespuesta = $scope.textoRespuesta[idRespuesta];
			var cambioRespuesta = this.editaresp;
			if(typeof cambioRespuesta==='undefined'){
				cambioRespuesta = '';
			}
			if(cambioRespuesta.length===0){
				$scope.comodinRes = idRespuesta;	
				$scope.mensajeEdicionRespuesta = 'La respuesta ingresada esta vacía';
			}else{
				//console.log(cambioRespuesta);
				var cuenta = $scope.authentication.user.cuenta.marca;
				$http.post('/editaRespuesta', {tema : temaSeleccionado, subtema : subtemaSeleccionado, edicion : cambioRespuesta, idRespuesta : idRespuesta, cuenta : cuenta}).success(function(data){
					if(data===1){
						$scope.comodinRes = idRespuesta;	
						$scope.mensajeEdicionRespuesta = 'Error en la conexión';
					}else if(data===2){
						$scope.comodinRes = idRespuesta;	
						$scope.mensajeEdicionRespuesta = 'La respuesta ya existe';
					}else if(data===3){
						$scope.comodinRes = idRespuesta;	
						$scope.mensajeEdicionRespuesta = 'Error al realizar la actualización';
					}else{
						$scope.MuestraTemas = data;
						var Resp = 'editaRespuesta_'+idRespuesta;
						var ocultaRes = 'ocultaRespuestas_'+idRespuesta;
						$scope[ocultaRes] = false;
						$scope[Resp] = false;
						$scope.textoRespuesta = {};
						$scope.comodinRes = idRespuesta;
						$scope.mensajeEdicionRespuesta = 'Respuesta actualizada correctamente';
					}
				});
			}
		};

		$scope.eliminaRespuesta = function(respuesta){
			var tema = $scope.temaEscogido;
			var subtema = $scope.subtemaEscogido;
			var cuenta = $scope.authentication.user.cuenta.marca;
			$http.post('/eliminaRespuesta', {tema : tema, subtema : subtema, respuesta : respuesta, cuenta : cuenta}).success(function(data){
				$scope.MuestraTemas = data;
				window.alert('Respuesta Eliminada');
			});	
		};

		$scope.$on('agregaThemes', function(event, message){
			var separaArreglo = message.split('||');
			$scope.getTemas();
			$scope.idtemaSeleccionado = '';
			$scope.subtemasPagina = '';
			$scope.respuestas = '';
			$scope.temaEscogido = '';
			$scope.subtemaEscogido = '';
			$scope.resTemas = '';
			$scope.resSubtemas = '';
			$scope.MuestraTemas = '';
			$scope.temaEscogido = separaArreglo[1];
		});

		$scope.$on('agregaSubthemes', function(event, message){
			$scope.obtenerSubtemas(message);
		});	

		$scope.$on('agregaResponse', function(event, message){
			var separaArreglo = message.split('||');
			if(separaArreglo[1]===''){
				$scope.obtieneResTemas(separaArreglo[0]);
			}			
			else if(separaArreglo[1]==='Null'){
				$scope.obtieneResTemas(separaArreglo[0]);
			}
			else{
				$scope.obtieneResSubtemas(separaArreglo[1]);
			}
		});				
	}
]).controller('ModalTema', function ($scope, $modal, $log,$resource,Authentication, Themes) {
	$scope.open = function (opcion) {
  		var opciones = opcion.split('|');
  		if(opciones[0]==='tema'){
  			$scope.agregaTema = true;
  			$scope.agregaSubtema = false;
  			$scope.agregaRespuesta = false;
  			$scope.deleteTema = false;
  			$scope.deleteSubtema = false;
  			$scope.deleteRespuesta = false;		  					
  		}else if(opciones[0]==='subtema'){
  			$scope.agregaTema = false;  		
  			$scope.agregaSubtema = true;
  			$scope.agregaRespuesta = false;
  			$scope.deleteTema = false;
  			$scope.deleteSubtema = false; 		  				
			$scope.deleteRespuesta = false;
  		}else if(opciones[0]==='respuesta'){
  	  		$scope.agregaTema = false;  		
  			$scope.agregaSubtema = false;
  			$scope.agregaRespuesta = true;
  			$scope.deleteTema = false;
  			$scope.deleteSubtema = false;
  			$scope.deleteRespuesta = false;		  				
  		}else if(opciones[0]==='eliminaTema'){
  	  		$scope.agregaTema = false;  		
  			$scope.agregaSubtema = false;
  			$scope.agregaRespuesta = false;  	
  			$scope.deleteTema = true;
  			$scope.deleteSubtema = false;
  			$scope.deleteRespuesta = false;		  					
  		}else if(opciones[0]==='eliminaSubtema'){
   	  		$scope.agregaTema = false;  		
  			$scope.agregaSubtema = false;
  			$scope.agregaRespuesta = false;  	
  			$scope.deleteTema = false; 
  			$scope.deleteSubtema = true;
			$scope.deleteRespuesta = false;	  				
  		}else if(opciones[0]==='eliminaRespuesta'){
   	  		$scope.agregaTema = false;  		
  			$scope.agregaSubtema = false;
  			$scope.agregaRespuesta = false;  	
  			$scope.deleteTema = false; 
  			$scope.deleteSubtema = false;  		
  			$scope.deleteRespuesta = true;
  		}
  		$scope.opcion = opcion;
    	var modalInstance = $modal.open({
      		templateUrl: 'modalTema.html',
      		controller: 'ModalInstanceThemes',
      		size: 150,
      		resolve: {
        		agregaTema: function () {
          			return $scope.agregaTema;
        		},
        		agregaSubtema:function(){
        			return $scope.agregaSubtema;
        			
        		},
        		agregaRespuesta:function(){
        			return $scope.agregaRespuesta;
        		},
        		temaEscogido:function(){
        			return opciones[1];
        		},
        		subtemaEscogido:function(){
        			return opciones[2];
        		},
        		respuestaEliminada:function(){
        			return opciones[3];
        		},
        		deleteTema:function(){
        			return $scope.deleteTema;
        		},
        		deleteSubtema:function(){
        			return $scope.deleteSubtema;
        		},
        		deleteRespuesta:function(){
        			return $scope.deleteRespuesta;
        		}
      		}
    	});

    	modalInstance.result.then(function(data) {
    		var separacion = data.split('|');
    		//console.log(separacion);
    		if(separacion[0]==='tema'){	
    			var concatTemas = separacion[0]+'||'+separacion[3];
	  			$scope.$emit('agregaThemes', concatTemas);
			}else if(separacion[0]==='subtema'){
	  			$scope.$emit('agregaSubthemes', separacion[1]);
			}else if(separacion[0]==='respuesta'){
				var concatena = separacion[1]+'||'+separacion[2];
				$scope.$emit('agregaResponse', concatena);
			}else if(separacion[0]==='eliminaTema'){
				$scope.$emit('agregaThemes', separacion[0]);
			}else if(separacion[0]==='eliminaSubtema'){
				$scope.$emit('agregaSubthemes', separacion[1]);
			}else if(separacion[0]==='eliminaRespuesta'){
				var concatenacion = separacion[1]+'||'+separacion[2];
				$scope.$emit('agregaResponse', concatenacion);
			}		
    	}, function () {
      		$log.info('Modal dismissed at: ' + new Date());
    	});
  	};
}).controller('ModalInstanceThemes',function ($scope, $modalInstance,agregaTema,agregaSubtema,agregaRespuesta,temaEscogido,subtemaEscogido,respuestaEliminada,deleteTema,deleteSubtema,deleteRespuesta,$resource,$http,Accounts,Authentication,Themes, Socket) {
	$scope.temaEscogido = temaEscogido;
  	$scope.deleteTema = deleteTema;
  	$scope.deleteSubtema = deleteSubtema;
  	$scope.deleteRespuesta = deleteRespuesta;
  	$scope.respuestaEliminada = respuestaEliminada;
  	$scope.subtemaEscogido = subtemaEscogido;
  	$scope.seleccionTema = agregaTema;
  	$scope.seleccionSubtema = agregaSubtema;
  	$scope.seleccionRespuesta = agregaRespuesta;
  	$scope.authentication = Authentication;
 
  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};
 
  	$scope.ok = function (opcion,datos,subtema,seleccion) {
		var concatenacion = '';
		if(subtema!==''){
			concatenacion = opcion+'|'+datos+'|'+subtema;
		}else{
			concatenacion = opcion+'|'+datos+'|'+'|'+seleccion;
		}
   	 	$modalInstance.close(concatenacion);
  	};

	$scope.agregarTema = function(){
		var temaNuevo = $scope.tema_nuevo;
		if(typeof temaNuevo==='undefined'){
			temaNuevo = '';
		}
		temaNuevo = temaNuevo.trim();
		if(temaNuevo.length===0){
			$scope.mensajeTema = 'El tema ingresado esta vacío';
		}else{
			var cuenta = $scope.authentication.user.cuenta.marca;
  			$http.post('/agregaTema', {tema : temaNuevo, cuenta : cuenta}).success(function(data){
  				if(data===1){
					$scope.mensajeTema = 'No se conectó a la base de datos';
  				}else if(data===2){
					$scope.mensajeTema = 'Error en la búsqueda de la base de datos';
  				}else if(data===3){
  					$scope.mensajeTema = 'El tema ingresado ya existe';
  				}else if(data===4){
					$scope.mensajeTema = 'Error al añadir el tema';
  				}else{
  					Socket.emit('actualizaTemasServer', $scope.authentication.user.cuenta.marca);
  					$scope.ok('tema',data,'',temaNuevo);
  				}
  			});
		}
  	};

	$scope.eliminaTema = function(){
		var temaEliminar = $scope.temaEscogido;
		if(typeof temaEliminar==='undefined'){
			temaEliminar = '';
		}
		if(temaEliminar.length>0){
			var cuenta = $scope.authentication.user.cuenta.marca;
			$http.post('/eliminaTema', {tema : temaEliminar, cuenta : cuenta}).success(function(data){
				//console.log(data);
				Socket.emit('actualizaTemasServer', $scope.authentication.user.cuenta.marca);
				$scope.ok('eliminaTema',data);
			});
		}
	};

  	$scope.agregarSubtema = function(req, res){
  		var temaActual = $scope.temaEscogido;
  		var subtemaNuevo = $scope.subtema_nuevo;
  		if($scope.temaEscogido.length===0){
  			//$scope.mensajeSubtema = 'Null';
			$scope.mensajeSubtema = 'Por favor seleccione un tema antes de agregar un subtema';
  		}else{
  			var newSubtema = $scope.subtema_nuevo;
			if(typeof newSubtema==='undefined'){
				newSubtema = '';
			}
			newSubtema.trim();
			if(newSubtema.length===0){
            	$scope.mensajeSubtema = 'El subtema ingresado esta vacío';
             	//console.log('El subtema ingresado está vacío');
			}else{
				var cuenta = $scope.authentication.user.cuenta.marca;
				$http.post('/agregaSubtema',{tema : temaActual, subtema_nuevo : subtemaNuevo, cuenta : cuenta}).success(function(data){
					if(data===1){
						$scope.mensajeSubtema = 'Error en la conexión';
					}else if(data===2){
						$scope.mensajeSubtema = 'El subtema ya existe';
					}else if(data===3){
						$scope.mensajeSubtema = 'Error al realizar la actualización';
					}else{
						var subtemas = {};
						for(var j in data){
  							subtemas[j] = {'idSubtema':data[j].idSubtema,'nombre':data[j].subtema};
  						}
  						Socket.emit('actualizaTemasServer', $scope.authentication.user.cuenta.marca);
  						$scope.ok('subtema',temaActual);
					}
  				});
			}
		}
	};

	$scope.eliminaSubtema=function(){
		var tema = $scope.temaEscogido;
		var subtema = $scope.subtemaEscogido;
		if(tema.length===0){
			console.log('No se ha seleccionado ningun tema');
		}else{
			if(subtema.length===0){
				console.log('No se ha seleccionado ningun subtema');
			}else{
				var cuenta = $scope.authentication.user.cuenta.marca;
				$http.post('/eliminaSubtema', {tema : tema, subtema : subtema, cuenta : cuenta}).success(function(data){
					$scope.ok('eliminaSubtema',tema);
					Socket.emit('actualizaTemasServer', $scope.authentication.user.cuenta.marca);
				});
			}
		}
	};

	//Funcion que sirve para añadir la respuesta a algun tema o subtema
	$scope.agregarRespuesta=function(){
		var tema = '';
		var subtema = '';
		if($scope.temaEscogido.length===0){
			tema = 'Null';
			//console.log('No ha seleccionado el tema');
		}else{
			tema = $scope.temaEscogido;
			//console.log('El tema: '+tema);
		}
		if($scope.subtemaEscogido.length===0){
			subtema = 'Null';
			//console.log('No se ha seleccionado subtema');
		}else{
			subtema = $scope.subtemaEscogido;
			//console.log('El subtema: '+subtema);
		}
		if(typeof $scope.respuesta==='undefined'){ 
			$scope.respuesta = '';
		}
		var response = $scope.respuesta.trim();
		//console.log(response);
		if(response.length===0){
			$scope.mensajeRespuesta = 'No answer to add';
			//console.log('No hay respuesta para añadir');
		}else{
			if($scope.temaEscogido===''){
				$scope.mensajeRespuesta = 'Please select a Topic and a Subtopic before creating an Answer';
			}else{
				//console.log('Lo agregara');
				$http.post('/insertRespuesta', {tema:tema,subtema:subtema,respuesta:response,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
					/* Casos para las respuestas:
						1.- La respuesta ingresada ya existe en la base de datos
						2.- no se ha seleccionado ningun tema, y se trata de añadir una respuesta
					*/
        			if(data===1){
						$scope.mensajeRespuesta = 'The answer already exists';
						$scope.respuesta = '';
					}else if(data===2){
						$scope.mensajeRespuesta = 'Is not selected topic to assign the answer';
						$scope.respuesta = '';
					}else if(data===3){
						$scope.mensajeRespuesta = 'There was an error adding response';
						$scope.respuesta = '';
					}else{
						//$scope.MuestraTemas=data;
						$scope.mensajeRespuesta = 'The response has been added';
						$scope.ok('respuesta',$scope.temaEscogido,$scope.subtemaEscogido);
						//$scope.respuesta='';
					}
        		});
			}
		}
	};

	$scope.eliminaRespuesta = function(){
		var tema = $scope.temaEscogido;
		var subtema = $scope.subtemaEscogido;
		var respuesta = $scope.respuestaEliminada;
		var cuenta = $scope.authentication.user.cuenta.marca;
		$http.post('/eliminaRespuesta', {tema : tema, subtema : subtema, respuesta : respuesta, cuenta : cuenta}).success(function(data){
			if(subtema.length===0){
				subtema = 'Null';
			}
			$scope.ok('eliminaRespuesta',tema,subtema);
		});
	};
});
