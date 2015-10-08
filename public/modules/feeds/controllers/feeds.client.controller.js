'use strict';
// Feeds controller


angular.module('feeds')

/*______ _ _ _               ______       _                       _______       _ _   _            
 |  ____(_) | |             |  ____|     | |                     |__   __|     (_) | | |           
 | |__   _| | |_ _ __ ___   | |__   _ __ | | __ _  ___ ___  ___     | |_      ___| |_| |_ ___ _ __ 
 |  __| | | | __| '__/ _ \  |  __| | '_ \| |/ _` |/ __/ _ \/ __|    | \ \ /\ / / | __| __/ _ \ '__|
 | |    | | | |_| | | (_) | | |____| | | | | (_| | (_|  __/\__ \    | |\ V  V /| | |_| ||  __/ |   
 |_|    |_|_|\__|_|  \___/  |______|_| |_|_|\__,_|\___\___||___/    |_| \_/\_/ |_|\__|\__\___|_|   
*/

.filter('etiquetasFecha',['$filter',
    function($filter) {
	return function(text) {

	var hoy = new Date();
	var fechaTwit = new Date(text);
	var html = '';

	if((hoy.getDate()+hoy.getMonth()+hoy.getFullYear()) !== (fechaTwit.getDate()+fechaTwit.getMonth()+fechaTwit.getFullYear())){
	
	html = '<label class="etiqueta-gris izq"  style="margin-left: 5px;" title="'+$filter('date')(fechaTwit, 'h:mm a')+'">'+$filter('date')(fechaTwit, 'd MMM yy')+'</label>';			
	
	
	}else{
		
	html = '<label class="etiqueta-gris izq"  style="margin-left: 5px;">'+$filter('date')(fechaTwit, 'h:mm a')+'</label>';
		
	} 
	
	return html;	

	};
    }
])

.filter('linksTwitter',['$filter', function($filter) {
        return function(text,entities,trackers) {
            if (!text){
            	return text;
           	}
			var replacedText = text;
			
			/*ENTITIES*/
            if (angular.isDefined(entities)) {    
                for(var a in entities.hashtags){
                	replacedText = replacedText.replace('#'+entities.hashtags[a].text, '<a href="https://twitter.com/hashtag/'+entities.hashtags[a].text+'" target="_blank">#'+entities.hashtags[a].text+'</a>');
                }
                
                for(var b in entities.user_mentions) {
                	replacedText = replacedText.replace('@'+entities.user_mentions[b].screen_name, '<a href="https://twitter.com/'+entities.user_mentions[b].screen_name+'" target="_blank">@'+entities.user_mentions[b].screen_name+'</a>');
                }                
                
            }
            /*ENTITIES*/
           
           /*TRACKERS*/
          
           if (angular.isDefined(trackers)) { 
           	for(var t in trackers){
           		var buscar = trackers[t];
           		var reemplazar = new RegExp(buscar, 'gim');
           		replacedText = replacedText.replace(reemplazar, function(e){
           		return '<span class="tracker">'+e+'</span>';	
           		});
           	}           	
           	}
          
          /*TRACKERS*/
           
           
           /*LINKS*/ 
            var patronLink = /(^|\s)(http:\/\/t\.[co\/])(\w*[a-zA-Z_]+\w*)\/(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = replacedText.replace(patronLink, '$1<a href="$2$3/$4" target="_blank" class="link-twitter link-twitter-hastag">$2$3/$4</a>');
            
            
           	var patronLink2 = /(^|\s)(https:\/\/t\.[co\/])(\w*[a-zA-Z_]+\w*)\/(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = replacedText.replace(patronLink2, '$1<a href="$2$3/$4" target="_blank" class="link-twitter link-twitter-hastag">$2$3/$4</a>');
            /*LINKS*/ 
            
            return replacedText;            
            
         
            /*esta es la función del filtro*/ 
        };
    }
])

/*______ _ _ _               ______       _                       _______       _ _   _            
 |  ____(_) | |             |  ____|     | |                     |__   __|     (_) | | |           
 | |__   _| | |_ _ __ ___   | |__   _ __ | | __ _  ___ ___  ___     | |_      ___| |_| |_ ___ _ __ 
 |  __| | | | __| '__/ _ \  |  __| | '_ \| |/ _` |/ __/ _ \/ __|    | \ \ /\ / / | __| __/ _ \ '__|
 | |    | | | |_| | | (_) | | |____| | | | | (_| | (_|  __/\__ \    | |\ V  V /| | |_| ||  __/ |   
 |_|    |_|_|\__|_|  \___/  |______|_| |_|_|\__,_|\___\___||___/    |_| \_/\_/ |_|\__|\__\___|_|   
*/
.filter('facebookLinkComment',['$filter',
    function($filter) {
	return function(text,id_comentario) {

		
		if(text !== ''){
	    var partes = text.split('_');
	    if(typeof id_comentario === 'undefined'){
	    	id_comentario='';
	    }
	    var partes_comentario = id_comentario.split('_');	
	    var url = 'https://www.facebook.com/'+partes[0]+'/posts/'+partes[1]+'?comment_id='+partes_comentario[1];
	    return url;			
		}
		

	};
    }
])
.filter('facebookLinkSubComment',['$filter',
    function($filter) {
	return function(text,id_comentario) {

		
		if(text !== ''){
	    var partes = text.split('_');
	    if(typeof id_comentario === 'undefined'){
	    	id_comentario='';
	    }
	    var partes_comentario = id_comentario.split('_');	
	    var url = 'https://www.facebook.com/'+partes[0]+'/posts/'+partes[1]+'?comment_id='+partes_comentario[1];
	    return url;			
		}
		

	};
    }
])
.filter('facebookLinkPost',['$filter', function($filter) {
	return function(text) {
		if(text !== ''){
	    	var partes = text.split('_');
	    	var url = 'https://www.facebook.com/'+partes[0]+'/posts/'+partes[1];
	    	return url;
        }
    };
}])
.filter('tipoFacebook',['$filter', function($filter) {
	return function(text) {
	    switch(text){
	    	case 'facebook_inbox':
				return 'Inbox';
	    	case 'comment':
				return 'Comment';
	    	case 'post':
				return 'Post';
	    	default:
				return text;
	    }  	
    };
}])
.filter('html5Entities',['$filter',
    function($filter) {
	return function(text) {
		if(text !== ''){
		var texto = text;
		return texto.replace('!!!',''); 	
        }
       };
    }
])

.filter('facebookMentions',['$filter',
    function($filter) {
	return function(text) {
		//if(text !== ''){
		if(text){
 			var replacedText = text;
			var patronHashtag = /(^|\s)\@(\[)(\w*[0-9]+\w*)(:)(\w*[0-9]+\w)(:)(\w*[\sa-z\SA-Z]+\w)(\])/gim;
            replacedText = replacedText.replace(patronHashtag, '$1<a target="_blank" class="link-twitter link-twitter-hastag" href="https://facebook.com/$3">@$7</a>');
            if(replacedText.match(/%[0-9a-f]{2}/i) !== null){
            	//console.log('el comentario tiene formato de url, se codifica correctamente');
            	replacedText = decodeURIComponent(replacedText);
            }
              
            return replacedText;    
        }
       };
    }
])

.filter('fechaPublicacion',['$filter',
    function($filter) {
	return function(text,tipo) {
		var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

		var fechaActual = new Date();
		var fechaEnviada = new Date(text);
		var tiempoRestante = (fechaActual - fechaEnviada)/(1000*60*60*24);
		var etiqueta = '';
		 //si el hay mas de un dia
		 if(tiempoRestante > 0){
		 	etiqueta += fechaEnviada.getDate()+' '+monthNames[fechaEnviada.getMonth()]+' '+fechaEnviada.getFullYear();	 	
		 	
		 }else{
		 //si la fecha es menor a un día
		 	etiqueta+=fechaEnviada.getHours()+' '+fechaEnviada.getMinutes();
		 }
		 

	
	return etiqueta;
	
        };
    }
])
.filter('numeroNotificaciones',['$filter', function($filter) {
	return function(text) {
		if(text !== ''){
	    	if(text > 0 && text < 100){
	    		return text; 
	    	}else if(text >= 100){
	    		return '99+';
	    	}
	    	
        }
    };
}])
.service('NotificacionService',['$rootScope','$http','$q','Authentication', function($rootScope,$http,$q,Authentication){
	return{
		notificacion_activa: new Array(),
		totalDesempenioDiario: $http.post('/obtieneDesempenioDiario', {idUsuario:Authentication.user._id,cuenta:Authentication.user.cuenta.marca}).success(function(data){
				return data;
			})
		,
		add: function(item){
			if(this.notificacion_activa.length > 0){
				for(var i = 0; i < this.notificacion_activa.length; i++){
					this.notificacion_activa.splice(i,1);
				}
			}
			this.notificacion_activa.push(item);
		},
		delete: function() {
			for(var i = 0; i <= this.notificacion_activa.length; i++){
				this.notificacion_activa.splice(i,1);
			}
		},
		getDesempenio : function(){
			return $http.post('/obtieneDesempenioDiario', {idUsuario:Authentication.user._id,cuenta:Authentication.user.cuenta.marca}).success(function(data){
				return data;
			});
		}
		};
}])

.controller('FeedsController', ['NotificacionService','Socket','$scope','$http','$stateParams', '$location','$resource','Authentication','$modal','$document','CONSTANT','$anchorScroll',
	function(NotificacionService,Socket,$scope,$http,$stateParams, $location, $resource,Authentication,$modal,$document,CONSTANT,$anchorScroll) {

		$scope.pendientes =  0;
		$scope.notificacion_activa = NotificacionService.notificacion_activa;

		NotificacionService.getDesempenio().success(function(data){
			$scope.totalDesempenioDiario = data;
		});
		$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id}).success(function(data){
			$scope.pendientes = parseInt(data);
		});
		$scope.filter_show = true;
		$scope.paginacion_a = false;
		$scope.paginacion_busqueda_skip = 0;
		$scope.lote = new Array();
		$scope.activacheckbox = '';

		$scope.checkLote = function(checked, elemento){
			if(checked){
				var datos_bloqueo = {};
				datos_bloqueo.cuenta = $scope.authentication.user.cuenta.marca;
			  	datos_bloqueo.user = $scope.authentication.user.displayName;
			  	datos_bloqueo._id = elemento._id;
			  	datos_bloqueo.user_image = $scope.authentication.user.imagen_src;
			  	Socket.emit('idBloquea',datos_bloqueo);
			  	$scope.activacheckbox = 'activaCheck';
				$scope.lote.push(elemento);
			}else{
				 for(var i in $scope.lote){
				 	if($scope.lote[i] === elemento){
				 		Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:elemento._id});
				 		$scope.lote.splice(i,1);
				 		if($scope.lote.length===0){
				 			$scope.activacheckbox = '';
				 		}
				 	}
				 }
			}
		}
		$scope.constant = CONSTANT;
		//funcion que muestra la notificacion por ensima de los filtros
		$scope.showNotificacion = function (notificacion) {	
			//if($location.$$path === '/feeds/getMailBox'){
			if($location.$$path === '/mailbox'){
				$scope.abrirNotificaciones();
		    	$http.get('getOneContent?colec='+notificacion.coleccion+'&mo_id='+notificacion.mongo_id).then(function(data){
				    var obj = data.data;
				    obj.mongo_id = notificacion._id;
				    console.log('Imprimiendo ids ');
				    console.log(obj.mongo_id);
				    console.log(obj._id);
				    delete obj.conversacion;
				    obj.conversacion = new Array();
				    obj.conv_cuenta=obj.conv_cuenta+1;
				    NotificacionService.add(obj);
				});
			}else{
				//var url = $location.path('/feeds/getMailBox').search({colec: notificacion.coleccion,mo_id:notificacion.mongo_id,not_id:notificacion._id});
				var url = $location.path('/mailbox').search({colec: notificacion.coleccion,mo_id:notificacion.mongo_id,not_id:notificacion._id});
			}				
		};
		var backspace = 0;
		var count = 0;
		$document.bind('keypress keyup keydown', function(e){
			if(e.type === 'keydown' && e.which === 8 && e.target.name === 'busqueda'){
				count++;
				if(count > 1){
					e.preventDefault();
				}
			}else{
				count = 0;
			}
			
          if(e.which === 8 && e.target.nodeName === "INPUT"){ // you can add others here.
              if($scope.s === ''){
              	backspace++;
              	if(backspace > 0){
              		$scope.paginacion_busqueda = false
              		$scope.posts =$scope.aux;
              	}
              
              }
          }
      	});
      	
      	
      	$scope.busquedaActiva = false;
      	$scope.numeroResultadosBusqueda = 0;
		$scope.busquedaInput = function(tipo){
			//console.log($scope.s);
			var criterio = $scope.s;
			$scope.buzon = tipo;
			if(!criterio){
				$scope.busquedaActiva = false;
				delete $scope.posts;
				$scope.paginacion_busqueda = false
				$scope.posts = $scope.aux;
				$scope.refreshAux();
				return;
			}else{
			if(criterio.length > 0 && criterio !== ''){
				
				$http.get('buscar?criterio='+criterio+'&coleccion='+Authentication.user.cuenta.marca+'&tipo='+tipo).success(function(data){
					delete $scope.posts;
					$scope.posts = angular.copy(data);
					var id_photo;
					for(var i in $scope.posts){
						(function(w) {
							if($scope.posts[w]){
								if($scope.posts[w].atendido){
									id_photo = $scope.posts[w].atendido.usuario_id;
								}else if($scope.posts[w].descartado){
									id_photo = $scope.posts[w].descartado.idUsuario;
								}else{
									id_photo = null;
								}
								if(id_photo){
									$scope.getUserPhoto(id_photo, function(conv) {
										if(conv[0]){
											if(conv[0].hasOwnProperty('imagen_src') === true){
												if($scope.posts[w]){
													if($scope.posts[w].atendido){
														$scope.posts[w].atendido.usuario_foto = conv[0].imagen_src;
													}else if($scope.posts[w].descartado){
														$scope.posts[w].descartado.usuario_foto = conv[0].imagen_src;
													}else{
														console.log('No se hace nada');
													}
												}
											}
										}
									});
								}
							}
						})(i);
					}
					if(data.length === 0){
						delete $scope.posts;
						$scope.paginacion_busqueda = false;
						$scope.paginacion_busqueda_skip = 0;
						$scope.numeroResultadosBusqueda = 0;
					}else{
						$scope.paginacion_busqueda = true;
						$scope.numeroResultadosBusqueda = data.length;
					}
				});
			$scope.busquedaActiva = true;				
			}else{
				$scope.numeroResultadosBusqueda = 0;
				$scope.busquedaActiva = false;
				$scope.paginacion_busqueda_skip = 0;
				$scope.paginacion_busqueda = false
				$scope.posts =$scope.aux;
			}
			

			
		}

		};
		
		
		
		$scope.refreshAux = function(){
			$scope.paginacion_busqueda = false
			delete $scope.posts;
			$scope.posts =$scope.aux;
		};
		$scope.$on('muestraFlash', function(event,str){
			console.log(str);
			$scope.flash = true;
			$scope.flash_text = str;
			setTimeout(function(){
				$scope.flash = false;
				$scope.flash_text = '';
			}, 2500);
		});
		$scope.obtieneNuevoBuzon = function(){
			//$http.get('http://likeable-crm.mvsdigital.info:8082/nuevoBuzon?coleccion=facespa_consolidada&cuenta_id=254867754693028&inicio=0').success(function(data){
			$http.get($scope.constant.host+'/nuevoBuzon?coleccion=facespa_consolidada&cuenta_id=167584559969748&inicio=0').success(function(data){
				$scope.paginacion = 15;
				$scope.posts = data;
				$scope.MuestraListadoFeeds = true;
				console.log(data);
			}).error(function(error){
				console.log('ERROR !!!');
				console.log(error);
			});
		};
	    $scope.changeRadio = function(){	
		if($scope.filter_val !== 'comment'){
		    $scope.filter_show = true;
		    $scope.filtro = {'tipo':$scope.filter_val};
		}else{
		    $scope.filter_show = false;
		}
		$scope.getFilter = function(){
		    if($scope.filter_show){
			return {'tipo':$scope.filter_val};
		    }else{
			return {'obj':'facebook'} && ({'tipo':'comment'} || {'tipo':'post'} || {'tipo':'share'});
		    }
		};
	    };
	    //funcion que determina en que parte del crm se llamo la nitificacion pra redirigit a buzon
	    $scope.comparaUrl = function(){
	    	console.log('Authenticando ');
	    	$scope.authentication = Authentication;
		    var tieneSesion=$scope.authentication.user.hasOwnProperty('_id');
		    if(tieneSesion===false){
		    	$location.path('/');
		    }
			NotificacionService.getDesempenio().success(function(data){
				$scope.totalDesempenioDiario = data;
			});
		  	if($location.$$search.colec){
			  	var notificacion = {};
			  	notificacion.coleccion = $location.$$search.colec;
			  	notificacion.mongo_id = $location.$$search.mo_id;
			  	notificacion._id = $location.$$search.not_id;
			  	if($scope.notificacionesOcultas)
			  		$scope.abrirNotificaciones();
			    $scope.showNotificacion(notificacion);
		  	}
		};
		//comparamos objeto por objeto para saber si es influencer
	    $scope.isInfluencer = function (index) {
		    	$http.post('/isInfluencer',{screen_name:$scope.posts[index].user.screen_name, coleccion: 'influencers_'+Authentication.user.cuenta.marca}).success(function(result){
		    		if(result === 'error'){
		    			return false;
		    		}
		    		if(result === 'false'){
		    			return false;
		    		}
		    		if(result === '"true"'){
		    			$scope.posts[index].influencer = 'true';
		    			return true;
		    		}
		    	});
	    };
	    $scope.changeIndex = function(e){
		if(e.which === 27){//shift
		    //$rootScope.$broadcast('doShift');  
		    $scope.notificacionesOcultas = true;	
		    $scope.clasesNotificaciones = 'animated bounceOutDown';  
		}
	    };
	    $scope.diasTranscurridos = function(fecha){	
		
		var fechaActual = new Date();
		var fechaEnviada = new Date(fecha);
		var tiempoRestante = (fechaActual - fechaEnviada)/(1000*60*60*24);
		//regresa en numero los dias entre fechas	
		return parseInt(tiempoRestante);
	
	    };

	    
	    if (Authentication.user.hasOwnProperty('additionalProvidersData')) {
		if (Authentication.user.additionalProvidersData.facebook) {
		    var fbobj = Authentication.user.additionalProvidersData.facebook;
		    var at = fbobj.accessToken;
		    var fuid = fbobj.id;
		    var acc_id = Authentication.user.cuenta._id;
		    var acc_nm = Authentication.user.cuenta.marca;
		    var us_dn = Authentication.user.displayName;
		    var us_id = Authentication.user._id;
		    
		    setInterval(function() { 
		    	/*var dest = $(angular.element(document.getElementById('object-0'))).offset().top;
		    	console.log('offset');
				console.log(dest);
				if(dest !== 191){
					console.log('menor');
					var longdiv = document.querySelector("#listado-mensajes");
					console.log(longdiv);
					console.log(longdiv.scrollTop);
					$scope.scrollTo(longdiv,dest,3000);
				}*/
			$http.post('/procesapendientes/', { 
			    access_token : at,
			    fbuid : fuid,
			    account_name : acc_nm,
			    account_id : acc_id,
			    screen_name : us_dn,
			    user_id : us_id })
			    .success(function(datae) {
				if(datae===0){
				    $scope.mensajeActualizacion='Ocurrio un error al procesar el resto de posts';
				}else if(datae===1){
				    $scope.mensajeActualizacion='Los posts pendientes fueron procesados';
				}
    			    })
			    .error(function(datae) {
					console.log(datae);
			    });
		    }, 30000);
		}
	    }
		$scope.scrollTo = function(element, to, duration) {
			console.log('Scrollenado !');
		    if (duration < 0) return;
		    var difference = to - element.scrollTop;
		    console.log('Diferencia');
		    console.log
		    var perTick = difference / duration * 10;

		    setTimeout(function () {
		        element.scrollTop = element.scrollTop + perTick;
		        console.log('Subiendo')
		        console.log(perTick);
		        console.log(element.scrollTop);
		        if (element.scrollTop == to) return;
		        $scope.scrollTo(element, to, duration - 10);
		    }, 10);
		}
	    $scope.limiteTexto = 300;	

	    $scope.getUserPhoto = function(id_usuario, callback) {
	    	if(id_usuario === null){
	    		id_usuario = '';
	    	}
	    	if(id_usuario !== 'direct-facebook' && id_usuario !== ''){
				$http.get('/getUserData?userId=' + id_usuario).success(function(data) {
				    callback(data);
				});
			}
	    };

	    $scope.textos = {
		tema:'Tema',
		subtema:'Subtema'
	    };

	    $scope.authentication = Authentication;
	    
	    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
		}	
		/*si no esta logueado en face*/
		
		$scope.notificaciones_ocupadas = [];
		$scope.notificaciones = [];

		/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ SOOCKETS Notificaciones +-+-+-+-+-+-+-+-+-+-+-+*/

	    Socket.emit('getNotificaciones',$scope.authentication.user._id);
	    $scope.notificar = function(data){
		if(typeof data[0].screen_name !== 'undefined'){
		 if (!Notification) {
		   alert('No se aceptaron las notificaciones'); 
		   return;
		 }

		 if (Notification.permission !== "granted")
		   Notification.requestPermission();
		 else {
		   var notification = new Notification('Likeable crm', {
		     icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAABMBJREFUWAnNmV+IFVUcx7/n3Ll796orsmi4ayaCEWYrWAmBvmT10MuKoUG4EPTUQ6b5IBIZYb1sECZB9BDSg/UiCW70FBGhS2QvofgHpWw17+LuslG70r3uzD39fufOnebMzD2zM3fv6sCy5/x+v/P7feb8n98VaOOZfgsDUBiUAo8roF8I9CuFfnZJ5QqVKwKo1BUuQ2Ck9xgu5g1HfrI9DCcUXoPETgGxPktrBXUDdZxRAieyQs8bdHo/HqFeel9IDFF/ySyAcVtVV3WcpB4/0nscN+P6uCQV9NIedK15GEep6QEaz1LcRTsSVaWpc/z2n3h30yncs3mygo7vw6ruIk7TEG+3OWlXR1PiXHUOL/V9gslWvlqC0lBvFgWMEOS6Vo0XUk6wY8rDIE2FC0l+E0E1pMSoEGJZUiOrjKavWLoSanbCapakVErN0tzdlgQbWxQ83Lon80BS9PLQV+h5bxyl599OYrHKuGM4NjNEDQ1QXjj+nMw/3NQlFBDdL36Awtqt0XipdZ5qzMAsYWMDtG8tbT/tLhy3Fvjv2v5GUM5SYAZ/pwmaBaC8T1LlzUCTsyCW9AYtC+ueCcqZCwL7manZLgDlzZw28u6mItd/Wkjh4ZbL9WmayxWzNJgazTWoPhb1iZPTp9+s+OReyOWrAydq7t+gnKfAp6C+T1BjDarP7naPRfJaeuEdg0fNjBv17BUhG2w+KF8wsjsxWxS3vILCqkcNoXf7V6Oeq+KzSb25Z7wFRQOKntXoHvwoKob7248xWVYB7QDrmVHSiA1mbWzY04xfMvQlZM9Dhlh5LtzL3xiyvBVmdOgM3ZjXAd+Oy7s/g7Ph2bgL2viXvv59XB6S8GKr/fAh3Atfh6TxIjM6+mYe16VLnBLKL3+Orqf2JtoKpwuFvicSdWGh8+op3P1iN9yLp8Nio8yMDnXKvDa70o7DQLGM+l9jmDt/AssOnCeQAcNh3kpxYJcVlBkd/sahQupT2nEIorwC7o1RDbpQkBw4bdExY3AypZJ20MC7+XOqd0m9WUm16rBBYc0WawRmlPxJa7XqsJIuy6hPXbdGYUb6JL+/oNVvD8P74ycrKDNKWvpXrFYdVqq7U6kROIHBoGdSLRMMeMgW4lEzd9LdUJZFcsZCZzDSzQ0L/txo9/EmrsH9/azVDbMxY2N7ojSL1boDSlX3MPvx00Btxu7dZ9OgnAsC6HBe1IdGhG4b9odSP5rNv4/q4adckL2Rqa2Nfkqv5pnCedaUew+1744C1X+sLajrTjaTacFE0x93Etda5ZckbcpCOlA0VPWJqzoAH6ly5QZ6XYcGJLq4QnVDp+BN0r5Z/dsKSQ6r1A+PNZNoASi3mj6IYcpzHErxsDhqpYZXHAPdhBqPMUnGb+EIJ6yayvv1nxk4wxeOb/QoK/wM3i+csQgbLlaZIMcos7c1mtmLgTKQ/o7KmyRr440yJck4DmfTaMVt47drI26mphyLYyZl8tiRMUfDnrkBDwHPl7C8E2WOwbFaQXLMlqCs5HlSuYXnaOsZpr//s1+sXJCHU+NqmGNE52TUfeIcjRpxnfdZOt4f3B8botAP/M83UWC/lzdzcoCGZSOdQy1/ECPdFVooI7Y5mOQ/LPsPLhKekoKwE4gAAAAASUVORK5CYII=',
		     body: "Tienes 1 nuevo mensajes de "+data[0].screen_name,
		   });

		   notification.onclick = function () {
		   		//window.location = 'https://likeable-crm.mvsdigital.info/#!/feeds/getMailBox?colec='+data[0].coleccion+'&mo_id='+data[0].mongo_id+'&not_id='+data[0]._id;
		   		window.open($scope.constant.host+'/#!/feeds/getMailBox?colec='+data[0].coleccion+'&mo_id='+data[0].mongo_id+'&not_id='+data[0]._id);
		   		//$location.path('/feeds/getMailBox').search({colec: data[0].coleccion,mo_id:data[0].mongo_id,not_id:data[0]._id});    
		   };
		   
		 }
		 }
		};

		document.addEventListener('DOMContentLoaded', function () {
		 if (Notification.permission !== "granted")
		   Notification.requestPermission();
		});
		
		Socket.on('notify', function(datos){
			for(var j = 0; j < $scope.notificaciones.length; j++){
			    if(datos[0]._id === $scope.notificaciones[j]._id){
				return;
			    }
			}
			for(var i = 0; i < datos[0].usuarios.length; i++){
			    if(datos[0].usuarios[i]._id === $scope.authentication.user._id){
					$scope.notificaciones.push(datos[0]);
					console.log('Notificando !!!!!');
					console.log(datos);
			    	$scope.notificar(datos);
			    }
			}
	    });
	    Socket.on('sendNotify', function(items){
			$scope.notificaciones = items;
			for(var i in $scope.notificaciones){
				if(!$scope.notificaciones[i].profile_image){
					$scope.notificaciones[i].profile_image = '/modules/core/img/usuario-sem-imagem.png';
				}
			}
	    });
	    Socket.on('bloqueaNotificacion', function(id_notificacion){
		$scope.notificaciones_ocupadas.push(id_notificacion);
	    });
	    Socket.on('quitaNotificacion', function(id_notificacion){
	    	NotificacionService.delete();
	    	console.log('Llamando a notificaciones');
	    	console.log(id_notificacion);
			for(var i = 0; i < $scope.notificaciones.length; i++){
				console.log($scope.notificaciones[i]);
			    if($scope.notificaciones[i]._id === id_notificacion || $scope.notificaciones[i].mongo_id === id_notificacion){
			    	console.log($scope.notificaciones.length);
				$scope.notificaciones.splice(i,1);
					console.log($scope.notificaciones);
				$scope.notificaciones = $scope.notificaciones.filter(function(){return true;}); 
					console.log($scope.notificaciones.length);
			    }
			}
	    });
	    /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ SOOCKETS Notificaciones +-+-+-+-+-+-+-+-+-+-+-+*/
	    
	    /*+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+ SOCEKTS TIEMPO REAL +-+-+-+-+-+-+-+++-+---+-+-+-+-+-+-*/
	    Socket.on('tiempoRealFront', function(obj_actualizar){
	    	if(_.size($scope.posts) < 5){
				console.log('Pediremos mas de este buzon !!!');
				console.log($scope.tipoBuzon);
	    		$scope.loadMoreUnificado();
	    	}
	    	if(obj_actualizar.cuenta === Authentication.user.cuenta.marca){
				$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id}).success(function(data){
					$scope.pendientes = parseInt(data);
					$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")"
				});
		    	switch($scope.tipoBuzon){
		    		case 'nuevos':	
		    			for(var i in $scope.posts){
		    				if($scope.posts[i]._id === obj_actualizar._id){
		    					delete $scope.posts[i];
		    					$scope.posts = $scope.posts.filter(function(){return true;});
		    				}
		    			}
		    		break;
		    		//case 'atendidos':
		    		case 'asignados':
		    			for(var i in $scope.posts){
		    				if($scope.posts[i]._id === obj_actualizar._id){
		    					delete $scope.posts[i];
		    					$scope.posts = $scope.posts.filter(function(){return true;});
		    				}
		    			}
		    		break;
		    		case 'descartados':
		    		var existe = false;
		    			if(obj_actualizar.descartado){
		    				for(var i in $scope.posts){
				    			if($scope.posts[i]._id === obj_actualizar._id){
				    				existe = true;
				    				$scope.posts[i].tipoMensaje = 'descartado';
				    				$scope.posts[i].descartado = obj_actualizar.descartado;
				    				if(Authentication.user.username === obj_actualizar.descartado.usuario){
				    					$scope.lote = new Array();
				    					var elem = angular.element(document.getElementById('selector_'+$scope.posts[i]._id));
				    					elem.attr('checked',false);
				    				}
				    				$scope.posts = $scope.posts.filter(function(){return true;});
				    			}
				    		}
				    		if(!existe){
				    			console.log('No existe y debemos notificar un nuevo descartado');
				    		}
		    			}
		    			for(var i in $scope.posts){
				    		if($scope.posts[i]._id === obj_actualizar._id){
				    			$scope.posts[i].clasificacion = {
				    				tema: obj_actualizar.tema,
				    				subtema: obj_actualizar.subtema,
				    			};
				    			$scope.posts[i].tipoMensaje = 'atendido';
				    			$scope.posts[i].sentiment = obj_actualizar.sentiment;
				    			$scope.posts = $scope.posts.filter(function(){return true;});
				    		}
				    	}
		    		break;
		    		case 'todos':
		    			if(obj_actualizar.descartado){
		    				for(var i in $scope.posts){
				    			if($scope.posts[i]._id === obj_actualizar._id){
				    				$scope.posts[i].tipoMensaje = 'descartado';
				    				$scope.posts[i].descartado = obj_actualizar.descartado;
				    				if(Authentication.user.username === obj_actualizar.descartado.usuario){
				    					$scope.lote = new Array();
				    					var elem = angular.element(document.getElementById('selector_'+$scope.posts[i]._id));
				    					elem.attr('checked',false);
				    				}
				    				$scope.posts = $scope.posts.filter(function(){return true;});
				    			}
				    		}
		    			}else{
		    				for(var i in $scope.posts){
				    			if($scope.posts[i]._id === obj_actualizar._id){
				    				$scope.posts[i].clasificacion = {
				    					tema: obj_actualizar.tema,
				    					subtema: obj_actualizar.subtema,
										user_name: obj_actualizar.username,
										user_id: obj_actualizar.user,
										imagen_usuario: obj_actualizar.user_image
				    				};
									console.log('ACTUALIZANDO USERNAME!');
									console.log(obj_actualizar);
									console.log(obj_actualizar.username);
									$scope.posts[i].atendido ={
										"usuario_id": obj_actualizar.user,
										"user_name": obj_actualizar.username
									}
				    				$scope.posts[i].sentiment = obj_actualizar.sentiment;
				    				$scope.posts[i].tipoMensaje = 'atendido';
				    				$scope.posts = $scope.posts.filter(function(){return true;});
				    			}
				    		}
		    			}		
		    		break;

		    	}
		    }
	    });
	    /*+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+ SOCEKTS TIEMPO REAL +-+-+-+-+-+-+-+++-+---+-+-+-+-+-+-*/

	    $scope.follow = function(twit){
	    	var obj = {
	    		id_cuenta : Authentication.user.cuenta._id,
	    		screen_name: twit.user.screen_name,
	    		user_id: twit.user.id
	    	};
	    	$http.post('/follow',obj).success(function(data_follow){
	    		if(data_follow.code){
	    			alert('Error en follow');
	    		}else{
	    			var obj_save = {
	    				id_user_made_follow : Authentication.user._id,
	    				displayName_made_follow: Authentication.user.displayName,
	    				user_follow_id : data_follow.id,
	    				user_follow_name: data_follow.name,
	    				user_follow_screenname: data_follow.screen_name
	    			};
	    			$http.post('/guardaFollow',{obj:obj_save,coleccion:'followers_'+Authentication.user.cuenta.marca}).success(function(result_follow){
	    				for(var i in $scope.posts){
	    					if(twit._id === $scope.posts[i]._id){
	    						$scope.posts[i].follower = 'true';
	    					}	
	    				}
	    				alert('Siguiendo a @'+obj.screen_name);
	    			});
	    		}
	    	});
	    };
	    //Funcion que compara objeto por objeto para saber si ya se sigue al usuario
	    $scope.isFollow = function(index){
		    	var obj_compare = {
		    		user_follow_id : $scope.posts[index].user.id,
		    		user_follow_screenname : $scope.posts[index].user.screen_name,
		    		coleccion:'followers_'+Authentication.user.cuenta.marca
		    	};
		    	$http.post('/isFollow',obj_compare).success(function(result){
		    		//console.log(result);
		    		if(result === 'error'){
		    			return false;
		    		}
		    		if(result === 'false'){
		    			return false;
		    		}
		    		if(result === '"true"'){
		    			$scope.posts[index].follower = 'true';
		    			return true;
		    		}
		    	});
		};
		//Funcion que manda unfollow al usuario del objeto
	    $scope.unFollow = function(twit){
	    	var obj = {
	    		id_cuenta : Authentication.user.cuenta._id,
	    		screen_name: twit.user.screen_name,
	    		user_id: twit.user.id,
	    		coleccion: 'followers_'+Authentication.user.cuenta.marca,
	    		obj_save:{
	    			id_user_made_follow : Authentication.user._id,
	    			displayName_made_follow: Authentication.user.displayName,
	    			user_follow_id : twit.user.id,
	    			user_follow_name: twit.user.name,
	    			user_follow_screenname: twit.user.screen_name
	    		}
	    	};
	    	$http.post('/unfollow',obj).success(function(data_unfollow){
	    		if(data_unfollow.code){
	    			alert('Error en unfollow');
	    		}else{
	    			for(var i in $scope.posts){
	    				if(twit._id === $scope.posts[i]._id){
	    					if($scope.posts[i].follower){
	    						delete $scope.posts[i].follower;
	    					}
	    				}	
	    			}
	    			alert('Dejaste de seguir a @'+twit.user.screen_name);
	    		}
	    	});
	    };
	    $scope.refreshUnificado = function(){
	    	if(!$scope.nuevosFiltered){
	    		for(var i in $scope.mensajeAsignado){
					$scope.posts.unshift($scope.mensajeAsignado[i]);
				}
				$scope.posts = $scope.posts.filter(function(){return true;});
				$scope.mensajeAsignado = new Array();
				$scope.nuevos = 0;
	    	}else{
		    	$http.get('/nuevosPostsFiltered?lastct='+$scope.posts[0].created_time+'&tipo='+$scope.nuevosFiltered.tipo+'&obj='+$scope.nuevosFiltered.obj+'&id_cuenta='+Authentication.user.cuenta._id).success(function(data){
					console.log('Resultados narajas !!!');
					console.log(data);
					for(var i in data.cuenta){
						console.log(data.cuenta[i]);
						data.cuenta[i].conv_cuenta = 3;
						data.cuenta[i].conversacion = new Array();
						data.cuenta[i].tipoMensaje = 'nuevo';
						$scope.posts.unshift(data.cuenta[i]);
					}
					$scope.posts = $scope.posts.filter(function(){return true;});
					$scope.nuevos = 0;
					//var someElement = angular.element(document.getElementById('object-0'));
					//var dest = $(angular.element(document.getElementById('object-0'))).offset().top;
					//$(angular.element(document.querySelector("#listado-mensajes"))).animate({scrollTop: dest});
					//var someElement = angular.element(document.getElementById('object-0'));
					//var ws = angular.element(document.getElementById('listado-mensajes'));
					//console.log(someElement);
					//ws.scrollToElementAnimated(someElement);
					//$document.duScrollTop(0,600);
					var newHash = 'object-0';
				      if ($location.hash() !== newHash) {
				        // set the $location.hash to `newHash` and
				        // $anchorScroll will automatically scroll to it
				        $location.hash('object-0');
				      } else {
				        // call $anchorScroll() explicitly,
				        // since $location.hash hasn't changed
				        $anchorScroll();
				      }
				});	
			}
	    }
		$scope.refresh = function(){
			/*delete $scope.nuevos;
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getFb($scope.tipo,$scope.organizacion);
				}else{
					$scope.getFb($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getFb('',$scope.organizacion);
				}
				else{
					$scope.getFb();
				}
			}*/		
			console.log('Llamando naranja !!!!');
			$http.get('/nuevosPosts?lastct='+$scope.posts[0].created_time+'&tipo='+$scope.tipo+'&id_cuenta='+Authentication.user.cuenta._id).success(function(data){
				console.log('Resultados narajas !!!');
				console.log(data);
				for(var i in data.cuenta){
					console.log(data.cuenta[i]);
					$scope.posts.unshift(data.cuenta[i]);
				}
				$scope.posts = $scope.posts.filter(function(){return true;});
				$scope.nuevos = 0;
				//var someElement = angular.element(document.getElementById('object-0'));
				//var dest = $(angular.element(document.getElementById('object-0'))).offset().top;
				//$(angular.element(document.querySelector("#listado-mensajes"))).animate({scrollTop: dest});
				//var someElement = angular.element(document.getElementById('object-0'));
				//var ws = angular.element(document.getElementById('listado-mensajes'));
				//console.log(someElement);
				//ws.scrollToElementAnimated(someElement);
				//$document.duScrollTop(0,600);
				var newHash = 'object-0';
			      if ($location.hash() !== newHash) {
			        // set the $location.hash to `newHash` and
			        // $anchorScroll will automatically scroll to it
			        $location.hash('object-0');
			      } else {
			        // call $anchorScroll() explicitly,
			        // since $location.hash hasn't changed
			        $anchorScroll();
			      }
			});	
			//window.location.reload();
		};
/*
              _    _       _  __ _               _       
             | |  | |     (_)/ _(_)             | |      
  _ __   ___ | |  | |_ __  _| |_ _  ___ __ _  __| | ___  
 | '_ \ / _ \| |  | | '_ \| |  _| |/ __/ _` |/ _` |/ _ \ 
 | | | | (_) | |__| | | | | | | | | (_| (_| | (_| | (_) |
 |_| |_|\___/ \____/|_| |_|_|_| |_|\___\__,_|\__,_|\___/ 
                                                         
*/
 		//Funcion que se llama despues de dar scroll para cargar mas en el BUZON QUE NO ESTA UNIFICADO
		$scope.loadMore = function(servicio) {
			$scope.quita_scroll = true;
			if($scope.paginacion_busqueda){
				$scope.paginacion_busqueda_skip += 15;
				$http.get('buscar?criterio='+$scope.s+'&coleccion='+Authentication.user.cuenta.marca+'&tipo='+$scope.buzon+'&skip='+$scope.paginacion_busqueda_skip).success(function(mas_busqueda){
					for(var i in mas_busqueda){
						$scope.posts.push(mas_busqueda[i]);
					}
					$scope.quita_scroll = false;
					$scope.muestraLoading=false;
				});
				return;
			}
 			if(servicio === 'nuevo'){
				//$http.get('http://likeable-crm.mvsdigital.info:8082/nuevoBuzon?coleccion=facespa_consolidada&cuenta_id=254867754693028&inicio='+$scope.paginacion).success(function(data){
				$http.get($scope.constant.host+'/nuevoBuzon?coleccion=facespa_consolidada&cuenta_id=167584559969748&inicio='+$scope.paginacion).success(function(data){
					$scope.paginacion += 15;
					for(var i in data){
						$scope.posts.push(data[i]);
					}
					$scope.quita_scroll = false;
				}).error(function(error){
					console.log('ERROR !!!');
					console.log(error);
				});
			}else{
				var tipoFiltro='';
				if($scope.tipo !== 'todos'){
					tipoFiltro = $scope.tipo;
				}
				var tipoOrganizacion = '';
				if($scope.organizacion !== 'desc'){
					tipoOrganizacion = $scope.organizacion;
				}
				console.log();
				if($scope.fechas){
					var parametros = $scope.fechas.firstdate;
					delete $scope.fechas;
					$scope.muestraLoading=true;
					$http.get('/'+servicio+'/'+$scope.authentication.user.cuenta._id+'?firstdate='+parametros+'&eltipo='+tipoFiltro+'&organizacion='+tipoOrganizacion)
					.success(function(data){
						if(data){
							var cuentaData = 0;
							cuentaData = data.length-1;     
							if(typeof data.length !== 'undefined'){
								$scope.masPost = true;
							}else{
								$scope.masPost = false;
							}
							var cuenta = cuentaData - 1;
							if(typeof data[cuentaData] !== 'undefined'){
								$scope.fechas = data[cuentaData].fecha;
								delete data[cuentaData];
								for(var i=0; i<=cuenta;i++){
									delete data[i].conversacion;
									data[i].conv_cuenta++;
									if(data[i].conv_cuenta < 1){
										data[i].conv_cuenta = ' ';
									}
									if(typeof data[i].respuestas !== 'undefined'){ 
										for(var cont in data[i].respuestas){
											data[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
											(function(w,contador) {
												$scope.getUserPhoto(data[w].respuestas[contador].user_id, function(conv) {
													if(conv[0]){
														if(conv[0].hasOwnProperty('imagen_src') === true){
															data[w].respuestas[contador].foto = conv[0].imagen_src;
														}else{
															data[w].respuestas[contador].foto = [];
														}
													}else{
														data[w].respuestas[contador].foto = [];
													}
												});                             
											}(i,cont));             
										}       
									}       
									(function(w) {
										if(data[w].atendido){
											$scope.getUserPhoto(data[w].atendido.usuario_id, function(conv) {
												data[w].atendido.usuario_foto = conv[0].imagen_src;
											});
										}
										if(data[w].descartado){
											$scope.getUserPhoto(data[w].descartado.idUsuario, function(conv) {
												data[w].descartado.usuario_foto = conv[0].imagen_src;
											});
										}
									})(i);
									data[i].conversacion = [];
								}
							}
 							var new_array = [];
							var old_array = [];
							var obj = {};
							for(var h in data){
								new_array[h] = data[i];
							}
							for(var j in $scope.posts){
								old_array[j] = $scope.posts[j];
							}
							for(var k = 0; k < new_array.length; k++ ){
								old_array[(old_array.length)] = new_array[k]; 
							}
							for(var l = 0; l < old_array.length; l++){
								obj[l] = old_array[l];
							}
							var tam = _.size($scope.posts);
							//tam = tam -1;
							$scope.posts = $scope.posts.filter(function(){return true;}); 
							var contador = 0;
							for(var s in $scope.posts){
								if(!$scope.posts[s].id){
									delete $scope.posts[s];
								}
							}
 							for(var z in data){
								$scope.posts[tam+contador] = data[z];
								contador++;
							}
							$scope.posts = $scope.posts.filter(function(){return true;});
							$scope.muestraLoading=false;
							$scope.quita_scroll = false;                                                
						}
					});
				}else{
					//no devuelve mas twitts
					$scope.quita_scroll = false;
				}
			}
        };
/*
                 _               _    _       _  __ _               _       
                | |             | |  | |     (_)/ _(_)             | |      
   ___ _ __   __| |  _ __   ___ | |  | |_ __  _| |_ _  ___ __ _  __| | ___  
  / _ \ '_ \ / _` | | '_ \ / _ \| |  | | '_ \| |  _| |/ __/ _` |/ _` |/ _ \ 
 |  __/ | | | (_| | | | | | (_) | |__| | | | | | | | | (_| (_| | (_| | (_) |
  \___|_| |_|\__,_| |_| |_|\___/ \____/|_| |_|_|_| |_|\___\__,_|\__,_|\___/ 
                                                                           
*/
		//Funcion que se llama despues de dar scroll para cargar mas 
		$scope.loadMoreUnificado = function(servicio) {
			$scope.quita_scroll = true;
			var tipoFiltro='';
			if($scope.tipo !== 'todos'){
				tipoFiltro = $scope.tipo;
			}
			var tipoOrganizacion = '';
			if($scope.organizacion !== 'desc'){
				tipoOrganizacion = $scope.organizacion;
			}
			var palabra = '';
			if(typeof $scope.palabra !== 'undefined'){
				palabra = $scope.palabra;
			}
			
			var tipoBuzon = $scope.tipoBuzon;
			console.log('El tipo de buzon');
			console.log(tipoBuzon);
			if($scope.fechas){
				var parametros = $scope.fechas.firstdate;
				delete $scope.fechas;
				$scope.muestraLoading=true;
				var idUsuario = $scope.authentication.user._id;
				console.log('URL !!!');
				console.log('/mailbox/?id='+$scope.authentication.user.cuenta._id+'&firstdate='+parametros+'&eltipo='+tipoFiltro+'&organizacion='+tipoOrganizacion+'&idUsuario='+idUsuario+'&tipoBuzon='+tipoBuzon+'&palabra='+palabra);
				$http.get('/mailbox/?id='+$scope.authentication.user.cuenta._id+'&firstdate='+parametros+'&eltipo='+tipoFiltro+'&organizacion='+tipoOrganizacion+'&idUsuario='+idUsuario+'&tipoBuzon='+tipoBuzon+'&palabra='+palabra).success(function(data){
		    		if(data){
		    			var cuentaData = 0;
		    			cuentaData = data.length-1;
		    			
		    			if(typeof data.length !== 'undefined'){
		    				$scope.masPost = true;
		    				
		    			}else{
		    				$scope.masPost = false;
		    			}
		    			
		    			var cuenta = cuentaData - 1;
		    			if(typeof data[cuentaData] !== 'undefined'){
		    				$scope.fechas = data[cuentaData].fecha;
		    				delete data[cuentaData];
							for(var i=0; i<=cuenta;i++){
				    			delete data[i].conversacion;
				    			data[i].conv_cuenta++;
				    			if(data[i].conv_cuenta < 1){
				    				data[i].conv_cuenta = ' ';
				    			}
		    	
		    					if(typeof data[i].respuestas !== 'undefined'){ 
									for(var cont in data[i].respuestas){
		    							data[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
		    							(function(w,contador) {
					    					$scope.getUserPhoto(data[w].respuestas[contador].user_id, function(conv) {
												if(conv[0]){
													if(conv[0].hasOwnProperty('imagen_src') === true){
														data[w].respuestas[contador].foto = conv[0].imagen_src;
													}else{
														data[w].respuestas[contador].foto = [];
													}
												}else{
													data[w].respuestas[contador].foto = [];
												}
						 					});		    		
		    							}(i,cont));		
									}	
		    					}	
	
			    				(function(w) {
									if(data[w].atendido){
										$scope.getUserPhoto(data[w].atendido.usuario_id, function(conv) {
						    				data[w].atendido.usuario_foto = conv[0].imagen_src;
										});
									}
									if(data[w].descartado){
										$scope.getUserPhoto(data[w].descartado.idUsuario, function(conv) {
						    				data[w].descartado.usuario_foto = conv[0].imagen_src;
										});
									}
			    				})(i);
				    			data[i].conversacion = [];
				    		}
		   				}
						var new_array = [];
						var old_array = [];
						var obj = {};
						for(var h in data){
							new_array[h] = data[i];
						}
						for(var j in $scope.posts){
							old_array[j] = $scope.posts[j];
						}
						for(var k = 0; k < new_array.length; k++ ){
							old_array[(old_array.length)] = new_array[k]; 
						}
						for(var l = 0; l < old_array.length; l++){
		        			obj[l] = old_array[l];
		        		}
		        		var tam = _.size($scope.posts);
		        		//tam = tam -1;

		        		$scope.posts = $scope.posts.filter(function(){return true;}); 
		        		var contador = 0;
		        		for(var s in $scope.posts){
						
							if(!$scope.posts[s].id){
								delete $scope.posts[s];
							}
						}
		        		for(var z in data){
		        			$scope.posts[tam+contador] = data[z];
		        			contador++;
		        		}
		        		$scope.posts = $scope.posts.filter(function(){return true;});
						$scope.muestraLoading=false;
						$scope.quita_scroll = false;
						
						
					}
				});
			}else{
				//no devuelve mas twitts
				$scope.quita_scroll = false;
			}
    	};

	    $scope.ocupados = [];
	    $scope.ocultos = [];
	    /* Socket para bloquear la caja del twit o post seleccionado*/
		Socket.on('bloquea', function(datos_a_bloquear){
			$scope.ocupados[($scope.ocupados.length)]={_id: datos_a_bloquear._id, user:datos_a_bloquear.user,user_image: datos_a_bloquear.user_image};		
		});
		console.log('Ocupados al iniciar');
		console.log($scope.ocupados);
		/* Socket para desbloquear la caja del twit o post */
		Socket.on('libera',function(libera){

			var libera_id = libera._id;
			if(libera.cuenta === $scope.authentication.user.cuenta.marca){
				for(var i in $scope.posts){
					if($scope.posts[i]._id === libera_id._id){
						delete $scope.posts[i].conversacion;
						$scope.posts[i].conversacion = [];
						$scope.posts = $scope.posts.filter(function(){return true;});
					}
				}
				var index = $scope.eval(libera_id);
				if(index !== -1){
					$scope.ocupados.splice(index,1);
				}
				

			}
		});




		/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ Socket para nuevos mensajes +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+*/
		Socket.on('mensajeNuevo', function(mensaje){

			if(mensaje.cuenta === Authentication.user.cuenta.marca){

				switch($scope.tipo){
				
					case 'facebook':
						if(mensaje.obj === 'facebook' && (mensaje.tipo === 'comment' || mensaje.tipo === 'share' || mensaje.tipo === 'post' || mensaje.tipo === 'inbox') ){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					case 'facebook_public':
						if(mensaje.obj === 'facebook' && (mensaje.tipo === 'comment' || mensaje.tipo === 'share' || mensaje.tipo === 'post' || mensaje.tipo === 'inbox') ){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					case 'facebook_inbox':
						if(mensaje.obj === 'facebook' && mensaje.tipo === 'facebook_inbox'){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					
					case 'twitter':
						if(mensaje.obj === 'twitter' && (mensaje.tipo === 'twit' || mensaje.tipo === 'direct_message' || mensaje.tipo === 'tracker') ){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					case 'twitter_public':
						if(mensaje.obj === 'twitter' && mensaje.tipo === 'twit'){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					case 'direct_message':
						if(mensaje.obj === 'twitter' && mensaje.tipo === 'direct_message'){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					case 'tracker':
						if(mensaje.obj === 'twitter' && mensaje.tipo === 'tracker'){
							$scope.setNuevos(mensaje.obj, mensaje.tipo);
						}
					break;
					
					default:
						$scope.setNuevos('todos','todos');																									
				}

			}
		});
		$scope.setNuevos = function(obj, tipo){
			$scope.nuevosFiltered = new Object();
			if(obj === 'facebook'){
				$scope.nuevosFiltered.obj ='facebook';
				if(tipo !== 'facebook_inbox'){
					$scope.nuevosFiltered.tipo = tipo;
				}else{
					$scope.nuevosFiltered.tipo = 'facebook_inbox';
				}
			}else if(obj === 'twitter'){
				$scope.nuevosFiltered.obj ='twitter';
				if(tipo === 'tracker'){
					$scope.nuevosFiltered.tipo = 'tracker';
				}else if(tipo === 'twit'){
					$scope.nuevosFiltered.tipo = 'twit';
				}else if(tipo === 'direct_message'){
					$scope.nuevosFiltered.tipo = 'direct_message';
				}
			}else if(obj === 'todos'){
				$scope.nuevosFiltered.obj ='todos';
				$scope.nuevosFiltered.tipo ='todos';
			}
			if($scope.nuevos && $scope.nuevos > 0){
				$scope.nuevos ++;
			}else{
				$scope.nuevos = 1;
			}
			return;
		}
		$scope.mensajeAsignado = new Array();
		/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ Socket para nuevos mensajes +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+*/
		/* Iniciando el socket para cuando alguien entra a buzon => Establecemos el arreglo de ocupados*/
		Socket.on('iniciaSocket', function(elements){
			if(elements){
				for(var i in elements){
					if(Authentication.user.cuenta.marca === elements[i].cuenta){
						$scope.ocupados = elements[i].ocupados;
					}
				}
			}
		});
		/* Socket que actualiza el front en tiempo real para mostrar mensajes asignados*/
		Socket.on('socketAsignaFront', function(data){
			if($scope.authentication.user.cuenta.marca === data.cuenta){
				for(var i in $scope.posts){
					if($scope.posts[i]._id === data._id){
						$scope.posts[i].asignado = data.asignado;
					}
				}
				$scope.posts = $scope.posts.filter(function(){return true;});
				data.mensaje.asignado = data.asignado;
				if($scope.tipoBuzon === 'asignados'){
					if(Authentication.user._id === data.asignado.usuario_asignado_id){
						if($scope.nuevos && $scope.nuevos > 0){
							$scope.nuevos++;
							$scope.mensajeAsignado.push(data.mensaje);
						}else{
							$scope.mensajeAsignado.push(data.mensaje);
							$scope.nuevos = 1;
						}
					}
				}	

			}
		});
		/* Socket que actualiza la clasificacion, sentiment y seccion(proceso,entrada,descartados y complretos) en tiempo real*/
		Socket.on('actualizaClasificacionFront', function(clasificacion){
			if(clasificacion.user === $scope.authentication.user._id){
				NotificacionService.getDesempenio().success(function(data){
					$scope.totalDesempenioDiario = data;
				});
			}
			if(clasificacion.cuenta === $scope.authentication.user.cuenta.marca){
				$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id}).success(function(data){
					$scope.pendientes = parseInt(data);
				});
			}
			if(clasificacion.descartado){
				for(var i in $scope.posts){
					if(clasificacion._id === $scope.posts[i]){
						delete $scope.posts[i];
						$scope.posts = $scope.posts.filter(function(){return true;});
					}
				}
			}
			if(clasificacion.sentiment || clasificacion.tema !== "'Tema'"){
				console.log('paso filtro de clasificacion');
				
				for (var i in $scope.posts) {
					if($scope.posts[i]){
						
						if($scope.posts[i]._id === clasificacion._id){
							
							if($location.$$path === '/feeds/getMailBox' || $location.$$path === '/home'){
								delete $scope.posts[i];
								$scope.posts = $scope.posts.filter(function(){return true;}); 
							}else{
								delete $scope.posts[i].conversacion;
								$scope.posts[i].conversacion = [];
								if($scope.posts[i].clasificacion){
									$scope.posts[i].clasificacion.tema = clasificacion.tema;
									$scope.posts[i].clasificacion.subtema = clasificacion.subtema;
									if(clasificacion.answer){	
										if($scope.posts[i].respuestas){
											$scope.posts[i].respuestas.push(clasificacion.answer);
										}else{
											$scope.posts[i].respuestas = [];
											$scope.posts[i].respuestas.push(clasificacion.answer);
										}
									}
								}else{
									$scope.posts[i].clasificacion = {
										tema: clasificacion.tema,
										subtema: clasificacion.subtema
									};
									if(clasificacion.answer){	
										if($scope.posts[i].respuestas){
											$scope.posts[i].respuestas.push(clasificacion.answer);
										}else{
											$scope.posts[i].respuestas = [];
											$scope.posts[i].respuestas.push(clasificacion.answer);
										}
									}
								}
								$scope.posts[i].sentiment = clasificacion.sentiment;
							}
						}
					}	
				}
			}else{
				console.log('Clasificacion invalida');
			}
		});
		/* Socket para ocultar Posts */
		Socket.on('ocultaPost', function(oculta_id){
			for(var i in $scope.posts){
				if($scope.posts[i]._id === oculta_id){
					delete $scope.posts[i];
				}
			}
			$scope.ocultos.push(oculta_id); 
		});
		/* Funcion que se usa en la vista para saber si se muestra o no el twit */
		$scope.evalOculto = function(id_ocultar){
			var existe = false;
			for(var i in $scope.ocultos){
				if($scope.ocultos[i] === id_ocultar){
					existe = true;
				}
			}
			if(existe){
				return true;
			}else{
				return false;
			}
		};
		/* Funcion que se usa en la vista para agregar la clase de ocupado y poder bloquear el twit */
		$scope.evalua_ocupado = function(id_twit){
			var existe = $scope.eval(id_twit);
			if(existe !== -1){
				return true;
			}
			else{
				return false;
			}
		};
 		/* Funcion que evalua la clasificacion en la vista para saber que color de palomita tendra */
		$scope.evalua_clasificacion = function(twit){
			if(twit){
				if(twit.clasificacion){
					if(twit.clasificacion.tema !== 'Tema' && twit.sentiment){
						return true;
					}else{
						return false;
					}
				}else{
					return false;
				}
			}
		};
	    /* Funcion secundaria para evaluar ocupados extiende $scope.evalua_ocupado()*/
		$scope.eval = function(search){
				var searchTerm = search,
			    index = -1;
				for(var i = 0; i < $scope.ocupados.length ;i++) {
				    if ($scope.ocupados[i]._id === searchTerm) {
				        index = i;
				        break;
				    }
				}
				return index;
			};
			var contador = 0;
		$scope.$on('finalizarCtrl', function(event, item){
			$scope.finalizar(item);
		});	

	   /* Funcion que completa el twit */
	   $scope.finalizar = function(twit){
		    if(twit.clasificacion){
				if(twit.clasificacion.tema === $scope.textos.tema){
			  		delete twit.clasificacion;
			  	}else{
			  		if(twit.clasificacion.subtema === $scope.textos.subtema){
			  			twit.clasificacion.subtema = '';
			  		}
			  	}
			}
	    	if(twit.clasificacion && twit.sentiment){
	    		var auxiliar_twit = angular.copy(twit);
	    		delete auxiliar_twit.conversacion;
	    		$http.post('/finalizar',{
	    			twit: auxiliar_twit,
	    			user_id:$scope.authentication.user._id,
	    			user_name:$scope.authentication.user.username,
	    			coleccion:Authentication.user.cuenta.marca+'_consolidada'
	    		}).success(function(data){
	    			//Borramos o actualizamos en tiempo real los posts
					twit.conversacion = data;
					for(var k in $scope.posts){
						if($scope.posts[k]){
							if($scope.posts[k]._id){
								if($scope.posts[k]._id === twit._id){
									//decidimos si se borra o se actualiza 
									//$scope.tipoBuzon general
									//$scope.items[0].tipoMensaje
									/*console.log('Buzon del mensaje');
									console.log($scope.posts[k].tipoMensaje);
									console.log('Tipo buzon');
									console.log($scope.tipoBuzon);
									if($scope.posts[k].tipoMensaje !== $scope.tipoBuzon){
										delete $scope.posts[k];
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}else{
										$scope.posts[k].tipoMensaje = 'atendido';
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}	*/
								}
							}
						}
					}
					for(var i in twit.conversacion){
						for(var z in $scope.posts){
							if($scope.posts[z]){
								if($scope.posts[z]._id){
									if($scope.posts[z]._id === twit.conversacion[i]){
										Socket.emit('postFinalizado',twit.conversacion[i]);
										delete $scope.posts[z];
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}
								}
							}
						}
					}
	
					NotificacionService.getDesempenio().success(function(data){
						$scope.totalDesempenioDiario = data;
					});

				}).error(function(error_post){
					console.log('Eror en post!');
					console.log(error_post);
				});
			}else{
		    		console.log('Twit NO clasificado');
		 			alert('Antes de completar, por favor clasifica esta conversación.');
		    }
				
	    };

		// Remove existing Feed
		$scope.remove = function( feed ) {
			if ( feed ) { feed.$remove();
				for (var i in $scope.feeds ) {
					if ($scope.feeds [i] === feed ) {
						$scope.feeds.splice(i, 1);
					}
				}
			} else {
				$scope.feed.$remove(function() {
					$location.path('feeds');
				});
			}
		};

        //Variable que define el buzon inicial
        $scope.tipoBuzon = 'todos';

		//Variable para filtro del tipo de red. Ejemplo: Twitter, Facebook, Inbox, etc.
		$scope.tipo='todos';

		//Variable para la organizacion
		$scope.organizacion='desc';

/*
              _    _       _  __ _               _       
             | |  | |     (_)/ _(_)             | |      
  _ __   ___ | |  | |_ __  _| |_ _  ___ __ _  __| | ___  
 | '_ \ / _ \| |  | | '_ \| |  _| |/ __/ _` |/ _` |/ _ \ 
 | | | | (_) | |__| | | | | | | | | (_| (_| | (_| | (_) |
 |_| |_|\___/ \____/|_| |_|_|_| |_|\___\__,_|\__,_|\___/ 
                                                         
*/
		//Funciones que nos sirven en el buzon que no es unificado	
        /* Funcion para cuando cambia el filtro de orden */
        $scope.cambioSelect = function(){
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getFb($scope.tipo,$scope.organizacion);
				}else{
					$scope.getFb($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getFb('',$scope.organizacion);
				}
				else{
					$scope.getFb();
				}
			}
		};

		$scope.cambioSelectProceso = function(){
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getMailboxProceso($scope.tipo,$scope.organizacion);
				}else{
					$scope.getMailboxProceso($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getMailboxProceso('',$scope.organizacion);
				}
				else{
					$scope.getMailboxProceso();
				}
			}
		};

		$scope.cambioSelectResueltos = function(){
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getResueltos($scope.tipo,$scope.organizacion);
				}else{
					$scope.getResueltos($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getResueltos('',$scope.organizacion);
				}
				else{
					$scope.getResueltos();
				}
			}
		};

		$scope.cambioSelectDescartados = function(){
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getDescartados($scope.tipo,$scope.organizacion);
				}else{
					$scope.getDescartados($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getDescartados('',$scope.organizacion);
				}
				else{
					$scope.getDescartados();
				}
			}
		};
		
		$scope.cambioOrganizacion = function(orden){
			$scope.organizacion = orden;
			
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getFb($scope.tipo,$scope.organizacion);
				}else{
					$scope.getFb($scope.tipo,'');
				}
			}else{
				
				if($scope.organizacion !== 'desc'){
					$scope.getFb('',$scope.organizacion);
				}
				else{
					$scope.getFb();
				}
			}
		};

		$scope.cambioOrganizacionDescartados = function(orden){
			$scope.organizacion = orden;
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getDescartados($scope.tipo,$scope.organizacion);
				}else{
					$scope.getDescartados($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getDescartados('',$scope.organizacion);
				}
				else{
					$scope.getDescartados();
				}
			}
		};

		$scope.cambioOrganizacionResueltos = function(orden){
			$scope.organizacion = orden;
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getResueltos($scope.tipo,$scope.organizacion);
				}else{
					$scope.getResueltos($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getResueltos('',$scope.organizacion);
				}
				else{
					$scope.getResueltos();
				}
			}
		};

		$scope.cambioOrganizacionProceso = function(orden){
			$scope.organizacion = orden;
			if($scope.tipo!=='todos'){
				if($scope.organizacion !== 'desc'){
					$scope.getMailboxProceso($scope.tipo,$scope.organizacion);
				}else{
					$scope.getMailboxProceso($scope.tipo,'');
				}
			}else{
				if($scope.organizacion !== 'desc'){
					$scope.getMailboxProceso('',$scope.organizacion);
				}
				else{
					$scope.getMailboxProceso();
				}
			}
		};
/*
                 _               _    _       _  __ _               _       
                | |             | |  | |     (_)/ _(_)             | |      
   ___ _ __   __| |  _ __   ___ | |  | |_ __  _| |_ _  ___ __ _  __| | ___  
  / _ \ '_ \ / _` | | '_ \ / _ \| |  | | '_ \| |  _| |/ __/ _` |/ _` |/ _ \ 
 |  __/ | | | (_| | | | | | (_) | |__| | | | | | | | | (_| (_| | (_| | (_) |
  \___|_| |_|\__,_| |_| |_|\___/ \____/|_| |_|_|_| |_|\___\__,_|\__,_|\___/ 
                                                                            
*/

        // Funcion  que sirve para cambiar el filtrado de cada buzon
        $scope.cambioBuzon = function(tipo){

        	$scope.tipoBuzon = tipo;
        	
			$scope.mostrarSelectorBandeja = false;
			
			switch($scope.tipoBuzon){
				
				case 'nuevos':
				$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
				break;
				//case 'proceso':
				//$scope.textoSelectorBandeja = "Proceso";
				//break;
				case 'atendidos':
				$scope.textoSelectorBandeja = "Atendidos";
				break;
				case 'descartados':
				$scope.textoSelectorBandeja = "Descartados";
				break;
				case 'asignados':
				$scope.textoSelectorBandeja = "Asignados";
				break;
				case 'todos':
				$scope.textoSelectorBandeja = "Todos";
				break;												

				
				default:
				$scope.textoSelectorBandeja = "Todos";
																								
			}
			        	
			if($scope.s){
				$scope.palabra = $scope.s;
			}else{
				$scope.palabra = '';
			}
            if($scope.tipo!=='todos'){
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, $scope.organizacion, $scope.palabra);
                }else{
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, '', $scope.palabra);
                }
            }else{
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, '', $scope.organizacion, $scope.palabra);
                }
                else{
                    $scope.obtieneBuzon($scope.tipoBuzon, '', '', $scope.palabra);
                }
            }
        };
        
        
        


        //Funcion que nos servira para realizar las busquedas por medio del filtro de nombre
		$scope.busqueda = function(){
			if($scope.s){
				$scope.palabra = $scope.s;
			}else{
				$scope.palabra = '';
			}

           if($scope.tipo!=='todos'){
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, $scope.organizacion , $scope.palabra);
                }else{
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, '', $scope.palabra);
                }
            }else{
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, '',$scope.organizacion , $scope.palabra);
                }
                else{
                    $scope.obtieneBuzon($scope.tipoBuzon, '', '', $scope.palabra);
                }
            }
		};

        //Funcion que nos sirve para cambiar el tipo de cuenta a filtrar. Ejemplo: Twitter, Facebook, Inbox, etc.
        $scope.cambioTipoCuenta = function(tipo){
        	$scope.tipo = tipo;
			$scope.mostrarSelectorRed = false;
			switch($scope.tipo){
				
				case 'facebook':
				$scope.textoSelectorRed = "<i class='fa fa-facebook' style='color:#375697;'></i>&nbsp;General";
				break;
				case 'facebook_public':
				$scope.textoSelectorRed = "<i class='fa fa-facebook' style='color:#375697;'></i>&nbsp;Público";
				break;
				case 'facebook_inbox':
				$scope.textoSelectorRed = "<i class='fa fa-facebook' style='color:#375697;'></i>&nbsp;Privado";
				break;
				
				case 'twitter':
				$scope.textoSelectorRed = "<i class='fa fa-twitter' style='color:#375697;'></i>&nbsp;General";
				break;
				case 'twitter_public':
				$scope.textoSelectorRed = "<i class='fa fa-twitter' style='color:#375697;'></i>&nbsp;Público";
				break;
				case 'direct_message':
				$scope.textoSelectorRed = "<i class='fa fa-twitter' style='color:#375697;'></i>&nbsp;Privado";
				break;
				case 'tracker':
				$scope.textoSelectorRed = "<i class='fa fa-twitter' style='color:#375697;'></i>&nbsp;Trackers";
				break;
				
				default:
				$scope.textoSelectorRed = "Todos";
																								
			}
			
		        	
			if($scope.s){
				$scope.palabra = $scope.s;
			}else{
				$scope.palabra = '';
			}
            if($scope.tipo!=='todos'){
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, $scope.organizacion, $scope.palabra);
                }else{
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, '', $scope.palabra);
                }
            }else{
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, '', $scope.organizacion, $scope.palabra);
                }
                else{
                    $scope.obtieneBuzon($scope.tipoBuzon, '', '', $scope.palabra);
                }
            }
        };

        //Función que ayuda a filtrar los mensajes de manera ascendente o dscendente
        $scope.cambioOrganizacionUnificado = function(organizacion){
        	if($scope.s){
				$scope.palabra = $scope.s;
			}else{
				$scope.palabra = '';
			}
        	$scope.organizacion = organizacion;
            if($scope.tipo!=='todos'){
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, $scope.organizacion, $scope.palabra);
                }else{
                    $scope.obtieneBuzon($scope.tipoBuzon, $scope.tipo, '', $scope.palabra);
                }
            }else{
                if($scope.organizacion !== 'desc'){
                    $scope.obtieneBuzon($scope.tipoBuzon, '', $scope.organizacion, $scope.palabra);
                }
                else{
                    $scope.obtieneBuzon($scope.tipoBuzon, '', '', $scope.palabra);
                }
            }
        };
/*
        _     _   _                 ____                       
       | |   | | (_)               |  _ \                      
   ___ | |__ | |_ _  ___ _ __   ___| |_) |_   _ _______  _ __  
  / _ \| '_ \| __| |/ _ \ '_ \ / _ \  _ <| | | |_  / _ \| '_ \ 
 | (_) | |_) | |_| |  __/ | | |  __/ |_) | |_| |/ / (_) | | | |
  \___/|_.__/ \__|_|\___|_| |_|\___|____/ \__,_/___\___/|_| |_|
                                                               
*/
        //Función para obtener todos los mensajes de la cuenta en general
        $scope.obtieneBuzon = function(tipoBuzon, filtro, organizacion, palabra){   
        	//Validamos la palabra de la busqueda
            if(typeof palabra==='undefined'){
                palabra = '';
            }     
            //Validamos que el tipo del buzón tenga algún valor
            if(typeof tipoBuzon==='undefined'){
                tipoBuzon = 'todos';
            }

            //Validacion de la variable para descendente o ascendente
            if(typeof organizacion==='undefined'){
                organizacion='';
            }

            //Validamos el tipo de red como por ejemplo Facebook, Twitter, inbox, direct_message
            if(typeof filtro==='undefined'){
                filtro='';
            }

            $scope.muestraLoading=false;
            $scope.muestraLoadingPrimario=true;
            $scope.MuestraListadoFeeds = false;
            $scope.quita_scroll = false;
            Socket.emit('getData');
            var id = $scope.authentication.user.cuenta._id;
            var idUsuario = $scope.authentication.user._id;
            
            function getUserPhoto(id_usuario, callback) {
                $http.get('/getUserData?userId=' + id_usuario).success(function(data) {
                    if(data){
                        return callback(data);
                    }else{
                        console.log('error');
                    }
                });
            }

            var cuentaData = 0;
            $http.get('/mailbox/?id='+id+'&eltipo='+filtro+'&organizacion='+organizacion+'&tipoBuzon='+tipoBuzon+'&idUsuario='+idUsuario+'&palabra='+palabra).success(function(data){
                $scope.posts = data;    
                
                //Sirve para saber si muestra la imagen de no post              
                if(typeof data.length !== 'undefined'){
                    $scope.hayPost = true;      
                }else{
					$scope.muestraLoadingPrimario=false;
                    $scope.hayPost = false;
                }

                //If que asigna la ultima fecha para utilizar en la paginación y la elimina del arreglo
                if(typeof data.length !== 'undefined'){
                    cuentaData = data.length - 1;
                    $scope.fechas = data[cuentaData].fecha;
                    delete $scope.posts[cuentaData];
                    $scope.posts = $scope.posts.filter(function(){return true;});
                }


                for(var i in $scope.posts){
                    //Función que nos ayuda a obtener los followers en la base de datos
                    (function(w) {
                        if($scope.posts[w].obj === 'twitter' && $scope.posts[w].tipo === 'twit'){
                            $scope.isFollow(w);
                            $scope.isInfluencer(w);
                        }                   
                    }(i));

                    //Validación que nos ayuda a obtener la foto del usuario que resalizo la respuesta
                    if(typeof $scope.posts[i].respuestas !== 'undefined'){
                        for(var cont in $scope.posts[i].respuestas){
                            $scope.posts[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
                            (function(w,contador) {
                                $scope.getUserPhoto($scope.posts[w].respuestas[contador].user_id, function(conv) {
                                    if(conv[0]){
                                        $scope.posts[w].respuestas[contador].foto = conv[0].imagen_src;
                                    }
                                });                 
                            }(i,cont));
                        }   
                    }

                    delete $scope.posts[i].conversacion;
                    $scope.posts[i].conversacion = [];
                    $scope.posts[i].conv_cuenta++;
                    if($scope.posts[i].conv_cuenta < 1){
                        $scope.posts[i].conv_cuenta = '';
                    }
                }

                $scope.muestraLoading=false;
                $scope.muestraLoadingPrimario=false;
                $scope.quita_scroll = false;
            
                if (id) {
                    /*setInterval(function(){
                    	if($scope.posts){ 
	                        if (typeof $scope.posts[0] !== 'undefined') {
	                            if($scope.tipoBuzon === 'nuevos'){
	                                $http.get('getNuevos/'+$scope.authentication.user.cuenta._id+'?lastct='+$scope.posts[0].created_time+'&tipo='+$scope.tipo).success(function(data) {
	                                    if($scope.organizacion !== 'asc')
	                                        $scope.nuevos = data.cuenta;
	                                    if(data.cuenta > 0){
	                                        $http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id}).success(function(data){
	                                            $scope.pendientes = parseInt(data);
	                                        });
	                                    }
	                                });
	                            }
	                        }
                    	}
                    },30000);*/
                    $scope.MuestraListadoFeeds = true;
                }  
            });
        };
/*
                 _         _     _   _                 ____                       
                | |       | |   | | (_)               |  _ \                      
   ___ _ __   __| |   ___ | |__ | |_ _  ___ _ __   ___| |_) |_   _ _______  _ __  
  / _ \ '_ \ / _` |  / _ \| '_ \| __| |/ _ \ '_ \ / _ \  _ <| | | |_  / _ \| '_ \ 
 |  __/ | | | (_| | | (_) | |_) | |_| |  __/ | | |  __/ |_) | |_| |/ / (_) | | | |
  \___|_| |_|\__,_|  \___/|_.__/ \__|_|\___|_| |_|\___|____/ \__,_/___\___/|_| |_|
                                                                                  
      */

		/* Obtener el mailbox principal y general */
	    $scope.getFb = function(filtro, organizacion){
	    	if(typeof organizacion==='undefined'){
	    		organizacion='';
	    	}

	    	if(typeof filtro==='undefined'){
	    		filtro='';
	    	}

			$scope.muestraLoading=false;
			$scope.muestraLoadingPrimario=true;
			$scope.MuestraListadoFeeds = false;
			$scope.quita_scroll = false;
			Socket.emit('getData');
			var id = $scope.authentication.user.cuenta._id;
		
			function getUserPhoto(id_usuario, callback) {
		    	// function obtieneFotoUsuario(id_usuario,callback){
		    	if(id_usuario === null){
		    		id_usuario = '';
		    	}
		    	if(id_usuario !== 'direct-facebook' && id_usuario !== ''){
			    	$http.get('/getUserData?userId=' + id_usuario).success(function(data) {
						if(data){
			    	    	return callback(data);
						}else{
			    	    	console.log('error');
						}
			    	});
			    }
			}
			var cuentaData = 0;
			$http.get('/getMailbox/'+id+'?eltipo='+filtro+'&organizacion='+organizacion).success(function(data){

		    	$scope.posts = data;
		    	  	
		    	if(typeof data.length !== 'undefined'){
		    		$scope.hayPost = true;		
		    	}else{
		  			$scope.hayPost = false;
	  			}
		    	if(typeof data.length !== 'undefined'){
		    		cuentaData = data.length - 1;
		    		$scope.fechas = data[cuentaData].fecha;
		    		delete $scope.posts[cuentaData];
		    		$scope.posts = $scope.posts.filter(function(){return true;});
		    		$scope.aux = $scope.posts;
		    	}

		    	for(var i in $scope.posts){
		    	
					/* Obteniendo followers */
					(function(w) {
						if($scope.posts[w].obj === 'twitter' && $scope.posts[w].tipo === 'twit'){
							$scope.isFollow(w);
							$scope.isInfluencer(w);
						}		    		
		    		}(i));
					/* Obteniendo followers */
					/*respuestas*/
		    	if(typeof $scope.posts[i].respuestas !== 'undefined'){
			    for(var cont in $scope.posts[i].respuestas){
		    		$scope.posts[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
		    		(function(w,contador) {
				    $scope.getUserPhoto($scope.posts[w].respuestas[contador].user_id, function(conv) {
					$scope.posts[w].respuestas[contador].foto = conv[0].imagen_src;
				    });		    		
		    		}(i,cont));
			    }	
		    	}	
			/*respuestas*/		    	

		    	delete $scope.posts[i].conversacion;
		    	$scope.posts[i].conversacion = [];
		    	$scope.posts[i].conv_cuenta++;
		    	if($scope.posts[i].conv_cuenta < 1){
		    		$scope.posts[i].conv_cuenta = '';
		    	}
		    }
		    $scope.muestraLoading=false;
		    $scope.muestraLoadingPrimario=false;
		    $scope.quita_scroll = false;
		    if (id) {
			/*setInterval(function(){
			    if (typeof $scope.posts[0] !== 'undefined' && !$scope.s ) {
					$http.get('getNuevos/'+$scope.authentication.user.cuenta._id+'?lastct='+$scope.posts[0].created_time+'&tipo='+$scope.tipo).success(function(data) {
						console.log('nuevos: '+data.cuenta);
						if($scope.organizacion !== 'asc')
					   		$scope.nuevos = data.cuenta;
					    if(data.cuenta > 0){
						$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id}).success(function(data){
						    $scope.pendientes = parseInt(data);
						});
					    }
					});
			    }
			},30000);*/
			$scope.MuestraListadoFeeds = true;
		    }
		    
		});
	    };
	    /*getsFb*/
		
		$scope.getNConversacion = function(posts){
			var arr = [];
			var obj = {};
			for(var i in posts){
				arr[i] = posts[i];
				if(arr[i]._id){
					arr[i].n_conv = (arr[i].conversacion[1])?(arr[i].conversacion[1].conv_cuenta):(arr[i].conversacion[0].conv_cuenta);
					if(arr[i].conversacion[1]){
						arr[i].conversacion.splice(1,1);
					}else{
						arr[i].conversacion.splice(0,1);	
					}
				}
			}
		};
	    /* Funcion para obtener el buzon de completados */
	    $scope.getResueltos = function(filtro, organizacion){
	    	$scope.hayPost = true;
	    	
	    	
	    	if(typeof organizacion==='undefined'){
	    		organizacion='';
	    	}

	    	if(typeof filtro==='undefined'){
	    		filtro='';
	    	}

			$scope.muestraLoading=false;
			$scope.muestraLoadingPrimario=true;
			$scope.MuestraListadoFeeds = false;
			$scope.quita_scroll = false;
			var imagenDefecto = '/modules/core/img/usuario-sem-imagem.png';
			var id = $scope.authentication.user.cuenta._id;
			var cuentaData = 0;
			$http.get('/getMailboxResuelto/'+id+'?eltipo='+filtro+'&organizacion='+organizacion).success(function(data){
		   	$scope.posts = data;
		   	
			/*esto es para saber si muestra la imagen de no post*/	    			
		    if(typeof data.length !== 'undefined'){
		    	$scope.hayPost = true;			
		    }else{
				$scope.hayPost = false;
   			}

		    if(typeof data.length !== 'undefined'){
		    	cuentaData = data.length - 1;
		    	$scope.fechas = data[cuentaData].fecha;
		    	delete $scope.posts[cuentaData];
		    	$scope.posts = $scope.posts.filter(function(){return true;});
		    	$scope.aux = $scope.posts;
		    } 
		    
		    for(var i in $scope.posts){
		    	if($scope.posts[i].conversacion){
		    		$scope.posts[i].conversacion.splice(0,$scope.posts[i].conversacion.length);
		    	}
		    	if($scope.posts[i]._id){
		    		 	$scope.posts[i].conv_cuenta++;
		    		 	if($scope.posts[i].conv_cuenta < 1){
			    			$scope.posts[i].conv_cuenta = '';
			    		}
		    		 }

			if(!$scope.posts[i]._id){
			    delete $scope.posts[i];
			}else{
			    (function(w) {
				$scope.getUserPhoto($scope.posts[w].atendido.usuario_id, function(conv) {
					console.log(conv);
				    if(conv[0]){
						if(conv[0].hasOwnProperty('imagen_src') === true){
							 $scope.posts[w].atendido.usuario_foto = conv[0].imagen_src;
						}else{
							 $scope.posts[w].atendido.usuario_foto  = null;
						}
					}else{
						 $scope.posts[w].atendido.usuario_foto = null;
					}
				});
			    })(i);
			}
			
			
		    }
		    $scope.muestraLoadingPrimario=false;
		});
		
	    };
	    
		/* $scope.getResueltos*/	    
	    
	    $scope.$on('eventRegresaMailbox', function(e,item){
	    	if(item.descartado){
	    		$scope.regresarDescartado(item._id);
	    	}
	    	if(item.atendido){
	    		$scope.regresarResuelto(item);
	    	}
	    });

	    $scope.regresarDescartado = function(id){
	    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:id});
	    	$http.post('/regresarDescartado',{col:Authentication.user.cuenta.marca+'_consolidada',id:id}).success(function(data){
	    		for(var i in $scope.posts){
	    			if($scope.posts[i]){
		    			if($scope.posts[i]._id === id){
		    				delete $scope.posts[i];
		    				$scope.posts = $scope.posts.filter(function(){return true;}); 
		    			}
	    			}
	    		}
	    	});
	    };
	    $scope.regresarResuelto = function(twit){
	    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:twit._id});
	    	$http.post('/regresarResuelto',{col:Authentication.user.cuenta.marca+'_consolidada',twit: twit}).success(function(data){
	    		for(var i in $scope.posts){
	    			if($scope.posts[i]._id === twit._id){
	    				delete $scope.posts[i];
	    				$scope.posts = $scope.posts.filter(function(){return true;}); 
	    			}
	    		}
	    	});
	    };
	    $scope.getMailboxProceso = function(filtro, organizacion){
	    	if(typeof organizacion==='undefined'){
	    		organizacion='';
	    	}

	    	if(typeof filtro==='undefined'){
	    		filtro='';
	    	}
	    	$scope.muestraLoading=false;
			$scope.muestraLoadingPrimario=true;
			var cuentaData = 0;
			var imagenDefecto = '/modules/core/img/usuario-sem-imagem.png';
			var id = $scope.authentication.user.cuenta._id;
			$http.get('/getMailboxProceso/'+id+'?eltipo='+filtro+'&organizacion='+organizacion).success(function(data){
			    $scope.posts = data;

/*esto es para saber si muestra la imagen de no post*/	    			
		    			if(typeof data.length !== 'undefined'){
		    				$scope.hayPost = true;
		    				
		    			}else{
		    				$scope.hayPost = false;
		    			}
/*esto es para saber si muestra la imagen de no post*/
			    
		    	if(typeof data.length !== 'undefined'){
		    		cuentaData = data.length - 1;
		    		$scope.fechas = data[cuentaData].fecha;
		    		delete $scope.posts[cuentaData];
		    		$scope.posts = $scope.posts.filter(function(){return true;});
		    		$scope.aux = $scope.posts;
		    	} 
			    
			    for(var i in $scope.posts){
			    	if($scope.posts[i].conversacion){
			    		$scope.posts[i].conversacion.splice(0,$scope.posts[i].conversacion.length);
			    	}
			    	if($scope.posts[i]._id){
			    		 	$scope.posts[i].conv_cuenta++;
			    		 	if($scope.posts[i].conv_cuenta < 1){
				    			$scope.posts[i].conv_cuenta = '';
				    		}
			    		 }
			    		 
/*respuestas*/
		    	if(typeof $scope.posts[i].respuestas !== 'undefined'){
			    for(var cont in $scope.posts[i].respuestas){
		    		$scope.posts[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
		    		(function(w,contador) {
				    $scope.getUserPhoto($scope.posts[w].respuestas[contador].user_id, function(conv) {
						if(conv[0]){
								if(conv[0].hasOwnProperty('imagen_src') === true){
									$scope.posts[w].respuestas[contador].foto = conv[0].imagen_src;
								}else{
									$scope.posts[w].respuestas[contador].foto = [];
								}
							}else{
								$scope.posts[w].respuestas[contador].foto= [];
							}
				    });		    		
		    		}(i,cont));
			    }	
		    	}	

				if(!$scope.posts[i]._id){
				    delete $scope.posts[i];
				}
				//else{
				//    console.log('no hago nada');
				//}
				
			    }
			    
			    
			    $scope.muestraLoading=false;
			    $scope.muestraLoadingPrimario=false;
			});	
	    };

		$scope.getDescartados = function(filtro, organizacion){
	    	if(typeof organizacion==='undefined'){
	    		organizacion='';
	    	}

	    	if(typeof filtro==='undefined'){
	    		filtro='';
	    	}
			/*Se usará en los filtros ascendente y descendente*/
			$scope.muestraLoading=false;
			$scope.muestraLoadingPrimario=true;
			var cuentaData = 0;
			var id = $scope.authentication.user.cuenta._id;
			$http.get('/getMailboxDescartados/'+id+'?eltipo='+filtro+'&organizacion='+organizacion).success(function(data){
				$scope.posts = data;
				/*esto es para saber si muestra la imagen de no post*/	    			
		    	if(typeof data.length !== 'undefined'){
		    		$scope.hayPost = true;	
		    	}else{
		    		$scope.hayPost = false;
		    	}
				/*esto es para saber si muestra la imagen de no post*/

		    	if(typeof data.length !== 'undefined'){
		    		cuentaData = data.length - 1;
		    		$scope.fechas = data[cuentaData].fecha;
		    		delete $scope.posts[cuentaData];
		    		$scope.posts = $scope.posts.filter(function(){return true;});
		    		$scope.aux = $scope.posts;
		    	}
			    for(var i in $scope.posts){
			    	if($scope.posts[i].conversacion){
		    			$scope.posts[i].conversacion.splice(0,$scope.posts[i].conversacion.length);
		    		}
		    		 if($scope.posts[i]._id){
		    		 	$scope.posts[i].conv_cuenta++;
		    		 	if($scope.posts[i].conv_cuenta < 1){
			    			$scope.posts[i].conv_cuenta = '';
			    		}
		    		 }	    	
/*respuestas*/
		    	
		    	if(typeof $scope.posts[i].respuestas != 'undefined'){
		  
				
				for(var cont in $scope.posts[i].respuestas){
		    		
		    		$scope.posts[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png';
		    		
		    		(function(w,contador) {
					    $scope.getUserPhoto($scope.posts[w].respuestas[contador].user_id, function(conv) {
					    	if(typeof conv[0].imagen_src !== 'undefined'){
					    	$scope.posts[w].respuestas[contador].foto = conv[0].imagen_src;	
					    	}else{
					    	$scope.posts[w].respuestas[contador].foto = '/modules/core/img/usuario-sem-imagem.png';
					    	}
						 });		    		
		    		}(i,cont));
			
				
				}	


	
		    	}	
/*respuestas*/				    	
			    	
			    	if(!$scope.posts[i]._id){
			    		delete $scope.posts[i];
			    	}else{
					(function(w) {
					    $scope.getUserPhoto($scope.posts[w].descartado.idUsuario, function(conv) {						
							
					    	if(typeof conv[0] !== 'undefined'){
					    	$scope.posts[w].descartado.usuario_foto = conv[0].imagen_src;	
					    	}else{
					    		$scope.posts[w].descartado.usuario_foto = '/modules/core/img/usuario-sem-imagem.png';
					    	}	
					    								
						});
					})(i);
			    		
			    	}
			    }
				$scope.muestraLoading=false;
				$scope.muestraLoadingPrimario=false;
			});
		};

		$scope.$on('actualizaPost', function(event, selectedItem){
			$scope.act(selectedItem);
		});	
		$scope.act_nuevobuzon = function(twit){
			//$scope.tipoBuzon general
			//$scope.items[0].tipoMensaje
			switch(twit.tipoMensaje){
				case 'todos':
				break;
				case 'asignados':
				break;
				case 'atendidos':
				break;
				case 'descartados':
				break;
				case 'nuevos':
				break;
			};
		}
		$scope.act = function(twit){
			/*console.log('Descartando');
			console.log(twit);
			if(twit){
				if(twit.descartado){
					console.log('Voy a eliminar el descartado');
					if($location.$$path !== '/feeds/descartados'){
						for(var i in $scope.posts){
							if($scope.posts[i]){
								if(twit._id === $scope.posts[i]._id){
									console.log('Eliminando el mensaje en ACT !');
									delete $scope.posts[i];
									$scope.posts = $scope.posts.filter(function(){return true;}); 
									if($scope.tipoBuzon !== 'todos' && $scope.posts[i].tipoBuzon !== 'descartado'){
										delete $scope.posts[i];
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}else{
										$scope.posts[i].tipoMensaje = 'descartado';
										$scope.posts[i].descartado = twit.descartado;
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}
								}
							}
						}
					}
				}
			}
			if(twit){
				if(twit.descartado){
					if($location.$$path !== '/feeds/descartados'){
						for(var i in $scope.posts){
							if($scope.posts[i]){
								if(twit._id === $scope.posts[i]._id){
									delete $scope.posts[i];
									$scope.posts = $scope.posts.filter(function(){return true;}); 
								}
							}
						}
					}
				}else{
					for(var i in $scope.posts){
						if($scope.posts[i]){
							for(var j in twit){
								if($scope.posts[i]){
									if(twit[j] === $scope.posts[i]._id){
										delete $scope.posts[i];
										$scope.posts = $scope.posts.filter(function(){return true;}); 
									}
								}
							}
						}
					}
				}
			}*/
		};
		
		$scope.clasesNotificaciones = '';
		$scope.notificacionesOcultas = true;
		$scope.abrirNotificaciones = function(){	
	    	
		/*if($scope.notificacionesOcultas){
		$scope.notificacionesOcultas = false;
		$scope.clasesNotificaciones = 'mostrar animated fadeIn';
		
		}else{
		$scope.notificacionesOcultas = true;	
		$scope.clasesNotificaciones = 'animated bounceOutDown';
		}*/
	    	
	   };		


		$scope.mostrarSelectorRed = false;
		$scope.textoSelectorRed = 'Redes';
		$scope.seleccionarRed = function(){
			if($scope.mostrarSelectorRed === true){
			$scope.mostrarSelectorRed = false;	
			}else{
			$scope.mostrarSelectorRed = true;
			}
			
		}

		$scope.mostrarSelectorBandeja = false;
		$scope.textoSelectorBandeja = 'Bandejas';
		$scope.seleccionarBandeja = function(){
			if($scope.mostrarSelectorBandeja === true){
			$scope.mostrarSelectorBandeja = false;	
			}else{
			$scope.mostrarSelectorBandeja = true;
			}
			
		}
		
		
/*esta función es para monitorear el id del elemento que se haga click en el body*/
$('body').click(function(e){
 
 var id = e.target.id;
 //console.log('id '+id);
 
 
 if(id !== ''){
 	if(id !== 'comboBandeja'){
 		$scope.mostrarSelectorBandeja = false;	
 	}
 	if(id !== 'comboRedes'){
 		$scope.mostrarSelectorRed = false;
 	}
	/*if(id !== 'notificaciones-cont' && id !== 'compana-cont' && id !== 'campana-salir'){
		
		if($scope.notificacionesOcultas === false){
		console.log('ocultando...');
		$scope.abrirNotificaciones();	
		}else{
		console.log('mostrando...');
		}
		
	}*/
 }else{
 		
 		
 		$scope.mostrarSelectorBandeja = false;
 		$scope.mostrarSelectorRed = false;
 }
 
 
 
 
});
/*esta función es para monitorear el id del elemento que se haga click en el body*/		
		

	}
])
.controller('ModalDemoCtrl', function ($scope, $modal,$http,$location,$log,$resource,Authentication,Socket,$rootScope,CONSTANT) {
$scope.terminar = function(){
	$scope.close();
};
$scope.$on('finalizarCtrlLast',function(event,item){
	$scope.$emit('finalizarCtrl', item);
});

$scope.textos = {
	tema:'Tema',
	subtema:'Subtema'
};
$scope.constant = CONSTANT;
	    $scope.getUserPhoto = function(id_usuario, callback) {
	    	if(id_usuario === null){
	    		id_usuario = '';
	    	}
	    	if(id_usuario !== 'direct-facebook' && id_usuario !== ''){
				$http.get('/getUserData?userId=' + id_usuario).success(function(data) {
				    callback(data);
				});
			}
	    };

	    $scope.asignarMensaje = function(tweet){
	    	console.log($scope.authentication.user);
	    	var modalInstance = $modal.open({
		      templateUrl: 'modalAsignar.html',
		      controller: 'ModalAsignarCtrl',
		      windowClass: 'modal fade in',
		      size: 'lg',
		      backdrop: 'static',
		      keyboard:false,
		      backdropClick: false,
		      resolve: {
		        mensaje: function () {
		          return tweet;
		        },
		        usuarios: function(){
		        	$scope.authentication = Authentication;

		        	return $http.get('/usuarios?cuenta='+$scope.authentication.user.cuenta.marca+'&user='+$scope.authentication.user._id).success(function(users){
		        		console.log(users);
		        		$scope.usuarios_cuenta = users;
		        		return $scope.usuarios_cuenta;
		        	});
		        }
		      }
		    });
		    modalInstance.result.then(function (selectedUser) {
		    	console.log('El usuario elegido es ');
		    	console.log(selectedUser);
		    	if(selectedUser.influencers || selectedUser.asignado){
				   	console.log('Eliminando notificacion');
				   	Socket.emit('eliminaNotificacion',selectedUser._id);
				}
		    }, function (selectedUser) {
		    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:selectedUser._id});
		      $log.info('Modal dismissed at: ' + new Date());
		    });
	    };
  $scope.open = function (tweet) {
  	console.log(tweet);
  	$scope.tweet = [tweet];
  	
    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      windowClass: 'modal fade in',
      size: 'lg',
      backdrop: 'static',
      keyboard:false,
      backdropClick: false,
      resolve: {
        items: function () {
          return $scope.tweet;
        },
        temas: function(){
        	$scope.authentication = Authentication;
			var service_temas = $resource('/cuentas/getTemas/:tema',{tema:'@tema'});
			return service_temas.get({tema: $scope.authentication.user.cuenta.marca},function(data){
				$scope.temas = data[0];
				return $scope.temas;
			});
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
    	delete selectedItem.conversacion;
    	selectedItem.conversacion = new Array();
    	$scope.$emit('actualizaPost', selectedItem);
      	$scope.selected = selectedItem;
      	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:selectedItem._id});
      	if(selectedItem.influencer || selectedItem.asignado){
		   	console.log('Eliminando notificacion');
		   	Socket.emit('eliminaNotificacion',selectedItem._id);
		}
    }, function (selectedItem) {
    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:selectedItem._id});
      $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.openOrigin = function(tweet){
    };
  };
  
  
  
  $scope.comparaUrl = function(){
  	NotificacionService.getDesempenio().success(function(data){
		$scope.totalDesempenioDiario = data;
	});
  	if($location.$$search.colec){
	  	var notificacion = {};
	  	notificacion.coleccion = $location.$$search.colec;
	  	notificacion.mongo_id = $location.$$search.mo_id;
	  	notificacion._id = $location.$$search.not_id;
	    $scope.openNotificacion(notificacion);
  	}
  };

  $scope.openNuevo = function (tweet) {
  	$scope.items=[tweet];
    var modalInstance = $modal.open({
      		templateUrl: 'nuevoInfluencers.html',
      		controller: 'ModalInstanceCtrl',
      		size: 150,
      		resolve: {
        		items: function () {
          			return $scope.items;
        		},
		        temas: function(){
		        	$scope.authentication = Authentication;
					var service_temas = $resource('/cuentas/getTemas/:tema',{tema:'@tema'});
					return service_temas.get({tema: $scope.authentication.user.cuenta.marca},function(data){
						$scope.temas = data[0];
						return $scope.temas;
					});
		        }
      		}
    	});

    modalInstance.result.then(function (data) {	  
	  $scope.$emit('informacionInfluencers', data);
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  /* Abre single de notificaciones */
    $scope.openNotificacion = function(notificacion){
		  	$scope.tweet = [notificacion];
		    var modalInstance = $modal.open({
		      templateUrl: 'myModalContent.html',
		      controller: 'ModalInstanceCtrl',
		      size: 150,
		      backdrop: 'static',
		      keyboard:false,
		      backdropClick: false,
		      resolve: {
		        items: function () {
		          return $http.get('getOneContent?colec='+notificacion.coleccion+'&mo_id='+notificacion.mongo_id).success(function(data){
		          	data.mo_id = notificacion._id;
		          	return data;
		          });
		        },
		        temas: function(){
		        	$scope.authentication = Authentication;
					var service_temas = $resource('/cuentas/getTemas/:tema',{tema:'@tema'});
					return service_temas.get({tema: $scope.authentication.user.cuenta.marca},function(data){
						$scope.temas = data[0];
						return $scope.temas;
					});
		        }
		      }
		    });
		    modalInstance.result.then(function (selectedItem) {
		    	console.log('Entrando a resolve modal !!!!');
		    	console.log(selectedItem);
		   	  	$scope.$emit('actualizaPost',selectedItem);
		   	  	if(selectedItem.influencers || selectedItem.asignado){
		   	  		console.log('Eliminando notificacion');
		   	  		Socket.emit('eliminaNotificacion',selectedItem._id);
		   	  	}
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
  	};
 /*Abre el modal de los descratados*/
  $scope.openDescartados = function (tweet) {
  	console.log(tweet);
  	$scope.tweet = [tweet];
    var modalInstance = $modal.open({
      templateUrl: 'descartados.html',
      controller: 'ModalInstanceCtrl',
      size: 150,
      resolve: {
        items: function () {
          return $scope.tweet;
        },
        temas: function(){
        	$scope.authentication = Authentication;
			var service_temas = $resource('/cuentas/getTemas/:tema',{tema:'@tema'});
			return service_temas.get({tema: $scope.authentication.user.cuenta.marca},function(data){
				$scope.temas = data[0];
				return $scope.temas;
			});
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
   	  $scope.$emit('actualizaPost', selectedItem);
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.openOrigin = function(tweet){
    	
    };
  };

 /*fin descartados*/ 

 /*Confirmacion de RegresarDescartado*/
 $scope.openRegresaDescartados = function (tweet) {
    var modalInstance = $modal.open({
      templateUrl: 'regresaDescartado.html',
      controller: 'ModalInstanceCtrl',
      size: 750,
      resolve: {
        items: function () {
          return [tweet];
        },
        temas: function(){
        	return tweet;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.openOrigin = function(tweet){
    	
    };
  };
 /*Confirmacion de RegresarDescartado*/
})
.controller('ModalInstanceCtrl',function ($scope, $modalInstance, items,temas,$resource,$http,Accounts,Authentication,Socket,$rootScope,$modal,$timeout,CONSTANT) {
	//Variable que contiene los textos default de tema y subtema
	$scope.textos = {
		tema:'Tema',
		subtema:'Subtema'
	};

	//Arreglo que guarda la lista de industrias para la parte de los influencers
	$scope.listaIndustry = [
		'Anuncios & Marketing',
		'Artes & Entretenimiento',
		'Auto',
		'Negocios',
		'Computadoras & Electronicos',
		'Bienes de consumo envasados',
		'Citas',
		'Familia y Maternidad',
		'Servicios Financieros',
		'Fitness & Perdida de peso',
		'Comida & Bebidas',
		'Juegos',
		'Hobbies / Intereses',
		'Casa & Jardin',
		'Trabajos & Educación',
		'Ley, Gobierno & Politicas',
		'Media',
		'Sin fines de lucro',
		'Regalos',
		'Mascotas',
		'Farmaceutica & Cuidado de la Salud',
		'Real Estate',
		'Religion & Espiritualidad',
		'Retail',
		'Software',
		'Estilo, Moda & Belleza',
		'Telecomunicaciones',
		'Viajes',
		'Deportes'
	];
	
	$scope.listaIndustry.sort();
	$scope.listaIndustry.push('Otro');
	
    $scope.constant = CONSTANT;

	$scope.items = items;
	$scope.authentication = Authentication;
	$scope.habilit = true;
  	$scope.nuevo_tema_activo  = true;
  	$scope.nuevo_subtema_activo = true;
  	$scope.temas = {};
  	
  	$scope.notSorted = function(obj){
		if (!obj) {
		    return [];
		}
		return Object.keys(obj);
  	};
  	
  	if(temas.$promise){
  		temas.$promise.then(function(data){
	  		var temas_ordenados = _.sortBy(data,'tema');
	  		var count = 0;
	  		for(var i in temas_ordenados){
	  			if(temas_ordenados[i].tema){
	  				$scope.temas[count] = temas_ordenados[i];
	  				count++;
	  			}
	  		}
	 	});
  	}
  
  	$scope.single = {};
  	$scope.cambio = 'Atender';
  	$scope.texto_completar = 'Resolver';
  	$scope.texto_aceptar = 'Aceptar';
  	$scope.authentication = Authentication;
	$scope.statusLoginFacebook = false;
	
	//Si nos e esta logeado en Facebook
	if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
	}
  	if(items[0]){
  		if(items[0].conv_cuenta > 1){
  			if(items[0].conversacion.length > 1){
				$scope.carga = false;
  			}else{
  				$scope.carga = true;
  			}	
  		}else{
  			$scope.carga = false;
 		}
   	}else{
  		$scope.carga = false;
   	}

  	if(items.data){
  		items.data.origen = 'notificacion';
  		$scope.items[0] = items.data;
  		$scope.actual_sentiment=$scope.items[0].sentiment;
  	}else{
  		$scope.actual_sentiment =items[0].sentiment;
  	}
    $scope.selected = {
    	item: $scope.items
  	};
  	var datos_bloqueo = {};
  	datos_bloqueo.cuenta = $scope.authentication.user.marca;
  	datos_bloqueo.user = $scope.authentication.user.displayName;
  	datos_bloqueo._id = items[0]._id;
  	datos_bloqueo.user_image = $scope.authentication.user.imagen_src;
  	Socket.emit('idBloquea',datos_bloqueo);

/*
                 _   _                      _   
                | | (_)                    | |  
  ___  ___ _ __ | |_ _ _ __ ___   ___ _ __ | |_ 
 / __|/ _ \ '_ \| __| | '_ ` _ \ / _ \ '_ \| __|
 \__ \  __/ | | | |_| | | | | | |  __/ | | | |_ 
 |___/\___|_| |_|\__|_|_| |_| |_|\___|_| |_|\__|
                                                
*/
  	//Método que realiza la representación gráfica del sentiment
	$scope.sentiment = function(sentiment,id,col,real){
		$scope.back_sentiment = $scope.items[0].sentiment;
		if(!real){
			real = '';
		}
		var cole = $scope.authentication.user.cuenta.marca+'_consolidada';
		var elemento;
		switch(sentiment){
			case 'positivo':
				elemento = angular.element(document.querySelector('#positivo-'+id));
				elemento.addClass('positivo-activo');
				 
				elemento = angular.element(document.querySelector('#neutro-'+id));
				elemento.removeClass('neutro-activo');
				 
				elemento = angular.element(document.querySelector('#negativo-'+id));
				elemento.removeClass('negativo-activo');
			break;

			case 'negativo':
				elemento = angular.element(document.querySelector('#positivo-'+id));
				elemento.removeClass('positivo-activo');
				 
				elemento = angular.element(document.querySelector('#neutro-'+id));
				elemento.removeClass('neutro-activo');
				 
				elemento = angular.element(document.querySelector('#negativo-'+id));
				elemento.addClass('negativo-activo');			
			break;

			case 'neutro':
				elemento = angular.element(document.querySelector('#positivo-'+id));
				elemento.removeClass('positivo-activo');
				
				elemento = angular.element(document.querySelector('#neutro-'+id));
				elemento.addClass('neutro-activo');
				 
				elemento = angular.element(document.querySelector('#negativo-'+id));
				elemento.removeClass('negativo-activo');			
			break;
		
		}
		
		if(real === 'real'){

			var criterio = {
				'twit' : id,
				'sentiment' : sentiment,
				'coleccion' : col,
				'user_name' : $scope.authentication.user.displayName,
				'user_id' : $scope.authentication.user._id
			};

			//$http.post('/sentiment', criterio).success(function(data){});
		}
		if($scope.items[0]._id === id){
			$scope.items[0].sentiment_actualizado = true;
			$scope.items[0].sentiment = sentiment; 
		}
	};

/*
                 _                  _   _                      _   
                | |                | | (_)                    | |  
   ___ _ __   __| |  ___  ___ _ __ | |_ _ _ __ ___   ___ _ __ | |_ 
  / _ \ '_ \ / _` | / __|/ _ \ '_ \| __| | '_ ` _ \ / _ \ '_ \| __|
 |  __/ | | | (_| | \__ \  __/ | | | |_| | | | | | |  __/ | | | |_ 
  \___|_| |_|\__,_| |___/\___|_| |_|\__|_|_| |_| |_|\___|_| |_|\__|
                                                                   
*/

	if($scope.items[0].clasificacion){
		if($scope.items[0].clasificacion !== 'null' && $scope.items[0].clasificacion !== 'null'){
			$scope.themeDefault=($scope.items[0].clasificacion.tema !== null)?$scope.items[0].clasificacion.tema:$scope.textos.tema;
			$scope.subthemeDefault=($scope.items[0].clasificacion.subtema !== null )?$scope.items[0].clasificacion.subtema:$scope.textos.subtema;
		}else{
			$scope.themeDefault=$scope.textos.tema;
			$scope.subthemeDefault=$scope.textos.subtema;
		}
	}else{
		$scope.themeDefault=$scope.textos.tema;
		$scope.subthemeDefault=$scope.textos.subtema;
	}
    
    $scope.seleccionaTema = function(idTema,nombreTema){
		$scope.themeDefault=nombreTema;
		idTema='';
		nombreTema='';
    };
	
	$scope.addTheme=false;
	$scope.muestra_mas_temas = true;
	$scope.muestra_mas_subtemas = true;
/* *
  ______     ___      .______        _______      ___           ______   ______   .__   __. ____    ____  _______ .______          _______.     ___       ______  __    ______   .__   __. 
 /      |   /   \     |   _  \      /  _____|    /   \         /      | /  __  \  |  \ |  | \   \  /   / |   ____||   _  \        /       |    /   \     /      ||  |  /  __  \  |  \ |  | 
|  ,----'  /  ^  \    |  |_)  |    |  |  __     /  ^  \       |  ,----'|  |  |  | |   \|  |  \   \/   /  |  |__   |  |_)  |      |   (----`   /  ^  \   |  ,----'|  | |  |  |  | |   \|  | 
|  |      /  /_\  \   |      /     |  | |_ |   /  /_\  \      |  |     |  |  |  | |  . `  |   \      /   |   __|  |      /        \   \      /  /_\  \  |  |     |  | |  |  |  | |  . `  | 
|  `----./  _____  \  |  |\  \----.|  |__| |  /  _____  \     |  `----.|  `--'  | |  |\   |    \    /    |  |____ |  |\  \----.----)   |    /  _____  \ |  `----.|  | |  `--'  | |  |\   | 
 \______/__/     \__\ | _| `._____| \______| /__/     \__\     \______| \______/  |__| \__|     \__/     |_______|| _| `._____|_______/    /__/     \__\ \______||__|  \______/  |__| \__| 
                                                                                                                                                                                            
 * */	
 
 
 	    $scope.getUserPhoto = function(id_usuario, callback) {
 	    	if(id_usuario === null){
 	    		id_usuario = '';
 	    	}
 	    	if(id_usuario !== 'direct-facebook' && id_usuario !== ''){
				$http.get('/getUserData?userId=' + id_usuario).success(function(data) {
				    callback(data);
				});
	    	}
	    };
 
	
	$scope.cargaConversacion = function(post){
		$scope.carga = false;
	    var user_id;
		var tipo;
		if(post.tipo){
			tipo = post.tipo;
		}else{
			tipo = post.type;
		}
		console.log
		var urlConv = 'getHistPend?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo;
		if(post.parent_post){
			var parent = post.parent_post;
			urlConv = 'getHistPend?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo+'&parent='+parent;
		}
		$http.get(urlConv).success(function(data){
		console.log('Resultado de leer mas');
		console.log(data);			
			for(var i in data.conversacion){
				if(data.conversacion[i]._id !== $scope.items[0]._id){
					$scope.items[0].conversacion.push(data.conversacion[i]);
				}
				/*respuestas*/
				if ( typeof data.conversacion[i].respuestas !== 'undefined') {

					for (var cont in data.conversacion[i].respuestas) {
						data.conversacion[i].respuestas[cont].tipo = 'respuesta';
						data.conversacion[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png'; ( function(w, contador) {
								$scope.getUserPhoto(data.conversacion[w].respuestas[contador].user_id, function(conv) {

									data.conversacion[w].respuestas[contador].foto = conv[0].imagen_src;
								});
							}(i, cont));

					}

				}//if respuestas
				/*respuestas*/
				
			}
			
		});
		
	};


/* *
  ______     ___      .______        _______      ___           ______   ______   .__   __. ____    ____  _______ .______          _______.     ___       ______  __    ______   .__   __. 
 /      |   /   \     |   _  \      /  _____|    /   \         /      | /  __  \  |  \ |  | \   \  /   / |   ____||   _  \        /       |    /   \     /      ||  |  /  __  \  |  \ |  | 
|  ,----'  /  ^  \    |  |_)  |    |  |  __     /  ^  \       |  ,----'|  |  |  | |   \|  |  \   \/   /  |  |__   |  |_)  |      |   (----`   /  ^  \   |  ,----'|  | |  |  |  | |   \|  | 
|  |      /  /_\  \   |      /     |  | |_ |   /  /_\  \      |  |     |  |  |  | |  . `  |   \      /   |   __|  |      /        \   \      /  /_\  \  |  |     |  | |  |  |  | |  . `  | 
|  `----./  _____  \  |  |\  \----.|  |__| |  /  _____  \     |  `----.|  `--'  | |  |\   |    \    /    |  |____ |  |\  \----.----)   |    /  _____  \ |  `----.|  | |  `--'  | |  |\   | 
 \______/__/     \__\ | _| `._____| \______| /__/     \__\     \______| \______/  |__| \__|     \__/     |_______|| _| `._____|_______/    /__/     \__\ \______||__|  \______/  |__| \__| 
                                                                                                                                                                                            
 * */		


	$scope.cargaConversacionCompletos = function(post){
		$scope.carga = false;
	    var user_id;
		var tipo;
		if(post.type){
			tipo = post.type;
		}else{
			tipo = post.tipo;
		}
		var urlConv = 'getMoreComplete?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo;
		if(post.parent_post){
			var parent = post.parent_post;
			urlConv = 'getMoreComplete?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo+'&parent='+parent;
		}
		$http.get(urlConv).success(function(data){
			for(var i in data.conversacion){			
				if(data.conversacion[i]._id !== $scope.items[0]._id){
					$scope.items[0].conversacion.push(data.conversacion[i]);
				}
				/*respuestas*/
				if ( typeof data.conversacion[i].respuestas !== 'undefined') {
					for (var cont in data.conversacion[i].respuestas) {
						data.conversacion[i].respuestas[cont].tipo = 'respuesta';
						data.conversacion[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png'; ( function(w, contador) {
								$scope.getUserPhoto(data.conversacion[w].respuestas[contador].user_id, function(conv) {
									data.conversacion[w].respuestas[contador].foto = conv[0].imagen_src;
								});
							}(i, cont));

					}

				}//if respuestas
				/*respuestas*/	
			}
			
		});
		
	};


	$scope.cargaConversacionDescartados = function(post){
		$scope.carga = false;
	    var user_id;
		var tipo;
		if(post.type){
			tipo = post.type;
		}else{
			tipo = post.tipo;
		}
		var urlConv = 'getMoreDescartados?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo;
		if(post.parent_post){
			var parent = post.parent_post;
			urlConv = 'getMoreDescartados?cont_id='+post._id+'&colec='+post.coleccion+'&us_id='+post.from_user_id+'&created='+post.created_time+'&mtp='+tipo+'&parent='+parent;
		}
		$http.get(urlConv).success(function(data){
			for(var i in data.conversacion){			
				if(data.conversacion[i]._id !== $scope.items[0]._id){
					$scope.items[0].conversacion.push(data.conversacion[i]);
				}
				/*respuestas*/
				if ( typeof data.conversacion[i].respuestas !== 'undefined') {
					for (var cont in data.conversacion[i].respuestas) {
						data.conversacion[i].respuestas[cont].tipo = 'respuesta';
						data.conversacion[i].respuestas[cont].foto = '/modules/core/img/usuario-sem-imagem.png'; ( function(w, contador) {
								$scope.getUserPhoto(data.conversacion[w].respuestas[contador].user_id, function(conv) {
									data.conversacion[w].respuestas[contador].foto = conv[0].imagen_src;
								});
							}(i, cont));

					}

				}//if respuestas
				/*respuestas*/	
			}
			
		});
		
	};	


	
	$scope.addThemeClick=function(){
		if($scope.addTheme === true){
			$scope.muestra_mas_temas = true;
			$scope.addTheme=false;
		}else{
			$scope.addTheme=true;
			$scope.muestra_mas_temas = false;
			
			      $timeout(function() {
					$(angular.element(document.querySelector('#txtTema'))).focus();
      				});
			 
		}
			
	};
	
$scope.cerrarCrearTema = function(){
	$scope.addTheme = false;
};	
	

/*addSubThemeClick*/ 
	$scope.addSubTheme=false;

	$scope.addSubThemeClick=function(){
		if($scope.addSubTheme===true){
			$scope.muestra_mas_subtemas = true;
			$scope.addSubTheme=false;
		}else{
			$scope.addSubTheme=true;
			
			      $timeout(function() {
					$(angular.element(document.querySelector('#txtSubTema'))).focus();
      				});			
		}
		
	};
	

$scope.cerrarCrearSubtema = function(){
	
	$scope.addSubTheme=false;
};	
	
/*addSubThemeClick*/

	
	$scope.mensajeRespuesta='';

$scope.agregarRespuesta=function(){
	var tema='';
	var subtema='';
	//Valida si no se ha seleccionado un tema
	if($scope.themeDefault!=='Tema'){
		tema=$scope.themeDefault;
	}

	//Valida si no se ha seleccionado un subtema
	if($scope.subthemeDefault!=='Subtema'){
		subtema=$scope.subthemeDefault;
	}
	var response=$scope.respuesta.trim();
	if(response.length===0){
		$scope.mensajeRespuesta='No hay respuesta para añadir';
	}
	else{
	$http.post('/cuentas/insertRespuesta', {tema:tema,subtema:subtema,respuesta:$scope.respuesta,cuenta:$scope.authentication.user.cuenta.marca})
	.success(function(data){

	/* Casos para las respuestas:
	1.- La respuesta ingresada ya existe en la base de datos
	2.- no se ha seleccionado ningun tema, y se trata de añadir una respuesta
	*/
            if(data === 1){
		$scope.mensajeRespuesta = 'La respuesta ya existe';
	    }
	    else if(data === 2){
		$scope.mensajeRespuesta = 'No se ha seleccionado ningún tema para asignar la respuesta';
	    }
	    else if(data === 3){
		$scope.mensajeRespuesta = 'Ocurrio un error al añadir la respuesta';
	    }
	    else if (data === 4) {
		$scope.mensajeRespuesta = 'Ocurrió un error al buscar el tema';
	    }
	    else if (data === 5) {
		$scope.mensajeRespuesta = 'Algo raro sucedió: pareciera que el subtema seleccionado no existe';
	    }
	    else{
		$scope.responseThemes=data;
		$scope.mensajeRespuesta='La respuesta ha sido añadida';
	    }
        });
	}
};

//Funcion que realiza el cambio del tema respecto a la seleccion
$scope.cambioSelect = function(req, res){
	$scope.respuesta = '';
	$scope.themeDefault=req;
	$scope.tema = req;
	$scope.habilit = false;
  	$scope.nuevo_tema_activo = true;
  	$scope.nuevo_subtema_activo = true;
  	var id_selected=$scope.themeDefault;
	for(var i in $scope.temas){
  		if($scope.temas[i].tema === id_selected){
  			var tema_selected = $scope.temas[i];
  			var subtemas = {};
  			for(var j in $scope.temas[i].subtemas){
  				subtemas[j] = {'nombre':$scope.temas[i].subtemas[j].subtema};
  			}
  			$scope.subtemas = _.sortBy(subtemas,'nombre');//subtemas;
  		}
  	}
	//Vaciado de variables para subtemas
	$scope.subthemeDefault=$scope.textos.subtema;
	$scope.muestraRespuestasSubtemas=false;
	$scope.respuestasTemas();
  };
//Funciones que sirven para las respuestas

$scope.muestraRespuestasTemas=false;
$scope.responseThemes=[];
$scope.resInfo='';
$scope.respuesta='';

$scope.informacionRespuesta=function(resp){
	if(!$scope.respuesta){
		if($scope.items[0].obj === 'twitter' && $scope.items[0].tipo === 'twit'){
			$scope.respuesta += '@'+$scope.items[0].user.screen_name+' ';
		}
		$scope.respuesta +=resp;
		$scope.faltanteMensaje = $scope.faltanteMensaje - ($scope.respuesta.length);
	}else{
		$scope.respuesta = '';
		$scope.faltanteMensaje = 140;
		if($scope.items[0].obj === 'twitter'){
			$scope.respuesta += '@'+$scope.items[0].user.screen_name+' ';
		}
		$scope.respuesta +=resp;
		$scope.faltanteMensaje = $scope.faltanteMensaje - ($scope.respuesta.length);
	}
};

$scope.respuestasTemas=function(){
	var temaActual=$scope.themeDefault;
	$scope.muestraRespuestasTemas=true;

$http.post('/cuentas/getRespuestasTemas', {temaActual:temaActual,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
	$scope.responseThemes=data;     
        });
};

$scope.muestraRespuestasSubtemas=false;

$scope.respuestasSubTemas=function(){
        var subtemaActual=$scope.subthemeDefault;
        var temaActual=$scope.themeDefault;
        $scope.muestraRespuestasSubtemas=true;

$http.post('/cuentas/getRespuestasSubtemas', {subtemaActual:subtemaActual,temaActual:temaActual,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
       	var cuenta=data.length;
	if(cuenta!==0){
        $scope.muestraRespuestasTemas=false;	
	}
	else{
	$scope.muestraRespuestasTemas=true;
	}
	$scope.responseSubThemes=data;
        });
};

//Fin de funciones para respuestas

$scope.cambioRadioSubtema=function(nombreSubtema){
	$scope.subtema=nombreSubtema;
	$scope.subthemeDefault=nombreSubtema;
	$scope.subtema = nombreSubtema;
	$scope.respuestasSubTemas();
};

/*
                                     _______                   
                                    |__   __|                  
   __ _  __ _ _ __ ___  __ _  __ _ _ __| | ___ _ __ ___   __ _ 
  / _` |/ _` | '__/ _ \/ _` |/ _` | '__| |/ _ \ '_ ` _ \ / _` |
 | (_| | (_| | | |  __/ (_| | (_| | |  | |  __/ | | | | | (_| |
  \__,_|\__, |_|  \___|\__, |\__,_|_|  |_|\___|_| |_| |_|\__,_|
         __/ |          __/ |                                  
        |___/          |___/                                   
*/
//Método que nos ayuda a agregar un tema desde el buzón
	$scope.agregarTema = function(req,res){
		var temaNuevo=$scope.tema_nuevo;
		if(typeof temaNuevo==='undefined'){
			temaNuevo='';
		}
		temaNuevo=temaNuevo.trim();
		if(temaNuevo.length===0){
			$scope.mensaje_server='El tema ingresado está vacío';
		}else{
	  		$http.post('/cuentas/getTemas', {tema:$scope.tema_nuevo,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
	  			var contador = 0;
	  			if(data._id){
	  				contador = Object.keys($scope.temas).length;
		  			$scope.temas[contador] = {_id:data._id,tema:data.tema};
		  			$scope.nuevo_tema_activo = true;
		  			$scope.nuevo_subtema_activo = true;
					$scope.mensaje_server = 'Tema creado correctamente';
					$scope.addTheme=false;
					$scope.tema_nuevo='';
					$scope.themeDefault=data.tema;
					$scope.cambioSelect(data.tema);
				}else{
					$scope.mensaje_server = 'El tema '+temaNuevo+' ya existe';
					$scope.tema_nuevo='';	
		  		}
	  		});
		}
	};


/*AGREGAR SUBTEMA*/
  $scope.agregarSubtema = function(req, res){
  	var newSubtema=$scope.subtema_nuevo;
	if(typeof newSubtema==='undefined'){
		newSubtema='';
	}
	newSubtema.trim();
	if(newSubtema.length===0){
             $scope.mensaje_server_subtema = 'El subtema ingresado está vacío';
	}
	else{
	var subtemas = {};
  	$scope.subtemas = {};
  	var guardado;
  	var existe = false;
  	for(var i in $scope.temas){
  		if($scope.temas[i].tema === $scope.themeDefault){
  			
			if($scope.temas[i].subtemas === undefined){
				$scope.temas[i].subtemas = [{subtema:$scope.subtema_nuevo}];
				//Variable para uso general creadas por Gabriel Aguilar Regato
				//$scope.mensaje_server_subtema = 'El subtema se agrego correctamente';
                $scope.subthemeDefault=$scope.subtema_nuevo;
				$scope.addSubTheme=false;
  			}else{
  				for(var k in $scope.temas[i].subtemas){
  					if($scope.temas[i].subtemas[k].subtema === $scope.subtema_nuevo){
  						existe = true;
  					}
  				}
  					if(existe){
  						$scope.mensaje_server_subtema= 'El subtema ya existe';	
  					}else{
  						$scope.temas[i].subtemas.push({subtema:$scope.subtema_nuevo});
  						//$scope.mensaje_server_subtema = 'El subtema se agrego correctamente';
						$scope.subthemeDefault=$scope.subtema_nuevo;
						$scope.addSubTheme=false;
  					}
  				}	
  			for(var j in $scope.temas[i].subtemas){
  				subtemas[j] = {'nombre':$scope.temas[i].subtemas[j].subtema};
  			}
  			guardado = $scope.temas[i];
  			$scope.subtemas = subtemas;
  		}
	}
  	$http.post('/setSub',{_id:guardado.tema,subtema_nuevo:$scope.subtema_nuevo,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
  	});
	$scope.subtema_nuevo='';
	}
  };

  $scope.ok = function (req) {
    $modalInstance.close();
  };
  $scope.close = function (req) {
   Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:req._id});
    $modalInstance.close();
  };
  
$scope.faltanteMensaje = 140;
$scope.advertenciaLimiteMensaje = false;
  
  $scope.focus_area = function(){
  	if($scope.items[0].obj === 'twitter'){
   		if($scope.items[0].tipo !== 'direct_message'){
  			if(!$scope.respuesta){
	  			$scope.respuesta += '@'+$scope.items[0].user.screen_name+' ';
	  			$scope.faltanteMensaje = $scope.faltanteMensaje - ($scope.items[0].user.screen_name.length + 1);
	  		}
	  	}
		if($scope.faltanteMensaje < 0){
			$scope.advertenciaLimiteMensaje = true;
		}else{
			$scope.advertenciaLimiteMensaje = false;
		}  			
  	}
  };
  $scope.faceConnect = function(id){
  	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:id});
  };
  
  
 /*
FUNCIONES DE LA LIBRERÍA DE TWITTER
*/ 

if (typeof twttr === "undefined" || twttr === null) {
    var twttr = {};
  }

  twttr.txt = {};
  $scope.regexen = {};

  var HTML_ENTITIES = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  // HTML escaping
  $scope.htmlEscape = function(text) {
    return text && text.replace(/[&"'><]/g, function(character) {
      return HTML_ENTITIES[character];
    });
  };

  // Builds a RegExp
  function regexSupplant(regex, flags) {
    flags = flags || "";
    if (typeof regex !== "string") {
      if (regex.global && flags.indexOf("g") < 0) {
        flags += "g";
      }
      if (regex.ignoreCase && flags.indexOf("i") < 0) {
        flags += "i";
      }
      if (regex.multiline && flags.indexOf("m") < 0) {
        flags += "m";
      }

      regex = regex.source;
    }

    return new RegExp(regex.replace(/#\{(\w+)\}/g, function(match, name) {
      var newRegex = $scope.regexen[name] || "";
      if (typeof newRegex !== "string") {
        newRegex = newRegex.source;
      }
      return newRegex;
    }), flags);
  }

  $scope.regexSupplant = regexSupplant;

  // simple string interpolation
  function stringSupplant(str, values) {
    return str.replace(/#\{(\w+)\}/g, function(match, name) {
      return values[name] || "";
    });
  }

  $scope.stringSupplant = stringSupplant;

  function addCharsToCharClass(charClass, start, end) {
    var s = String.fromCharCode(start);
    if (end !== start) {
      s += "-" + String.fromCharCode(end);
    }
    charClass.push(s);
    return charClass;
  }

  $scope.addCharsToCharClass = addCharsToCharClass;

  // Space is more than %20, U+3000 for example is the full-width space used with Kanji. Provide a short-hand
  // to access both the list of characters and a pattern suitible for use with String#split
  // Taken from: ActiveSupport::Multibyte::Handlers::UTF8Handler::UNICODE_WHITESPACE
  var fromCode = String.fromCharCode;
  var UNICODE_SPACES = [
    fromCode(0x0020), // White_Space # Zs       SPACE
    fromCode(0x0085), // White_Space # Cc       <control-0085>
    fromCode(0x00A0), // White_Space # Zs       NO-BREAK SPACE
    fromCode(0x1680), // White_Space # Zs       OGHAM SPACE MARK
    fromCode(0x180E), // White_Space # Zs       MONGOLIAN VOWEL SEPARATOR
    fromCode(0x2028), // White_Space # Zl       LINE SEPARATOR
    fromCode(0x2029), // White_Space # Zp       PARAGRAPH SEPARATOR
    fromCode(0x202F), // White_Space # Zs       NARROW NO-BREAK SPACE
    fromCode(0x205F), // White_Space # Zs       MEDIUM MATHEMATICAL SPACE
    fromCode(0x3000)  // White_Space # Zs       IDEOGRAPHIC SPACE
  ];
  addCharsToCharClass(UNICODE_SPACES, 0x009, 0x00D); // White_Space # Cc   [5] <control-0009>..<control-000D>
  addCharsToCharClass(UNICODE_SPACES, 0x2000, 0x200A); // White_Space # Zs  [11] EN QUAD..HAIR SPACE

  var INVALID_CHARS = [
    fromCode(0xFFFE),
    fromCode(0xFEFF), // BOM
    fromCode(0xFFFF) // Special
  ];
  addCharsToCharClass(INVALID_CHARS, 0x202A, 0x202E); // Directional change

  $scope.regexen.spaces_group = regexSupplant(UNICODE_SPACES.join(""));
  $scope.regexen.spaces = regexSupplant("[" + UNICODE_SPACES.join("") + "]");
  $scope.regexen.invalid_chars_group = regexSupplant(INVALID_CHARS.join(""));
  $scope.regexen.punct = /\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?@\[\]\^_{|}~\$/;
  $scope.regexen.rtl_chars = /[\u0600-\u06FF]|[\u0750-\u077F]|[\u0590-\u05FF]|[\uFE70-\uFEFF]/mg;
  $scope.regexen.non_bmp_code_pairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/mg;

  var latinAccentChars = [];
  // Latin accented characters (subtracted 0xD7 from the range, it's a confusable multiplication sign. Looks like "x")
  addCharsToCharClass(latinAccentChars, 0x00c0, 0x00d6);
  addCharsToCharClass(latinAccentChars, 0x00d8, 0x00f6);
  addCharsToCharClass(latinAccentChars, 0x00f8, 0x00ff);
  // Latin Extended A and B
  addCharsToCharClass(latinAccentChars, 0x0100, 0x024f);
  // assorted IPA Extensions
  addCharsToCharClass(latinAccentChars, 0x0253, 0x0254);
  addCharsToCharClass(latinAccentChars, 0x0256, 0x0257);
  addCharsToCharClass(latinAccentChars, 0x0259, 0x0259);
  addCharsToCharClass(latinAccentChars, 0x025b, 0x025b);
  addCharsToCharClass(latinAccentChars, 0x0263, 0x0263);
  addCharsToCharClass(latinAccentChars, 0x0268, 0x0268);
  addCharsToCharClass(latinAccentChars, 0x026f, 0x026f);
  addCharsToCharClass(latinAccentChars, 0x0272, 0x0272);
  addCharsToCharClass(latinAccentChars, 0x0289, 0x0289);
  addCharsToCharClass(latinAccentChars, 0x028b, 0x028b);
  // Okina for Hawaiian (it *is* a letter character)
  addCharsToCharClass(latinAccentChars, 0x02bb, 0x02bb);
  // Combining diacritics
  addCharsToCharClass(latinAccentChars, 0x0300, 0x036f);
  // Latin Extended Additional
  addCharsToCharClass(latinAccentChars, 0x1e00, 0x1eff);
  $scope.regexen.latinAccentChars = regexSupplant(latinAccentChars.join(""));

  var unicodeLettersAndMarks = "A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D";
  var unicodeNumbers = "0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19";
  var hashtagSpecialChars = "_\u200c\u200d\ua67e\u05be\u05f3\u05f4\u309b\u309c\u30a0\u30fb\u3003\u0f0b\u0f0c\u00b7";

  // A hashtag must contain at least one unicode letter or mark, as well as numbers, underscores, and select special characters.
  $scope.regexen.hashSigns = /[#＃]/;
  $scope.regexen.hashtagAlpha = new RegExp("[" + unicodeLettersAndMarks + "]");
  $scope.regexen.hashtagAlphaNumeric = new RegExp("[" + unicodeLettersAndMarks + unicodeNumbers + hashtagSpecialChars + "]");
  $scope.regexen.endHashtagMatch = regexSupplant(/^(?:#{hashSigns}|:\/\/)/);
  $scope.regexen.hashtagBoundary = new RegExp("(?:^|$|[^&" + unicodeLettersAndMarks + unicodeNumbers + hashtagSpecialChars + "])");
  $scope.regexen.validHashtag = regexSupplant(/(#{hashtagBoundary})(#{hashSigns})(#{hashtagAlphaNumeric}*#{hashtagAlpha}#{hashtagAlphaNumeric}*)/gi);

  // Mention related regex collection
  $scope.regexen.validMentionPrecedingChars = /(?:^|[^a-zA-Z0-9_!#$%&*@＠]|(?:^|[^a-zA-Z0-9_+~.-])(?:rt|RT|rT|Rt):?)/;
  $scope.regexen.atSigns = /[@＠]/;
  $scope.regexen.validMentionOrList = regexSupplant(
    '(#{validMentionPrecedingChars})' +  // $1: Preceding character
    '(#{atSigns})' +                     // $2: At mark
    '([a-zA-Z0-9_]{1,20})' +             // $3: Screen name
    '(\/[a-zA-Z][a-zA-Z0-9_\-]{0,24})?'  // $4: List (optional)
  , 'g');
  $scope.regexen.validReply = regexSupplant(/^(?:#{spaces})*#{atSigns}([a-zA-Z0-9_]{1,20})/);
  $scope.regexen.endMentionMatch = regexSupplant(/^(?:#{atSigns}|[#{latinAccentChars}]|:\/\/)/);

  // URL related regex collection
  $scope.regexen.validUrlPrecedingChars = regexSupplant(/(?:[^A-Za-z0-9@＠$#＃#{invalid_chars_group}]|^)/);
  $scope.regexen.invalidUrlWithoutProtocolPrecedingChars = /[-_.\/]$/;
  $scope.regexen.invalidDomainChars = stringSupplant("#{punct}#{spaces_group}#{invalid_chars_group}", $scope.regexen);
  $scope.regexen.validDomainChars = regexSupplant(/[^#{invalidDomainChars}]/);
  $scope.regexen.validSubdomain = regexSupplant(/(?:(?:#{validDomainChars}(?:[_-]|#{validDomainChars})*)?#{validDomainChars}\.)/);
  $scope.regexen.validDomainName = regexSupplant(/(?:(?:#{validDomainChars}(?:-|#{validDomainChars})*)?#{validDomainChars}\.)/);
  $scope.regexen.validGTLD = regexSupplant(RegExp(
    '(?:(?:' +
    'abbott|abogado|academy|accountant|accountants|active|actor|ads|adult|aero|afl|agency|airforce|' +
    'allfinanz|alsace|amsterdam|android|apartments|aquarelle|archi|army|arpa|asia|associates|' +
    'attorney|auction|audio|autos|axa|band|bank|bar|barclaycard|barclays|bargains|bauhaus|bayern|bbc|' +
    'beer|berlin|best|bid|bike|bingo|bio|biz|black|blackfriday|bloomberg|blue|bmw|bnpparibas|boats|' +
    'bond|boo|boutique|brussels|budapest|build|builders|business|buzz|bzh|cab|cafe|cal|camera|camp|' +
    'cancerresearch|canon|capetown|capital|caravan|cards|care|career|careers|cartier|casa|cash|' +
    'casino|cat|catering|cbn|center|ceo|cern|cfd|channel|chat|cheap|chloe|christmas|chrome|church|' +
    'citic|city|claims|cleaning|click|clinic|clothing|club|coach|codes|coffee|college|cologne|com|' +
    'community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|country|' +
    'courses|credit|creditcard|cricket|crs|cruises|cuisinella|cymru|cyou|dabur|dad|dance|date|dating|' +
    'datsun|day|dclk|deals|degree|delivery|democrat|dental|dentist|desi|design|dev|diamonds|diet|' +
    'digital|direct|directory|discount|dnp|docs|doha|domains|doosan|download|durban|dvag|eat|edu|' +
    'education|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|erni|esq|estate|' +
    'eurovision|eus|events|everbank|exchange|expert|exposed|express|fail|faith|fan|fans|farm|fashion|' +
    'feedback|film|finance|financial|firmdale|fish|fishing|fit|fitness|flights|florist|flowers|' +
    'flsmidth|fly|foo|football|forex|forsale|foundation|frl|frogans|fund|furniture|futbol|gal|' +
    'gallery|garden|gbiz|gdn|gent|ggee|gift|gifts|gives|glass|gle|global|globo|gmail|gmo|gmx|gold|' +
    'goldpoint|golf|goo|goog|google|gop|gov|graphics|gratis|green|gripe|guge|guide|guitars|guru|' +
    'hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hiv|holdings|holiday|homes|horse|host|' +
    'hosting|house|how|ibm|ifm|immo|immobilien|industries|infiniti|info|ing|ink|institute|insure|int|' +
    'international|investments|irish|iwc|java|jcb|jetzt|jewelry|jobs|joburg|juegos|kaufen|kddi|kim|' +
    'kitchen|kiwi|koeln|komatsu|krd|kred|kyoto|lacaixa|land|lat|latrobe|lawyer|lds|lease|leclerc|' +
    'legal|lgbt|lidl|life|lighting|limited|limo|link|loan|loans|london|lotte|lotto|love|ltda|luxe|' +
    'luxury|madrid|maif|maison|management|mango|market|marketing|markets|marriott|media|meet|' +
    'melbourne|meme|memorial|menu|miami|mil|mini|mma|mobi|moda|moe|monash|money|mormon|mortgage|' +
    'moscow|motorcycles|mov|movie|mtn|mtpc|museum|nagoya|name|navy|net|network|neustar|new|news|' +
    'nexus|ngo|nhk|nico|ninja|nissan|nra|nrw|ntt|nyc|okinawa|one|ong|onl|online|ooo|org|organic|' +
    'osaka|otsuka|ovh|page|panerai|paris|partners|parts|party|pharmacy|photo|photography|photos|' +
    'physio|piaget|pics|pictet|pictures|pink|pizza|place|plumbing|plus|pohl|poker|porn|post|praxi|' +
    'press|pro|prod|productions|prof|properties|property|pub|qpon|quebec|racing|realtor|recipes|red|' +
    'redstone|rehab|reise|reisen|reit|ren|rentals|repair|report|republican|rest|restaurant|review|' +
    'reviews|rich|rio|rip|rocks|rodeo|rsvp|ruhr|ryukyu|saarland|sale|samsung|sap|sarl|saxo|sca|scb|' +
    'schmidt|scholarships|school|schule|schwarz|science|scot|seat|services|sew|sex|sexy|shiksha|' +
    'shoes|show|shriram|singles|site|sky|social|software|sohu|solar|solutions|sony|soy|space|spiegel|' +
    'spreadbetting|study|style|sucks|supplies|supply|support|surf|surgery|suzuki|sydney|systems|' +
    'taipei|tatar|tattoo|tax|team|tech|technology|tel|temasek|tennis|tickets|tienda|tips|tires|tirol|' +
    'today|tokyo|tools|top|toshiba|tours|town|toys|trade|trading|training|travel|trust|tui|' +
    'university|uno|uol|vacations|vegas|ventures|vermögensberater|vermögensberatung|versicherung|vet|' +
    'viajes|video|villas|vision|vlaanderen|vodka|vote|voting|voto|voyage|wales|wang|watch|webcam|' +
    'website|wed|wedding|weir|whoswho|wien|wiki|williamhill|win|wme|work|works|world|wtc|wtf|xerox|' +
    'xin|xxx|xyz|yachts|yandex|yodobashi|yoga|yokohama|youtube|zip|zone|zuerich|дети|москва|онлайн|' +
    'орг|рус|сайт|بازار|شبكة|موقع|संगठन|みんな|グーグル|世界|中信|中文网|企业|佛山|信息|健康|八卦|公司|公益|商城|商店|商标|在线|广东|慈善|' +
    '我爱你|手机|政务|政府|时尚|机构|淡马锡|游戏|移动|组织机构|网址|网店|网络|谷歌|集团|飞利浦|삼성|onion' +
    ')(?=[^0-9a-zA-Z@]|$))'));
  $scope.regexen.validCCTLD = regexSupplant(RegExp(
    '(?:(?:' +
    'ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bl|bm|bn|bo|bq|' +
    'br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|' +
    'ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|' +
    'gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|' +
    'la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mf|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|' +
    'my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|' +
    'rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|' +
    'tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|' +
    'бел|мкд|мон|рф|срб|укр|қаз|հայ|الاردن|الجزائر|السعودية|المغرب|امارات|ایران|بھارت|تونس|سودان|' +
    'سورية|عراق|عمان|فلسطين|قطر|مصر|مليسيا|پاکستان|भारत|বাংলা|ভারত|ਭਾਰਤ|ભારત|இந்தியா|இலங்கை|' +
    'சிங்கப்பூர்|భారత్|ලංකා|ไทย|გე|中国|中國|台湾|台灣|新加坡|澳門|香港|한국' +
    ')(?=[^0-9a-zA-Z@]|$))'));
  $scope.regexen.validPunycode = regexSupplant(/(?:xn--[0-9a-z]+)/);
  $scope.regexen.validSpecialCCTLD = regexSupplant(RegExp(
    '(?:(?:co|tv)(?=[^0-9a-zA-Z@]|$))'));
  $scope.regexen.validDomain = regexSupplant(/(?:#{validSubdomain}*#{validDomainName}(?:#{validGTLD}|#{validCCTLD}|#{validPunycode}))/);
  $scope.regexen.validAsciiDomain = regexSupplant(/(?:(?:[\-a-z0-9#{latinAccentChars}]+)\.)+(?:#{validGTLD}|#{validCCTLD}|#{validPunycode})/gi);
  $scope.regexen.invalidShortDomain = regexSupplant(/^#{validDomainName}#{validCCTLD}$/i);
  $scope.regexen.validSpecialShortDomain = regexSupplant(/^#{validDomainName}#{validSpecialCCTLD}$/i);

  $scope.regexen.validPortNumber = regexSupplant(/[0-9]+/);

  $scope.regexen.validGeneralUrlPathChars = regexSupplant(/[a-z0-9!\*';:=\+,\.\$\/%#\[\]\-_~@|&#{latinAccentChars}]/i);
  // Allow URL paths to contain up to two nested levels of balanced parens
  //  1. Used in Wikipedia URLs like /Primer_(film)
  //  2. Used in IIS sessions like /S(dfd346)/
  //  3. Used in Rdio URLs like /track/We_Up_(Album_Version_(Edited))/
  $scope.regexen.validUrlBalancedParens = regexSupplant(
    '\\('                                   +
      '(?:'                                 +
        '#{validGeneralUrlPathChars}+'      +
        '|'                                 +
        // allow one nested level of balanced parentheses
        '(?:'                               +
          '#{validGeneralUrlPathChars}*'    +
          '\\('                             +
            '#{validGeneralUrlPathChars}+'  +
          '\\)'                             +
          '#{validGeneralUrlPathChars}*'    +
        ')'                                 +
      ')'                                   +
    '\\)'
  , 'i');
  // Valid end-of-path chracters (so /foo. does not gobble the period).
  // 1. Allow =&# for empty URL parameters and other URL-join artifacts
  $scope.regexen.validUrlPathEndingChars = regexSupplant(/[\+\-a-z0-9=_#\/#{latinAccentChars}]|(?:#{validUrlBalancedParens})/i);
  // Allow @ in a url, but only in the middle. Catch things like http://example.com/@user/
  $scope.regexen.validUrlPath = regexSupplant('(?:' +
    '(?:' +
      '#{validGeneralUrlPathChars}*' +
        '(?:#{validUrlBalancedParens}#{validGeneralUrlPathChars}*)*' +
        '#{validUrlPathEndingChars}'+
      ')|(?:@#{validGeneralUrlPathChars}+\/)'+
    ')', 'i');

  $scope.regexen.validUrlQueryChars = /[a-z0-9!?\*'@\(\);:&=\+\$\/%#\[\]\-_\.,~|]/i;
  $scope.regexen.validUrlQueryEndingChars = /[a-z0-9_&=#\/]/i;
  $scope.regexen.extractUrl = regexSupplant(
    '('                                                            + // $1 total match
      '(#{validUrlPrecedingChars})'                                + // $2 Preceeding chracter
      '('                                                          + // $3 URL
        '(https?:\\/\\/)?'                                         + // $4 Protocol (optional)
        '(#{validDomain})'                                         + // $5 Domain(s)
        '(?::(#{validPortNumber}))?'                               + // $6 Port number (optional)
        '(\\/#{validUrlPath}*)?'                                   + // $7 URL Path
        '(\\?#{validUrlQueryChars}*#{validUrlQueryEndingChars})?'  + // $8 Query String
      ')'                                                          +
    ')'
  , 'gi');

  $scope.regexen.validTcoUrl = /^https?:\/\/t\.co\/[a-z0-9]+/i;
  $scope.regexen.urlHasProtocol = /^https?:\/\//i;
  $scope.regexen.urlHasHttps = /^https:\/\//i;

  // cashtag related regex
  $scope.regexen.cashtag = /[a-z]{1,6}(?:[._][a-z]{1,2})?/i;
  $scope.regexen.validCashtag = regexSupplant('(^|#{spaces})(\\$)(#{cashtag})(?=$|\\s|[#{punct}])', 'gi');

  // These URL validation pattern strings are based on the ABNF from RFC 3986
  $scope.regexen.validateUrlUnreserved = /[a-z0-9\-._~]/i;
  $scope.regexen.validateUrlPctEncoded = /(?:%[0-9a-f]{2})/i;
  $scope.regexen.validateUrlSubDelims = /[!$&'()*+,;=]/i;
  $scope.regexen.validateUrlPchar = regexSupplant('(?:' +
    '#{validateUrlUnreserved}|' +
    '#{validateUrlPctEncoded}|' +
    '#{validateUrlSubDelims}|' +
    '[:|@]' +
  ')', 'i');

  $scope.regexen.validateUrlScheme = /(?:[a-z][a-z0-9+\-.]*)/i;
  $scope.regexen.validateUrlUserinfo = regexSupplant('(?:' +
    '#{validateUrlUnreserved}|' +
    '#{validateUrlPctEncoded}|' +
    '#{validateUrlSubDelims}|' +
    ':' +
  ')*', 'i');

  $scope.regexen.validateUrlDecOctet = /(?:[0-9]|(?:[1-9][0-9])|(?:1[0-9]{2})|(?:2[0-4][0-9])|(?:25[0-5]))/i;
  $scope.regexen.validateUrlIpv4 = regexSupplant(/(?:#{validateUrlDecOctet}(?:\.#{validateUrlDecOctet}){3})/i);

  // Punting on real IPv6 validation for now
  $scope.regexen.validateUrlIpv6 = /(?:\[[a-f0-9:\.]+\])/i;

  // Also punting on IPvFuture for now
  $scope.regexen.validateUrlIp = regexSupplant('(?:' +
    '#{validateUrlIpv4}|' +
    '#{validateUrlIpv6}' +
  ')', 'i');

  // This is more strict than the rfc specifies
  $scope.regexen.validateUrlSubDomainSegment = /(?:[a-z0-9](?:[a-z0-9_\-]*[a-z0-9])?)/i;
  $scope.regexen.validateUrlDomainSegment = /(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)/i;
  $scope.regexen.validateUrlDomainTld = /(?:[a-z](?:[a-z0-9\-]*[a-z0-9])?)/i;
  $scope.regexen.validateUrlDomain = regexSupplant(/(?:(?:#{validateUrlSubDomainSegment]}\.)*(?:#{validateUrlDomainSegment]}\.)#{validateUrlDomainTld})/i);

  $scope.regexen.validateUrlHost = regexSupplant('(?:' +
    '#{validateUrlIp}|' +
    '#{validateUrlDomain}' +
  ')', 'i');

  // Unencoded internationalized domains - this doesn't check for invalid UTF-8 sequences
  $scope.regexen.validateUrlUnicodeSubDomainSegment = /(?:(?:[a-z0-9]|[^\u0000-\u007f])(?:(?:[a-z0-9_\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
  $scope.regexen.validateUrlUnicodeDomainSegment = /(?:(?:[a-z0-9]|[^\u0000-\u007f])(?:(?:[a-z0-9\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
  $scope.regexen.validateUrlUnicodeDomainTld = /(?:(?:[a-z]|[^\u0000-\u007f])(?:(?:[a-z0-9\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
  $scope.regexen.validateUrlUnicodeDomain = regexSupplant(/(?:(?:#{validateUrlUnicodeSubDomainSegment}\.)*(?:#{validateUrlUnicodeDomainSegment}\.)#{validateUrlUnicodeDomainTld})/i);

  $scope.regexen.validateUrlUnicodeHost = regexSupplant('(?:' +
    '#{validateUrlIp}|' +
    '#{validateUrlUnicodeDomain}' +
  ')', 'i');

  $scope.regexen.validateUrlPort = /[0-9]{1,5}/;

  $scope.regexen.validateUrlUnicodeAuthority = regexSupplant(
    '(?:(#{validateUrlUserinfo})@)?'  + // $1 userinfo
    '(#{validateUrlUnicodeHost})'     + // $2 host
    '(?::(#{validateUrlPort}))?'        //$3 port
  , "i");

  $scope.regexen.validateUrlAuthority = regexSupplant(
    '(?:(#{validateUrlUserinfo})@)?' + // $1 userinfo
    '(#{validateUrlHost})'           + // $2 host
    '(?::(#{validateUrlPort}))?'       // $3 port
  , "i");

  $scope.regexen.validateUrlPath = regexSupplant(/(\/#{validateUrlPchar}*)*/i);
  $scope.regexen.validateUrlQuery = regexSupplant(/(#{validateUrlPchar}|\/|\?)*/i);
  $scope.regexen.validateUrlFragment = regexSupplant(/(#{validateUrlPchar}|\/|\?)*/i);

  // Modified version of RFC 3986 Appendix B
  $scope.regexen.validateUrlUnencoded = regexSupplant(
    '^'                               + // Full URL
    '(?:'                             +
      '([^:/?#]+):\\/\\/'             + // $1 Scheme
    ')?'                              +
    '([^/?#]*)'                       + // $2 Authority
    '([^?#]*)'                        + // $3 Path
    '(?:'                             +
      '\\?([^#]*)'                    + // $4 Query
    ')?'                              +
    '(?:'                             +
      '#(.*)'                         + // $5 Fragment
    ')?$'
  , "i");


  // Default CSS class for auto-linked lists (along with the url class)
  var DEFAULT_LIST_CLASS = "tweet-url list-slug";
  // Default CSS class for auto-linked usernames (along with the url class)
  var DEFAULT_USERNAME_CLASS = "tweet-url username";
  // Default CSS class for auto-linked hashtags (along with the url class)
  var DEFAULT_HASHTAG_CLASS = "tweet-url hashtag";
  // Default CSS class for auto-linked cashtags (along with the url class)
  var DEFAULT_CASHTAG_CLASS = "tweet-url cashtag";
  // Options which should not be passed as HTML attributes
  var OPTIONS_NOT_ATTRIBUTES = {'urlClass':true, 'listClass':true, 'usernameClass':true, 'hashtagClass':true, 'cashtagClass':true,
                            'usernameUrlBase':true, 'listUrlBase':true, 'hashtagUrlBase':true, 'cashtagUrlBase':true,
                            'usernameUrlBlock':true, 'listUrlBlock':true, 'hashtagUrlBlock':true, 'linkUrlBlock':true,
                            'usernameIncludeSymbol':true, 'suppressLists':true, 'suppressNoFollow':true, 'targetBlank':true,
                            'suppressDataScreenName':true, 'urlEntities':true, 'symbolTag':true, 'textWithSymbolTag':true, 'urlTarget':true,
                            'invisibleTagAttrs':true, 'linkAttributeBlock':true, 'linkTextBlock': true, 'htmlEscapeNonEntities': true
                            };

  var BOOLEAN_ATTRIBUTES = {'disabled':true, 'readonly':true, 'multiple':true, 'checked':true};

  // Simple object cloning function for simple objects
  function clone(o) {
    var r = {};
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        r[k] = o[k];
      }
    }

    return r;
  }

  $scope.tagAttrs = function(attributes) {
    var htmlAttrs = "";
    for (var k in attributes) {
      var v = attributes[k];
      if (BOOLEAN_ATTRIBUTES[k]) {
        v = v ? k : null;
      }
      if (v == null) continue;
      htmlAttrs += " " + $scope.htmlEscape(k) + "=\"" + $scope.htmlEscape(v.toString()) + "\"";
    }
    return htmlAttrs;
  };

  $scope.linkToText = function(entity, text, attributes, options) {
    if (!options.suppressNoFollow) {
      attributes.rel = "nofollow";
    }
    // if linkAttributeBlock is specified, call it to modify the attributes
    if (options.linkAttributeBlock) {
      options.linkAttributeBlock(entity, attributes);
    }
    // if linkTextBlock is specified, call it to get a new/modified link text
    if (options.linkTextBlock) {
      text = options.linkTextBlock(entity, text);
    }
    var d = {
      text: text,
      attr: $scope.tagAttrs(attributes)
    };
    return stringSupplant("<a#{attr}>#{text}</a>", d);
  };

  $scope.linkToTextWithSymbol = function(entity, symbol, text, attributes, options) {
    var taggedSymbol = options.symbolTag ? "<" + options.symbolTag + ">" + symbol + "</"+ options.symbolTag + ">" : symbol;
    text = $scope.htmlEscape(text);
    var taggedText = options.textWithSymbolTag ? "<" + options.textWithSymbolTag + ">" + text + "</"+ options.textWithSymbolTag + ">" : text;

    if (options.usernameIncludeSymbol || !symbol.match($scope.regexen.atSigns)) {
      return $scope.linkToText(entity, taggedSymbol + taggedText, attributes, options);
    } else {
      return taggedSymbol + $scope.linkToText(entity, taggedText, attributes, options);
    }
  };

  $scope.linkToHashtag = function(entity, text, options) {
    var hash = text.substring(entity.indices[0], entity.indices[0] + 1);
    var hashtag = $scope.htmlEscape(entity.hashtag);
    var attrs = clone(options.htmlAttrs || {});
    attrs.href = options.hashtagUrlBase + hashtag;
    attrs.title = "#" + hashtag;
    attrs["class"] = options.hashtagClass;
    if (hashtag.charAt(0).match($scope.regexen.rtl_chars)){
      attrs["class"] += " rtl";
    }
    if (options.targetBlank) {
      attrs.target = '_blank';
    }

    return $scope.linkToTextWithSymbol(entity, hash, hashtag, attrs, options);
  };

  $scope.linkToCashtag = function(entity, text, options) {
    var cashtag = $scope.htmlEscape(entity.cashtag);
    var attrs = clone(options.htmlAttrs || {});
    attrs.href = options.cashtagUrlBase + cashtag;
    attrs.title = "$" + cashtag;
    attrs["class"] =  options.cashtagClass;
    if (options.targetBlank) {
      attrs.target = '_blank';
    }

    return $scope.linkToTextWithSymbol(entity, "$", cashtag, attrs, options);
  };

  $scope.linkToMentionAndList = function(entity, text, options) {
    var at = text.substring(entity.indices[0], entity.indices[0] + 1);
    var user = $scope.htmlEscape(entity.screenName);
    var slashListname = $scope.htmlEscape(entity.listSlug);
    var isList = entity.listSlug && !options.suppressLists;
    var attrs = clone(options.htmlAttrs || {});
    attrs["class"] = (isList ? options.listClass : options.usernameClass);
    attrs.href = isList ? options.listUrlBase + user + slashListname : options.usernameUrlBase + user;
    if (!isList && !options.suppressDataScreenName) {
      attrs['data-screen-name'] = user;
    }
    if (options.targetBlank) {
      attrs.target = '_blank';
    }

    return $scope.linkToTextWithSymbol(entity, at, isList ? user + slashListname : user, attrs, options);
  };

  $scope.linkToUrl = function(entity, text, options) {
    var url = entity.url;
    var displayUrl = url;
    var linkText = $scope.htmlEscape(displayUrl);

    // If the caller passed a urlEntities object (provided by a Twitter API
    // response with include_entities=true), we use that to render the display_url
    // for each URL instead of it's underlying t.co URL.
    var urlEntity = (options.urlEntities && options.urlEntities[url]) || entity;
    if (urlEntity.display_url) {
      linkText = $scope.linkTextWithEntity(urlEntity, options);
    }

    var attrs = clone(options.htmlAttrs || {});

    if (!url.match($scope.regexen.urlHasProtocol)) {
      url = "http://" + url;
    }
    attrs.href = url;

    if (options.targetBlank) {
      attrs.target = '_blank';
    }

    // set class only if urlClass is specified.
    if (options.urlClass) {
      attrs["class"] = options.urlClass;
    }

    // set target only if urlTarget is specified.
    if (options.urlTarget) {
      attrs.target = options.urlTarget;
    }

    if (!options.title && urlEntity.display_url) {
      attrs.title = urlEntity.expanded_url;
    }

    return $scope.linkToText(entity, linkText, attrs, options);
  };

  $scope.linkTextWithEntity = function (entity, options) {
    var displayUrl = entity.display_url;
    var expandedUrl = entity.expanded_url;

    // Goal: If a user copies and pastes a tweet containing t.co'ed link, the resulting paste
    // should contain the full original URL (expanded_url), not the display URL.
    //
    // Method: Whenever possible, we actually emit HTML that contains expanded_url, and use
    // font-size:0 to hide those parts that should not be displayed (because they are not part of display_url).
    // Elements with font-size:0 get copied even though they are not visible.
    // Note that display:none doesn't work here. Elements with display:none don't get copied.
    //
    // Additionally, we want to *display* ellipses, but we don't want them copied.  To make this happen we
    // wrap the ellipses in a tco-ellipsis class and provide an onCopy handler that sets display:none on
    // everything with the tco-ellipsis class.
    //
    // Exception: pic.twitter.com images, for which expandedUrl = "https://twitter.com/#!/username/status/1234/photo/1
    // For those URLs, display_url is not a substring of expanded_url, so we don't do anything special to render the elided parts.
    // For a pic.twitter.com URL, the only elided part will be the "https://", so this is fine.

    var displayUrlSansEllipses = displayUrl.replace(/…/g, ""); // We have to disregard ellipses for matching
    // Note: we currently only support eliding parts of the URL at the beginning or the end.
    // Eventually we may want to elide parts of the URL in the *middle*.  If so, this code will
    // become more complicated.  We will probably want to create a regexp out of display URL,
    // replacing every ellipsis with a ".*".
    if (expandedUrl.indexOf(displayUrlSansEllipses) != -1) {
      var displayUrlIndex = expandedUrl.indexOf(displayUrlSansEllipses);
      var v = {
        displayUrlSansEllipses: displayUrlSansEllipses,
        // Portion of expandedUrl that precedes the displayUrl substring
        beforeDisplayUrl: expandedUrl.substr(0, displayUrlIndex),
        // Portion of expandedUrl that comes after displayUrl
        afterDisplayUrl: expandedUrl.substr(displayUrlIndex + displayUrlSansEllipses.length),
        precedingEllipsis: displayUrl.match(/^…/) ? "…" : "",
        followingEllipsis: displayUrl.match(/…$/) ? "…" : ""
      };
      for (var k in v) {
        if (v.hasOwnProperty(k)) {
          v[k] = $scope.htmlEscape(v[k]);
        }
      }
      // As an example: The user tweets "hi http://longdomainname.com/foo"
      // This gets shortened to "hi http://t.co/xyzabc", with display_url = "…nname.com/foo"
      // This will get rendered as:
      // <span class='tco-ellipsis'> <!-- This stuff should get displayed but not copied -->
      //   …
      //   <!-- There's a chance the onCopy event handler might not fire. In case that happens,
      //        we include an &nbsp; here so that the … doesn't bump up against the URL and ruin it.
      //        The &nbsp; is inside the tco-ellipsis span so that when the onCopy handler *does*
      //        fire, it doesn't get copied.  Otherwise the copied text would have two spaces in a row,
      //        e.g. "hi  http://longdomainname.com/foo".
      //   <span style='font-size:0'>&nbsp;</span>
      // </span>
      // <span style='font-size:0'>  <!-- This stuff should get copied but not displayed -->
      //   http://longdomai
      // </span>
      // <span class='js-display-url'> <!-- This stuff should get displayed *and* copied -->
      //   nname.com/foo
      // </span>
      // <span class='tco-ellipsis'> <!-- This stuff should get displayed but not copied -->
      //   <span style='font-size:0'>&nbsp;</span>
      //   …
      // </span>
      v['invisible'] = options.invisibleTagAttrs;
      return stringSupplant("<span class='tco-ellipsis'>#{precedingEllipsis}<span #{invisible}>&nbsp;</span></span><span #{invisible}>#{beforeDisplayUrl}</span><span class='js-display-url'>#{displayUrlSansEllipses}</span><span #{invisible}>#{afterDisplayUrl}</span><span class='tco-ellipsis'><span #{invisible}>&nbsp;</span>#{followingEllipsis}</span>", v);
    }
    return displayUrl;
  };

  $scope.autoLinkEntities = function(text, entities, options) {
    options = clone(options || {});

    options.hashtagClass = options.hashtagClass || DEFAULT_HASHTAG_CLASS;
    options.hashtagUrlBase = options.hashtagUrlBase || "https://twitter.com/#!/search?q=%23";
    options.cashtagClass = options.cashtagClass || DEFAULT_CASHTAG_CLASS;
    options.cashtagUrlBase = options.cashtagUrlBase || "https://twitter.com/#!/search?q=%24";
    options.listClass = options.listClass || DEFAULT_LIST_CLASS;
    options.usernameClass = options.usernameClass || DEFAULT_USERNAME_CLASS;
    options.usernameUrlBase = options.usernameUrlBase || "https://twitter.com/";
    options.listUrlBase = options.listUrlBase || "https://twitter.com/";
    options.htmlAttrs = $scope.extractHtmlAttrsFromOptions(options);
    options.invisibleTagAttrs = options.invisibleTagAttrs || "style='position:absolute;left:-9999px;'";

    // remap url entities to hash
    var urlEntities, i, len;
    if(options.urlEntities) {
      urlEntities = {};
      for(i = 0, len = options.urlEntities.length; i < len; i++) {
        urlEntities[options.urlEntities[i].url] = options.urlEntities[i];
      }
      options.urlEntities = urlEntities;
    }

    var result = "";
    var beginIndex = 0;

    // sort entities by start index
    entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });

    var nonEntity = options.htmlEscapeNonEntities ? $scope.htmlEscape : function(text) {
      return text;
    };

    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      result += nonEntity(text.substring(beginIndex, entity.indices[0]));

      if (entity.url) {
        result += $scope.linkToUrl(entity, text, options);
      } else if (entity.hashtag) {
        result += $scope.linkToHashtag(entity, text, options);
      } else if (entity.screenName) {
        result += $scope.linkToMentionAndList(entity, text, options);
      } else if (entity.cashtag) {
        result += $scope.linkToCashtag(entity, text, options);
      }
      beginIndex = entity.indices[1];
    }
    result += nonEntity(text.substring(beginIndex, text.length));
    return result;
  };

  $scope.autoLinkWithJSON = function(text, json, options) {
    // map JSON entity to twitter-text entity
    if (json.user_mentions) {
      for (var i = 0; i < json.user_mentions.length; i++) {
        // this is a @mention
        json.user_mentions[i].screenName = json.user_mentions[i].screen_name;
      }
    }

    if (json.hashtags) {
      for (var i = 0; i < json.hashtags.length; i++) {
        // this is a #hashtag
        json.hashtags[i].hashtag = json.hashtags[i].text;
      }
    }

    if (json.symbols) {
      for (var i = 0; i < json.symbols.length; i++) {
        // this is a $CASH tag
        json.symbols[i].cashtag = json.symbols[i].text;
      }
    }

    // concatenate all entities
    var entities = [];
    for (var key in json) {
      entities = entities.concat(json[key]);
    }

    // modify indices to UTF-16
    $scope.modifyIndicesFromUnicodeToUTF16(text, entities);

    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.extractHtmlAttrsFromOptions = function(options) {
    var htmlAttrs = {};
    for (var k in options) {
      var v = options[k];
      if (OPTIONS_NOT_ATTRIBUTES[k]) continue;
      if (BOOLEAN_ATTRIBUTES[k]) {
        v = v ? k : null;
      }
      if (v == null) continue;
      htmlAttrs[k] = v;
    }
    return htmlAttrs;
  };

  $scope.autoLink = function(text, options) {
    var entities = $scope.extractEntitiesWithIndices(text, {extractUrlsWithoutProtocol: false});
    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.autoLinkUsernamesOrLists = function(text, options) {
    var entities = $scope.extractMentionsOrListsWithIndices(text);
    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.autoLinkHashtags = function(text, options) {
    var entities = $scope.extractHashtagsWithIndices(text);
    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.autoLinkCashtags = function(text, options) {
    var entities = $scope.extractCashtagsWithIndices(text);
    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.autoLinkUrlsCustom = function(text, options) {
    var entities = $scope.extractUrlsWithIndices(text, {extractUrlsWithoutProtocol: false});
    return $scope.autoLinkEntities(text, entities, options);
  };

  $scope.removeOverlappingEntities = function(entities) {
    entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });

    var prev = entities[0];
    for (var i = 1; i < entities.length; i++) {
      if (prev.indices[1] > entities[i].indices[0]) {
        entities.splice(i, 1);
        i--;
      } else {
        prev = entities[i];
      }
    }
  };

  $scope.extractEntitiesWithIndices = function(text, options) {
    var entities = $scope.extractUrlsWithIndices(text, options)
                    .concat($scope.extractMentionsOrListsWithIndices(text))
                    .concat($scope.extractHashtagsWithIndices(text, {checkUrlOverlap: false}))
                    .concat($scope.extractCashtagsWithIndices(text));

    if (entities.length == 0) {
      return [];
    }

    $scope.removeOverlappingEntities(entities);
    return entities;
  };

  $scope.extractMentions = function(text) {
    var screenNamesOnly = [],
        screenNamesWithIndices = $scope.extractMentionsWithIndices(text);

    for (var i = 0; i < screenNamesWithIndices.length; i++) {
      var screenName = screenNamesWithIndices[i].screenName;
      screenNamesOnly.push(screenName);
    }

    return screenNamesOnly;
  };

  $scope.extractMentionsWithIndices = function(text) {
    var mentions = [],
        mentionOrList,
        mentionsOrLists = $scope.extractMentionsOrListsWithIndices(text);

    for (var i = 0 ; i < mentionsOrLists.length; i++) {
      mentionOrList = mentionsOrLists[i];
      if (mentionOrList.listSlug == '') {
        mentions.push({
          screenName: mentionOrList.screenName,
          indices: mentionOrList.indices
        });
      }
    }

    return mentions;
  };

  /**
   * Extract list or user mentions.
   * (Presence of listSlug indicates a list)
   */
  $scope.extractMentionsOrListsWithIndices = function(text) {
    if (!text || !text.match($scope.regexen.atSigns)) {
      return [];
    }

    var possibleNames = [],
        slashListname;

    text.replace($scope.regexen.validMentionOrList, function(match, before, atSign, screenName, slashListname, offset, chunk) {
      var after = chunk.slice(offset + match.length);
      if (!after.match($scope.regexen.endMentionMatch)) {
        slashListname = slashListname || '';
        var startPosition = offset + before.length;
        var endPosition = startPosition + screenName.length + slashListname.length + 1;
        possibleNames.push({
          screenName: screenName,
          listSlug: slashListname,
          indices: [startPosition, endPosition]
        });
      }
    });

    return possibleNames;
  };


  $scope.extractReplies = function(text) {
    if (!text) {
      return null;
    }

    var possibleScreenName = text.match($scope.regexen.validReply);
    if (!possibleScreenName ||
        RegExp.rightContext.match($scope.regexen.endMentionMatch)) {
      return null;
    }

    return possibleScreenName[1];
  };

  $scope.extractUrls = function(text, options) {
    var urlsOnly = [],
        urlsWithIndices = $scope.extractUrlsWithIndices(text, options);

    for (var i = 0; i < urlsWithIndices.length; i++) {
      urlsOnly.push(urlsWithIndices[i].url);
    }

    return urlsOnly;
  };

  $scope.extractUrlsWithIndices = function(text, options) {
    if (!options) {
      options = {extractUrlsWithoutProtocol: true};
    }
    if (!text || (options.extractUrlsWithoutProtocol ? !text.match(/\./) : !text.match(/:/))) {
      return [];
    }

    var urls = [];

    while ($scope.regexen.extractUrl.exec(text)) {
      var before = RegExp.$2, url = RegExp.$3, protocol = RegExp.$4, domain = RegExp.$5, path = RegExp.$7;
      var endPosition = $scope.regexen.extractUrl.lastIndex,
          startPosition = endPosition - url.length;

      // if protocol is missing and domain contains non-ASCII characters,
      // extract ASCII-only domains.
      if (!protocol) {
        if (!options.extractUrlsWithoutProtocol
            || before.match($scope.regexen.invalidUrlWithoutProtocolPrecedingChars)) {
          continue;
        }
        var lastUrl = null,
            asciiEndPosition = 0;
        domain.replace($scope.regexen.validAsciiDomain, function(asciiDomain) {
          var asciiStartPosition = domain.indexOf(asciiDomain, asciiEndPosition);
          asciiEndPosition = asciiStartPosition + asciiDomain.length;
          lastUrl = {
            url: asciiDomain,
            indices: [startPosition + asciiStartPosition, startPosition + asciiEndPosition]
          };
          if (path
              || asciiDomain.match($scope.regexen.validSpecialShortDomain)
              || !asciiDomain.match($scope.regexen.invalidShortDomain)) {
            urls.push(lastUrl);
          }
        });

        // no ASCII-only domain found. Skip the entire URL.
        if (lastUrl == null) {
          continue;
        }

        // lastUrl only contains domain. Need to add path and query if they exist.
        if (path) {
          lastUrl.url = url.replace(domain, lastUrl.url);
          lastUrl.indices[1] = endPosition;
        }
      } else {
        // In the case of t.co URLs, don't allow additional path characters.
        if (url.match($scope.regexen.validTcoUrl)) {
          url = RegExp.lastMatch;
          endPosition = startPosition + url.length;
        }
        urls.push({
          url: url,
          indices: [startPosition, endPosition]
        });
      }
    }

    return urls;
  };

  $scope.extractHashtags = function(text) {
    var hashtagsOnly = [],
        hashtagsWithIndices = $scope.extractHashtagsWithIndices(text);

    for (var i = 0; i < hashtagsWithIndices.length; i++) {
      hashtagsOnly.push(hashtagsWithIndices[i].hashtag);
    }

    return hashtagsOnly;
  };

  $scope.extractHashtagsWithIndices = function(text, options) {
    if (!options) {
      options = {checkUrlOverlap: true};
    }

    if (!text || !text.match($scope.regexen.hashSigns)) {
      return [];
    }

    var tags = [];

    text.replace($scope.regexen.validHashtag, function(match, before, hash, hashText, offset, chunk) {
      var after = chunk.slice(offset + match.length);
      if (after.match($scope.regexen.endHashtagMatch))
        return;
      var startPosition = offset + before.length;
      var endPosition = startPosition + hashText.length + 1;
      tags.push({
        hashtag: hashText,
        indices: [startPosition, endPosition]
      });
    });

    if (options.checkUrlOverlap) {
      // also extract URL entities
      var urls = $scope.extractUrlsWithIndices(text);
      if (urls.length > 0) {
        var entities = tags.concat(urls);
        // remove overlap
        $scope.removeOverlappingEntities(entities);
        // only push back hashtags
        tags = [];
        for (var i = 0; i < entities.length; i++) {
          if (entities[i].hashtag) {
            tags.push(entities[i]);
          }
        }
      }
    }

    return tags;
  };

  $scope.extractCashtags = function(text) {
    var cashtagsOnly = [],
        cashtagsWithIndices = $scope.extractCashtagsWithIndices(text);

    for (var i = 0; i < cashtagsWithIndices.length; i++) {
      cashtagsOnly.push(cashtagsWithIndices[i].cashtag);
    }

    return cashtagsOnly;
  };

  $scope.extractCashtagsWithIndices = function(text) {
    if (!text || text.indexOf("$") == -1) {
      return [];
    }

    var tags = [];

    text.replace($scope.regexen.validCashtag, function(match, before, dollar, cashtag, offset, chunk) {
      var startPosition = offset + before.length;
      var endPosition = startPosition + cashtag.length + 1;
      tags.push({
        cashtag: cashtag,
        indices: [startPosition, endPosition]
      });
    });

    return tags;
  };

  $scope.modifyIndicesFromUnicodeToUTF16 = function(text, entities) {
    $scope.convertUnicodeIndices(text, entities, false);
  };

  $scope.modifyIndicesFromUTF16ToUnicode = function(text, entities) {
    $scope.convertUnicodeIndices(text, entities, true);
  };

  $scope.getUnicodeTextLength = function(text) {
    return text.replace($scope.regexen.non_bmp_code_pairs, ' ').length;
  };

  $scope.convertUnicodeIndices = function(text, entities, indicesInUTF16) {
    if (entities.length == 0) {
      return;
    }

    var charIndex = 0;
    var codePointIndex = 0;

    // sort entities by start index
    entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });
    var entityIndex = 0;
    var entity = entities[0];

    while (charIndex < text.length) {
      if (entity.indices[0] == (indicesInUTF16 ? charIndex : codePointIndex)) {
        var len = entity.indices[1] - entity.indices[0];
        entity.indices[0] = indicesInUTF16 ? codePointIndex : charIndex;
        entity.indices[1] = entity.indices[0] + len;

        entityIndex++;
        if (entityIndex == entities.length) {
          // no more entity
          break;
        }
        entity = entities[entityIndex];
      }

      var c = text.charCodeAt(charIndex);
      if (0xD800 <= c && c <= 0xDBFF && charIndex < text.length - 1) {
        // Found high surrogate char
        c = text.charCodeAt(charIndex + 1);
        if (0xDC00 <= c && c <= 0xDFFF) {
          // Found surrogate pair
          charIndex++;
        }
      }
      codePointIndex++;
      charIndex++;
    }
  };

  // this essentially does text.split(/<|>/)
  // except that won't work in IE, where empty strings are ommitted
  // so "<>".split(/<|>/) => [] in IE, but is ["", "", ""] in all others
  // but "<<".split("<") => ["", "", ""]
  $scope.splitTags = function(text) {
    var firstSplits = text.split("<"),
        secondSplits,
        allSplits = [],
        split;

    for (var i = 0; i < firstSplits.length; i += 1) {
      split = firstSplits[i];
      if (!split) {
        allSplits.push("");
      } else {
        secondSplits = split.split(">");
        for (var j = 0; j < secondSplits.length; j += 1) {
          allSplits.push(secondSplits[j]);
        }
      }
    }

    return allSplits;
  };

  $scope.hitHighlight = function(text, hits, options) {
    var defaultHighlightTag = "em";

    hits = hits || [];
    options = options || {};

    if (hits.length === 0) {
      return text;
    }

    var tagName = options.tag || defaultHighlightTag,
        tags = ["<" + tagName + ">", "</" + tagName + ">"],
        chunks = $scope.splitTags(text),
        i,
        j,
        result = "",
        chunkIndex = 0,
        chunk = chunks[0],
        prevChunksLen = 0,
        chunkCursor = 0,
        startInChunk = false,
        chunkChars = chunk,
        flatHits = [],
        index,
        hit,
        tag,
        placed,
        hitSpot;

    for (i = 0; i < hits.length; i += 1) {
      for (j = 0; j < hits[i].length; j += 1) {
        flatHits.push(hits[i][j]);
      }
    }

    for (index = 0; index < flatHits.length; index += 1) {
      hit = flatHits[index];
      tag = tags[index % 2];
      placed = false;

      while (chunk != null && hit >= prevChunksLen + chunk.length) {
        result += chunkChars.slice(chunkCursor);
        if (startInChunk && hit === prevChunksLen + chunkChars.length) {
          result += tag;
          placed = true;
        }

        if (chunks[chunkIndex + 1]) {
          result += "<" + chunks[chunkIndex + 1] + ">";
        }

        prevChunksLen += chunkChars.length;
        chunkCursor = 0;
        chunkIndex += 2;
        chunk = chunks[chunkIndex];
        chunkChars = chunk;
        startInChunk = false;
      }

      if (!placed && chunk != null) {
        hitSpot = hit - prevChunksLen;
        result += chunkChars.slice(chunkCursor, hitSpot) + tag;
        chunkCursor = hitSpot;
        if (index % 2 === 0) {
          startInChunk = true;
        } else {
          startInChunk = false;
        }
      } else if(!placed) {
        placed = true;
        result += tag;
      }
    }

    if (chunk != null) {
      if (chunkCursor < chunkChars.length) {
        result += chunkChars.slice(chunkCursor);
      }
      for (index = chunkIndex + 1; index < chunks.length; index += 1) {
        result += (index % 2 === 0 ? chunks[index] : "<" + chunks[index] + ">");
      }
    }

    return result;
  };

  var MAX_LENGTH = 140;

  // Characters not allowed in Tweets
  var INVALID_CHARACTERS = [
    // BOM
    fromCode(0xFFFE),
    fromCode(0xFEFF),

    // Special
    fromCode(0xFFFF),

    // Directional Change
    fromCode(0x202A),
    fromCode(0x202B),
    fromCode(0x202C),
    fromCode(0x202D),
    fromCode(0x202E)
  ];

  // Returns the length of Tweet text with consideration to t.co URL replacement
  // and chars outside the basic multilingual plane that use 2 UTF16 code points
  $scope.getTweetLength = function(text, options) {
    if (!options) {
      options = {
          // These come from https://api.twitter.com/1/help/configuration.json
          // described by https://dev.twitter.com/docs/api/1/get/help/configuration
          short_url_length: 22,
          short_url_length_https: 23
      };
    }
    var textLength = $scope.getUnicodeTextLength(text),
        urlsWithIndices = $scope.extractUrlsWithIndices(text);
    $scope.modifyIndicesFromUTF16ToUnicode(text, urlsWithIndices);

    for (var i = 0; i < urlsWithIndices.length; i++) {
      // Subtract the length of the original URL
      textLength += urlsWithIndices[i].indices[0] - urlsWithIndices[i].indices[1];

      // Add 23 characters for URL starting with https://
      // Otherwise add 22 characters
      if (urlsWithIndices[i].url.toLowerCase().match($scope.regexen.urlHasHttps)) {
         textLength += options.short_url_length_https;
      } else {
        textLength += options.short_url_length;
      }
    }

    return textLength;
  };

  // Check the text for any reason that it may not be valid as a Tweet. This is meant as a pre-validation
  // before posting to api.twitter.com. There are several server-side reasons for Tweets to fail but this pre-validation
  // will allow quicker feedback.
  //
  // Returns false if this text is valid. Otherwise one of the following strings will be returned:
  //
  //   "too_long": if the text is too long
  //   "empty": if the text is nil or empty
  //   "invalid_characters": if the text contains non-Unicode or any of the disallowed Unicode characters
  $scope.isInvalidTweet = function(text) {
    if (!text) {
      return "empty";
    }

    // Determine max length independent of URL length
    if ($scope.getTweetLength(text) > MAX_LENGTH) {
      return "too_long";
    }

    if ($scope.hasInvalidCharacters(text)) {
      return "invalid_characters";
    }

    return false;
  };

  $scope.hasInvalidCharacters = function(text) {
    for (var i = 0; i < INVALID_CHARACTERS.length; i++) {
      if (text.indexOf(INVALID_CHARACTERS[i]) >= 0) {
        return true;
      }
    }
    return false;
  };

  $scope.isValidTweetText = function(text) {
    return !$scope.isInvalidTweet(text);
  };

  $scope.isValidUsername = function(username) {
    if (!username) {
      return false;
    }

    var extracted = $scope.extractMentions(username);

    // Should extract the username minus the @ sign, hence the .slice(1)
    return extracted.length === 1 && extracted[0] === username.slice(1);
  };

  var VALID_LIST_RE = regexSupplant(/^#{validMentionOrList}$/);

  $scope.isValidList = function(usernameList) {
    var match = usernameList.match(VALID_LIST_RE);

    // Must have matched and had nothing before or after
    return !!(match && match[1] == "" && match[4]);
  };

  $scope.isValidHashtag = function(hashtag) {
    if (!hashtag) {
      return false;
    }

    var extracted = $scope.extractHashtags(hashtag);

    // Should extract the hashtag minus the # sign, hence the .slice(1)
    return extracted.length === 1 && extracted[0] === hashtag.slice(1);
  };

  $scope.isValidUrl = function(url, unicodeDomains, requireProtocol) {
    if (unicodeDomains == null) {
      unicodeDomains = true;
    }

    if (requireProtocol == null) {
      requireProtocol = true;
    }

    if (!url) {
      return false;
    }

    var urlParts = url.match($scope.regexen.validateUrlUnencoded);

    if (!urlParts || urlParts[0] !== url) {
      return false;
    }

    var scheme = urlParts[1],
        authority = urlParts[2],
        path = urlParts[3],
        query = urlParts[4],
        fragment = urlParts[5];

    if (!(
      (!requireProtocol || (isValidMatch(scheme, $scope.regexen.validateUrlScheme) && scheme.match(/^https?$/i))) &&
      isValidMatch(path, $scope.regexen.validateUrlPath) &&
      isValidMatch(query, $scope.regexen.validateUrlQuery, true) &&
      isValidMatch(fragment, $scope.regexen.validateUrlFragment, true)
    )) {
      return false;
    }

    return (unicodeDomains && isValidMatch(authority, $scope.regexen.validateUrlUnicodeAuthority)) ||
           (!unicodeDomains && isValidMatch(authority, $scope.regexen.validateUrlAuthority));
  };

  function isValidMatch(string, regex, optional) {
    if (!optional) {
      // RegExp["$&"] is the text of the last match
      // blank strings are ok, but are falsy, so we check stringiness instead of truthiness
      return ((typeof string === "string") && string.match(regex) && RegExp["$&"] === string);
    }

    // RegExp["$&"] is the text of the last match
    return (!string || (string.match(regex) && RegExp["$&"] === string));
  }

  if (typeof module != 'undefined' && module.exports) {
    module.exports = twttr.txt;
  }

  if (typeof define == 'function' && define.amd) {
    define([], twttr.txt);
  }

  if (typeof window != 'undefined') {
    if (window.twttr) {
      for (var prop in twttr) {
        window.twttr[prop] = twttr[prop];
      }
    } else {
      window.twttr = twttr;
    }
  }

/*
FUNCIONES DE LA LIBRERÍA DE TWITTER
*/   
  
  
  
  $scope.textChange = function(req, res){

	//ESTO ES PARA CONTAR EL LIMITE DEL CAMPO DE RESPUESTA
	var limite = 140;
	$scope.faltanteMensaje = limite - $scope.getTweetLength($scope.respuesta);
	if($scope.faltanteMensaje < 0){
		$scope.advertenciaLimiteMensaje = true;
		$scope.deshabilita = true;
	}else{
		$scope.advertenciaLimiteMensaje = false;
		$scope.deshabilita = false;
	}
	
 };

  	$scope.respondeMensaje = function(tipoCuenta, tipoRespuesta){
  	//Si el metodo es 1 es solo aceptar y si es 2 es aceptar y completar
  	var coleccion = Authentication.user.cuenta.marca+'_consolidada';
	$scope.items[0].clasificacion = {
		tema : $scope.themeDefault,
		subtema : $scope.subthemeDefault
	};
	if($scope.items[0].clasificacion.tema === $scope.textos.tema){
  		delete $scope.items[0].clasificacion;
  	}else{
  		if($scope.items[0].clasificacion.subtema === $scope.textos.subtema){
  			$scope.items[0].clasificacion.subtema = '';
  		}
  	}
  	if(typeof $scope.respuesta === 'undefined' || $scope.respuesta === null){
  		$scope.respuesta = '';
  	}
  	var criterio ={
  		'coleccion' : coleccion,
  		'mensaje' : items[0],
  		'clasificacion' : $scope.items[0].clasificacion,
  		'sentiment' : $scope.items[0].sentiment,
  		'usuario' : Authentication.user,
  		'imagenUsuario' : Authentication.user.imagen_src,
  		'idMensaje' : $scope.items[0]._id,
  		'tipoRedSocial' : tipoCuenta,
  		'tipoMensajeRedSocial' : tipoRespuesta,
  		//'opcion' : metodo,
		'respuesta' : $scope.respuesta, 
		'timestamp' : new Date(),
		'nombreSistema' : Authentication.user.cuenta.marca,
		'account_id' : Authentication.user.cuenta._id
  	};
  	console.log('Criterio de respuesta !');
	console.log(criterio);
	if($scope.items[0].clasificacion && $scope.items[0].sentiment){	
		console.log(items[0]);
		$http.post('/respondeMailbox', criterio).success(function(data){
			if(!data.error && !data.errorface){
				if($scope.items[0].tipoMensaje === 'nuevo'){
					console.log('Finalizará el nuevo');
				//if(metodo === '2'){
					$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
				}
				if($scope.items[0].influencers || $scope.items[0].asignado){
			  		Socket.emit('eliminaNotificacion',$scope.items[0]._id);
			  	}
				var answer = {
					'texto' : $scope.respuesta, 
					'user_name' : Authentication.user.displayName,
					'user_id' : Authentication.user._id,
					'timestamp' : new Date()
				};
				console.log('AUTHENTICACION !!!!');
				console.log(Authentication.user);
				var obj_actualizar = {
					'_id' : $scope.items[0]._id,
					'mensajeBuzon': $scope.items[0].tipoMensaje,
					'tema' : $scope.themeDefault,
					'subtema' : $scope.subthemeDefault, 
					'sentiment' : items[0].sentiment, 
					'answer' : answer,
					'user' : $scope.authentication.user._id,
					'username': Authentication.user.username,
					'user_image': Authentication.user.imagen_src,
					'cuenta' : $scope.authentication.user.cuenta.marca,
					'tipoBuzon': $scope.tipoBuzon
				};
				
				//Socket.emit('actualizaClasificacion',obj_actualizar);
				Socket.emit('tiempoRealServer', obj_actualizar);
				//Socket.emit('liberaOcupado',$scope.items[0]._id);
				$scope.deshabilita = false;
				$modalInstance.close($scope.items[0]);
			}else{
				if(data.error){
					if(data.tipo === 'facebook'){
						if(data.error.code === 100 || data.error.code === 1705){
							$scope.respuesta_server = 'Este post ya fue eliminado por el usuario';
						}else if(data.error.code === 190){
							$scope.respuesta_server = 'No tienes permiso para contestar esta publicacion';
						}else{
							switch(data.error.message){
								
								case 'The access token could not be decrypted':
									$scope.respuesta_server = 'Error de acceso: Favor de volverte a firmar en Facebook';
								break;
								
								case 'No administras esta pagina':
									$scope.respuesta_server = 'No cuentas con permisos para administrar esta página y no puedes responder';
								break;

								case 'Error en respuesta de facebook, intenta mas tarde':
									$scope.respuesta_server = 'Error en respuesta de facebook, intenta mas tarde';
								break;

								case '(#200) Permissions error':
									$scope.respuesta_server = 'El mensaje no se ha podido responder tal vez haya sido eliminado de Facebook';
								break;
								
								default:
									$scope.respuesta_server = 'Error desconocido favor de contactar al administrador';
							}
						}
					}else if(data.tipo === 'twitter'){
				  		if(data.error.code){
						  	switch(data.error.code.toString()){
						  		case '187':
						  			console.log('error code 187');
									$scope.respuesta_server = 'No se pudo responder: Respuesta duplicada';
						  		break;

						  		case '186':
						  			console.log('error code 186');

						  		break;

						  		case '32':
						  			console.log('error code 32');
						  			$scope.respuesta_server = 'No pudimos conectar con Twitter, favor de revisar la conexión de la cuenta';
						  		break;

						  		case '151':
						  			console.log('error code 151');
						  			$scope.respuesta_server = 'El mensaje que se trata de enviar está vacío, favor de verificarlo';
						  		break;

						  		default:
						  			$scope.respuesta_server = data.error.message;
						  		break;
						  	}
				  		}
					}
				}
				else if(data.errorface){
					$scope.respuesta_server = data.errorface;
				}
			}
		});
	}else{
		$scope.error_post = 'No se puede completar sin clasificación';
		console.log('No tiene clasificacion');
	}
};
  
  
  
  
  //Responde facebook
  $scope.responder = function(param){
  	$scope.deshabilita = true;
  	$scope.items[0].clasificacion = {
		tema : $scope.themeDefault,
		subtema : $scope.subthemeDefault
	};
	if($scope.items[0].clasificacion.tema === $scope.textos.tema){
  		delete $scope.items[0].clasificacion;
  	}else{
  		if($scope.items[0].clasificacion.subtema === $scope.textos.subtema){
  			$scope.items[0].clasificacion.subtema = '';
  		}
  	}
  	var cerrar = true;
  	var elemento = angular.copy($scope.items[0]);
  	delete elemento.conversacion;
    var clas = {};

    if(param){
		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
			console.log('Contesta sin problemas');
		}else{
			if(!$scope.items[0].clasificacion){
				$scope.error_post = 'No tiene clasificacion';
			}else if(!$scope.items[0].sentiment){
				$scope.error_post = 'No tiene sentiment';
			}else{
				$scope.error_post = 'No tiene clasificacion';
			}
			$scope.deshabilita = false;
			return 0;
		}
	}
  	if ($scope.respuesta !== '' && $scope.respuesta !== 'undefined' && $scope.respuesta !== null){
  	    clas = {
			tema: $scope.themeDefault,
			subtema: $scope.subthemeDefault,
			username: Authentication.user.displayName,
			userid: Authentication.user._id,
			hora: new Date()
	    };
  		var respuesta = $scope.respuesta;
	  	$http.post('/respTwit',{item_id:elemento._id,respuesta:respuesta,coleccion:Authentication.user.cuenta.marca+'_consolidada',clas:clas,id_cuenta:Authentication.user.cuenta._id,id_str: elemento.id_str}).success(function(data){
	  		var response = data;
	  		console.log('status del envío en twitter');
	  		console.log(response);
	  		if(response.code){
			  	switch(response.code.toString()){
			  		case '187':
			  			console.log('error code 187');
						$scope.respuesta_server = 'No se pudo responder: Respuesta duplicada';
						cerrar = false;		
			  		break;
			  		case '186':
			  			console.log('error code 186');
			  			$scope.respuesta_server = 'No se pudo responder: Sobrepasas los 140 caracteres permitidos';
			  			cerrar = false;
			  		break;
			  		default:
			  			
			  			$scope.respuesta_server = response.message;
			  			cerrar = false;
			  		break;
			  	}
	  		}
	  		
		  	if(cerrar){
		  		if(param){
		  			if($scope.items[0].sentiment){
				  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
						});
					}
			  		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
			  			$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
			  			if($scope.items[0].influencers || $scope.items[0].asignado)
			  				Socket.emit('eliminaNotificacion',$scope.items[0]._id);
			  		}else{
			  			if($scope.items[0].clasificacion){
							$scope.error_post = 'No tiene clasificacion';
						}else if($scope.items[0].sentiment){
							$scope.error_post = 'No tiene sentiment';
						}else{
							$scope.error_post = 'No tiene clasificacion';
						}
			  			$scope.deshabilita = false;
			  			return;
			  		}
			  	}
			  	$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
				});
		  		var answer = {texto:respuesta, user_name:Authentication.user.displayName, user_id:Authentication.user._id,timestamp:new Date()};
			  	var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment, answer:answer,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
			  	Socket.emit('actualizaClasificacion',obj_actualizar);
			 	Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:items[0]._id});
			 	if($scope.items[0].sentiment || $scope.items[0].clasificacion){
			 		if($scope.items[0].influencers || $scope.items[0].asignado)
			 			Socket.emit('eliminaNotificacion',$scope.items[0]._id);
			 	}
			 	$scope.deshabilita = false;
			  	$modalInstance.close($scope.items[0]);
			}
	  	});
  	}else{
  		if(param){
  			$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
			});
	  		$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
	  		if($scope.items[0].influencers || $scope.items[0].asignado)
	  			Socket.emit('eliminaNotificacion',$scope.items[0]._id);
	  	}
  	    clas = {
		tema: $scope.themeDefault,
		subtema: $scope.subthemeDefault,
		username: Authentication.user.displayName,
		userid: Authentication.user._id
	    };
	    if($scope.items[0].sentiment){
			$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
			});
		}
	    if($scope.themeDefault !=='Tema'){
	 		$http.post('/insertaClasificacion',{id:$scope.items[0]._id,coleccion:Authentication.user.cuenta.marca+'_consolidada',clas:clas}).success(function(data){
	  			var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
			  	Socket.emit('actualizaClasificacion',obj_actualizar);
			 	Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:items[0]._id});
			 	if($scope.items[0].influencers || $scope.items[0].asignado)
			 		Socket.emit('eliminaNotificacion',$scope.items[0]._id);
			  	$modalInstance.close($scope.items[0]);
	  		}).error(function(resp){
		        console.log('Error!');
		       	console.log(resp);
		    });
		}

	    var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
		Socket.emit('actualizaClasificacion',obj_actualizar);
		Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:items[0]._id});
		if($scope.items[0].sentiment || $scope.items[0].clasificacion){
			//alert('Eliminando notificacion');
			if($scope.items[0].influencers || $scope.items[0].asignado)
				Socket.emit('eliminaNotificacion',$scope.items[0]._id);
		}
		$scope.deshabilita = false;
		$modalInstance.close($scope.items[0]);
  	}
  	/*
	*/	
  };
$scope.respondeDMTwitter = function(param){
	$scope.deshabilita = true;
	$scope.items[0].clasificacion = {
		tema : $scope.themeDefault,
		subtema : $scope.subthemeDefault
	};
	if($scope.items[0].clasificacion.tema === $scope.textos.tema){
  		delete $scope.items[0].clasificacion;
  	}else{
  		if($scope.items[0].clasificacion.subtema === $scope.textos.subtema){
  			$scope.items[0].clasificacion.subtema = '';
  		}
  	}

	var elemento = angular.copy($scope.items[0]);
	delete elemento.conversacion;
	var cerrar = true;
    var clas = {};
    if(param){
		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
		}else{
			if(!$scope.items[0].clasificacion){
				$scope.error_post = 'No tiene clasificacion';
			}else if(!$scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  $scope.deshabilita = false;
			 return;
		}
	}
	if ($scope.respuesta !== '' && $scope.respuesta !== 'undefined' && $scope.respuesta !== null){
		clas = {
			tema: $scope.themeDefault,
			subtema: $scope.subthemeDefault,
			username: Authentication.user.displayName,
			userid: Authentication.user._id,
			tiempo: new Date()
		}; 
		$http.post('/respDM',{clas:clas,respuesta:$scope.respuesta,coleccion:Authentication.user.cuenta.marca+'_consolidada',item:elemento,sentiment:$scope.items[0].sentiment, cuenta: Authentication.user.cuenta._id}).success(function(data){

			$scope.items[0].clasificacion = {
			  	tema:$scope.themeDefault,
			  	subtema:$scope.subthemeDefault
			};
			if(data.code){
				cerrar = false;
				$scope.respuesta_server = data.message;
			}
			if(cerrar){
				if($scope.items[0].sentiment){
			  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
						
					});
				}
				if(param){		  			
					$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
			  	}
				var answer = {texto:$scope.respuesta, user_name:Authentication.user.displayName, user_id:Authentication.user._id,timestamp:new Date()};
			  	var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment, answer:answer,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
				Socket.emit('actualizaClasificacion',obj_actualizar);
				Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:$scope.items[0]._id});
				$scope.deshabilita = false;
				$modalInstance.close($scope.items[0]);
			}
			
		});
	}else{
		if(param){
			if($scope.items[0].sentiment){
				  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
						});
					}
	  		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
	  			$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
	  		}else{
	  			if($scope.items[0].clasificacion){
					$scope.error_post = 'No tiene clasificacion';
				}else if($scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  	$scope.deshabilita = false;
			  	return;
	  		}
	  	}
  		clas = {
			tema: $scope.themeDefault,
			subtema: $scope.subthemeDefault,
			username: Authentication.user.displayName,
			userid: Authentication.user._id
		};
		if($scope.themeDefault !=='Tema'){
	  		$http.post('/insertaClasificacion',{id:$scope.items[0]._id,coleccion:Authentication.user.cuenta.marca+'_consolidada',clas:clas}).success(function(data){
	  			var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
				Socket.emit('actualizaClasificacion',obj_actualizar);
	  		}).error(function(resp){
		        console.log('Error!');
		       	console.log(resp);
		    });
		}
		if($scope.items[0].sentiment){
				  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
						});
					}
		var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
		Socket.emit('actualizaClasificacion',obj_actualizar);
		if(cerrar){
			Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:$scope.items[0]._id});
			$scope.deshabilita = false;
			$modalInstance.close($scope.items[0]);
		}
	}	
};
$scope.respondeInboxFb = function(param){
	$scope.deshabilita = true;
	$scope.items[0].clasificacion = {
		tema : $scope.themeDefault,
		subtema : $scope.subthemeDefault
	};
	if($scope.items[0].clasificacion.tema === $scope.textos.tema){
  		delete $scope.items[0].clasificacion;
  	}else{
  		if($scope.items[0].clasificacion.subtema === $scope.textos.subtema){
  			$scope.items[0].clasificacion.subtema = '';
  		}
  	}
	var elemento = angular.copy($scope.items[0]);
	delete elemento.conversacion;
	if(param){
		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
		}else{
			if(!$scope.items[0].clasificacion){
					$scope.error_post = 'No tiene clasificacion';
				}else if(!$scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  	$scope.deshabilita = false;
				return;
		}
	}
	if($scope.respuesta !== '' && $scope.respuesta !== 'undefined' && $scope.respuesta !== null){
	    
		var data_extra = {
		    tema: $scope.themeDefault,
		    subtema: $scope.subthemeDefault,
		    username: Authentication.user.displayName,
		    userid: Authentication.user._id,
		    nombreSistema: Authentication.user.cuenta.marca
		};

		if(Authentication.user.additionalProvidersData.facebook.accessToken){
			console.log('Entro con accessToken');
		    var fbobject = Authentication.user.additionalProvidersData.facebook;
		    data_extra.fb_usid = fbobject.id;
		    var a_t = fbobject.accessToken;
		    var colectione = Authentication.user.cuenta.marca+'_consolidada';
		    var account_id = Authentication.user.cuenta._id;

			$http.post('/respondeInbox',{obj: elemento, respuesta: $scope.respuesta, coleccion:colectione, id: account_id, access_user: a_t, extra:data_extra}).
			success(function(data){
				if(!data.error && !data.errorface){
					if($scope.items[0].sentiment){
				  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
							
						});
				  	}
					if(param){
				  		$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
				  	}
					var answer = {texto:$scope.respuesta, user_name:Authentication.user.displayName, user_id:Authentication.user._id,timestamp:new Date()};
					var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment, answer:answer,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
					Socket.emit('actualizaClasificacion',obj_actualizar);
					Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:$scope.items[0]._id});
					$scope.deshabilita = false;
					$modalInstance.close($scope.items[0]);
				}else{
					if(data.errorface){
						$scope.respuesta_server = data.errorface;
					}else{
						$scope.respuesta_server = 'El usuario no tiene permisos para responder';
					}	
				}
			});
		}else{
			console.log('no tiene accessToken');
		}

	}//hay respuesta
	else{
		if($scope.items[0].sentiment){
	  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
				
			});
	  	}
		if(param){
	  		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
	  			$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
	  		}else{
	  			if($scope.items[0].clasificacion){
					$scope.error_post = 'No tiene clasificacion';
				}else if($scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  	$scope.deshabilita = false;
			  	return;
	  		}
	  	}
		var clas = {
			tema: $scope.themeDefault,
			subtema: $scope.subthemeDefault,
			username: Authentication.user.displayName,
			userid: Authentication.user._id,
			sentiment: $scope.items[0].sentiment
		};
		if($scope.themeDefault !== 'Tema'){
			$http.post('/insertaClasificacion',{id:$scope.items[0]._id,coleccion:Authentication.user.cuenta.marca+'_consolidada',clas:clas}).success(function(data){
	  		});
	  	}
	  	var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:$scope.items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
	  	Socket.emit('actualizaClasificacion',obj_actualizar);
  		Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:$scope.items[0]._id});
  		$scope.deshabilita = false;
		$modalInstance.close($scope.items[0]);
	}//no hay respuesta
};
$scope.respondePostFb = function(param){
	$scope.deshabilita = true;
	var cerrar = true;
	var acceso;
	$scope.items[0].clasificacion = {
		tema : $scope.themeDefault,
		subtema : $scope.subthemeDefault
	};
	if($scope.items[0].clasificacion.tema === $scope.textos.tema){
  		delete $scope.items[0].clasificacion;
  	}else{
  		if($scope.items[0].clasificacion.subtema === $scope.textos.subtema){
  			$scope.items[0].clasificacion.subtema = '';
  		}
  	}
	var elemento = angular.copy($scope.items[0]); 
	delete elemento.conversacion;
	if(param){
		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
			console.log('Contesta sin problemas');
		}else{
			if(!$scope.items[0].clasificacion){
					$scope.error_post = 'No tiene clasificacion';
				}else if(!$scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  	$scope.deshabilita = false;
			  	return;
		}
	}
	if ($scope.respuesta !== '' && $scope.respuesta !== 'undefined' && $scope.respuesta !== null){
		var id_cuenta = $scope.authentication.user.cuenta._id;
		var service = $resource('/accounts/:accountId',{accountId: '@id'});
		var fb = service.get({accountId:id_cuenta},function(data){
			var id_page = data.datosPage.id;
			var url='https://graph.facebook.com'+$scope.constant.fbapiversion+'me/accounts?access_token='+$scope.authentication.user.additionalProvidersData.facebook.accessToken;
			$http.get(url).success(function(respuesta){
				var aux = $scope.items[0].id.split('_');
					for(var i = 0; i < respuesta.data.length; i++){
					    if(respuesta.data[i].id === id_page){
					      	acceso = respuesta.data[i].access_token;
					    }
					}
				console.log('Accesos de la cuenta de Facebook para responder!');
				console.log(acceso);
				var respuesta_scope = $scope.respuesta;
				var parent;
				if($scope.items[0].parent_comment === $scope.items[0].parent_post){
					parent =  $scope.items[0].id;
				}else{
					parent = (($scope.items[0].parent_comment)?$scope.items[0].parent_comment:$scope.items[0].id);
				}
				//(var parent = (($scope.items[0].parent_comment)?$scope.items[0].parent_comment:$scope.items[0].id)
					respuesta_scope = encodeURIComponent(respuesta_scope);
		       	var url_responder = 'https://graph.facebook.com'+$scope.constant.fbapiversion+parent+'/comments?message='+respuesta_scope+'&access_token='+acceso;
		       	//var url_responder = 'https://graph.facebook.com'+$scope.constant.fbapiversion+(($scope.items[0].parent_comment)?$scope.items[0].parent_comment:$scope.items[0].id)+'/comments?message='+respuesta_scope+'&access_token='+acceso;
		       	$http.post(url_responder).success(function(resp){
		       		console.log('Respuesta de la solicitud de respuesta post');
		       		console.log(resp);
		       		var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
					Socket.emit('actualizaClasificacion',obj_actualizar);
		       		if(param){
				  		$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
				  	} 
				  	var hora = new Date();
				  	var clas = {
				  		tema: $scope.themeDefault,
				  		subtema: $scope.subthemeDefault,
				  		username: Authentication.user.displayName,
				  		userid: Authentication.user._id
				  	};
				  	var resp_twit = $http.post('/respFb',{id:elemento.id,resp:$scope.respuesta,coleccion:Authentication.user.cuenta.marca+'_consolidada',clas:clas,tiempo:hora,id_cuenta:$scope.authentication.user.cuenta._id,id_str:resp.id,id_post:$scope.items[0]._id}).success(function(data){
				  		$scope.response = 'Respuesta enviada correctamente.';
				  		var answer = {texto:respuesta_scope, user_name:Authentication.user.displayName, user_id:Authentication.user._id,timestamp:new Date()};
				  		var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:items[0].sentiment,answer:answer,user:$scope.authentication.user._id,cuenta:$scope.authentication.user.cuenta.marca};
						if($scope.items[0].sentiment){
					  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
								
							});
					  	}
						Socket.emit('actualizaClasificacion',obj_actualizar);
						$scope.deshabilita = false;
				  		$modalInstance.close($scope.items[0]);
				  	});
		       	}).error(function(resp){
		       		console.log('Error de facebook !! ');
		       		console.log(resp);
		       		$scope.deshabilita = false;
		       		if(resp.error.code === 100 || resp.error.code === 1705) {
		       			$scope.respuesta_server = 'Este post ya fue eliminado por el usuario';
		       		} else if(resp.error.code === 190) {
		       			$scope.respuesta_server = 'No tienes permiso para contestar esta publicacion';
		       		} else {
		       			$scope.respuesta_server = resp.error.message;
		       		}
		       	});
			});
		});
	}//end if respuesta vacia
	else{
		if(param){
	  		if($scope.items[0].clasificacion && $scope.items[0].sentiment){
	  			$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
	  		}else{
	  			if(!$scope.items[0].clasificacion){
					$scope.error_post = 'No tiene clasificacion';
				}else if(!$scope.items[0].sentiment){
					$scope.error_post = 'No tiene sentiment';
				}else{
					$scope.error_post = 'No tiene clasificacion';
				}
			  	$scope.deshabilita = false;
			  	return;
	  		}
	  	}
	  	var obj_actualizar = {_id: $scope.items[0]._id,tema:$scope.themeDefault,subtema:$scope.subthemeDefault, sentiment:$scope.items[0].sentiment};
  		Socket.emit('actualizaClasificacion',obj_actualizar);
		var beto = {
			id:elemento._id,
			coleccion:Authentication.user.cuenta.marca+'_consolidada',
			tema:$scope.themeDefault,
			subtema:$scope.subthemeDefault,
			clas:{
				tema: $scope.themeDefault,
				subtema: $scope.subthemeDefault,
				username: Authentication.user.displayName,
				userid: Authentication.user._id
			}
		};
		if($scope.themeDefault !=='Tema'){
			$http.post('/insertaClasificacion',beto);
	  	}
	  	$scope.deshabilita = false;
  		$modalInstance.close($scope.items[0]);
	}
	$scope.items[0].clasificacion = {
  		tema:$scope.themeDefault,
  		subtema:$scope.subthemeDefault
  	};
  	if($scope.items[0].sentiment){
  		$http.post('/sentiment',{twit: $scope.items[0]._id,sentiment:$scope.items[0].sentiment,coleccion:Authentication.user.cuenta.marca+'_consolidada',user_name:$scope.authentication.user.displayName,user_id:$scope.authentication.user._id}).success(function(data){
			
		});
  	}
  	
	Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:$scope.items[0]._id});
};
	$scope.elimina_post = false;

	$scope.deletePost = function(){
		console.log('Checked !!!');
		console.log($scope.elimina_post);
		$scope.mensajeDescartado='';

	};

	$scope.cambiaMotivo = function(motivo){
		$scope.descarte = motivo;
		if($scope.descarte === 'spam'){
			$scope.elimina_post = true;
			$scope.mensajeDescartado='';
		}else{
			$scope.elimina_post = false;
			$scope.mensajeDescartado='';

		}
	}

  $scope.guardaDescarte=function(red, tipo){
  	var cerrar = false;
  	var descartado=$scope.descarte;
  	var idUsuario=$scope.authentication.user._id;
  	var username=$scope.authentication.user.username;
  	var imagenUsuario = $scope.authentication.user.imagen_src;
  	var idPost= $scope.items[0]._id;
  	var idFbPost = $scope.items[0].id;
  	var idFacebook = '';
  	var accessToken = '';
  	var elimina = '';
  	if(red === 'facebook' && tipo !== 'facebook_inbox'){
  		elimina = $scope.elimina_post;
  	}else{
  		elimina = false;
  	}
  	if(Authentication.user.additionalProvidersData){
  		idFacebook = Authentication.user.additionalProvidersData.facebook.id;
  		accessToken = Authentication.user.additionalProvidersData.facebook.accessToken;
  	}else{
  		idFacebook = '';
  		accessToken = '';		
  	}
  	var criterio = {
  		descartado : descartado,
  		idUsuario : idUsuario,
  		username : username,
  		cuenta : $scope.authentication.user.cuenta.id,
  		coleccion : $scope.authentication.user.cuenta.marca+'_consolidada',
  		idPost : idPost,
  		eliminar : elimina,
  		razon_eliminar : $scope.texto_eliminado,
  		fb_usid : idFacebook,
  		fb_usat : accessToken,
  		nombreSistema : Authentication.user.cuenta.marca,
  		id_fb_post : idFbPost,
  		imagenUsuario : imagenUsuario
  	};
  	if(typeof descartado==='undefined'){
  		$scope.mensajeDescartado='No se ha seleccionado ninguna razón';
  	}else{
  		if(idFacebook === '' && accessToken === '' && elimina === true){
  			$scope.mensajeDescartado='Para descartar el mensaje debes administrar la fan page';
  			//cerrar = false;
  		}else{
	  		//cerrar = true;
	  		if($scope.items[0].length){
	  			console.log('Accion por lote');
	  			delete criterio.idPost;
	  			delete criterio.eliminar;
	  			delete criterio.id_fb_post;
	  			delete criterio.razon_eliminar;
	  			delete criterio.fb_usid;
  				delete criterio.fb_usa;
	  			criterio.lote = $scope.items[0];
	  			$http.post('/descartadoLote', criterio).success(function(data){
		  			console.log(data);
		  			if(data.length > 0){
		  				cerrar = true;
		  			}
		  		  	if(cerrar){
	  					for(var i = 0; i < data.length; i++){
	  						console.log('Liberando ocupado ');
	  						console.log(data);
	  						Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:data[i]});
	  						var obj_actualizar_descartado ={
		  						username: Authentication.user.displayName,
		  						cuenta: Authentication.user.cuenta.marca,
		  						_id: data[i],
		  						descartado: {
			  						idUsuario: idUsuario,
			  						motivo: descartado,
			  						usuario:username,
									usuario_foto: Authentication.user.imagen_src
			  					}
		  					};
		  					Socket.emit('tiempoRealServer', obj_actualizar_descartado);
		  					var obj_actualizar = {descartado:true, _id:data[i],user: Authentication.user._id,cuenta:Authentication.user.cuenta.marca};
	  						Socket.emit('actualizaClasificacion',obj_actualizar);
	  					}
	  					
						$modalInstance.close(data);
	  				}

		  		});
	  		}else{
	  			console.log('Accion individual');
	  			$http.post('/descartado', criterio).success(function(data){
		  			console.log('EL RRETORNO DE DESCARTE');
		  			console.log(data);
		  			if(data.error === 'noPage_access_token'){
						$scope.mensajeDescartado='Necesitas ser administrador para eliminar el mensaje';
						cerrar = false;
						$scope.elimina_post = false;
		  			}else if(data.error === 'mensajeEliminado_facebook'){
						$scope.mensajeDescartado='El mensaje ha sido eliminado directamente en Faceboook';
						cerrar = false;	
						$scope.elimina_post = false;
		  			}else if(data.error === 'post_noEncontrado'){
						$scope.mensajeDescartado='El mensaje no ha sido encontrado para poder eliminarlo en Faceboook';
						cerrar = false;	
						$scope.elimina_post = false;
		  			}else if(data.error === 'contenido_noEncontrado'){
		  				$scope.mensajeDescartado='Contenido no encontrado, favor de verificarlo';
		  				cerrar = false;
		  				$scope.elimina_post = false;
		  			}else if(data.error === 'sinPermisos'){
		  				$scope.mensajeDescartado='No cuentas con permisos suficientes para eliminar el mensaje en Facebook';
		  				cerrar = false;
		  				$scope.elimina_post = false;
		  			}else if(data===1){
		  				$scope.mensajeDescartado='Error con la conexión de la base de datos';
		  				cerrar = false;
		  			}
		  			else if(data===2){
		  	  			$scope.mensajeDescartado='No se pudo actualizar la razón';
		  				cerrar = false;
		  			}
		  			else if(data===3){
						cerrar = true;
		  			}
		  		  	if(cerrar){
	  					$scope.items[0].descartado = {
	  						idUsuario: idUsuario,
	  						motivo: descartado,
	  						usuario:username,
							usuario_foto: Authentication.user.imagen_src
	  					};
	  					Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:idPost});
	  					$scope.$emit('actualizaPost',$scope.items[0]);
	  					var obj_actualizar = {descartado:true, _id:$scope.items[0]._id,user: Authentication.user._id,cuenta:Authentication.user.cuenta.marca};
	  					Socket.emit('actualizaClasificacion',obj_actualizar);
	  					var obj_actualizar_descartado ={
	  						username: Authentication.user.displayName,
	  						cuenta: Authentication.user.cuenta.marca,
	  						_id: $scope.items[0]._id,
	  						descartado: $scope.items[0].descartado	
	  					};
	  					Socket.emit('tiempoRealServer', obj_actualizar_descartado);
						$modalInstance.close($scope.items[0]);
	  				}
		  		});
	  		}
	  	}
  	}
  };

   $scope.regresarMailbox = function(item){
   		$rootScope.$broadcast('eventRegresaMailbox',item);
	    $modalInstance.dismiss(item);
	};
  $scope.cancel = function (item) {
  	delete item.conversacion;
  	item.conversacion = new Array();
  	console.log(item);
  	if(item.sentiment_actualizado){
  		delete item.sentiment;
  		item.sentiment = $scope.back_sentiment;
  	}
  	Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:item._id});
    $modalInstance.dismiss(item);

  };
  $scope.cancelaDescarte = function (item) {
    $modalInstance.dismiss('cancel');
    Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:item._id});
  };


  $scope.guardaInfluencer=function(item){
		var nombreInfluencer=$scope.nombre;
		var apellidoInfluencer=$scope.apellido;
		var descripcionInfluencer=$scope.descripcion;
		var categoriaInfluencer=$scope.categoria;
		var usernameInfluencer=$scope.username;
		var error=0;
		$scope.mensajeErrores = '';
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
		}
		else{
			$scope.errorCategoria='';
		}
		
		if(usernameInfluencer.length===0){
			$scope.errorUsername='Por favor llene el USERNAME';
			error++;
		}			
		else{
			$scope.errorUsername='';
		}
		
		if(error!==0){
			$scope.mensajeErrores = 'Favor de llenar los campos requeridos';
		}else{
			var nombreUsuario=usernameInfluencer.replace('@','');
			$scope.muestraBarra=true;
				//,descripcion:descripcionInfluencer
				$http.post('/addInfluencer/', {apellido:apellidoInfluencer,nombre:nombreInfluencer,categoria:categoriaInfluencer,username:nombreUsuario,cuenta:$scope.authentication.user.cuenta.marca,descripcion:descripcionInfluencer}).success(function(data){
					if(data===1){
						window.alert('El usuario de twitter no existe');
					}
					else if(data===2){
						window.alert('Ocurrió un error al validar la información');
					}  
					else if(data===3){
						window.alert('Ocurrió un error al agregar el influencer');
					}

					else if(data===5){
						window.alert('El influencer ya existe');
					}
					else{
						Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:item._id});
 		 				$modalInstance.close();
					}
    			});			
			}

		};

}).controller('ModalAsignarCtrl', function($scope, $modalInstance, mensaje,usuarios,$resource,$http,Authentication,Socket,$rootScope,$modal,$timeout,CONSTANT){
	$scope.usuarios_cuenta = usuarios;
	$scope.mensaje = mensaje;
	$scope.authentication = Authentication;
    $scope.constant = CONSTANT;
	var datos_bloqueo = {};
	datos_bloqueo.cuenta = $scope.authentication.user.marca;
  	datos_bloqueo.user = $scope.authentication.user.displayName;
  	datos_bloqueo._id = $scope.mensaje._id;
  	datos_bloqueo.user_image = $scope.authentication.user.imagen_src;
  	Socket.emit('idBloquea',datos_bloqueo);
	$scope.evaluaActivo = function(id){
  	    if(id === $scope.usuario_seleccionado){
	  		return true;
	    }else{
	  		return false;
	    }
	};
	$scope.asignaMensaje = function(user){
		$scope.asigna_usuario = user;
      	$scope.usuario_seleccionado = user._id;
	};
	$scope.asignaMensajeService = function(){
		if($scope.asigna_usuario){
			var obj = {
				id:$scope.mensaje._id,
				usuario_asignador_foto: Authentication.user.imagen_src,
				coleccion: Authentication.user.cuenta.marca,
				asignado:{
					de_id : $scope.authentication.user._id,
					de_name : $scope.authentication.user.displayName,
					usuario_asignado_id : $scope.asigna_usuario._id,
					usuario_asignado_displayName : $scope.asigna_usuario.displayName,
					usuario_asignado_image:$scope.asigna_usuario.imagen_src,
					timestamp : new Date()
				}
			};
			$http.post('/asignaMensaje',obj).success(function(data){
				if(!data.code){
					Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:$scope.mensaje._id});
					var obj_atendido = {_id:$scope.mensaje._id, cuenta: Authentication.user.cuenta.marca,asignado:obj.asignado,mensaje:$scope.mensaje};
					Socket.emit('socketAsignaServer',obj_atendido);
					console.log($scope.mensaje);
					if($scope.mensaje.influencers){
					   	console.log('Eliminando notificacion');
					   	console.log($scope.mensaje);
					   	Socket.emit('eliminaNotificacion',$scope.mensaje._id);
					}
					$rootScope.$broadcast('muestraFlash','Mensaje asignado correctamente');
					$modalInstance.dismiss($scope.mensaje);
				}else{
					$scope.error_asignacion = 'Hubo un error en la asignacion';
					return;
				}
			});
		}else{
			$scope.error_asignacion = 'Selecciona un usuario';
			return;
		}
	};
	$scope.cancelAsignacion = function (item) {
	  	Socket.emit('liberaOcupado',{cuenta:Authentication.user.cuenta.marca,_id:item._id});
	    $modalInstance.dismiss(item);
	  };
}).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0]; 
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});
