'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'likeable-crm';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils','btford.socket-io','dcbImgFallback','gettext','highcharts-ng'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.module(ApplicationConfiguration.applicationModuleName).constant('CONSTANT', {
    host:'https://crm.likeable.mx',
    fbapiversion: '/v2.4/'
});

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('accounts');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('charts');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('csvs');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('feeds');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('influencers');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('themes');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Configuring the Articles module
angular.module('accounts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Empresas', 'accounts', 'dropdown', '/accounts(/create)?');
		Menus.addSubMenuItem('topbar', 'accounts', 'Listado de las Empresas', 'accounts');
		Menus.addSubMenuItem('topbar', 'accounts', 'Añadir Empresa', 'accounts/create');
	}
]);
'use strict';
var user;
var permisos = [	{
		'rol': 'app-manager',
		'permisos':['1','2']//1: puede ver listas, 2: puede crear cuentas
	},
	{
		'rol': 'account-manager',
		'permisos':['1']//1: puede ver listas
	},
	{
		'rol': 'user',
		'permisos':[0]//1: puede ver listas
	}];
//Setting up route
angular.module('accounts').controller('SettingsController', ['$scope','Authentication',
		function($scope, Authentication) {
			user = Authentication.user;
     	}

	]).config(['$stateProvider',
	function($stateProvider) {
		// Accounts state routing
		$stateProvider.
		state('listAccounts', {
			url: '/accounts',
			templateUrl: 'modules/accounts/views/list-accounts.client.view.html'
		}).
		/*state('listThemes', {
			url: 'get/listThemes',
			templateUrl: 'modules/accounts/views/temasSubtemas.html'
		}).*/
		state('listTwit',{
			url: '/get/twits',
			templateUrl: 'modules/accounts/views/lista.twits.view.html'
		}).
		state('createAccount', {
			url: '/accounts/create',
			templateUrl: function(){
				for(var permiso in permisos){
					if (user.roles[0] === permisos[permiso].rol ) {
						if(permisos[permiso].permisos.indexOf(2) > 0){	
							return 'modules/accounts/views/create-account.client.view.html';
						}else{
							return 'modules/users/views/404.html';
						}
					}
				}
			}
		}).
		state('viewAccount', {
			url: '/accounts/:accountId',
			templateUrl: 'modules/accounts/views/view-account.client.view.html'
		}).
		state('inbox',{
			url: '/inbox',
			templateUrl:'modules/accounts/views/inbox.html'
		}).
		state('editAccount', {
			url: '/accounts/:accountId/edit',
			templateUrl: 'modules/accounts/views/edit-account.client.view.html'
		}).
		state('dashboard', {
			url: '/dashboard',
			templateUrl: 'modules/accounts/views/dashboard.html'
		})
		/*.
		state('facebookListener', {
			url: '/accounts/facebook/callback',
			templateUrl: 'modules/accounts/views/facebook.client.view.html'
		})*/;
	}
]);

'use strict';
// Accounts controller
angular.module('accounts').filter('linksTwitter',['$filter', function($filter) {
        return function(text,target) {

            if (!text) return text;
            /*esta es la función del filtro*/ 
            var replacedText = $filter('linky')(text, target);
            var targetAttr = '';

            //esto es para ver si angular esta funcional
            if (angular.isDefined(target)) {
                targetAttr = ' target="' + target + '"';
            }

            // aquí va la expresion regular a buscar #
            var patronMencion = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
			replacedText = text.replace(patronMencion, '$1<a target="_blank" class="link-twitter link-twitter-mencion" href="https://twitter.com/search?q=%23$2"' + targetAttr + '>#$2</a>');            	

            // aquí va la expresion regular a buscar @
            var patronHashtag = /(^|\s)\@(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = replacedText.replace(patronHashtag, '$1<a target="_blank" class="link-twitter link-twitter-hastag" href="https://twitter.com/$2"' + targetAttr + '>@$2</a>');
            return replacedText;
            /*esta es la función del filtro*/ 
        };
    }
]).controller('AccountsController', ['$scope', '$http', '$resource', '$stateParams', '$location', 'Authentication', 'Accounts','CONSTANT', function($scope, $http, $resource ,$stateParams, $location, Authentication, Accounts,CONSTANT) {
	$scope.authentication = Authentication;
//	console.log($scope.authentication);
	
/*opciones para idioma general de highcharts*/	
Highcharts.setOptions({
    lang: {
        months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Novimbre","Diciembre"],
        weekdays: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
        shortMonths:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
    }
});	
/*opciones para idioma general de highcharts*/

		    /*si no esta logueado en face*/
	    $scope.statusLoginFacebook = false;  
	    if(typeof $scope.authentication.user.additionalProvidersData !== 'undefined'){
		$scope.statusLoginFacebook = true;	
		}	
		/*si no esta logueado en face*/
    $scope.fechaActual = new Date();
	$scope.esquemaColores = ['#465769','#005b8a','#aea9fd','#ffc65b','#31d6c5','#fe8081','#dee2eb','#a8d6e3','#f37c00'];
	$scope.constant = CONSTANT;
    $scope.creaArchivo = function(nombreSistema, opcion){
/* Click en sentimiento para mostrar los mensajes en ventana aparte*/
$scope.clickSentiment = function (key,value){	
	if(value === 0)
		return;
	window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&sentiment='+key+'&cuenta='+nombreSistema+'&opcion='+opcion);	
};
		function obtenPorcentajes(obj, total){
			var obj_perce = {};
			for(var i in obj){
				if(obj[i]===0){
					obj_perce[i]=0;
				}else{
					obj_perce[i] =  Math.round(( ( obj[i] * 100 ) / total ).toFixed(2));
				}
			}
			return obj_perce;
		}

		if(nombreSistema === undefined){
	    	nombreSistema = Authentication.user.cuenta.marca;
		}
		if(opcion === undefined){
	    	opcion = 'general';
		}
		var obj = {};
		obj.fecha_inicial = $scope.dt;
		var fecha_inicial = $scope.dt;
		var fecha_final = $scope.dt2;
		var right_now = new Date();
		if (fecha_final.getDate() === right_now.getDate()) {
	    	obj.fecha_final = fecha_final;
		}
		else {
	    	fecha_final.setHours(23);
	    	fecha_final.setMinutes(59);
	    	fecha_final.setSeconds(59);
	    	obj.fecha_final = fecha_final;
		}
		$scope.graficaTags('create',nombreSistema,obj.fecha_inicial,obj.fecha_final);
		obj.coleccion = nombreSistema+'_consolidada';
		obj.tipo = opcion;
		obj.nombreSistema=nombreSistema;
		var data_series = [];
/*
                                                    _     _            
                                     /\            | |   (_)           
   __ _  ___ _ __   ___ _ __ __ _   /  \   _ __ ___| |__  ___   _____  
  / _` |/ _ \ '_ \ / _ \ '__/ _` | / /\ \ | '__/ __| '_ \| \ \ / / _ \ 
 | (_| |  __/ | | |  __/ | | (_| |/ ____ \| | | (__| | | | |\ V / (_) |
  \__, |\___|_| |_|\___|_|  \__,_/_/    \_\_|  \___|_| |_|_| \_/ \___/ 
   __/ |                                                               
  |___/                                                                */

		$http.post('/generaArchivo',obj).success(function(items){
		    var data = items;
		    var csv = [['Categoria','Número']];
		    var contador = 1;
		    var contador2 = 0;
		    var contador_coincidencias = [];
		    var n = [];
		    var title= [];
		    var obj = {};
		    var series = [];
		    var sentiment = {};
	    	sentiment.negativo = items.sentiment_negativo;
			sentiment.neutro = items.sentiment_neutro;
			sentiment.positivo = items.sentiment_positivo;
			$scope.numeroSentiment = sentiment;
		    var total = 0;
		    for(var x in sentiment){
		    	total += sentiment[x];
		    }
		    $scope.sentiment_perce = obtenPorcentajes(sentiment,total);	

		    //Validación que nos sirve para ocultar o mostrar los sentimientos en la gráfica
		   	if((isNaN($scope.sentiment_perce.negativo) === true && isNaN($scope.sentiment_perce.neutro) === true && isNaN($scope.sentiment_perce.positivo) === true) || ($scope.sentiment_perce.negativo === 0 && $scope.sentiment_perce.neutro === 0 && $scope.sentiment_perce.positivo === 0)){
		   		$scope.mostrarSentiment = false;
		   	}else{
		   		$scope.mostrarSentiment = true;
		   	}

			var temasTemas = [];
			var subtemasTemas = [];
			var objTemp = {};
			var subtemasTemp = [];
			var divTema;
			var subtemaEncontrado = false;
			for(var tt in items){
				objTemp = {};
				divTema = tt.split('_');
				
				if(divTema.length == 1){
				objTemp.name = tt;
				objTemp.y = items[tt];
				objTemp.drilldown = tt;
				temasTemas.push(objTemp);

				objTemp = {};
				objTemp.id = divTema[0];
				objTemp.data = [];
				objTemp.events = {
					click : function(e,i){
						//alert(e.point.name);	
					}
				};
				subtemasTemas.push(objTemp);				
									
				}
				
			}//for
			
			for(var tt in items){
				objTemp = {};
				divTema = tt.split('_');
				var arrayTemporal = [];

				
				if(divTema.length != 1){
					for(var st in subtemasTemas){

											
						
						if(subtemasTemas[st].id === divTema[0]){
							//console.log(divTema);	
							arrayTemporal[0] = divTema[1];
							arrayTemporal[1] = items[tt];
							//console.log(arrayTemporal);
							subtemasTemas[st].data.push(arrayTemporal);
						}
					}
				}				
				
			}//for 2

		    $scope.sentiment = sentiment;
		    for(var i  in data){
				if(i.search('_') === -1){
			    	obj[contador2] ={
						name:i,
						drilldown:i,
						y:data[i]
			    	};
			    	series.push({
			        	id:i,
			        	events:{
				    		click: function (e,i) {	
								//window.open('https://alberto.likeable.mx/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&tema='+e.point.name+'&total='+e.point.y+'&cuenta='+nombreSistema+'&opcion='+opcion);
				    		}
						},
			        	data:[]
			    	});
			    	contador2++;
				}  
				for(var k in obj){
			    	if( i.search(obj[k].name) !== -1 && i.search('_') !== -1 ){
			    		//console.log('Encontramos un subtema ');
			    		//console.log(i);
						if(contador_coincidencias.hasOwnProperty(obj[k].name)){
				    		contador_coincidencias[obj[k].name] += data[i];
						}else{
				    		contador_coincidencias[obj[k].name] = data[i];
						}
			    	}
				}
				csv[contador] = [i,data[i]];
				n[contador-1] = data[i];
				title[contador-1] = i;
				contador++;
		    }
		    
		    var arr_subtemas = [];
		    contador = 0;
		    var array= [];
		    for(var j in obj){
				contador = 0;
				if(obj[j].name !== 'undefined'){
					array.push(obj[j]);		
					for(var l in data){
				    	if(l.search(obj[j].name) !== -1 && l.search('_') !== -1){
							if(contador === 0){
					    		arr_subtemas[obj[j].name] = [];
							}
							var start = l.indexOf('_');
							var subtema = l.slice(start+1);
							for(var z in series){
					    		if(series[z].id === obj[j].drilldown){
									series[z].data.push([subtema,data[l]]);
					    		}
							}
							arr_subtemas[obj[j].name][contador] = subtema;
							contador++; 
				    	}
					}
				}
		    }
		    var graf_subtemas = {};
		    for(var i = 0; i <=  series.length; i++){
		    	if(series[i]){
			    	for(var j in series[i].data){
			    		if(series[i].data[j][0] !== 'Subtema'){
				    		if(graf_subtemas.hasOwnProperty(series[i].data[j][0])){
			    				graf_subtemas[series[i].data[j][0]] += series[i].data[j][1];
			    			}else{
			    				graf_subtemas[series[i].data[j][0]] = series[i].data[j][1];
			    			}
			    		}
			    	}
			    }
		    }
		    //Proceso que ordena de mayor a menor los temas del drill down 
		    var temasDrillOrd = array.slice(0);
			temasDrillOrd.sort(function(a,b) {
    			var x = a.y;
    			var y = b.y;
    			return x > y ? -1 : x < y ? 1 : 0;
			});
			$scope.temasDecarga = temasDrillOrd;
		    var cuentaTemasDrill = temasDrillOrd.length - 1;
			
			//For que servira para sacar el total de los temas
			var totalTemas = 0;
			for(var recorreTemas=0; recorreTemas <= cuentaTemasDrill; recorreTemas++){
				totalTemas = totalTemas + temasDrillOrd[recorreTemas].y;
			}
		    $scope.totalTemas = totalTemas;
		    var topTemasDrill = []; 
			/*Esto es cuando no se quiere un top ten		    
			if(cuentaTemasDrill <= 50){
		    	for(var i = 0; i <= cuentaTemasDrill; i++){
		    		topTemasDrill.push(temasDrillOrd[i]);
		    	}
		    }else{
		    	for(var i = 0; i<50; i++){
		    		topTemasDrill.push(temasDrillOrd[i]);
		    	}
		    }*/
		    if(cuentaTemasDrill < 10){
		    	for(var i = 0; i <= cuentaTemasDrill; i++){
 		    		topTemasDrill.push(temasDrillOrd[i]);
 		    	}
 		    }else{
		    	for(var i = 0; i<10; i++){
 		    		topTemasDrill.push(temasDrillOrd[i]);
 		    	}
 		    }
			/*if(array.length > 0){
				$scope.mostrarTemasDrill = true;
			}else{
				$scope.mostrarTemasDrill = false;
			}*/
			if(topTemasDrill.length > 0){
				$scope.mostrarTemasDrill = true;
			}else{
				$scope.mostrarTemasDrill = false;
			}			

			$scope.config = {
				loading:true,
				options : {
					
					chart : {
						type : 'pie',
						events:{
							redraw:function(){
								$scope.config.loading = false;
							}
						}
					},
					drilldown : {
						drillUpButton : {
							relativeTo : 'spacingBox',
							position : {
								y : 0,
								x : -40
							}
						},
						 allowPointDrilldown: false,
						 series : subtemasTemas
					},
					legend : {
						align : 'right',
						verticalAlign : 'middle',
						layout : 'vertical',
						itemMarginBottom : 20,
						enabled : true
					},
					lang : {
						drillUpText : '<< Regresar'
					},
					exporting : {
						width : 1000,
						buttons : {
							contextButton : {
								//text: 'Exportar',
								menuItems : [{
									textKey : 'downloadPNG',
									text : 'Exportar a PNG',
									onclick : function() {
										var nombreCorto = 'temas_subtemas';
										var nombreCompleto = 'Temas & Subtemas';
										var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
										var fecha1 = new Date($scope.dt);
										var fecha2 = new Date($scope.dt2);
										var fechaFinal = fecha1.getDate() + "_" + (nombreMeses[fecha1.getMonth() + 1]) + "_" + fecha1.getFullYear() + '__' + fecha2.getDate() + "_" + (nombreMeses[fecha2.getMonth() + 1]) + "_" + fecha2.getFullYear();
										this.exportChart({
											filename : $scope.account + '_' + nombreCorto + '_' + fechaFinal
										}, {
											title : {
												//text:nombreCompleto
											}
										});
									}
								}]
							}
						}
					}
				},
				height : '500px',
				title : {
					//text: 'Temas y subtemas'
					text : ''
				},
				credits : {
					enabled : false
				},
				xAxis : {
					type : 'category'
				},
				legend : {
					enabled : false
				},
				plotOptions : {
					pie : {
						allowPointSelect : true,
						cursor : 'pointer',
						dataLabels : {
							enabled : true,
							color : '#000000',
							connectorColor : '#000000',
							formatter : function() {
								return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
							}
						}
					},
					series : {
						borderWidth : 0,
						dataLabels : {
							enabled : true,
						}
					}
				},
				series : [{
					name : 'Total',
					colorByPoint : true,
					data : temasTemas,
				}]
			}; 


			
	
			var objTemas = new Array();
			//Generando objeto para gráfica temas
			
			for(var i in topTemasDrill){
	    		objTemas.push({name:topTemasDrill[i].name, y:topTemasDrill[i].y,
				events : {
					click : function(e,i){
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&tema='+e.point.name+'&total='+e.point.y+'&cuenta='+nombreSistema+'&opcion='+opcion);	
					}
				}
				});
			}
			if(objTemas.length > 0){
				$scope.mostrarTemas = true;
			}else{
				$scope.mostrarTemas = false;
 			}
			
			for(var t in objTemas){
				objTemas[t].color = $scope.esquemaColores[t];
			}
			
			$scope.tipoGraficaTemas = 'pie';
			
			/*chartTemas*/
			$scope.chartTemas = {
				loading:true,
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false									
				},
				title: {
					text:' '
				},
				credits:{
					enabled:false
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				options:{
					chart:{
						events:{
						redraw:function(){
							$scope.chartTemas.loading = false;
						}								
						}					
					},
					legend:{
						enabled:true,
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20,
						labelFormatter: function () {
							return this.name + ' ('+this.y+')';	
            			}
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								formatter: function(){
									return Math.round(this.percentage.toFixed(2))+'%';
									//if(this.percentage!=0)  return Math.round(this.percentage)  + '%';
								},
								// distance: -50,
								style: {
									fontWeight: 'bold',
									color: 'black',
								}
							},
							showInLegend: true
						},
						column : {
							 dataLabels: {
							 	enabled: true,
							 	formatter: function(){
							 		//return Math.round(this.y)+'%';
							 		return this.y;
							 	}
							 }							
						}
					}
					,exporting: { 
						width:1500,
						buttons: { 
							contextButton: {
								//text: 'Exportar', 
								menuItems:[{
									textKey : 'downloadPNG',
									text: 'Exportar a PNG',
									onclick : function() {			
										var nombreCorto = 'top_temas';
										var nombreCompleto = 'Top Temas';
										var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
										var fecha1 = new Date($scope.dt); 
										var fecha2 = new Date($scope.dt2);
										var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();
										this.exportChart({
											filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
										}, {
											title:{
												//text:nombreCompleto		
											}
										});
									}
								},
								{
									//textKey : 'downloadPNG',
									text: 'Exportar CSV Temas',
									onclick : function() {	
										$scope.descargaTemas($scope.nombre_cuenta,$scope.temasDecarga,$scope.totalTemas);
									}
								},
								{
									text:'&nbsp;'
								}					
								]
							}
						}
					}     
        		},
        		xAxis: {
            		categories: {},
					 lineColor: 'transparent',
        		},   
        	yAxis: {
				title: {
                    text: ' '
                	}
        		},
				series: [{
					type: $scope.tipoGraficaTemas,
					name: 'Total',
					data: objTemas
				}]
			};
			/*chartTemas*/
			
			$scope.cambiarGraf = function(){
				console.log('$scope.cambiarGraf');
				$scope.chartTemas.series[0].type = 'column';
			}
			
			$scope.cambiarGraficaTemas = function(){
				$scope.chartTemas.series[0].type = $scope.tipoGraficaTemas;
			}
			

			
			//construyendo objSubTemas
			var objSubTemas = new Array();
			for(var i in series){
				for(var j in series[i].data){
					objSubTemas.push(series[i].data[j]);
				}
			}
			var objSubTemasC = new Array();
			var contadorSubtemas = 0;
			var totalSubtemas = 0;
			for(var i in graf_subtemas){
				totalSubtemas = totalSubtemas +graf_subtemas[i];
				objSubTemasC.push({name:i,y:graf_subtemas[i],
				events : {
					click : function(e,i){
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&subtema='+e.point.name+'&total='+e.point.y+'&cuenta='+nombreSistema+'&opcion='+opcion);	
					}
				}
				});
				//objSubTemasC.push({name:i,y:graf_subtemas[i],color:$scope.esquemaColores[contadorSubtemas]});
				contadorSubtemas++;	    	
				//objSubTemasC.push([i,graf_subtemas[i]]);
			}
			objSubTemasC.sort(function (a, b){
				return (b.y - a.y);
			});

			$scope.subtemasDecarga = objSubTemasC;
		    $scope.totalSubtemas = totalSubtemas;

			//Proceso para el Top 10 de los temas
		    var cuentaSubTemas = objSubTemasC.length - 1;
		    var topSubTemas = [];
		    /*Aqui esta el proceso para evoitar el top ten
		    if(cuentaSubTemas <= 50){
		    	for(var i = 0; i <= cuentaSubTemas; i++){
		    		topSubTemas.push(objSubTemasC[i]);
		    	}
		    }else{

		    	for(var i = 0; i<50 ; i++){
		    		topSubTemas.push(objSubTemasC[i]);
		    	}
		    }*/
		    if(cuentaSubTemas < 10){
		    	for(var i = 0; i <= cuentaSubTemas; i++){
 		    		topSubTemas.push(objSubTemasC[i]);
 		    	}
 		    }else{
 		    	for(var i = 0; i<10 ; i++){
 		    		topSubTemas.push(objSubTemasC[i]);
 		    	}
 		    }
 		    
			for(var t in topSubTemas){
				topSubTemas[t].color = $scope.esquemaColores[t];
			}

			$scope.tipoGraficaSubTemas = 'pie'; 		    

		$scope.chartSubTemas = {
			loading:true,
		    chart: {
		        plotBackgroundColor: null,
		        plotBorderWidth: null,
		        plotShadow: false
		    },
		    title: {
		        //text: 'Top Temas'
		        text: ' '
		    },
		    credits:{
			  	enabled:false
			},
		    tooltip: {
		        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		    },
		    options:{
		    	chart:{
		    		events:{
		    			redraw:function(){
		    				$scope.chartSubTemas.loading = false;	
		    			}
		    		}
		    	},
		    	legend:{
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20
			    },
			    plotOptions: {
			        pie: {
			            allowPointSelect: true,
			            cursor: 'pointer',
			            dataLabels: {
				            enabled: true,
				            formatter: function(){
				             	return Math.round(this.percentage.toFixed(2))+'%';
				            },
                    	},
                    	showInLegend: true,
				    	distance: -50,
				    	style: {
				       	 	fontWeight: 'bold',
				        	color: 'black',
				        	//textShadow: '0px 1px 2px black'
				    	}
					},
			        showInLegend: true
			    }
				,exporting: { 
					width:1500,
					buttons: { 
						contextButton: {
							//text: 'Exportar', 
							menuItems:[{
								textKey : 'downloadPNG',
								text: 'Exportar a PNG',
								onclick : function() {	
									var nombreCorto = 'top_subtemas';
									var nombreCompleto = 'Top Subtemas';
									var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
									var fecha1 = new Date($scope.dt); 
									var fecha2 = new Date($scope.dt2);
									var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();
									this.exportChart({
										filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
									}, {
										title:{
											//text:nombreCompleto
										}
									});
								}
							},
							{
								textKey : 'downloadPNG',
								text: 'Exportar CSV Subtemas',
								onclick : function() {	
									$scope.descargaSubtemas($scope.nombre_cuenta,$scope.subtemasDecarga,$scope.totalSubtemas);
								}
							}]
						}
					}
				}
			},
        		xAxis: {
            		categories: {},
					 lineColor: 'transparent',
        		},   
        	yAxis: {
				title: {
                    text: ' ',
                	}
        		},			
		    series: [{
		        type: $scope.tipoGraficaSubTemas,
		        name: 'Total',
		        data: topSubTemas
		    }]
		};
		

			$scope.cambiarGraficaSubTemas = function(){
				$scope.chartSubTemas.series[0].type = $scope.tipoGraficaSubTemas;
			}		
		
	/*	if(objSubTemasC.length > 0){
			$scope.mostrarSubtemas = true;
		}else{
			$scope.mostrarSubtemas = false;
		}*/
		if(objSubTemasC.length > 0){
			$scope.mostrarSubtemas = true;
		}else{
			$scope.mostrarSubtemas = false;
		}
		
		
		
		var csvContent = '';
		if(data !== 0){
			csv.forEach(function(infoArray, index){
				var dataString = infoArray.join(',');
				csvContent += index < csv.length ? dataString+ '\n' : dataString;
			}); 
			var encodedUri = encodeURI(csvContent);
			$scope.archivo = encodedUri;
			//window.open(encodedUri);
		}else{
			//alert('No hubo resultados para ese rango de fechas');
		   	console.log('No hubo resultados para ese rango de fechas');
		}	
	});

/*
  
                 _                                                     _     _            
                | |                                     /\            | |   (_)           
   ___ _ __   __| |   __ _  ___ _ __   ___ _ __ __ _   /  \   _ __ ___| |__  ___   _____  
  / _ \ '_ \ / _` |  / _` |/ _ \ '_ \ / _ \ '__/ _` | / /\ \ | '__/ __| '_ \| \ \ / / _ \ 
 |  __/ | | | (_| | | (_| |  __/ | | |  __/ | | (_| |/ ____ \| | | (__| | | | |\ V / (_) |
  \___|_| |_|\__,_|  \__, |\___|_| |_|\___|_|  \__,_/_/    \_\_|  \___|_| |_|_| \_/ \___/ 
                      __/ |                                                               
                     |___/                                                                

       _                _   _____                              _ _        _____                    
      | |              | | |  __ \                            | (_)      / ____|                   
   ___| |__   __ _ _ __| |_| |__) | __ ___  _ __ ___   ___  __| |_  ___ | |     __ _ ___  ___  ___ 
  / __| '_ \ / _` | '__| __|  ___/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| |    / _` / __|/ _ \/ __|
 | (__| | | | (_| | |  | |_| |   | | | (_) | | | | | |  __/ (_| | | (_) | |___| (_| \__ \ (_) \__ \
  \___|_| |_|\__,_|_|   \__|_|   |_|  \___/|_| |_| |_|\___|\__,_|_|\___/ \_____\__,_|___/\___/|___/
                                                                                                   
*/

$http.post('/chartPromedioCasos',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data){
	//var total = data.Completos + data.Descartados + data.Entrada + data.Proceso;

	//data.Completos = data.Completos - data.facebook;
	var total = data.Completos + data.Descartados + data.Entrada;
	console.log('Imprimiendo el total de promedio caso');
	console.log(data);
	$scope.totalCasos = total;

	var vistos = total - data.Entrada;

	var obj = new Array();

	var coloresPromedioCasos = {"En Proceso":"#32b9d9","Descartados":"#8ed996","Entrada":"#465769","Completos":"#f67c01"};
	//var coloresPromedioCasos = {"En Proceso":"#32b9d9","Descartados":"#8ed996","Nuevos":"#465769","Atendidos":"#f67c01"};

	for(var i in data){
		obj.push({name:i.replace('Proceso','En Proceso'),y:data[i],color:coloresPromedioCasos[i.replace('Proceso','En Proceso')]});
	}
	obj.sort(function (a, b){
		return (b.y - a.y);
	});
	if(total === 0){
		$scope.mostrarPromedioCasos = false;
	}else{
		$scope.mostrarPromedioCasos = true;
	}


		var porcentajeTotalCasos = Math.round((parseInt(vistos)/parseInt(total))*100);
		
		if(isNaN(porcentajeTotalCasos)){
		$scope.porcentajeTotalCasos = 0;	
		}else{
		$scope.porcentajeTotalCasos = porcentajeTotalCasos;	
		}
		
		if($scope.porcentajeTotalCasos <= 0){
		$scope.loadingTotalCasos = false;	
		}	
		
		var casos = {};
//		casos.crm = data.Completos + data.Descartados + data.Proceso;
		casos.crm = data.Completos + data.Descartados;
		casos.facebook = data.facebook;
//		casos.total = data.Completos + data.Descartados + data.Entrada + data.Proceso + data.facebook;
		var arregloDona = [];
		if(opcion === 'twitter'){
			casos.total = data.Completos + data.Descartados + data.Entrada;
			casos.resto = casos.total - casos.crm;
			arregloDona = [{
					type : 'pie',
					name : 'Número de Casos',
					innerSize : '50%',
					data : [
					{
						index:0,
						name: 'Atendidos en CRM',
						color: '#0DBEC8',
						y: casos.crm					
					},
					{
						index:1,
						name: 'No Atendidos',
						color: '#EBEEF3',
						y: casos.resto
					}
					],
				dataLabels: {
					enabled:false
				}					
				}];		
		}else{
			casos.total = data.Completos + data.Descartados + data.Entrada + data.facebook;
			casos.resto = casos.total - (casos.crm+casos.facebook);
			arregloDona = [{
					type : 'pie',
					name : 'Número de Casos',
					innerSize : '50%',
					data : [
					{
						index:0,
						name: 'Atendidos en CRM',
						color: '#0DBEC8',
						y: casos.crm					
					},
					{	
						index:1,
						name: 'Atendidos en Facebook',
						color: '#4A669F',
						y: casos.facebook
					},
					{
						index:2,
						name: 'No Atendidos',
						color: '#EBEEF3',
						y: casos.resto
					}
					],
				dataLabels: {
					enabled:false
				}					
				}];		
		}		
			$scope.chartDona = {
				loading : true,
				options : {

					chart : {
					events:{
						redraw:function(){
							$scope.chartDona.loading = false;
						}
					},						
					},
					title : {
						text : ' ',
						align : 'center',
						verticalAlign : 'middle',
						y : 40
					},
					tooltip : {
						enabled:true,
						//pointFormat : '{series.name}: {series.y} <b>({point.percentage:.1f}%)</b>'
					},
					plotOptions : {
						pie : {
							borderWidth: 1,
							 borderColor: 'silver',
							dataLabels : {
								enabled : true,
								distance : -50,
								style : {
									fontWeight : 'bold',
									color : 'white',
									textShadow : '0px 1px 2px black'
								}
							},
							startAngle : -90,
							endAngle : 90,
							//center : ['50%', '25%']
						}
					},
					exporting : {
						//width: 1000,
						chartOptions : {
							width : 2000,
							margin : [100, 100, 100, 100]
						},
						buttons : {
							contextButton : {
								//text: 'Exportar',
								menuItems : [{
									textKey : 'downloadPNG',
									text : 'Exportar a PNG',
									onclick : function() {
										var nombreCorto = 'total_de_casos';
										var nombreCompleto = 'Total de Casos';
										var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
										var fecha1 = new Date($scope.dt);
										var fecha2 = new Date($scope.dt2);
										var fechaFinal = fecha1.getDate() + "_" + (nombreMeses[fecha1.getMonth() + 1]) + "_" + fecha1.getFullYear() + '__' + fecha2.getDate() + "_" + (nombreMeses[fecha2.getMonth() + 1]) + "_" + fecha2.getFullYear();
										this.exportChart({
											filename : $scope.account + '_' + nombreCorto + '_' + fechaFinal
										}, {
											title : {
												//text:nombreCompleto
											}
										});
									}
								}]
							}
						}
					}
				},

				title : {
					text : $scope.porcentajeTotalCasos + '%',
					//text:' ',
					//y: 0,
					style : {
						fontWeight : 'bold',
						fontSize : '30px'
					}
				},
				
				subtitle:{
					text:'<div style="text-align:center; border:0px !important;"><span style="font-size:14px;color:black;">'+(casos.total - casos.resto)+' de '+casos.total+' Casos</span><br/>',
					floating: false,
					verticalAlign: 'bottom',
					y: -105,
            		style: {
               			color: '#FF00FF',
                		fontWeight: 'bold'
            		}
					
				},

				series : arregloDona,

			}
/*dona*/
	
		//$scope.loadingTotalCasos = false;
		$scope.loadingPromedioCasos = true;
		$scope.tipoPromedioCasos = 'pie';
/*ajusto nombres de elementos de las graficas*/
for(var o in obj){
	if(obj[o].name == 'En Proceso'){
		obj[o].name = 'Atendidos';
	}
	if(obj[o].name == 'Completos'){
		obj[o].name = 'Atendidos';
	}	
	if(obj[o].name == 'facebook'){
		obj[o].name = 'Atendidos en FB';
	}	
}
/*ajusto nombres de elementos de las graficas*/
		
		$scope.chartPromedioCasos = {
			loading:true,
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				height:300
				//spacingRight: 1000
        						
			},
			credits:{
				enabled:false
			},
			title: {
				//text:'Promedio de Casos'
				text: ' '
			},    
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
	      	options:{
	      		chart: {
					width:380,
					 spacingRight: 20,					 
					events:{
						redraw:function(){
							$scope.chartPromedioCasos.loading = false;
						}
					}						
				},
				legend:{
						enabled: true,
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20,
			            labelFormatter: function () {
            			    return this.name + ' ('+this.y+')';
            			}
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						  /*size:'100%',*/
						dataLabels: {
							enabled: true,
							formatter: function(){
				           		//return Math.round(this.percentage.toFixed(2))+'%';
								//if(this.percentage!=0)  return Math.round(this.percentage)  + '%';
								return this.percentage.toFixed(1) + '%';
							},
							//distance: -50,
							style: {
								fontWeight: 'bold',
								color: 'black',
								// textShadow: '0px 1px 2px black'
				            }
				        },
			            showInLegend: true
			        }   
			    }
				/*esto es la configuracion de exportado para las graficas*/
				,exporting: { 
					//width: 1000,
					buttons: { 
						contextButton: {
							//text: 'Exportar', 
							menuItems:[{
								textKey : 'downloadPNG',
								text: 'Exportar a PNG',
								onclick : function() {		
									var nombreCorto = 'promedio_de_casos';
									var nombreCompleto = 'Promedio de casos';
									var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
									var fecha1 = new Date($scope.dt); 
									var fecha2 = new Date($scope.dt2);
									var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();	 
									this.exportChart({
										filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
									},{
										title:{
											//text:nombreCompleto
										}
									});
								}
							}]
						}
					}
				}
				/*esto es la configuracion de exportado para las graficas*/ 
			},
        		xAxis: {
            		categories: {},
					 lineColor: 'transparent',
        		},   
        	yAxis: {
				title: {
                    text: ' ',
                	}
        		},			
		    series: [{
		        type: $scope.tipoPromedioCasos,
				name: 'Total',
				data: obj
			}]
		};
		
			$scope.cambiarGraficaPromedioCasos = function(){
				$scope.chartPromedioCasos.series[0].type = $scope.tipoPromedioCasos;
			}
					
		//$scope.loadingPromedioCasos = false;
	});


/*
                 _        _                _   _____                              _ _        _____                    
                | |      | |              | | |  __ \                            | (_)      / ____|                   
   ___ _ __   __| |   ___| |__   __ _ _ __| |_| |__) | __ ___  _ __ ___   ___  __| |_  ___ | |     __ _ ___  ___  ___ 
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __|  ___/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| |    / _` / __|/ _ \/ __|
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |   | | | (_) | | | | | |  __/ (_| | | (_) | |___| (_| \__ \ (_) \__ \
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_|   |_|  \___/|_| |_| |_|\___|\__,_|_|\___/ \_____\__,_|___/\___/|___/
                                                                                                                      
      _                _   _   _ _           _  _____                 _      _       
      | |              | | | \ | (_)         | |/ ____|               (_)    (_)      
   ___| |__   __ _ _ __| |_|  \| |___   _____| | (___   ___ _ ____   ___  ___ _  ___  
  / __| '_ \ / _` | '__| __| . ` | \ \ / / _ \ |\___ \ / _ \ '__\ \ / / |/ __| |/ _ \ 
 | (__| | | | (_| | |  | |_| |\  | |\ V /  __/ |____) |  __/ |   \ V /| | (__| | (_) |
  \___|_| |_|\__,_|_|   \__|_| \_|_| \_/ \___|_|_____/ \___|_|    \_/ |_|\___|_|\___/ 
                                                                                      
*/
	$http.post('/chartNivelServicio',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(datosNServicio){
		var obj = new Array();
		var menosHora = new Array();
		var unaOcho = new Array();
		var ochoVeinticuatro = new Array();
		var masVeinticuatro = new Array();
		for(var i in datosNServicio){
			menosHora.push(datosNServicio[i].menosHora);
			unaOcho.push(datosNServicio[i].unaOcho);
			ochoVeinticuatro.push(datosNServicio[i].ochoVeinticuatro);	    
			masVeinticuatro.push(datosNServicio[i].masVeinticuatro);	    
		}	    
		obj.push({
			name: 'Menos de 1 hr',
			y: datosNServicio.menosHora,
			color:'#8ed996'
		});
		obj.push({
			name: '1 - 8 hrs',
			y: datosNServicio.unaOcho,
			color:'#32b9d9'
		});
		obj.push({
			name: '8 - 24 hrs',
			y: datosNServicio.ochoVeinticuatro,
			color:'#f67c01'
		});
		obj.push({
			name: 'Más de 24 hrs',
			y: datosNServicio.masVeinticuatro,
			color:'#5F7082'
		});
		obj.sort(function (a, b){
			return (b.y - a.y);
		});
		
		$scope.tipoGraficaNivelServicio = 'pie';

		$scope.chartNivelServicio = {
			loading:true,
        	chart: {
            	plotBackgroundColor: null,
            	plotBorderWidth: null,
            	plotShadow: false
        	},
        	credits:{
            	enabled:false
        	},
        	title: {
            	//text:'Promedio de Casos'
            	text: ' '
        	},
        	tooltip: {
            	pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        	},
        	options:{
        		chart:{
        			events:{
        				redraw:function(){
        					$scope.chartNivelServicio.loading = false;
        				}
        			}
        		},
            	legend:{
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20
            	},
            	plotOptions: {
                	pie: {
                    	allowPointSelect: true,
                    	cursor: 'pointer',
                    	dataLabels: {
                        	enabled: true,
                        	formatter: function(){
                            	return Math.round(this.percentage.toFixed(2))+'%';
                            	//if(this.percentage!=0)  return Math.round(this.percentage)  + '%';
                        	},
                        	//distance: -50,
                        	style: {
                            	fontWeight: 'bold',
                            	color: 'black',
                            	// textShadow: '0px 1px 2px black'
                        	}
                    	},
                    	showInLegend: true
                	}
            	}
            	,exporting: {
					width: 1000,           		
               		buttons: {
						contextButton: {
							//text: 'Exportar',
							menuItems:[{
								textKey : 'downloadPNG',
								text: 'Exportar a PNG',
								onclick : function() {
									var nombreCorto = 'nivel_de_servicio';
									var nombreCompleto = 'Nivel de Servicio';
									var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
									var fecha1 = new Date($scope.dt);
									var fecha2 = new Date($scope.dt2);
									var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();
									this.exportChart({
										filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
                                    }, {
										title:{
 											//text:nombreCompleto
                                 	    }
									});
								}
							}]
						}
					}
				}
        	},
        		xAxis: {
            		categories: {},
					 lineColor: 'transparent',
        		},   
        	yAxis: {
				title: {
                    text: ' ',
                	}
        		},        	
        	series: [{
            	type: $scope.tipoGraficaNivelServicio,
            	name: 'Total',
            	data: obj
        	}]
    	};
    	
			$scope.cambiarGraficaNivelServicio= function(){
				$scope.chartNivelServicio.series[0].type = $scope.tipoGraficaNivelServicio;
			}    	
    	
    	var sumaNivelServicio = 0;
    	for(var o in obj){
    		if(typeof obj[o].y === 'undefined'){
    			sumaNivelServicio += 0;
    		}else{
    			sumaNivelServicio += parseInt(obj[o].y);
    		}
    	}
    	
    	if(sumaNivelServicio !== 0){
    		$scope.mostrarNivelServicio = true;
    	}else{
    		$scope.mostrarNivelServicio = false;
    	}
    	
	});
/*
                 _        _                _   _   _ _           _  _____                 _      _       
                | |      | |              | | | \ | (_)         | |/ ____|               (_)    (_)      
   ___ _ __   __| |   ___| |__   __ _ _ __| |_|  \| |___   _____| | (___   ___ _ ____   ___  ___ _  ___  
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| . ` | \ \ / / _ \ |\___ \ / _ \ '__\ \ / / |/ __| |/ _ \ 
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |\  | |\ V /  __/ |____) |  __/ |   \ V /| | (__| | (_) |
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_| \_|_| \_/ \___|_|_____/ \___|_|    \_/ |_|\___|_|\___/ 

       _                _   _____                           _            _           
      | |              | | |  __ \                         | |          | |          
   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
 | (__| | | | (_| | |  | |_| |__| |  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/
                                                                                     
*/
	$http.post('/chartDescartados',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data_graf_descartados){
		if(data_graf_descartados !== 'No hubo resultados'){
			console.log(data_graf_descartados);
			$scope.mostrarMotivoDescarte = true;
			var objDescartados = new Array();
			var coloresDescartados = {
				"respondidas":"#E3684D",
				"insulto":"#5FBED2",
				"no Relacionado":"#F7C479",
				"spam":"#8DD995",
				"troll":"#739FFF",
				"otro":"#FCA1BF",
				"irrelevante":"#f8c479",
				"mediático":"#7CB5EC",
				"campaña":"#5F7082"
		    };
			var op;
			for(var i in data_graf_descartados){
				switch(i){
					case 'respondidas':
						op = 'answered';
					break;
					case 'insulto':
						op = 'insult';
					break;
					case 'troll':
						op = 'troll'
					break;
					case 'otro':
						op = 'otro';
					break;
					case 'irrelevante':
						op = 'not-related';
					break;
					case 'mediático':
						op = 'mediatico';
					break;
					case 'campaña':
						op = 'campaign';
					break;
					case 'spam':
						op = 'spam';
					break;
				}
				if(i !== 'total'){
				objDescartados.push({name:i,y:data_graf_descartados[i],color:coloresDescartados[i],
				events : {
					click : function(e,i){
						//alert(e.point.name);
						
						//window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&descartado='+e.point.name+'&total='+e.point.y);
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&descartado='+e.point.op+'&total='+e.point.y+'&cuenta='+nombreSistema+'&opcion='+opcion);
						
						//document.location = 'google.com?first='+fecha_inicial+'&second='+fecha_final+'&descartado='+e.point.name+'&total='+e.point.y;
						console.log(e.point);
						console.log(e);	
					}
				},
				op:op
				});	
				}
			}
			
			objDescartados.sort(function (a, b){
				return (b.y - a.y);
			});
			

			
			$scope.chartDescartados = {
				loading:true,
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				credits: {
					enabled: false
				},
				title: {
					text: ' '
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				options:{
					chart: {
            			width: 380,
            			events:{
            				redraw:function(){
            					$scope.chartDescartados.loading = false;
            				}
            			}
        			}, 
					legend:{
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								formatter: function(){
									return Math.round(this.percentage.toFixed(2))+'%';
	                                //if(this.percentage!=0)  return Math.round(this.percentage)  + '%';
	                            },
								//distance: -50,
								style: {
									fontWeight: 'bold',
									color: 'black',
									// textShadow: '0px 1px 2px black'
					            }
							},
							showInLegend: true
				        }
				    }
					,exporting: { 
					width: 1000,					
						buttons: { 
							contextButton: {
								//text: 'Exportar', 
								menuItems:[{
									textKey : 'downloadPNG',
									text: 'Exportar a PNG',
									onclick : function() {		
										var nombreCorto = 'motivo_de_descarte';
										var nombreCompleto = 'Motivo de descarte';
										var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
										var fecha1 = new Date($scope.dt); 
										var fecha2 = new Date($scope.dt2);
										var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();
										this.exportChart({
											filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
										}, {
											title:{
												//text:nombreCompleto
											}
										});
									}
								},
								{
									//textKey : 'downloadPNG',
									text: 'Exportar CSV Descartados',
									onclick : function() {	
										$scope.descargaDescartados($scope.nombre_cuenta,$scope.dt,$scope.dt2, opcion);
									}
								}
								]
							}
						}
					} 
				},
				series: [{
					type: 'pie',
					name: 'Total',
					data: objDescartados
			    }]
			};
			

		}else{
			$scope.mostrarMotivoDescarte = false;
			console.log('No hay descartados');
		}
		//console.log('Termino descartados');
	});
/*
                 _        _                _   _____                           _            _           
                | |      | |              | | |  __ \                         | |          | |          
   ___ _ __   __| |   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |__| |  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/

       _                _   _____                                            _       
      | |              | | |  __ \                                          (_)      
   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___  
  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \ 
 | (__| | | | (_| | |  | |_| |__| |  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) |
  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/ 
                                                           | |                       
                                                           |_|                       
*/
	$http.post('/chartDesempenio',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data_desem){
		var existe_data = 0;
		if(data_desem !== 'No hubo resultados'){
			var obj_desem = new Array();
			var arr_names = new Array();
			var aux_descartado = new Array();
			var aux_atendidos = new Array();
			var aux_respuestas = new Array();
			var aux_clasificados = new Array();
			var images = {};
			var count = 0;
			var miniatura = '';
			for(var i in data_desem){
				if(data_desem[i].total!==0){
					count++;
					existe_data++;
					images['<span style="text-align:center";>'+data_desem[i].nombre+'<br><span style="font-weight:bold;">'+data_desem[i].total+' Casos</span></span>'] = (data_desem[i].imagen)?'<br><img src="'+data_desem[i].imagen+'" class="circular--ligero" style="width:30px; height:30px;border-radius:50%;">':'<br><img src="/modules/core/img/usuario-sem-imagem.png" class="circular-ligero" style="width:30px; height:30px;border-radius:50%;">';			
					miniatura = data_desem[i].imagen;
					if((miniatura == '') || (typeof miniatura == 'undefined')){
						miniatura = '/modules/core/img/usuario-sem-imagem.png';
					}								
					var totalPorcentaje = (data_desem[i].total / $scope.totalCasos)*100;
					totalPorcentaje = totalPorcentaje.toFixed(2);
					arr_names.push('<div class="datos-desempeno"><a title="'+data_desem[i].nombre+': '+totalPorcentaje +'% \nAtendidos: '+data_desem[i].atendidos+'\nDescartados: '+data_desem[i].descartado+'\nTotal: '+data_desem[i].total+'"><img src="'+miniatura+'" class="circular-ligero" style="width:30px; cursor:pointer; height:30px;border-radius:50%; max-width:100px;"></a></div>');	
					aux_atendidos.push(data_desem[i].atendidos);
					aux_descartado.push(data_desem[i].descartado);
				}
			}
			
			console.log('auxiliares !!!');
			console.log(aux_atendidos);
			console.log(aux_descartado);
			console.log(aux_respuestas);
			
			obj_desem.push({
				name: 'Descartados',
				data: aux_descartado,
				color:'#8ed996',
				events:{
				    click: function (e,i) {	
						console.log(e.point);
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&usuario='+e.point.op+'&tipo='+e.point.tipo+'&cuenta='+nombreSistema+'&opcion='+opcion);
						//window.open('https://alberto.likeable.mx/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&tema='+e.point.name+'&total='+e.point.y+'&cuenta='+nombreSistema);
					}
				}
			});
			obj_desem.push({
				name: 'Atendidos',
				data: aux_atendidos,
				//data: aux_respuestas,
				color:'#f67c01',
				events:{
				    click: function (e,i) {	
					//	alert(opcion);
						console.log(e.point);
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&usuario='+e.point.op+'&tipo='+e.point.tipo+'&cuenta='+nombreSistema+'&opcion='+opcion);
						//window.open('https://alberto.likeable.mx/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&tema='+e.point.name+'&total='+e.point.y+'&cuenta='+nombreSistema);
					}
				}
			});
	
	/*		obj_desem.push({
				name: 'Atendidos',
				//data: aux_atendidos,
				data: aux_respuestas,
				color:'#32b9d9',
				events:{
				    click: function (e,i) {	
						console.log(e.point);
						window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicial+'&second='+fecha_final+'&usuario='+e.point.op+'&tipo='+e.point.tipo+'&cuenta='+nombreSistema+'&opcion='+opcion);
					}
				}
			});*/
			//obj_desem.push({
				//	name: 'Clasificados',
				//	data: aux_clasificados,
				//	color:'#465769'
			//});
			if(existe_data === 0){
				//alert('No hay datos para estas fechas');
				$scope.mostrarDesempenoEquipo = false;
			}else{
				$scope.mostrarDesempenoEquipo = true;
			}
			
			$scope.obj_desem = obj_desem;
			var alto = (count * 50 < 400)?400:(count * 50);
			console.log('Alto !!!!!');
			console.log(alto);
			$scope.loadingDesempenio = false;
			$scope.chartDesempenio = {
				
    			loading: true,				
				options:{
					chart: {
					    type: 'bar',
					    height: alto,
					    renderTo:'container',
						events:{
							redraw:function(){
								$scope.chartDesempenio.loading = false;
							}
						}				    
					},
					title: {
						text: ' '
					},
					credits:{
						enabled:false
					},
					xAxis: {
						categories: arr_names,
						labels: {
							useHTML: true,
							//align:'left',
							textAlign:'left',
							//x:1,
							formatter: function(){
								//return '<div class="datos-desempeno"><div class="nombre-usuario-desempeno">'+this.value+'</div><div class="foto-desempeno">' +images[this.value] + '</div></div>';
								return this.value;                        
					        }
						} 
					},
					yAxis: {
						min: 0,
						allowDecimals: false,
						title: {
							text: ' '
					    } 
					},
					legend: {
						reversed: true
					},
					scrollbar: {
            			enabled:false,
					},		
					plotOptions: {
			
						series: {
							stacking: 'normal',
							//pointWidth: 50
                /*dataLabels: {
                    enabled: true,
                    color: '#FFFFFF'
                }*/							
						}
					}
					,exporting: { 
					width: 1000,						
						buttons: { 
							contextButton: {
								//text: 'Exportar', 
								menuItems:[{
									textKey : 'downloadPNG',
									text: 'Exportar a PNG',
									onclick : function() {		
										var nombreCorto = 'desempeño_del_equipo';
										var nombreCompleto = 'Desempeño del equipo';
										var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
										var fecha1 = new Date($scope.dt); 
										var fecha2 = new Date($scope.dt2);
										var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();	 
										this.exportChart({
											filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
										}, {
											title:{
												//text:nombreCompleto	
											}
										});
									}
								}]
							}
						}
					} 
				},
				series: obj_desem
			};
			//$scope.loadingDesempenio = false;
			//console.log('Termino desempeño Chart empezaremos con promedio respuesta');
		}else{
			$scope.mostrarDesempenoEquipo = false;
		}
	});
/*
                 _        _                _   _____                                            _       
                | |      | |              | | |  __ \                                          (_)      
   ___ _ __   __| |   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___  
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \ 
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |__| |  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) |
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/ 
                                                                              | |                       
                                                                              |_|                       
       _                _   _____                              _ _       _____                                 _        
      | |              | | |  __ \                            | (_)     |  __ \                               | |       
   ___| |__   __ _ _ __| |_| |__) | __ ___  _ __ ___   ___  __| |_  ___ | |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / __| '_ \ / _` | '__| __|  ___/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \|  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 | (__| | | | (_| | |  | |_| |   | | | (_) | | | | | |  __/ (_| | | (_) | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|_| |_|\__,_|_|   \__|_|   |_|  \___/|_| |_| |_|\___|\__,_|_|\___/|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                                        | |                             
                                                                                        |_|                             
*/
	$http.post('/chartPromedioRespuesta',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data_tiempo){
		if(data_tiempo !== 'No hubo resultados'){
			var obj_tiempo_respuesta = new Array();
			var contadorTiempoRespuesta = 0;
			for(var i in data_tiempo){
				obj_tiempo_respuesta.push({name:i,y:data_tiempo[i],color:$scope.esquemaColores[contadorTiempoRespuesta]});
				contadorTiempoRespuesta++;		    	
			}
			
			
			$scope.chartTiempoRespuesta = {
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false
				},
				title: {
					text:' '
				},
				credits:{
					enabled:false
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				options:{
					legend:{
						align: 'right',
						verticalAlign: 'middle',
						layout: 'vertical',
						itemMarginBottom: 20
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								formatter: function(){
									return Math.round(this.percentage.toFixed(2))+'%';
	                            },								
								style: {
									fontWeight: 'bold',
									color: 'black',
								}
							},
							showInLegend: true
						}
					}
					,exporting: { 
					width: 1000,						
						buttons: { 
							contextButton: {
							menuItems:[{
								textKey : 'downloadPNG',
								text: 'Exportar a PNG',
								onclick : function() {
									var nombreCorto = 'promedio_de_respuesta';
									var nombreCompleto = 'Promedio de respuesta';
									var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
									var fecha1 = new Date($scope.dt); 
									var fecha2 = new Date($scope.dt2);
									var fechaFinal = fecha1.getDate()+"_"+(nombreMeses[fecha1.getMonth()+1])+"_"+fecha1.getFullYear()+'__'+fecha2.getDate()+"_"+(nombreMeses[fecha2.getMonth()+1])+"_"+fecha2.getFullYear();
									this.exportChart({
										filename : $scope.account+'_'+nombreCorto+'_'+fechaFinal
									}, {
										title:{
											//text:nombreCompleto	
										}
									});
								}
							}]
						}
					}
				} 
				},
				series: [{
					type: 'pie',
					name: 'Total',
					data: obj_tiempo_respuesta
				}]
			};
			
			
			$scope.mostrarPromedioRespuesta = true;
			
		}else{
			
			$scope.mostrarPromedioRespuesta = false;
			console.log('No hubo resultados de tiempo promedio');
		}
	});
/*
                 _        _                _   _____                              _ _       _____                                 _        
                | |      | |              | | |  __ \                            | (_)     |  __ \                               | |       
   ___ _ __   __| |   ___| |__   __ _ _ __| |_| |__) | __ ___  _ __ ___   ___  __| |_  ___ | |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __|  ___/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \|  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |   | | | (_) | | | | | |  __/ (_| | | (_) | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_|   |_|  \___/|_| |_| |_|\___|\__,_|_|\___/|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                                                           | |                             
                                                                                                           |_|                             

       _                _   _____                              _ _    _______ _                            
      | |              | | |  __ \                            | (_)  |__   __(_)                           
   ___| |__   __ _ _ __| |_| |__) | __ ___  _ __ ___   ___  __| |_  ___ | |   _  ___ _ __ ___  _ __   ___  
  / __| '_ \ / _` | '__| __|  ___/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| |  | |/ _ \ '_ ` _ \| '_ \ / _ \ 
 | (__| | | | (_| | |  | |_| |   | | | (_) | | | | | |  __/ (_| | | (_) | |  | |  __/ | | | | | |_) | (_) |
  \___|_| |_|\__,_|_|   \__|_|   |_|  \___/|_| |_| |_|\___|\__,_|_|\___/|_|  |_|\___|_| |_| |_| .__/ \___/ 
                                                                                              | |          
                                                                                              |_|          
*/
	$http.post('/chartRating',{nombreSistema : nombreSistema, fecha_inicial : $scope.dt, fecha_final : $scope.dt2, tipo: opcion}).success(function(dataRating){
		console.log('LA RESPUESTA DE CHART RATING');
		console.log(dataRating);
		if(dataRating === 0){
			$scope.mostrarRating = false;
		}else{
			$scope.mostrarRating = true;
		}
		$scope.rating = dataRating;


	});


	$http.post('/chartPromedioTiempo',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data_promedio_tiempo){
		$scope.chartPromedioTiempo = data_promedio_tiempo;
	});

	
$http.post('/chartDesempenioHora',{nombreSistema : nombreSistema, fecha_inicial : $scope.dt, fecha_final : $scope.dt2, tipo: opcion}).success(function(desempenioHora){
		var totalAT = 0;
		var arregloAT = [];
		if(opcion === 'twitter'){
			totalAT = desempenioHora.totalAtendidos - desempenioHora.totalFacebook;
			arregloAT = [
				desempenioHora.atendidos.cero, desempenioHora.atendidos.una, 
				desempenioHora.atendidos.dos, desempenioHora.atendidos.tres, 
				desempenioHora.atendidos.cuatro, desempenioHora.atendidos.cinco, 
				desempenioHora.atendidos.seis, desempenioHora.atendidos.siete, 
				desempenioHora.atendidos.ocho, desempenioHora.atendidos.nueve, 
				desempenioHora.atendidos.diez, desempenioHora.atendidos.once, 
				desempenioHora.atendidos.doce, desempenioHora.atendidos.trece, 
				desempenioHora.atendidos.catorce, desempenioHora.atendidos.quince, 
				desempenioHora.atendidos.dieciseis, desempenioHora.atendidos.diecisiete, 
				desempenioHora.atendidos.dieciocho, desempenioHora.atendidos.diecinueve, 
				desempenioHora.atendidos.veinte, desempenioHora.atendidos.veintiuno, 
				desempenioHora.atendidos.veintidos, desempenioHora.atendidos.veintitres
			];
		}else{
			totalAT = desempenioHora.totalAtendidos;
			arregloAT = [		
				desempenioHora.atendidos.cero + desempenioHora.facebook.cero, desempenioHora.atendidos.una + + desempenioHora.facebook.una, 
				desempenioHora.atendidos.dos + desempenioHora.facebook.dos, desempenioHora.atendidos.tres + desempenioHora.facebook.tres, 
				desempenioHora.atendidos.cuatro + desempenioHora.facebook.cuatro, desempenioHora.atendidos.cinco + desempenioHora.facebook.cinco, 
				desempenioHora.atendidos.seis + desempenioHora.facebook.seis, desempenioHora.atendidos.siete + desempenioHora.facebook.siete, 
				desempenioHora.atendidos.ocho + desempenioHora.facebook.ocho, desempenioHora.atendidos.nueve + desempenioHora.facebook.nueve, 
				desempenioHora.atendidos.diez + desempenioHora.facebook.diez, desempenioHora.atendidos.once + desempenioHora.facebook.once, 
				desempenioHora.atendidos.doce + desempenioHora.facebook.doce, desempenioHora.atendidos.trece + desempenioHora.facebook.trece, 
				desempenioHora.atendidos.catorce + desempenioHora.facebook.catorce, desempenioHora.atendidos.quince + desempenioHora.facebook.quince, 
				desempenioHora.atendidos.dieciseis + desempenioHora.facebook.dieciseis, desempenioHora.atendidos.diecisiete + desempenioHora.facebook.diecisiete, 
				desempenioHora.atendidos.dieciocho + desempenioHora.facebook.dieciocho, desempenioHora.atendidos.diecinueve + desempenioHora.facebook.diecinueve, 
				desempenioHora.atendidos.veinte + desempenioHora.facebook.veinte, desempenioHora.atendidos.veintiuno + desempenioHora.facebook.veintiuno, 
				desempenioHora.atendidos.veintidos + desempenioHora.facebook.veintidos, desempenioHora.atendidos.veintitres + desempenioHora.facebook.veintitres
			];
		} 


		$scope.graficaDesempenioHora = {
			loading : true,
			options : {
				chart : {
					//zoomType: 'x'
					events : {
						redraw : function() {
							$scope.graficaDesempenioHora.loading = false;
						}
					}
				},
				exporting : {
					width : 1000,
					buttons : {
						contextButton : {
							menuItems : [{
								textKey : 'downloadPNG',
								text : 'Exportar a PNG',
								onclick : function() {
									var nombreCorto = 'crecimiento';
									var nombreCompleto = 'Crecimiento';
									var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
									var fecha1 = new Date($scope.dt);
									var fecha2 = new Date($scope.dt2);
									var fechaFinal = fecha1.getDate() + "_" + (nombreMeses[fecha1.getMonth() + 1]) + "_" + fecha1.getFullYear() + '__' + fecha2.getDate() + "_" + (nombreMeses[fecha2.getMonth() + 1]) + "_" + fecha2.getFullYear();
									this.exportChart({
										filename : $scope.account + '_' + nombreCorto + '_' + fechaFinal
									}, {
										title : {
											//text:nombreCompleto
										}
									});
								}
							}]
						}
					}
				}
			},
			credits : {
				enabled : false
			},
		    xAxis: {
		    	title : {
		    		text : 'Horas'
		    	},
		        categories: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']
		    },
	 		yAxis: {
	 			min : 0,
	 			allowDecimals : false,
	            title: {
	                text: 'Casos'
	            },
	            plotLines: [{
	                value: 0,
	                width: 1,
	                color: '#808080'
	            }]
	        },
			series : [
				{
					color : '#0DBEC8',
					name : 'Total de Casos ('+desempenioHora.totalTodos+')',
					data : [
						desempenioHora.todos.cero, desempenioHora.todos.una, 
						desempenioHora.todos.dos, desempenioHora.todos.tres, 
						desempenioHora.todos.cuatro, desempenioHora.todos.cinco, 
						desempenioHora.todos.seis, desempenioHora.todos.siete, 
						desempenioHora.todos.ocho, desempenioHora.todos.nueve, 
						desempenioHora.todos.diez, desempenioHora.todos.once, 
						desempenioHora.todos.doce, desempenioHora.todos.trece, 
						desempenioHora.todos.catorce, desempenioHora.todos.quince, 
						desempenioHora.todos.dieciseis, desempenioHora.todos.diecisiete, 
						desempenioHora.todos.dieciocho, desempenioHora.todos.diecinueve, 
						desempenioHora.todos.veinte, desempenioHora.todos.veintiuno, 
						desempenioHora.todos.veintidos, desempenioHora.todos.veintitres
					]				
				},{
					color:'#32d285',
					name : 'Atendidos ('+desempenioHora.totalAtendidos+')',
					y : 1500,
					data : arregloAT
				},{
					color:'#95A4C2',
					name : 'Descartados ('+desempenioHora.totalDescartados+')',
					data : [
						desempenioHora.descartados.cero, desempenioHora.descartados.una, 
						desempenioHora.descartados.dos, desempenioHora.descartados.tres, 
						desempenioHora.descartados.cuatro, desempenioHora.descartados.cinco, 
						desempenioHora.descartados.seis, desempenioHora.descartados.siete, 
						desempenioHora.descartados.ocho, desempenioHora.descartados.nueve, 
						desempenioHora.descartados.diez, desempenioHora.descartados.once, 
						desempenioHora.descartados.doce, desempenioHora.descartados.trece, 
						desempenioHora.descartados.catorce, desempenioHora.descartados.quince, 
						desempenioHora.descartados.dieciseis, desempenioHora.descartados.diecisiete, 
						desempenioHora.descartados.dieciocho, desempenioHora.descartados.diecinueve, 
						desempenioHora.descartados.veinte, desempenioHora.descartados.veintiuno, 
						desempenioHora.descartados.veintidos, desempenioHora.descartados.veintitres
					]
				},{
					color : '#E3684D',
					name : 'Sin Atender ('+desempenioHora.totalNuevos+')',
					data : [
						desempenioHora.nuevos.cero, desempenioHora.nuevos.una, 
						desempenioHora.nuevos.dos, desempenioHora.nuevos.tres, 
						desempenioHora.nuevos.cuatro, desempenioHora.nuevos.cinco, 
						desempenioHora.nuevos.seis, desempenioHora.nuevos.siete, 
						desempenioHora.nuevos.ocho, desempenioHora.nuevos.nueve, 
						desempenioHora.nuevos.diez, desempenioHora.nuevos.once, 
						desempenioHora.nuevos.doce, desempenioHora.nuevos.trece, 
						desempenioHora.nuevos.catorce, desempenioHora.nuevos.quince, 
						desempenioHora.nuevos.dieciseis, desempenioHora.nuevos.diecisiete, 
						desempenioHora.nuevos.dieciocho, desempenioHora.nuevos.diecinueve, 
						desempenioHora.nuevos.veinte, desempenioHora.nuevos.veintiuno, 
						desempenioHora.nuevos.veintidos, desempenioHora.nuevos.veintitres
					]				
				}
				/*,{
					color : '#465769',
					name : 'Facebook ('+desempenioHora.totalFacebook+')',
					data : [
						desempenioHora.facebook.cero, desempenioHora.facebook.una, 
						desempenioHora.facebook.dos, desempenioHora.facebook.tres, 
						desempenioHora.facebook.cuatro, desempenioHora.facebook.cinco, 
						desempenioHora.facebook.seis, desempenioHora.facebook.siete, 
						desempenioHora.facebook.ocho, desempenioHora.facebook.nueve, 
						desempenioHora.facebook.diez, desempenioHora.facebook.once, 
						desempenioHora.facebook.doce, desempenioHora.facebook.trece, 
						desempenioHora.facebook.catorce, desempenioHora.facebook.quince, 
						desempenioHora.facebook.dieciseis, desempenioHora.facebook.diecisiete, 
						desempenioHora.facebook.dieciocho, desempenioHora.facebook.diecinueve, 
						desempenioHora.facebook.veinte, desempenioHora.facebook.veintiuno, 
						desempenioHora.facebook.veintidos, desempenioHora.facebook.veintitres
					]				
				}*/
			],
			title : {
				text : ' '
			},
			//useHighStocks : true
		};
	});   	
};
        
/*grafica crecimiento*/
	$scope.graficaCrecimiento = {
		loading : true,
		options : {
			chart : {
				//zoomType: 'x'
				events : {
					redraw : function() {
						$scope.graficaCrecimiento.loading = false;
					}
				}
			},
			rangeSelector : {
				enabled : true,
				selected : 4,
				inputEnabled : false,
				buttonTheme : {
					visibility : 'hidden'
				},
				labelStyle : {
					visibility : 'hidden'
				}
			},
			navigator : {
				enabled : false
			},
			exporting : {
				width : 1000,
				buttons : {
					contextButton : {
						menuItems : [{
							textKey : 'downloadPNG',
							text : 'Exportar a PNG',
							onclick : function() {
								var nombreCorto = 'crecimiento';
								var nombreCompleto = 'Crecimiento';
								var nombreMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
								var fecha1 = new Date($scope.dt);
								var fecha2 = new Date($scope.dt2);
								var fechaFinal = fecha1.getDate() + "_" + (nombreMeses[fecha1.getMonth() + 1]) + "_" + fecha1.getFullYear() + '__' + fecha2.getDate() + "_" + (nombreMeses[fecha2.getMonth() + 1]) + "_" + fecha2.getFullYear();
								this.exportChart({
									filename : $scope.account + '_' + nombreCorto + '_' + fechaFinal
								}, {
									title : {
										//text:nombreCompleto
									}
								});
							}
						}]
					}
				}
			},
		},

		series : [],
		title : {
			text : ' '
		},
		useHighStocks : true
	}


    
    /*estas series son para alimentar la gráfica de crecimiento*/
    $scope.graficaCrecimiento.series.push({
        id: 1,
        name:'Facebook',
        color: '#45619D',
        data: [
            [1147651200000, 23.15],
            [1147737600000, 23.01],
            [1147824000000, 22.73],
            [1147910400000, 22.83],
            [1147996800000, 22.56],
            [1148256000000, 22.88],
            [1148342400000, 22.79],
            [1148428800000, 23.50],
            [1148515200000, 23.74],
            [1148601600000, 23.72],
            [1148947200000, 23.15],
            [1149033600000, 22.65]
        ]
    },{
        id: 2,
        name:'Twitter',
        color:'#88C9F9',
        data: [
            [1147651200000, 25.15],
            [1147737600000, 25.01],
            [1147824000000, 25.73],
            [1147910400000, 25.83],
            [1147996800000, 25.56],
            [1148256000000, 25.88],
            [1148342400000, 25.79],
            [1148428800000, 25.50],
            [1148515200000, 26.74],
            [1148601600000, 26.72],
            [1148947200000, 26.15],
            [1149033600000, 26.65]
        ]

    }



    );
    
/*estas series son para alimentar la gráfica de crecimiento*/
    
/*grafica crecimiento*/      


/*Grafica desempenio Hora*/

/*grafica crecimiento*/




	$scope.getDashboard = function(){
	    //alert('ENTRO A getDashboard');
	    setInterval(function(){
	    	$http.post('/getDashboard', {}).success(function(respuesta){
			 	//console.log(respuesta);
			 	$scope.total_clientes = respuesta.length;
			 	$scope.dashboards = respuesta;	
		     }).error(function(err){
			 	console.log('Error !!!');
			 	console.log(err);
		    });
	    },1000);
	    $http.post('/getDashboard', {}).success(function(respuesta){
		 	$scope.total_clientes = respuesta.length;
		 	$scope.dashboards = respuesta;
			var elemento = angular.element(document.querySelector('#isotope-container'));
			var elemento2 = angular.element(document.querySelector('#isotope-container2'));
			angular.element(document).ready(function () {
				$(elemento).isotope({  itemSelector: '.elemento-cuenta', layoutMode: 'fitRows',});	
				$(elemento2).isotope({  itemSelector: '.elemento-cuenta2', layoutMode: 'fitRows',});	
			});
		}).error(function(err){
		 	console.log('Error !!!');
		 	console.log(err);
	    });
	};

	$scope.descargaArchivo = function(nombreSistema, opcion){
		//window.open($scope.archivo);
		if(nombreSistema === undefined){
			nombreSistema = Authentication.user.cuenta.marca;
		}
		if(opcion === undefined){
			opcion = 'general';
		}
		var obj = {
			nombreSistema : nombreSistema,
			fecha_inicial : $scope.dt,
			fecha_final : $scope.dt2
		};
	    	/*$http.post('/generaCsv',obj)*/
		$http({method: 'POST',url: '/generaCsv',data: obj,timeout :90000}).then(function(items){
			console.log('Llamando a the !!!!');
			console.log(items);
			var items = items.data;
			var data = new Array();
			data.push(['Fecha de Entrada','Fecha de Respuesta','Tiempo de Respuesta','Status','Razón de Descartado','Nombre de Usuario','Fuente','Clase','Mensaje','Tema','Subtema','Sentimiento','Respuesta']);
			for(var i in items){
				data.push([items[i].fecha_llegada,items[i].fecha_respuesta,items[i].tiempo_respuesta,items[i].status,items[i].razon_desacartado,items[i].nombre_post,items[i].obj,items[i].tipo,items[i].mensaje,items[i].tema,items[i].subtema,items[i].sentiment,items[i].respuesta]);
			}
			var dataString;
			var csvContent = "";
			data.forEach(function(infoArray, index){
				dataString = infoArray.join(",");
				csvContent += index < data.length ? dataString+ "\n" : dataString;
			}); 
			//var encodedUri = encodeURI(csvContent);
			//window.open(encodedUri);
			//console.log(data);
			var csvData;
			var encodedUri = encodeURI(csvContent);
			csvData = new Blob([csvContent], { type: 'text/csv' })
			var csvUrl = URL.createObjectURL(csvData);
			var link = document.createElement("a");
			//link.setAttribute("href", encodedUri);
			link.setAttribute("href", csvUrl);
			var fecha_string_inicial = new Date($scope.dt).toDateString().replace(/ /g,'');
			var fecha_string_final = new Date($scope.dt2).toDateString().replace(/ /g,'');
			link.setAttribute("download", obj.nombreSistema+'_'+fecha_string_inicial+'_to_'+fecha_string_final+'.csv');
			link.click();
	  	});
	};
	$scope.descargaDescartados = function(nombreSistema,fecha_inicial,fecha_final, tipo){
		//window.open($scope.archivo);
		if(nombreSistema === undefined){
			nombreSistema = Authentication.user.cuenta.marca;
		}
	     $http.post('/getDescartados', {'nombreSistema':nombreSistema, 'fecha_inicial' : fecha_inicial, 'fecha_final' : fecha_final, 'tipo' : tipo}).success(function(descartados){
		 	if(descartados !== 'error'){
				var data = [];
				var mensaje = '';
				data.push(['Mensaje', 'Fecha Entrada', 'Fecha Descarte', 'Usuario', 'Red', 'Tipo', 'Motivo Descarte', 'Descartó']);
				for(var i in descartados){
					if(descartados[i].mensaje){
						mensaje = descartados[i].mensaje.replace(/,/g,'-');
						data.push([mensaje, descartados[i].fechaEntrada, descartados[i].fechaDescarte , descartados[i].usuario, descartados[i].red, descartados[i].tipo, descartados[i].motivoDescarte, descartados[i].usuarioDescarte]);
					}
				}
				var dataString;
				var csvContent = "";
				data.forEach(function(infoArray, index){
					dataString = infoArray.join(",");
					csvContent += index < data.length ? dataString+ "\n" : dataString;
				}); 
				var csvData;
				var encodedUri = encodeURI(csvContent);
				csvData = new Blob([csvContent], { type: 'text/csv' });
				var csvUrl = URL.createObjectURL(csvData);
				var link = document.createElement("a");
				//link.setAttribute("href", encodedUri);
				link.setAttribute("href", csvUrl);
				var fecha_string_inicial = new Date($scope.dt).toDateString().replace(/ /g,'');
				var fecha_string_final = new Date($scope.dt2).toDateString().replace(/ /g,'');
				link.setAttribute("download", nombreSistema+'_descartados_'+fecha_string_inicial+'_to_'+fecha_string_final+'.csv');
				link.click();
			}
		 	//$scope.inbox = resp.data;			
	     }).error(function(err){
		 	console.log('Error !!!');
		 	console.log(err);
	     });

	};

	$scope.descargaTemas = function(nombreSistema,temas,totalTemas){
		//window.open($scope.archivo);
		if(nombreSistema === undefined){
			nombreSistema = Authentication.user.cuenta.marca;
		}
		var data = [];
		data.push(['Tema','Porcentaje','Total']);
		for(var i in temas){
			data.push([temas[i].name,((temas[i].y/totalTemas) *100).toFixed(2)+'%',temas[i].y]);
		}
		var dataString;
		var csvContent = "";
		data.forEach(function(infoArray, index){
			dataString = infoArray.join(",");
			csvContent += index < data.length ? dataString+ "\n" : dataString;
		}); 
		var csvData;
		var encodedUri = encodeURI(csvContent);
		csvData = new Blob([csvContent], { type: 'text/csv' });
		var csvUrl = URL.createObjectURL(csvData);
		var link = document.createElement("a");
		//link.setAttribute("href", encodedUri);
		link.setAttribute("href", csvUrl);
		var fecha_string_inicial = new Date($scope.dt).toDateString().replace(/ /g,'');
		var fecha_string_final = new Date($scope.dt2).toDateString().replace(/ /g,'');
		link.setAttribute("download", nombreSistema+'_temas_'+fecha_string_inicial+'_to_'+fecha_string_final+'.csv');
		link.click();
	};

	$scope.descargaSubtemas = function(nombreSistema,subtemas,totalSubtemas){
		//window.open($scope.archivo);
		if(nombreSistema === undefined){
			nombreSistema = Authentication.user.cuenta.marca;
		}
		console.log('Los subtemas');
		console.log(subtemas);
		var data = [];
		data.push(['Subtema','Porcentaje','Total']);
		for(var i in subtemas){
			data.push([subtemas[i].name,((subtemas[i].y/totalSubtemas)*100).toFixed(2)+'%',subtemas[i].y]);
		}
		var dataString;
		var csvContent = "";
		data.forEach(function(infoArray, index){
			dataString = infoArray.join(",");
			csvContent += index < data.length ? dataString+ "\n" : dataString;
		}); 
		var csvData;
		var encodedUri = encodeURI(csvContent);
		csvData = new Blob([csvContent], { type: 'text/csv' });
		var csvUrl = URL.createObjectURL(csvData);
		var link = document.createElement("a");
		//link.setAttribute("href", encodedUri);
		link.setAttribute("href", csvUrl);
		var fecha_string_inicial = new Date($scope.dt).toDateString().replace(/ /g,'');
		var fecha_string_final = new Date($scope.dt2).toDateString().replace(/ /g,'');
		link.setAttribute("download", nombreSistema+'_subtemas_'+fecha_string_inicial+'_to_'+fecha_string_final+'.csv');
		link.click();
	};

	$scope.today = function() {

		var hoy = new Date().getDate();
		
		//console.log(hoy.getDate() + '/' + month[hoy.getMonth()]+ '/' +  hoy.getFullYear());
		//console.log(hoy);
		var timestamp = new Date().setDate(hoy - 15);
		var start_date = new Date(timestamp); start_date.setHours(0); start_date.setMinutes(0); start_date.setSeconds(0);
		$scope.dt = start_date;

		$scope.dt2 = new Date();
	};

	$scope.today();    
	
	$scope.clear = function () {
		$scope.dt = null;
	};
	    
	    
	$scope.toggleMin = function() {
		//$scope.minDate = $scope.minDate ? null : new Date();
		$scope.minDate = -10;
	};
	
	$scope.toggleMin();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
		//cierra el otro selector
		$scope.opened2 = false;
	};

	$scope.open2 = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened2 = true;
		//cierra el otro selector
		$scope.opened = false;
	};

	$scope.dateOptions = {
		/*formatYear: 'yyyy',
		formatMonth:'MMMM',
		formatDay:'dd',
		datepickerPopup:'dd / MMMM / yyyy',*/
		startingDay: 1,
		showWeeks:false
	};

	$scope.formats = ['dd / MMMM / yyyy'];
	$scope.format = $scope.formats[0];
	$scope.maxDate=Date.now();


	 //Scope que sirve para obtener las publicaciones de la cuenta seleccionada de fb
	 $scope.obtienePublicacionesFacebook = function(nombreSistema){
	 	 $scope.nombre_cuenta = '';
	 	 $scope.nombre_cuentaFB = nombreSistema;
	 	 $scope.nombre_cuentaTW = '';
	 	 $scope.nombre_cuentaTW_uno = '';
	     //console.log('Ha entrado  obtienePublicacionesFacebook');
	     //console.log(nombreSistema);
	     $scope.creaArchivo(nombreSistema,'facebook');
	     $http.post('/get5PublicacionesFB', {'nombreSistema':nombreSistema}).success(function(resp){
		 //console.log('Obteniendo PUBLICACIONES');
		 //console.log(resp);
		 $scope.publicacionesCuenta=resp;	
		 //$scope.inbox = resp.data;			
	     }).error(function(err){
		 console.log('Error !!!');
		 console.log(err);
	     });
	 };
	 
	 //Scope que sirve para obtener las publicaciones de la cuenta seleccionada de fb
	 $scope.obtienePublicacionesTwitter = function(nombreSistema,opcionTW){
	 	if(opcionTW===0){
	 		$scope.nombre_cuentaTW = nombreSistema;
	 		$scope.nombre_cuentaTW_uno = ''; 
	 	}
	 	else if(opcionTW===1){
	 		$scope.nombre_cuentaTW = '';
	 		$scope.nombre_cuentaTW_uno = nombreSistema;
	 	}
	     //console.log('Ha entrado  obtienePublicacionesTwitter');
	     //console.log(nombreSistema);
	     $scope.nombre_cuenta = '';
	     $scope.nombre_cuentaFB = '';
	     $scope.creaArchivo(nombreSistema,'twitter');
	     $http.post('/get5PublicacionesTW', {'nombreSistema':nombreSistema}).success(function(resp){
		 //console.log('Obteniendo PUBLICACIONES');
		 //console.log(resp);
		 $scope.publicacionesCuenta=resp;	
		 //$scope.inbox = resp.data;			
	     }).error(function(err){
		 console.log('Error !!!');
		 console.log(err);
	     });
	 };	
	 
	 $scope.mostrarPublications = false;
	 //$scope.mostrarMetricas = false;
	 $scope.mostrarMetrics = true;
	 $scope.activoPublications = 'active';
	 $scope.activoMetricas = '';
	
	 $scope.mostrarSeccion = function(mostrar){
	     if(mostrar === 'metricas'){
		 $scope.mostrarPublications = false;
		 $scope.mostrarMetrics = true;
		 $scope.activoPublications = '';
		 $scope.activoMetricas = 'active';
		 //alert('metricas');			
	     }
	     if(mostrar === 'publicaciones'){
		 $scope.mostrarPublications = true;
		 $scope.mostrarMetrics = false;
		 $scope.activoPublications = 'active';
		 $scope.activoMetricas = '';
		 //alert('publicaciones');			
	     }
	};
	
	$scope.imagen_error = '/modules/core/img/usuario-sem-imagem.png';
	 
	$scope.authentication = Authentication;

	$scope.pag = 2;
	
	$scope.pageData='';
    
    $scope.getSingleTweet = function(tweet){
    	//console.log(tweet);
    	this.open();
   	};

	$scope.user = Authentication;
	
	$scope.clickTitulo = function(account){
		console.log('Account');
		console.log(account);
		
		$scope.mostrarDesempenoEquipo = true;
		$scope.mostrarTotalCasos = true;
		$scope.mostrarPromedioCasos = true;
		
		if(typeof $scope.chartDesempenio.loading !== 'undefined'){
		$scope.chartDesempenio.loading = true;
		}
		/*if(typeof $scope.chartTotalCasos.loading !== 'undefined'){
			$scope.chartTotalCasos.loading = true;
		}*/
		if(typeof $scope.chartDona.loading !== 'undefined'){
			$scope.chartDona.loading = true;
		}
		if(typeof $scope.chartPromedioCasos.loading !== 'undefined'){
			$scope.chartPromedioCasos.loading = true;
		}
		if(typeof $scope.chartTemas.loading !== 'undefined'){
			$scope.chartTemas.loading = true;
		}
		if(typeof $scope.chartSubTemas.loading !== 'undefined'){
			$scope.chartSubTemas.loading = true;
		}
		if(typeof $scope.config.loading !== 'undefined'){
			$scope.config.loading = true;
		}
		if(typeof $scope.chartNivelServicio.loading !== 'undefined'){
			$scope.chartNivelServicio.loading = true;
		}
		/*if(typeof $scope.chartDescartados.loading !== 'undefined'){
			$scope.chartDescartados.loading = true;
		}*/
		
    	$scope.imagen_cuenta = account.imagen_src;
    	$scope.nombre_cuenta = account.nombreSistema;
    	$scope.nombre_cuentaFB = '';
    	$scope.nombre_cuentaTW = '';
    	$scope.nombre_cuentaTW_uno = '';
    	$scope.twitter_cuenta = account.datosTwitter.twitter_screenname_principal;
    	$scope.creaArchivo(account.nombreSistema);
    	$scope.mostrarNubeTerminos = false;
    	$scope.id_facebook_cuenta = account.datosPage.id;
    	$scope.graficaTags('create',account.nombreSistema,$scope.dt,$scope.dt2);
    	$scope.account = account.nombreSistema;     
    	//$scope.id_twitter_cuenta = account.datosTwitter.twitter_id_principal;
    };
   	     
	 $scope.create = function() {
	     $scope.conectaPostPagina();
	     //Proceso que sirve para realizar la conexión de la página seleccionada a administrar con facebook
	     var infoPagina=$scope.pageSelect;
	     if(infoPagina.id){
		 var urlPost='https://graph.facebook.com'+$scope.constant.fbapiversion+infoPagina.id+'/subscribed_apps?access_token='+infoPagina.access_token;
	      	 var acceso = infoPagina.access_token;
	       	 $http.post(urlPost)
	       	     .success(function(response) {
	    		 console.log(response);	
	  	     });
  	     }
       	     //Finaliza conexión de página a administrar con facebook

	     
	    var account = new Accounts ({
		 	marca: this.marca,
		 	nombreSistema: this.nombreSistema,
		 	correo: this.correo,
		 	//google_api_key: this.google_api_key,
		 	twitter_consumer_key: this.twitter_consumer_key,
		 	twitter_consumer_secret: this.twitter_consumer_secret,
			twitter_access_token:this.twitter_access_token,
			twitter_access_token_secret: this.twitter_access_token_secret,
			twitter_screenname_principal: this.twitter_screenname_principal,
			twitter_id_principal: this.twitter_id_principal,
			twitter_screenname_respuesta: this.twitter_screenname_respuesta,
			twitter_id_respuesta: this.twitter_id_respuesta,
			terminos: this.terminos,
			datosPage: $scope.pageSelect
	    });
	    account.$save(function(response) {
			$location.path('accounts/' + response._id);
			// Clear form fields
			$scope.name = '';
	    }, function(errorResponse) {
		 	$scope.error = errorResponse.data.message;
	    });
	};
	 
	 // Función que sirve para eliminar una cuenta o empresa
	 $scope.remove = function( account ) {
	     if ( account ) { account.$remove();
			      
			      for (var i in $scope.accounts ) {
				  if ($scope.accounts [i] === account ) {
				      $scope.accounts.splice(i, 1);
				  }
			      }
			    } else {
				$scope.account.$remove(function() {
				    $location.path('accounts');
				});
			    }
	 };


	 $scope.getInbox = function(){
	     var id = Authentication.user.cuenta._id;
	     //console.log(id);
	     //console.log('Llamando a getInbox');
	     $http.post('/getInbox', {data:id}).success(function(resp){
		 //console.log('Obteniendo inbox');
		 //console.log(resp.data);	
		 $scope.inbox = resp.data;			
	     }).error(function(err){
		 console.log('Error !!!');
		 console.log(err);
	     });
	 };
	 
	 $scope.removefromlist = function(accountid) {
	     
	     $scope.account = Accounts.get({ 
		 accountId: accountid
	     });
	     var account=$scope.account;
	     var accountURL = 'accounts/'+accountid;
	     
	     if ( account ) { 
		 account.$remove();
		 for (var i in $scope.accounts ) {
		     if ($scope.accounts [i] === account ) {
			 $scope.accounts.splice(i, 1);
		     }
		 }
	     } else {
		 $scope.account.$remove(function() {
		     $location.path('accounts');
		 });
	     }	
	 };
	 
	 // Funcion que recibe los datos de las paginas mediante el accessToken proporcionado
	 $scope.conectarPagina = function(accessToken) {
	     var url='https://graph.facebook.com/me/accounts?access_token='+accessToken;
	     $http.get(url)
        	 .success(function(informacion){
        	     var fbData = [];
        	     fbData.push(informacion.data);
        	     $scope.datos = fbData[0];
        	    // console.log($scope.datos);
		 });
	 };
	 
		//Función que recibe los datos de la pagina a administrar seleccionada asignandola a una variable
		//Realiza la validación de si esta o no conectada.
		
		//Función que sirve para desconectar la cuenta seleccionada

		// Función que sirve para la actualización
	 $scope.update = function() {
	     //console.log('UPDETEANDOOOOOOOO');
	     var account = new Accounts ($scope.account);
	     //console.log(account);
	     var tienePaginaConectada=account.hasOwnProperty('datosPage');
	     //console.log('Tiene pagina: '+tienePaginaConectada);
	     //console.log(account);
	     //console.log('El scope de page');
	     //console.log($scope.pageSelect);
	     if(typeof $scope.pageSelect !=='undefined'){
		 //console.log('no Esta indefinido');
		 $scope.conectaPostPagina();
		 account.datosPage=$scope.pageSelect;
	     }else{
		 //console.log('Esta indefinido');
		 var revisaPaginas=account.datosPage.hasOwnProperty('id');
		 if(revisaPaginas===true){
		     account.datosPage.id='-1';
		 }
		 //$scope.account.datosPage={};
	     }
	     //console.log(account);
	     account.$update(function() {
		 //console.log('UPDETEADO');
		 $location.path('accounts/' + account._id);
	     }, function(errorResponse) {
		 $scope.error = errorResponse.data.message;
	     });
	 };
	 // Get Twits
	 $scope.getTw = function(){
	     var id = $scope.authentication.user.cuenta._id;
	     //var id_infonavit = '5452ae9a305bdf95a7e11348';
	     //console.log($scope.authentication.user.cuenta);
	     //console.log('Id: '+id+' id_infonavit: '+id_infonavit);
	     var service_tw = $resource('/cuentas/get/:cuentaId', {cuentaId: '@id'});
	     var tw = service_tw.get({cuentaId: id},function(data){
		 //$scope.twits = {};
		 $scope.twits = data;
	     });
	 };
	 
	 //Funciones para mostrar los temas en la pagina temasSubtemas.html
	 //Scope inicial de los subtemas, se encuentra vacia debido a que no se ha seleccionado ningun tema aun.
	 $scope.subtemasPagina=[];

	 //Scopes que ayudaran a saber cual es el tema y subtema actual seleccionado
	 $scope.temaEscogido='';
	 $scope.subtemaEscogido='';
	 $scope.resTemas='';
	 $scope.resSubtemas='';
	 $scope.MuestraTemas='';
	 
	 //Scope que llama los temas actuales de la cuenta que se tiene seleccionada
	 $scope.getTemas=function(){
	     $http.post('/getTemasPantalla/:cuenta', {cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
		 $scope.temasActuales=data; 
	     });
	 };
	 
	 //Scope que obtiene los subtemas dependiendo el tema seleccinado
	 $scope.obtenerSubtemas=function(temaAhora){
	     $scope.obtieneResTemas(temaAhora);
	     //se asigna el tema escogido a un scope y auna variable para poder usarla
  	     $scope.temaEscogido=temaAhora;
  	     var temaSeleccionado=temaAhora;
	     for(var i in $scope.temasActuales){
  		 if($scope.temasActuales[i].tema === temaSeleccionado){
  		     //var tema_selected = $scope.temasActuales[i];
  		     var subtemasPagina = [];
  		     for(var j in $scope.temasActuales[i].subtemas){
  			 subtemasPagina[j] = {'nombre':$scope.temasActuales[i].subtemas[j].subtema};
  		     }
  		     $scope.subtemasPagina = subtemasPagina;
  		    //console.log($scope.subtemasPagina);
  		 }
		 
  	     }
	 };
	 
	 //Funcion que sirve para obtener las respuestas que se han asignado a los temas
	 $scope.obtieneResTemas=function(tema){
	     $http.post('/getResTemas/', {temaActual:tema,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
		 $scope.resTemas=data;
		 $scope.MuestraTemas=data;
		 $scope.subtemaEscogido='';
	     });
	 };
	 $scope.abreRespuesta = function (tweet) {
  	     $scope.tweet = [tweet];
	     var modalInstance = $modal.open({
		 templateUrl: 'myModalContent.html',
		 controller: 'AccountsController',
		 size: 150
	     });
	 };

	 $scope.addRespuesta=function(){
	    console.log($scope.temaEscogido);
	    console.log($scope.subtemaEscogido);
	 };
	 
	 //Funcion que sirve para obtener las repuestas que se han asignado a los subtemas
	 $scope.obtieneResSubtemas=function(otraVariable){
	    $scope.subtemaEscogido='';
	    $scope.subtemaEscogido=otraVariable;
	    $http.post('/getResSubtemas', {temaActual:$scope.temaEscogido,subtemaActual:otraVariable,cuenta:$scope.authentication.user.cuenta.marca}).success(function(data){
			//console.log(data);
			if(data.length===0){
				$scope.MuestraTemas=$scope.resTemas;
			}
		 	else{
		     	$scope.MuestraTemas=data;
		 	}
	    });
	 };
	 //Finaliza temas y subtemas
	 $scope.getFb = function(){
	    var id = $scope.authentication.user.cuenta._id;
	    //console.log('Entro a FB');
	    var service = $resource('/getFb/:idCuenta',{idCuenta: '@id'});
	    var fb = service.get({idCuenta:id},function(data){
			$scope.posts = data;
			//console.log(data);
	    });
	 };

	 // Find a list of Accounts
	 $scope.find = function(cuenta) {
	    //console.log('METODO FIND LLAMADo');
	    //var cuentas = Accounts.query();
	    //$scope.creaArchivo(Authentication.user.cuenta.marca);
	    //$scope.graficaTags('create',Authentication.user.cuenta.marca);
	    $scope.accounts = Accounts.query();
	    //console.log('LAS CUENTAS');
	    //console.log($scope.accounts);
	    $scope.accounts.$promise.then(function(data){
		//console.log('Cuenta');
    	//console.log($scope.accounts[0]);
	   	var arr = [];
	    var obj = {};
	    	for(var i in $scope.accounts){
	    	    arr[i] = $scope.accounts[i];
	    	    if(arr[i].datosTwitter === ''){
	    			arr[i].twitter = '-1';
	    	    }else{
	    	    	if(arr[i].datosTwitter){
	    		 		if(arr[i].datosTwitter.twitter_screenname_respuesta){
	    		     		arr[i].twitter_respuesta = '-1';
	    		 		}
	    			}
	    	     }
	    	    if(arr[i].datosPage === ''){
	    			arr[i].facebook = '-1';
	    	    }
	    	}
			var byName = arr.slice(0);
			byName.sort(function(a,b) {
    			var x = a.nombreSistema.toLowerCase();
    			var y = b.nombreSistema.toLowerCase();
    			return x < y ? -1 : x > y ? 1 : 0;
			});
			$scope.accounts=byName;
			if(cuenta){
				$scope.imagen_cuenta = cuenta.imagen_src;
	    		$scope.nombre_cuenta = cuenta.nombreSistema;
    	    	//$scope.twitter_cuenta = cuenta.datosTwitter.twitter_screenname_principal;
    	    	$scope.creaArchivo(cuenta.nombreSistema);
    	    	$scope.account = cuenta.nombreSistema;
    	    	$scope.graficaTags('create',cuenta.nombreSistema,$scope.dt,$scope.dt2);
	    		//console.log('EL ARREGLO DE LAS CUENTAS');
	    		//console.log(arr);
	    		//arr.sort();
    			if(cuenta.datosTwitter){
	    	    	$scope.twitter_cuenta = cuenta.datosTwitter.twitter_screenname_principal;
    		 	}				
			}else{
				$scope.imagen_cuenta = $scope.accounts[0].imagen_src;
	    		$scope.nombre_cuenta = $scope.accounts[0].nombreSistema;
    	    	$scope.twitter_cuenta = $scope.accounts[0].datosTwitter.twitter_screenname_principal;
    	    	$scope.creaArchivo($scope.accounts[0].nombreSistema);
    	    	$scope.account = $scope.accounts[0].nombreSistema;
    	    	$scope.graficaTags('create',$scope.accounts[0].nombreSistema,$scope.dt,$scope.dt2);
	    		//console.log('EL ARREGLO DE LAS CUENTAS');
	    		//console.log(arr);
	    		//arr.sort();
    		 	if($scope.accounts[0].datosTwitter){
	    	    	$scope.twitter_cuenta = $scope.accounts[0].datosTwitter.twitter_screenname_principal;
    		 	}
    		}
	    });
	};

	 // Find existing Account
	 $scope.findOne = function() {
	     $scope.account = Accounts.get({ 
		 accountId: $stateParams.accountId
	     });
	 };
	 
	 $scope.$on('actualizaAccounts', function(event, message){
	     //console.log('Entro a actualiza accounts');
	     //console.log(message);
	     $scope.find();
	     /*if(message==='1'){
	      $scope.find();
	      }*/		
	 });

	$scope.$on('creaCuenta', function(event, message){
	    $scope.find(message[0]);	
	 });

	$scope.$on('creoCuentaFacebook', function(event, message){
	     //console.log('Entro a actualiza accounts');
	     //console.log(message);
	     $scope.find(message);
	     //$scope.nombre_cuenta=message;
	     //alert($scope.nombre_cuenta);
	     /*if(message==='1'){
	      $scope.find();
	      }*/		
	 });
	 
	 $scope.item = [];
	 $scope.counter = 0;
	 $scope.prueba = function(){
	     var i = 1;
	     while (i < 50) {
	         $scope.item.push(++$scope.counter);
	         i++;
	     }
	 };
    	 $scope.prueba();
    	 
	$scope.graficaTags = function(action, nombreSistema,fecha1,fecha2){
		var palabras = [];
		var fecha_inicio = fecha1;
		var fecha_fin = fecha2;
		var nombreColeccion = nombreSistema+'_consolidada';
		var NumeroMaximoElementosMostrar = 10;

		if(typeof nombreColeccion  !== 'undefined'){
			var cadenaSolicitud = '/getStringTagCloud?cuenta=' + nombreColeccion+'&fecha1='+fecha_inicio+'&fecha2='+fecha_fin+'&id_facebook='+$scope.id_facebook_cuenta;
		/*console.log('****************************');
		console.log('cadena solicitud tags');
		console.log(cadenaSolicitud);
		console.log('****************************');*/			
			$http.get(cadenaSolicitud).success(function(data) {
				var datosRemotos = data;			
				var elemento = angular.element(document.querySelector('#tagcloud'));	
				var arrayTemp = [];
				var keywords = datosRemotos[0].terminos.splice(0,NumeroMaximoElementosMostrar);
				var hashtags = datosRemotos[1].hashtags.splice(0,NumeroMaximoElementosMostrar);	
				var mentions = datosRemotos[2].menciones.splice(0,NumeroMaximoElementosMostrar);
				palabras = hashtags.concat(mentions,keywords);
				var list = new Array();
				/*for(var i in palabras){
					
					var aux = palabras[i].text;
					console.log(palabras[i]);
					/*palabras[i].handlers = {
						click:function() {
							console.log(aux);
							return function() {
								window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+aux+'&cuenta='+nombreSistema+'&opcion=general');
							}
						}()
					};
					palabras[i].link = $scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+palabras[i].text+'&cuenta='+nombreSistema+'&opcion=general';
					palabras[i].link = encodeURI(palabras[i].link);				
				}*/
				if(action == 'create'){
					//console.log('create');
					$scope.palabras = hashtags.concat(mentions,keywords);
					/*for(var i in $scope.palabras){
						console.log($scope.palabras[i]);
						/*palabras[i].handlers = {
						click: function() {
							window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+$scope.palabras[i].text+'&cuenta='+nombreSistema+'&opcion=general');
						}
					};
						palabras[i].link = $scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+$scope.palabras[i].text+'&cuenta='+nombreSistema+'&opcion=general';
						palabras[i].link = encodeURI(palabras[i].link);
					}*/
					$(elemento).jQCloud($scope.palabras, { autoResize: true,  height: 350,  shape: 'circle'});
					$scope.mostrarNubeTerminos = true;
					$(elemento).jQCloud('update',$scope.palabras);	
				}
				if(action == 'update'){
					//console.log('update');
					palabras =hashtags.concat(mentions,keywords);
					/*for(var i in palabras){
						console.log(palabras[i]);
						/*palabras[i].handlers = {
							click: function() {
								window.open($scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+palabras[i].text+'&cuenta='+nombreSistema+'&opcion=general');
								}
							};
						palabras[i].link = $scope.constant.host+'/#!/filtroAccount?first='+fecha_inicio+'&second='+fecha_fin+'&palabra='+palabras[i].text+'&cuenta='+nombreSistema+'&opcion=general';
						palabras[i].link = encodeURI(palabras[i].link);
					}*/
					//$(elemento).html(''); 		
					$(elemento).html('').jQCloud('update',$scope.palabras);
								
				}					
				
				if($scope.palabras.length > 0){
					//console.log($scope.palabras.length);
					$scope.mostrarNubeTerminos = true;	
				}else{
					$(elemento).html('');
					$scope.mostrarNubeTerminos = false;	
				}
			}).error(function(){
				var elemento = angular.element(document.querySelector('#tagcloud'));
				console.log('error nube de terminos');

				$(elemento).html('');
				$scope.mostrarNubeTerminos = false;	
			});
		}else{
			console.log('no hay cuenta');
			
		}
	}//graficaTags 

}]).controller('ModalAccountCtrl', ["$scope", "$modal", "$location", "$log", "$resource", "Authentication", function ($scope, $modal,$location, $log,$resource,Authentication) {
	
	$scope.open = function (id) {
	    var modalInstance = $modal.open({
		templateUrl: 'createAccountContent.html',
		controller: 'ModalAccountInstanceCtrl',
		size: 200,
		resolve: {
		    id_cuenta: function () {
			return id;
		    }
		}
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
		$scope.$emit('creaCuenta', selectedItem);
		$scope.selected = selectedItem;
	    }, function () {
		$log.info('Modal dismissed at: ' + new Date());
	    });
	    
	    $scope.openOrigin = function(tweet){
    		
	    };
	};
	
   	$scope.eliminaMonitoreo = function(id){
	    var modalInstance = $modal.open({
	    	templateUrl: 'desconectaMonitoreo.html',
	      	controller: 'ModalAccountInstanceCtrl',
	      	size: 150,
      	  	resolve: {
        	    id_cuenta: function () {
          		return id;
        	    }
      	  	}
    	    });
    	    modalInstance.result.then(function (selectedItem) {
      		$scope.$emit('actualizaAccounts', 'Hola');
      		$scope.selected = selectedItem;
    	    }, function () {
      		$log.info('Modal dismissed at: ' + new Date());
    	    });	
  	};	

  	   	$scope.eliminaCuentaGeneral = function(id){
	    var modalInstance = $modal.open({
	    	templateUrl: 'eliminaCuenta.html',
	      	controller: 'ModalAccountInstanceCtrl',
	      	size: 150,
      	  	resolve: {
        	    id_cuenta: function () {
          		return id;
        	    }
      	  	}
    	    });
    	    modalInstance.result.then(function (selectedItem) {
      		$scope.$emit('actualizaAccounts', 'Hola');
      		$scope.selected = selectedItem;
    	    }, function () {
      		$log.info('Modal dismissed at: ' + new Date());
    	    });	
  	};	
	
	$scope.conectaFacebook = function(id){
  	    if(Authentication.user.additionalProvidersData){
		var modalInstance = $modal.open({
		    templateUrl: 'conectaFacebook.html',
		    controller: 'ModalAccountInstanceCtrl',
		    size: 150,
		    resolve: {
			id_cuenta: function () {
			    return id;
			}
		    }
		});
		
		modalInstance.result.then(function (respuesta) {
	    	if(respuesta){
				$scope.$emit('creoCuentaFacebook', respuesta);
			}
		}, function () {
	    	    $log.info('Modal dismissed at: ' + new Date());
		});
		
		$scope.openOrigin = function(tweet){
	    	    
		};
	    }else{
		var acepta = confirm('No tienes sesion activa en Facebook deseas iniciar sesion?');
		if(acepta){
		    document.location=$scope.constant.host+'/auth/facebook';
		}
	    }  		
	};
	
  	$scope.desconectaCuentaFacebook = function(id){
	    var modalInstance = $modal.open({
		templateUrl: 'desconectaCuentaContent.html',
		controller: 'ModalAccountInstanceCtrl',
		size: 150,
		resolve: {
	            id_cuenta: function () {
	        	id.desconecta = 'Facebook';
			return id;
	        }
	      }
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
		$scope.$emit('actualizaAccounts', 'Hola');
		$scope.selected = selectedItem;
	    }, function () {
		$log.info('Modal dismissed at: ' + new Date());
	    });
	    
	    $scope.openOrigin = function(tweet){
    		
	    };  	
	};		

	$scope.desconectaCuentaTwitter = function(id){
	    var modalInstance = $modal.open({
		templateUrl: 'desconectaCuentaContent.html',
		controller: 'ModalAccountInstanceCtrl',
		size: 150,
		resolve: {
	            id_cuenta: function () {
	        	id.desconecta = 'Twitter';
			return id;
	            }
		}
	    });

	    modalInstance.result.then(function (selectedItem) {
    		$scope.$emit('actualizaAccounts', 'Hola');
		$scope.selected = selectedItem;
	    }, function () {
		$log.info('Modal dismissed at: ' + new Date());
	    });
	    $scope.openOrigin = function(tweet){
	    };  	
	};	

	$scope.conectaTwitter = function(id){
	    var modalInstance = $modal.open({
		templateUrl: 'conectTwitterContent.html',
		controller: 'ModalAccountInstanceCtrl',
		size: 150,
		resolve: {
		    id_cuenta: function () {
        		id.desconecta = 'Twitter';
			return id;
		    }
		}
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
		$scope.$emit('actualizaAccounts', 'Hola');
		$scope.selected = selectedItem;
	    }, function () {
		$log.info('Modal dismissed at: ' + new Date());
	    });

	    $scope.openOrigin = function(tweet){
    		
	    };  	
	};

	$scope.addTrackers = function(informacionCuenta){
	    var modalInstance = $modal.open({
			templateUrl: 'trackers.html',
			controller: 'ModalAccountInstanceCtrl',
			size: 150,
			resolve: {
		    	id_cuenta: function () {
					return informacionCuenta;
		    	}
			}
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
			$scope.$emit('actualizaAccounts', 'Hola');
			$scope.selected = selectedItem;
	    }, function () {
			$log.info('Modal dismissed at: ' + new Date());
	    });	
	};

	$scope.deleteTrackers = function(informacionCuenta){
	    var modalInstance = $modal.open({
			templateUrl: 'deleteTrackers.html',
			controller: 'ModalAccountInstanceCtrl',
			size: 150,
			resolve: {
		    	id_cuenta: function () {
					return informacionCuenta;
		    	}
			}
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
			$scope.$emit('actualizaAccounts', 'Hola');
			$scope.selected = selectedItem;
	    }, function () {
			$log.info('Modal dismissed at: ' + new Date());
	    });  	
	};

	$scope.eliminaListeningTwitter = function(id){	
  	    var modalInstance = $modal.open({
		templateUrl: 'eliminaRespTwitterContent.html',
		controller: 'ModalAccountInstanceCtrl',
		size: 150,
		resolve: {
		    id_cuenta: function () {
			return id;
		    }
		}
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
	    }, function () {
			$log.info('Modal dismissed at: ' + new Date());
	    });
	    
	    $scope.openOrigin = function(tweet){
    		
	    }; 
	};
}])
    .controller('ModalAccountInstanceCtrl',["$scope", "$modalInstance", "id_cuenta", "$resource", "$http", "Accounts", "Authentication", function ($scope, $modalInstance, id_cuenta,$resource,$http,Accounts,Authentication) {
	$scope.paginaActual=id_cuenta;
  	$scope.authentication = Authentication;
  	if (id_cuenta) {
	    if(id_cuenta.datosTwitter && id_cuenta.datosTwitter.twitter_access_token !== '-1'){
	  	$scope.twitter_consumer_secret = id_cuenta.datosTwitter.twitter_consumer_secret;
		$scope.twitter_consumer_key = id_cuenta.datosTwitter.twitter_consumer_key;
		$scope.twitter_access_token = id_cuenta.datosTwitter.twitter_access_token;
		$scope.twitter_access_token_secret = id_cuenta.datosTwitter.twitter_access_token_secret;
		$scope.twitter_screenname_principal = id_cuenta.datosTwitter.twitter_screenname_principal;
		$scope.twitter_screenname_respuesta = id_cuenta.datosTwitter.twitter_screenname_respuesta;
		$scope.twitter_id_respuesta = id_cuenta.datosTwitter.twitter_id_respuesta;
		$scope.twitter_id_principal = id_cuenta.datosTwitter.twitter_id_principal;
	    }
	}
	//modal twitter
	$scope.muestraForm = true;
	$scope.muestraAyuda = false;
	if(id_cuenta){
	    if(id_cuenta.datosPage){
	  	$scope.selected_page = id_cuenta.datosPage.id;
	    }else{
	  	$scope.selected_page = false;
	    }
	}
	if(Authentication.user.additionalProvidersData){
	    var url='https://graph.facebook.com/me/accounts?access_token='+Authentication.user.additionalProvidersData.facebook.accessToken;
	    $http.get(url)
	        .success(function(informacion){
	            var fbData = [];
	            fbData.push(informacion.data);
	            $scope.paginas = fbData;
		});
	}

	 $scope.borraCuentaGeneral = function(){
	 	if($scope.paginaActual){
			$http.post('/eliminaCuenta',{nombreSistema:$scope.paginaActual.nombreSistema}).success(function(respuestaCuenta){
				var respuesta= respuestaCuenta.replace(/"/gi, "");
				if(respuesta === 'ok'){
					$scope.desvinculaCuenta($scope.paginaActual);
					$modalInstance.close();
				}
				//alert(respuestaCuenta);
			});
	 	}
	 	else{
	 		alert('Error en cuenta');
	 	}
	 };

	$scope.desvinculaMonitoreo=function(){
  	    $http.post('/eliminaMonitoreo',{_id:id_cuenta._id}).success(function(data){
  			$modalInstance.close(data);
  	    });		
	};	
        
	$scope.eliminaListeningTwitter = function(item){
  	    $http.post('/eliminaListening',item).success(function(data){
  			$modalInstance.close(item);
  	    });
	};
  $scope.selectPage = function(data){
      $scope.carga_pagina_facebook = data;
      $scope.selected_page = data.id;
  };
	
  	$scope.showHelp = function(){
  	    $scope.muestraForm = false;	
  	    $scope.muestraAyuda = true;	
  	};
	
  	$scope.showFormulario = function(){
  	    $scope.muestraForm = true;	
  	    $scope.muestraAyuda = false;	
  	};
  	$scope.desvinculaCuenta = function(item){
  	    if(item.desconecta === 'Facebook'){
			var idCuenta=item._id;
			var idPage=item.datosPage.id;
			var tokenPage=item.datosPage.access_token;
	  		$http.post('/deleteFBAccount', {idPage:idPage,tokenPage:tokenPage,idCuenta:idCuenta}).success(function(data){
	  	    	$modalInstance.close();
	  		}).error(function(error_cuenta_face){
	  			console.log('Error !!!!');
	  			console.log(error_cuenta_face);
	  		});
  	    }else{
  			$http.post('/desconectaTwitter',item).success(function(data){
  		     	$modalInstance.close();   
  			}).error(function(error_cuenta_face){
	  			console.log('Error !!!!');
	  			console.log(error_cuenta_face);
	  		});
  	    }
  	    //$modalInstance.close();
  	};

  	$scope.conectaPaginaFacebook = function(){
  	    if($scope.monitoreo){
  			$http.post('/agregaMonitoreo',{_id:id_cuenta._id,monitoreo:$scope.monitoreo,nombreCuenta:id_cuenta.nombreSistema,usuario:$scope.authentication.user.additionalProvidersData}).success(function(data){
  		    	if(data===1){
  					$scope.mensajeMonitoreo='No se ha encontrado la cuenta en facebook';
  		    	}else if(data===2){
  					$modalInstance.close(data);
  		    	}
  			});
  	    }else{
  			if(id_cuenta.datosPage){
  		    	$scope.desconectaCuenta(); 
  			}else{
  		    	var idCuentaSelect=$scope.carga_pagina_facebook.id;
  		    	var accessTokenSelect=$scope.carga_pagina_facebook.access_token;
  		    	$http.post('/connectFBAccount',{idCuenta:idCuentaSelect,accessToken:accessTokenSelect,datosPage:$scope.carga_pagina_facebook,_id:id_cuenta._id}).success(function(data){
  					//console.log('EL valor de retorno de la conexion de la pagina');
	  				//console.log(data);
	  				var respuestaFinal= data.replace(/"/gi, "");
	  				if(respuestaFinal === 'ok'){
	  					$modalInstance.close($scope.paginaActual);
	  				}	
  		    	}).error(function(err){
  					console.log('Error en Conectar Pagina');
  					console.log(err);
  		    	});
  			}
  	    }
  	};
	
  	$scope.guardaPaginaselecccion=function(informacionPagina){
  	    console.log('Guardando pagina Facebook');
	    var appDefault='689164264519175';
	    var conectado=0;
	    var information = informacionPagina;
	    var url='http://graph.facebook.com'+$scope.constant.fbapiversion+information.id+'/subscribed_apps?access_token='+information.access_token;
	    $http.get(url).success(function(respuesta){
	    	if(respuesta.data){
	       	    for(var i=0;i<respuesta.data.length;i++){
	       			if(respuesta.data[i].id===appDefault){
	       		    	conectado++;
	       			}
	       	    }
	       	}
	       	if(conectado>0){
	       		console.log('La cuenta esta conectada');
	       	}
	       	else{
		    	console.log('La cuenta no esta conectada');
	       	}
	    }).error(function(err){
	    	console.log('EL ERROR');
	        console.log(err);
	    });
	    $scope.pageSelect=information;//JSON.parse(inf[0]);
	};
	
	$scope.conectaPostPagina=function(){
	    //Proceso que sirve para realizar la conexión de la página seleccionada a administrar con facebook
        var infoPagina=$scope.pageSelect;
	    if(typeof infoPagina !== 'undefined'){
			var urlPost='https://graph.facebook.com'+$scope.constant.fbapiversion+infoPagina.id+'/subscribed_apps?access_token='+infoPagina.access_token;
			var acceso = infoPagina.access_token;
			$http.post(urlPost).success(function(response) {
                //Devuelve un true si se realizo o un error si no
		    	console.log(response);
			});
	    }
	    else{
			console.log('No administra ninguna pagina');
	    }
	};
	
	$scope.desconectaCuenta = function(){
  	    var idCuentaSelect=$scope.carga_pagina_facebook.id;
  	    var accessTokenSelect=$scope.carga_pagina_facebook.access_token;		
	    //console.log('Eliminacion de la cuenta actual');
	    var idCuenta=id_cuenta._id;
	    //console.log(idCuenta);
	    var idPage=id_cuenta.datosPage.id;
	    var tokenPage=id_cuenta.datosPage.access_token;
  	    $http.post('/deleteFBAccount', {idPage:idPage,tokenPage:tokenPage,idCuenta:idCuenta}).success(function(data){
  	    	//console.log('La respuesta');
  	    	//console.log(data);
  	    	if(data==='1'){
  	    		//console.log('YA SE HA ELIMINADO');
  		    	var idCuentaSelect=$scope.carga_pagina_facebook.id;
  		    	var accessTokenSelect=$scope.carga_pagina_facebook.access_token;
		    	$http.post('/connectFBAccount',{idCuenta:idCuentaSelect,accessToken:accessTokenSelect,datosPage:$scope.carga_pagina_facebook,_id:id_cuenta._id}).success(function(data){
  			    	//console.log('YA SE HA RECONOCECTADO LA CUENTA');
	  		    	//console.log(data);
  			    	$modalInstance.close(data);
  				}).error(function(err){
  			    	console.log('error !!!');
  			    	console.log(err);
  				});    		
  	    	}
  	    });
	};
	
	$scope.ok = function (req) {
	    $modalInstance.close($scope.selected.item);
	};
	$scope.submitTwitter = function(){
  	    //console.log(id_cuenta);
  	    var account = new Accounts ({
  			id: id_cuenta._id,
			twitter_consumer_key: $scope.twitter_consumer_key,
			twitter_consumer_secret: $scope.twitter_consumer_secret,
			twitter_access_token:$scope.twitter_access_token,
			twitter_access_token_secret: $scope.twitter_access_token_secret,
			twitter_screenname_principal: $scope.twitter_screenname_principal,//username
			twitter_screenname_respuesta: $scope.twitter_screenname_respuesta //second username
	    });
	    
  	    $http.post('/getDataTwitter',account).success(function(response) {
	  		console.log(response);
	  		switch(response){
	  			case 1:
	  	    		$scope.response_twitter_submit='Sorry, We don´t found the listening account';
	  	    	break;
	  			case 0:
	  	    		$scope.response_twitter_submit='Sorry, We don´t found the responding account';
	  	    	break;
	  			case 2:
	  	    		$scope.response_twitter_submit='Sorry, Invalid or expired token';
	  	    	break;
	  			default:
	  	    		$modalInstance.close(id_cuenta);
	  	    	break;
	  		}
	    });
	};

	$scope.saveTrackers = function(){
		var trackerSinEspacios = $scope.listadoTrackers.replace(/ /g,'');
		var nombreTrackers = $scope.trackerName;
		var separaTrackers = trackerSinEspacios.split(',');
		var arregloTrackers = [];
		for(var i = 0; i< separaTrackers.length;i++){
			arregloTrackers.push(separaTrackers[i]);
		}
  	    var trackers = {
  	    	'nombreTrackers' : nombreTrackers,
  	    	'trackers' : arregloTrackers
  	    };
  		$http.post('/insertTrackers',{'infoCuenta' : $scope.paginaActual, 'nombreTrackers' : nombreTrackers, 'objetoTrackers' : trackers}).success(function(response) {
	  		if(response === 1){
	  			$modalInstance.close($scope.paginaActual._id);
	  		}else{
	  	    	$scope.responseTrackers = 'Hubo un error al agregar los trackers, intente de nuevo';
	  		}
	    });
	};

	$scope.eliminaTrackers = function(){
  		$http.post('/eliminaTrackers',{'infoCuenta' : $scope.paginaActual}).success(function(response) {
  			if(response === 'ok'){
	  			$modalInstance.close($scope.paginaActual._id);
	  		}else{
	  	    	$scope.responseTrackers = 'Hubo un error al eliminar los trackers, intente de nuevo';
	  		}
	    });
	};

	$scope.fileChanged = function(element){
  	    //console.log(element);
  	    $scope.files = element.files;
  	    //console.log(element.files);
  	    $scope.apply();
	};
	$scope.submit = function(req,res){
  	    var fd = new FormData();
  	    //var f = document.getElementById('file').files[0];
  	    //console.log(f);
  	    
  	    if(typeof $scope.file_imagen === 'undefined'){
  	    	//si no trae imagen regresamos un error
  	    $scope.errorNuevaCuenta = 'Es Obligatorio Subir un Logo'; 
  	    	
  	    }else{
  	    	//si se agrego la imagen entonces se procesa
 
  	    var f = $scope.file_imagen;
  	    fd.append('file',f);
  	    fd.append('nombre', $scope.nombre);
  	    fd.append('nombre_corto',$scope.nombre_corto);
	    
  	    $http.post('/dataAccount',fd,{transformRequest:angular.identity,headers:{'Content-Type':undefined}}).success(function(response) {
			var respuesta=response.replace(/"/gi, "");
			if(respuesta === 'ok'){
				$http.post('/informacionCuenta',{nombreSistema:$scope.nombre_corto}).success(function(infoCuenta){
  			    	//console.log('YA SE HA RECONOCECTADO LA CUENTA');
	  		    	//console.log(data);
  			    	$modalInstance.close(infoCuenta);
  				}).error(function(err){
  			    	console.log('error !!!');
  			    	console.log(err);
  				}); 
				//$modalInstance.close($scope.nombre_corto);
			}
			//console.log('LA RESPUESTA DE LA CREACION DE LA CUENTA');
	  	    //console.log(response);  
		}); 
  	    	
  	    }
  	    

		
	};
	$scope.evaluaActivo = function(id){
  	    if(id === $scope.selected_page){
	  		return true;
	    }else{
	  		return false;
	    }
	};

	//Método que sirve para cargar y mostrar la imagen al agregar una nueva cuenta
	$scope.cambiaImagen = function(){
		var f = document.getElementById('file').files[0];

  	    $scope.file_imagen = f;
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
			var muestraImagen = "<div class='perfil-circular' style='width:120px; height:120px;background-image: url("+img.src+");' align='center'></div>";
			$(fileDisplayArea).append(muestraImagen);
	    };
  	    r.readAsDataURL(f); 
	    //r.readAsArrayBuffer(f);
	};
	
	$scope.cancel = function () {
	    console.log($scope.archivo);
	    $modalInstance.dismiss('cancel');
	};
}])
	.directive('scroll', ["$window", function ($window) {
		return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
        		var rawElement = elem[0];
        		//console.log(rawElement);
				// var rawElement = angular.element($window); // new
				rawElement	.bind('scroll', function () {
            	    //console.log(this.pageYOffset);
            	    console.log(rawElement.scrollTop);
                    if((rawElement.scrollTop + rawElement.offsetHeight+5) >= rawElement.scrollHeight){ //new
                		//console.log('entro');
						scope.$apply('prueba()');
                    }
				});
            }
		};
    }])
.directive('datepickerPopup', ["dateFilter", "datepickerPopupConfig", function (dateFilter, datepickerPopupConfig) {
    return {
        restrict: 'A',
        priority: 1,
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
            var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
            ngModel.$formatters.push(function (value) {
                return dateFilter(value, dateFormat);
            });
        }
    };
}])
    
    
  

.controller('MapController',['$scope', '$http','$stateParams','$location', 'Authentication', function($scope, $http, $stateParams, $location, Authentication) {
/*
		var estados = [
		{'nombreEstado':'Baja California','cantidad':100},
		{'nombreEstado':'Baja California Sur','cantidad':100},
		{'nombreEstado':'Sonora','cantidad':200},
		{'nombreEstado':'Colima','cantidad':100},
		{'nombreEstado':'Nayarit','cantidad':100},
		{'nombreEstado':'Campeche','cantidad':100},
		{'nombreEstado':'Quintana Roo','cantidad':100},
		{'nombreEstado':'Mexico','cantidad':1},
		{'nombreEstado':'Tabasco','cantidad':2}
		];
		
		$scope.dataEstados = [];
		
for (var ce in estados) {
	//estados[ce]
$scope.dataEstados.push(
	{
		allAreas:false,
		name:estados[ce].nombreEstado,
		countries:estados[ce].nombreEstado,
		data:[{
			name:estados[ce].nombreEstado,
			value:estados[ce].cantidad
			}],
		dataLabels:{
			enabled:true,
			color:"black",
			align:'center',
			padding:10,
			formatter:function(){
				return '<span class="txt-centro" style="text-align:center;">'+this.point.name+'<br/>'+estados[ce].cantidad+'</span>';
			}
			},
		tooltip:{
			enabled:true,
			headerFormat:"",
			align:'center',
			useHTML:true,
			verticalAlign:'middle',
			//formatter:function(){return '<h1>test</h1>';}
			pointFormat:"<span style=\"text-align:center;\">{point.name}:<br/><b>"+estados[ce].cantidad+" Casos</b></span>"
			}
			}
		);
}

        this.config = {
            options: {
                legend: {
                    enabled: true,
                    align: 'right',
            		verticalAlign: 'top',
            		layout: 'vertical',
            		labelFormatter: function () {
                		return this.name + ' ';
            		}            		
                },
                plotOptions: {
                    map: {
                    	mapData: Highcharts.maps['countries/mx/mx-all'],
                    	area:{animation:true},
                        //mapData: Highcharts.maps['custom/world'],
                        joinBy: ['name']
                    }
                },
            },
            chartType: 'map',
            title: {
                text: ' '
            },
            series: $scope.dataEstados
        };

        this.config.series[0].allAreas = true;

*/

/*
                   __ _                 _                           _           _            _        
                  / _(_)               | |                         (_)         (_)          | |       
   __ _ _ __ __ _| |_ _  ___ __ _    __| | ___    ___ _ __ ___  ___ _ _ __ ___  _  ___ _ __ | |_ ___  
  / _` | '__/ _` |  _| |/ __/ _` |  / _` |/ _ \  / __| '__/ _ \/ __| | '_ ` _ \| |/ _ \ '_ \| __/ _ \ 
 | (_| | | | (_| | | | | (_| (_| | | (_| |  __/ | (__| | |  __/ (__| | | | | | | |  __/ | | | || (_) |
  \__, |_|  \__,_|_| |_|\___\__,_|  \__,_|\___|  \___|_|  \___|\___|_|_| |_| |_|_|\___|_| |_|\__\___/ 
   __/ |                                                                                              
  |___/                                                                                               
//COnstrucción de grafica de crecimiento
						$scope.chartCrecimiento = {
						title: {
            text: '',
            x: -20 //center
        },

        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Gráfica de Crecimiento'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Followers',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'Retweets',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, 
        {
            name: 'Favorites',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'Likes',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }, {
            name: 'Comments',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        },
         {
            name: 'Shares',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }
        ]
	};
*/

    }]);

'use strict';

//Accounts service used to communicate Accounts REST endpoints
angular.module('accounts').factory('Accounts', ['$resource',
	function($resource) {
		return $resource('accounts/:accountId', { accountId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
	}
]);
'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('charts').config(['$stateProvider',
	function($stateProvider) {
		// Charts state routing
		$stateProvider.
		state('listCharts', {
			url: '/charts',
			templateUrl: 'modules/charts/views/list-charts.client.view.html'
		}).
		state('createChart', {
			url: '/charts/create',
			templateUrl: 'modules/charts/views/create-chart.client.view.html'
		}).
		state('viewChart', {
			url: '/charts/:chartId',
			templateUrl: 'modules/charts/views/view-chart.client.view.html'
		}).
		state('editChart', {
			url: '/charts/:chartId/edit',
			templateUrl: 'modules/charts/views/edit-chart.client.view.html'
		});
	}
]);
'use strict';

// Charts controller

angular.module('charts')

.controller('ChartsController', ['$scope', '$http','$stateParams','$location', 'Authentication', 'Charts',
	function($scope, $http, $stateParams, $location, Authentication, Charts ) {

		$scope.authentication = Authentication;
		

		
	

$scope.graficaTags = function(action){
	
	
	
	
	var nombreColeccion = $scope.authentication.user.cuenta.marca+'_consolidada';
	//var nombreColeccion = 'exafm_consolidada';
	var NumeroMaximoElementosMostrar = 10;
	console.log(nombreColeccion);
	
	
	var datosRemotos;


			$http.get('/getStringTagCloud?cuenta=' + nombreColeccion).success(function(data) {
				//callback(data);
				//console.log(data[0]);
				var datosRemotos = data;
				//console.log('datos remotos');
				console.log(datosRemotos);
				
	var elemento = angular.element(document.querySelector('#tagcloud'));	
	var arrayTemp = [];
	if(action == 'create'){
	$scope.check_hashtag = true;
	$scope.check_mentions = true;
	$scope.check_keywords = true;		
	}

	
	if($scope.check_hashtag){
	
	
	$scope.hashtags = datosRemotos[1].hashtags.splice(0,NumeroMaximoElementosMostrar);	
	}else{
	$scope.hashtags = [];	
	}
	
	if($scope.check_mentions){
	
	$scope.mentions = datosRemotos[2].menciones.splice(0,NumeroMaximoElementosMostrar);	
	}else{
	$scope.mentions = [];	
	}
	
	if($scope.check_keywords){
	//arrayTemp = datosRemotos[0].terminos.splice(0,20);
	$scope.keywords = datosRemotos[0].terminos.splice(0,NumeroMaximoElementosMostrar);	
	}else{
	$scope.keywords = [];	
	}
	
	$scope.palabras = [];
	
	if(action == 'create'){
	console.log('create');
	
	$scope.palabras = $scope.hashtags.concat($scope.mentions,$scope.keywords);
	
	
	$(elemento).jQCloud($scope.palabras, {  width: 500,  height: 350, shape:true}); 		
	}
	
	if(action == 'update'){
	console.log('update');
	
	$scope.palabras = $scope.hashtags.concat($scope.mentions,$scope.keywords);
	
	$(elemento).html(''); 		
	$(elemento).jQCloud($scope.palabras, {width: 500,height: 350,shape:true}); 			
	}				
				
			});
			

	

}//graficaTags 

		//console.log($scope.authentication.cuenta.marca);
		$scope.chart1=function(){
			console.log('Ha entrado  Chart1');
	    	 console.log($scope.authentication.cuenta.marca);
	    	 $http.post('/getChart1', {'nombreSistema':$scope.authentication.cuenta.marca}).success(function(resp){
			 	console.log('Obteniendo Data para chart');
			 	console.log(resp);
		 		$scope.publicacionesCuenta=resp;	
		 		//$scope.inbox = resp.data;			
	    	 }).error(function(err){
			 	console.log('Error !!!');
			 	console.log(err);
	     });
		};


		// Create new Chart
		$scope.create = function() {
			// Create new Chart object
			var chart = new Charts ({
				name: this.name
			});

			// Redirect after save
			chart.$save(function(response) {
				$location.path('charts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Chart
		$scope.remove = function( chart ) {
			if ( chart ) { chart.$remove();

				for (var i in $scope.charts ) {
					if ($scope.charts [i] === chart ) {
						$scope.charts.splice(i, 1);
					}
				}
			} else {
				$scope.chart.$remove(function() {
					$location.path('charts');
				});
			}
		};

		// Update existing Chart
		$scope.update = function() {
			var chart = $scope.chart ;

			chart.$update(function() {
				$location.path('charts/' + chart._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Charts
		$scope.find = function() {
			$scope.charts = Charts.query();
		};

		// Find existing Chart
		$scope.findOne = function() {
			$scope.chart = Charts.get({ 
				chartId: $stateParams.chartId
			});
		};
	}
])/*.controller('MapController',['$scope', '$http','$stateParams','$location', 'Authentication', function($scope, $http, $stateParams, $location, Authentication) {

		var estados = [
		{'nombreEstado':'Baja California','cantidad':100},
		{'nombreEstado':'Baja California Sur','cantidad':100},
		{'nombreEstado':'Sonora','cantidad':100},
		{'nombreEstado':'Colima','cantidad':100},
		{'nombreEstado':'Nayarit','cantidad':100},
		{'nombreEstado':'Campeche','cantidad':100},
		{'nombreEstado':'Quintana Roo','cantidad':100},
		{'nombreEstado':'Mexico','cantidad':1},
		{'nombreEstado':'Tabasco','cantidad':2}
		];
		
		$scope.dataEstados = [];
		
for (var ce in estados) {
	//estados[ce]
$scope.dataEstados.push({"allAreas":false,"name":estados[ce].nombreEstado,"countries":estados[ce].nombreEstado,"data":[{"name":estados[ce].nombreEstado,"value":estados[ce].cantidad}],"dataLabels":{"enabled":true,"color":"white"},"tooltip":{"enabled":true,"headerFormat":"","pointFormat":"<span style=\"text-align:center;\">{point.name}:<br/><b>"+estados[ce].cantidad+" Casos</b></span>"}});
}

        this.config = {
            options: {
                legend: {
                    enabled: false
                },
                plotOptions: {
                    map: {
                    	mapData: Highcharts.maps['countries/mx/mx-all'],
                        //mapData: Highcharts.maps['custom/world'],
                        joinBy: ['name']
                    }
                },
            },
            chartType: 'map',
            title: {
                text: ' '
            },
            series: $scope.dataEstados
        };

        this.config.series[0].allAreas = true;


		


    }])*/;
'use strict';

//Charts service used to communicate Charts REST endpoints
angular.module('charts').factory('Charts', ['$resource',
	function($resource) {
		return $resource('charts/:chartId', { chartId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.

		state('login', {
			url: '/',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('home', {
			url: '/home',
			//templateUrl: 'modules/feeds/views/lista.fb.view.html'
			templateUrl: 'modules/feeds/views/buzon.view.html'
		}).

		state('politicas', {
			url: '/politicas',
			templateUrl: 'modules/core/views/politicas.html'
		}).
		state('terminos', {
			url: '/terminos',
			templateUrl: 'modules/core/views/terminos.html'
		}).
		state('soporte', {
			url: '/soporte',
			templateUrl: 'modules/core/views/soporte.html'
		});

	}
]);
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


'use strict';


angular.module('core')



.controller('HomeController', ['$scope', 'Authentication','ui.bootstrap',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}

]);
'use strict';

angular.module('core')
    .controller('NotificationController', ['$scope','$location','Authentication','Socket',
	function($scope, Authentication,$location,Socket) {
	    $scope.authentication = Authentication;
	    	    
	}
]);
angular.module("ngLocale", [], ["$provide", function($provide) {
var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
$provide.value("$locale", {
  "DATETIME_FORMATS": {
    "AMPMS": [
      "a.m.",
      "p.m."
    ],
    "DAY": [
      "Domingo",
      "Lunes",
      "Martes",
      "Mi\u00e9rcoles",
      "Jueves",
      "Viernes",
      "S\u00e1bado"
    ],
    "MONTH": [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
    ],
    "SHORTDAY": [
      "dom",
      "lun",
      "mar",
      "mi\u00e9",
      "jue",
      "vie",
      "s\u00e1b"
    ],
    "SHORTMONTH": [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic"
    ],
    "fullDate": "EEEE, d 'de' MMMM 'de' y",
    "longDate": "d 'de' MMMM 'de' y",
    "medium": "dd/MM/yyyy HH:mm:ss",
    "mediumDate": "dd/MM/yyyy",
    "mediumTime": "HH:mm:ss",
    "short": "dd/MM/yy HH:mm",
    "shortDate": "dd/MM/yy",
    "shortTime": "HH:mm"
  },
  "NUMBER_FORMATS": {
    "CURRENCY_SYM": "\u20ac",
    "DECIMAL_SEP": ",",
    "GROUP_SEP": ".",
    "PATTERNS": [
      {
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 3,
        "minFrac": 0,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "",
        "posPre": "",
        "posSuf": ""
      },
      {
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 2,
        "minFrac": 2,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "\u00a0\u00a4",
        "posPre": "",
        "posSuf": "\u00a0\u00a4"
      }
    ]
  },
  "id": "es-es",
  "pluralCat": function (n) {  if (n == 1) {   return PLURAL_CATEGORY.ONE;  }  return PLURAL_CATEGORY.OTHER;}
});
}]);
function crearPDF(){
console.log('creando el objeto para crear pdf');

//var imgData = 'data:image/jpeg;base64,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';
var doc = new jsPDF();

doc.setFontSize(40);
doc.text(35, 25, "Paranyan loves jsPDF");
doc.addImage(imgData, 'JPEG', 15, 40, 180, 160);


doc.save('Reportes.pdf');
console.log('fin de la generacion de pdf');	
}
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';
/*global io:false */
//socket factory that provides the socket service
angular.module('core').factory('Socket', ['socketFactory', '$location',
  function(socketFactory, $location) {
    //console.log($location.protocol() + '://' + $location.host() + ':' + $location.port());
    return socketFactory({
      prefix: '',
      //ioSocket: io.connect('http://localhost:8080')
      ioSocket: io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() )
    });
  }
]);
angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en_US', {'ACCOUNTS':'ACCOUNTS','Accept':'Accept','Account Name:':'Account Name:','Accounts':'Accounts','Add Influencer':'Add Influencer','Add Response':'Add Response','Add Subtopic':'Add Subtopic','Add Topic':'Add Topic','Add to your Predefined Answers':'Add to your Predefined Answers','Answer':'Answer','Answered':'Answered','Are you sure you want to delete this Subtopic?':'Are you sure you want to delete this Subtopic?','Are you sure you want to delete this Topic?':'Are you sure you want to delete this Topic?','Are you sure?':'Are you sure?','Articles':'Articles','Assign':'Assign','Average Case':'Average Case','Average Time':'Average Time','Begin':'Begin','By doing so, you will delete its Subtopics':'By doing so, you will delete its Subtopics','Cancel':'Cancel','Cancelar':'Cancel','Change Password':'Change Password','Clasificado por':'Sort by','Close':'Close','Complete':'Complete','Completed':'Completed','Confirm New Password':'Confirm New Password','Create':'Create','Current Password':'Current Password','Dashboard':'Dashboard','Description':'Description','Direct Messages':'Direct Messages','Doing so will remove the answer':'Doing so will remove the answer','Download CSV':'Download CSV','Edit Feed':'Edit Feed','Email':'Email','Engagement':'Engagement','Enter your account username.':'Enter your account username.','Entries':'Entries','Facebook Account':'Facebook Account','Favorites':'Favorites','First Name':'First Name','Follow':'Follow','For furter assitance call <strong>01 800 20 56 30</strong>':'<!--For furter assitance call <strong>01 800 20 56 30</strong>-->','Generate':'Generate','Got it!':'Got it!','INFLUENCERS':'INFLUENCERS','Industry':'Industry','Influencers':'Influencers','Insult':'Insult','Last Name':'Last Name','Login with an account that you will use to respend width<br><a href=\"https://apps.twitter.com\" target=\"_blank\">apps.twitter.com</a>':'Login with an account that you will use to respend width<br><a href=\"https://apps.twitter.com\" target=\"_blank\">apps.twitter.com</a>','MAILBOX':'MAILBOX','METRICS':'METRICS','Mailbox':'Mailbox','Map':'Map','Name':'Name','Need Help?':'Need Help?','New Feed':'New Feed','New Password':'New Password','New Response':'New Response','New Subtopic':'New Subtopic','New Topic':'New Topic','Nickname:':'Nickname:','No articles yet, why don\\u0027t you <a href=\"/#!/articles/create\">create one</a>?':'No articles yet, why don\\u0027t you <a href=\"/#!/articles/create\">create one</a>?','No tienes notificaciones':'No notifications','Not Related':'Not Related','Other':'Other','PROFILE':'PROFILE','PUBLICATIONS':'PUBLICATIONS','Password':'Password','Performances':'Performances','Please select the account you<br>would like to manage':'Please select the account you<br>would like to manage','Posted on\n\t\t\t\t<span data-ng-bind=\"article.created | date:\\u0027mediumDate\\u0027\"></span>\n\t\t\t\tby\n\t\t\t\t<span data-ng-bind=\"article.user.displayName\"></span>':'Posted on\n\t\t\t\t<span data-ng-bind=\"article.created | date:\\u0027mediumDate\\u0027\"></span>\n\t\t\t\tby\n\t\t\t\t<span data-ng-bind=\"article.user.displayName\"></span>','Private Message':'Private Message','Profile':'Profile','RESPONSE':'RESPONSE','RESUMEN':'ABSTRACT','Range':'Range','Read More':'Read More','Regresar':'Back','Reject':'Reject','Rejected':'Rejected','Remind to fill all the fields with *':'Remind to fill all the fields with *','Replies':'Replies','Response Averange / hrs':'Response Averange / hrs','Restore your password':'Restore your password','Return to entries':'Return to entries','Retweets':'Retweets','Rol':'Rol','Rol del usuario':'Rol del usuario','SUBTOPIC':'SUBTOPIC','Save Changes':'Save Changes','Selecting reasons gives you a better understanding<br>of your conversations:':'Selecting reasons gives you a better understanding<br>of your conversations:','Sentiment':'Sentiment','Spam':'Spam','Sure you want to proceed?':'Deseas Continuar','TEAM':'TEAM','TOPIC':'TOPIC','Tagcloud':'Tagcloud','Team':'Team','This will affect it\\u0027s history':'This will affect it\\u0027s history','Top Subtopics':'Top Subtopics','Top Topics':'Top Topics','Topics &amp;<br>Subtopics':'Topics &amp;<br>Subtopics','Total Cases':'Total Cases','Troll':'Troll','Twitter  Accounts':'Twitter  Accounts','Twitter Setup':'Twitter Setup','Upload Image':'Upload LogoUpload Image','Upload Logo':'Upload Logo','User':'User','User Name':'User Name','Username':'Username','Username (twitter)':'Username (twitter)','Why?':'Why?','You will not be notified when they message back':'You will not be notified when they message back','Your account’s information will be deleted permanently':'Your account’s information will be deleted permanently','{{ \\u0027Discart Reason\\u0027 | translate }}':'Razón Descarte','¿Are you sure?':'Are you sure?','¿Estás seguro de que deseas desconectar listening account de twitter?':'¿Estás seguro de que deseas desconectar listening account de twitter?','¿Forgot Password?':'¿Forgot Password?', 'not-related' : 'not-related', 'answered' : 'answered', 'campaign' : 'campaign', 'insult' : 'insult', 'other_comments' : 'other_comments'});
    gettextCatalog.setStrings('es_ES', {'(Responding)':'(Attending...)','ACCOUNTS':'CUENTAS','Accept':'Aceptar','Access Token':'Access Token','Access Token Secret':'Access Token Secret','Account Name:':'Nombre de la Cuenta:','Accounts':'Cuentas','Add Influencer':'Agregar Influencer','Add Response':'Agregar Respuesta','Add Subtopic':'Agregar Subtema','Add Topic':'Agregar Tema','Add User':'Agregar Usuario','Add to your Predefined Answers':'Agregar a mis respuestas predefinidas','Answer':'Ver Conversación','Answered':'Respondido','Are you sure you want delete this response?':'¿Estás seguro de borrar esta respuesta?','Are you sure you want to delete this Subtopic?':'¿Estás seguro de borrar este Subtema?','Are you sure you want to delete this Topic?':'¿Estás seguro de borrar este Tema?','Are you sure?':'¿Estas seguro?','Articles':'Artículos','Average Case':'Promedio de Casos','Average Time':'Tiempo Promedio','Begin':'Ingresar','By doing so, you will delete its Subtopics':'Al hacerlo, eliminarás sus Subtemas y sus Respuestas','Cancel':'Cancelar','Cancelar':'Cancelar','Change Password':'Cambio de Contraseña','Clasificado por':'Clasificado por','Close':'Cerrar','Completado por':'Resuelto por','Complete':'Completar','Completed':'Resueltos','Confirm New Password':'Confirmar Nueva Contraseña','Consumer Secret':'Consumer Secret','Costumer Key':'Clave de Cliente','Create':'Crear','Current Password':'Contraseña Actual','Description':'Descripción','Direct Messages':'Mensajes Directos','Doing so will remove the answer':'Al hacerlo eliminarás la respuesta','Download CSV':'Descargar CSV','Download PDF':'Descargar PDF','Edit Feed':'Editar','Email':'Email','Enter your account username.':'Ingresa tu nombre de usuario','Entries':'Entrada','Facebook Account':'Cuenta de Facebook','First Name':'Nombre','Follow':'Seguir','Generate':'Generar','Got it!':'¡Entendido!','INFLUENCERS':'INFLUENCERS','Industry':'Industria','Influencers':'Influencers','Insult':'Insulto','Last Name':'Apellidos','Login with an account that you will use to respend width<br><a href=\"https://apps.twitter.com\" target=\"_blank\">apps.twitter.com</a>':'Has Login con la cuenta que utilizarás para dar respuesta','MAILBOX':'BUZÓN','METRICS':'METRICAS','Mailbox':'Buzón','Map':'Mapa','Name':'Nombre','Need Help?':'Ver Tutorial','New Account':'Nueva Cuenta','New Feed':'Respuesta Nueva','New Messages':'Nuevos Mensajes','New Password':'Nueva Contraseña','New Response':'Nueva Respuesta','New Subtopic':'Nuevo Subtema','New Topic':'Nuevo Tema','Nickname:':'Nombre Corto de la Cuenta:','No articles yet, why don\\u0027t you <a href=\"/#!/articles/create\">create one</a>?':'No hay artículos aún, ¿ <a href=\"/#!/articles/create\">crear uno</a>?','No tienes notificaciones':'No tienes notificaciones','Not Related':'No Relacionado','Notifications':'Notificaciones','Other':'Otro','PROFILE':'PERFIL','PUBLICATIONS':'PUBLICACIONES','Password':'Contraseña','Please select the account you<br>would like to manage':'Selecciona la cuenta<br/>que deseas agregar','Primary Account':'Cuenta Primaria','Private Message':'Mensaje Privado','Proceso':'Atendidos','Profile':'Perfil','RESPONSE':'RESPUESTA','RESUMEN':'RESUMEN','Range':'Rango','Read More':'Leer Todos','Regresar':'Back','Reject':'Descartar','Rejected':'Descartados','Remind to fill all the fields with *':'Recuerda rellenar todos los campos marcados con *','Response':'Respuesta','Response Averange / hrs':'Promedio de respuesta / hrs','Restore your password':'Recuperación de Contraseña','Return to entries':'Regresar a Entrada','Rol':'Rol','Rol del usuario':'Rol del usuario','SUBTOPIC':'SUBTEMA','Save Changes':'Guardar Cambios','Secondary Account':'Cuenta Secundaria','Selecting reasons gives you a better understanding<br>of your conversations:':'Selecciona la razón por la que descartas este mensaje','Sentiment':'Sentimiento','Spam':'Spam','Sure you want to proceed?':'¿Estas Seguro?','TEAM':'EQUIPO','TOPIC':'TEMA','Tagcloud':'Nube de Términos','Team':'Equipo','Top Subtopics':'Top Subtemas','Top Topics':'Top Temas','Topics &amp;<br>Subtopics':'Temas &amp;<br>Subtemas','Total Cases':'Total Casos','Troll':'Troll','Twitter  Accounts':'Cuentas de Twitter','Twitter Setup':'Cofiguración de Twitter','Upload Image':'Subir Imagen','Upload Logo':'Subir Logo','User':'Nombre de Usuario','User Name':'Nombre deUsuario','Username':'Nombre de Usuario','Username (twitter)':'Nombre de Usuario (Twitter)','Why?':'¿Por qué?','You will not be notified when they message back':'Dejarás de recibir notificaciones cuando te mencionen o te escriban','Your account’s information will be deleted permanently':'La información de la cuenta será borrada permanentemente','to':'a','¿Are you sure?':'¿Estas seguro?','¿Estás seguro de que deseas desconectar listening account de twitter?':'¿Estás seguro de que deseas desconectar esta cuenta?','¿Forgot Password?':'¿Olvidaste tu contraseña?', 'not-related' : 'no relacionado', 'answered' : 'Respondido', 'campaign' : 'campaña', 'insult' : 'insulto', 'other_comments' : 'mediático'});
/* jshint +W100 */
}]);
'use strict';

//Setting up route
angular.module('csvs').config(['$stateProvider',
	function($stateProvider) {
		// Csvs state routing
		$stateProvider.
		state('listCsvs', {
			url: '/csvs',
			templateUrl: 'modules/csvs/views/list-csvs.client.view.html'
		}).
		state('createCsv', {
			url: '/csvs/create',
			templateUrl: 'modules/csvs/views/create-csv.client.view.html'
		}).
		state('viewCsv', {
			url: '/csvs/:csvId',
			templateUrl: 'modules/csvs/views/view-csv.client.view.html'
		}).
		state('editCsv', {
			url: '/csvs/:csvId/edit',
			templateUrl: 'modules/csvs/views/edit-csv.client.view.html'
		});
	}
]);
'use strict';

// Csvs controller
angular.module('csvs').controller('CsvsController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'Csvs',
	function($scope, $stateParams, $http, $location, Authentication, Csvs ) {
	    $scope.authentication = Authentication;
	    $scope.creaArchivo = function(){
	    //	alert($scope.coleccion);
		var obj = {};
		var config = {};
		obj.fecha_inicial = $scope.dt;
		obj.fecha_final = $scope.dt2;
		obj.coleccion = Authentication.user.cuenta.marca+'_consolidada';
		var data_series = [];
		$http.post('/generaArchivo',obj).success(function(items){
		    var data = items;
		    console.log('Sacando archivos en front');
		    var csv = [['Categoria','Nùmero']];
		    var contador = 1;
		    var contador2 = 0;
		    var contador_coincidencias = [];
		    var n = [];
		    var title= [];
		    var obj = {};
		    var series = [];
		    var sentiment = {};
		    if(items.sentiment_negativo){
		    	sentiment.negativo = items.sentiment_negativo;
		    }
		    if(items.sentiment_neutro){
		    	sentiment.neutro = items.sentiment_neutro;
		    }	
		    if (items.sentiment_positivo) {
		    	sentiment.positivo = items.sentiment_positivo;
		    }
		    var total = 0;
		    for(var i in sentiment){
		    	console.log(i);
		    	console.log(sentiment);
		    	console.log(sentiment[i]);
		    	total += sentiment[i];
		    }
		    
		    $scope.sentiment_perce = obtenPorcentajes(sentiment,total);		    
		    $scope.sentiment = sentiment;
		    for(var h  in data) {
			if(h.search('_') === -1){
			    obj[contador2] ={
				name:h,
				drilldown:h
			    };
			    series.push({
			        id:h,
			        events:{
				    click: function (e,h) {
						alert(e.point.name);
				    }
				},
			        data:[]
			    });
			    contador2++;
			}
			for(var k in obj){
			    if(h.search(obj[k].name) !== -1 && h.search('_') !== -1){
				if(contador_coincidencias.hasOwnProperty(obj[k].name)){
				    contador_coincidencias[obj[k].name] += data[h];
				}else{
				    contador_coincidencias[obj[k].name] = data[h];
				}
			    }
			}
			csv[contador] = [h,data[h]];
			n[contador-1] = data[h];
			title[contador-1] = h;
			contador++;
		    }
		    
		    var arr_subtemas = [];
		    contador = 0;
		    var array= [];
		    for(var j in obj){
		    	if(typeof contador_coincidencias[obj[j].name] === undefined){
		    		obj[j].y = 0;
		    	}else{
		    		obj[j].y = contador_coincidencias[obj[j].name];
		    	}
		    	console.log(obj[j].y);
		    	console.log(obj[j].y = contador_coincidencias[obj[j].name]);
			 
			contador = 0;
			array.push(obj[j]);
			for(var l in data){
			    if(l.search(obj[j].name) !== -1 && l.search('_') !== -1){
				if(contador === 0){
				    arr_subtemas[obj[j].name] = [];
				}
				var start = l.indexOf('_');
				var subtema = l.slice(start+1);
				for(var z in series){
				    if(series[z].id === obj[j].name){
					series[z].data.push([subtema,data[l]]);
				    }
				}
				arr_subtemas[obj[j].name][contador] = subtema;
				contador++; 
			    }
			}
		    }

		    /*+-+-+-+-+-+-+-+-+-+-+- Inicia gráfica totales atendidos +-+-+-+-+-+-+-+-++-+-+-*/
		    console.log('Por fechas');
		    console.log($scope.dt);
		    console.log($scope.dt2);
		    $http.post('/chartPromedioCasos',{nombreSistema:Authentication.user.cuenta.marca,fecha_inicial:$scope.dt,fecha_final:$scope.dt2}).success(function(data){
		    	console.log('Obteniendo datos de char1');
		    	console.log(data);
		    	var total = data.totalProceso + data.totalDescartado + data.totalNuevos + data.totalAtendidos;
		    	var vistos = total - data.totalNuevos;
		    	var obj = [];
		    	for(var i in data){
		    		obj.push( new Array(i.replace('total',''),data[i]) );
		    	}
		    	$scope.chartTotalCasos = {
			        options: {
			            chart: {
			                type: 'solidgauge'
			            },
			            credits:{
			            	enabled:false
			            },
			            pane: {
			                center: ['50%', '85%'],
			                size: '140%',
			                startAngle: -90,
			                endAngle: 90,
			                background: {
			                    backgroundColor:'#EEE',
			                    innerRadius: '60%',
			                    outerRadius: '100%',
			                    shape: 'arc'
			                }
			            },
			            solidgauge: {
			                dataLabels: {
			                    y: -30,
			                    borderWidth: 0,
			                    useHTML: true
			                }
			            }
			        },
			        series: [{
			            data: [vistos],
			            dataLabels: {
				        	format: '<div style="text-align:center"><span style="font-size:120px;color:black;font-weight:bold;">{y}/'+total+'</span><br/>'
				        }
			        }],
			        title: {
			            //text: 'Total de Casos',
			            text:' ',
			            y: 50
			        },
			        yAxis: {
			            currentMin: 0,
			            currentMax: total,
			            title: {
			                y: 140
			            },      
						stops: [
			                [0.1, '#DF5353'], // red
				        	[0.5, '#DDDF0D'], // yellow
				        	[0.9, '#55BF3B'] // green
						],
						lineWidth: 0,
			            tickInterval: 20,
			            tickPixelInterval: 400,
			            tickWidth: 0,
			            labels: {
			                y: 15
			            }   
			        },
			        loading: false
			    };

			    $scope.chartPromedioCasos = {
		            chart: {
		                plotBackgroundColor: null,
		                plotBorderWidth: null,
		                plotShadow: false
		            },
		            credits:{
			           	enabled:false
			        },
		            title: {
		            	//text:'Promedio de Casos'
		                text: ' '
		            },
		            
		            tooltip: {
		                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		            },
		            options:{
		            	legend:{
			                align: 'right',
			                verticalAlign: 'middle',
			                layout: 'vertical',
			                itemMarginBottom: 20
			             
			            },
			            plotOptions: {
			                pie: {
			                    allowPointSelect: true,
			                    cursor: 'pointer',
			                     dataLabels: {
				                    enabled: true,
				                    formatter: function(){
				                    	return this.percentage.toFixed(2)+'%';
                                //if(this.percentage!=0)  return Math.round(this.percentage)  + '%';

                            },
				                    //distance: -50,
				                    style: {
				                        fontWeight: 'bold',
				                        color: 'black',
				                       // textShadow: '0px 1px 2px black'
				                    }
				                },
			                    showInLegend: true
			                }
			            }
			        },
		            series: [{
		                type: 'pie',
		                name: 'Total',
		                data: obj
		            }]
		        };

		        //Obteniendo datos para gráfica descartados 
		        $http.post('/chartDescartados',{nombreSistema:Authentication.user.cuenta.marca,fecha_inicial:$scope.dt,fecha_final:$scope.dt2}).success(function(data_graf_descartados){
		        	console.log('Imprimiendo datos graficas descartados');
		        	console.log(data_graf_descartados);
		        	if(data_graf_descartados !== '"No hubo resultados"'){
		        	var objDescartados = [];
			    	for(var i in data_graf_descartados){
			    		objDescartados.push( new Array(i,data_graf_descartados[i]) );
			    	}
			    	$scope.chartDescartados = {
			            chart: {
			                plotBackgroundColor: null,
			                plotBorderWidth: null,
			                plotShadow: false
			            },
			            credits: {
			            	enabled: false
			            },
			            title: {
			                text: ' '
			            },
			            tooltip: {
			                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			            },
			            options:{
			            	legend:{
			                	align: 'right',
			                	verticalAlign: 'middle',
			                	layout: 'vertical',
			                	itemMarginBottom: 20
			            	},
				            plotOptions: {
				                pie: {
				                    allowPointSelect: true,
				                    cursor: 'pointer',
				                     dataLabels: {
					                    enabled: true,
					                    formatter: function(){
					                    	return this.percentage.toFixed(2)+'%';
	                                //if(this.percentage!=0)  return Math.round(this.percentage)  + '%';

	                            },
					                    //distance: -50,
					                    style: {
					                        fontWeight: 'bold',
					                        color: 'black',
					                       // textShadow: '0px 1px 2px black'
					                    }
					                },
				                    showInLegend: true
				                }
				            }
				        },
			            series: [{
			                type: 'pie',
			                name: 'Total',
			                data: objDescartados
			            }]
			        };
			    }else{
			    	console.log('No hay descartados');
			    }
			    console.log('Termino descartados');
		        });
				$http.post('/chartDesempenio',{nombreSistema:Authentication.user.cuenta.marca,fecha_inicial:$scope.dt,fecha_final:$scope.dt2}).success(function(data_desem){
					console.log('Entro a desempeño chart ');
					console.log(data_desem);
					if(data_desem !== 'No hubo resultados'){
					var obj_desem = [];
					var arr_names = [];
					var aux_descartado = [];
					var aux_atendidos = [];
					var aux_respuestas = [];
					var aux_clasificados = [];
					data_desem.sort(function (a, b) {
    					return (b.total - a.total);
					});
			        var images = {};
					for(var i in data_desem){
						images['<span style="text-align:center";>'+data_desem[i].nombre+'<br><span style="font-weight:bold;">'+data_desem[i].total+' Casos</span></span>'] = (data_desem[i].imagen)?'<br><img src="'+data_desem[i].imagen+'" style="width:30px; height:30px;border-radius:50%;">':'<br><img src="/modules/core/img/usuario-sem-imagem.png" style="width:30px; height:30px;border-radius:50%;">';
						arr_names.push('<span style="text-align:center";>'+data_desem[i].nombre+'<br><span style="font-weight:bold;">'+data_desem[i].total+' Casos</span></span>');	
						aux_clasificados.push(data_desem[i].clasificacion);
						aux_respuestas.push(data_desem[i].respuestas);
						aux_atendidos.push(data_desem[i].atendidos);
						aux_descartado.push(data_desem[i].descartado);
					}
					obj_desem.push({
						name: 'Descartados',
						data: aux_descartado
					});
					obj_desem.push({
						name: 'Atendidos',
						data: aux_atendidos
					});
					obj_desem.push({
						name: 'Respondidos',
						data: aux_respuestas
					});
					obj_desem.push({
						name: 'Clasificados',
						data: aux_clasificados
					});
					$scope.chartDesempenio = {
						options:{
					        chart: {
					            type: 'bar'
					        },
					        title: {
					            text: ' '
					        },
					        credits:{
					        	enabled:false
					        },
					        xAxis: {
					            categories: arr_names,
					            labels: {
					                useHTML: true,
					                formatter: function(){
					                    return '<br><div class="datos">'+this.value+' ' +images[this.value] + '</div>';                        
					                }
					            } 
					        },
					        yAxis: {
					            min: 0,
					            title: {
					                text: ' '
					            } 
					        },
					        legend: {
					            reversed: true
					        },
					        
					        plotOptions: {
					            series: {
					                stacking: 'normal'
					            }
					        }
					    },
					    series: obj_desem
					};
					console.log('Termino desempeño Chart empezaremos con promedio respuesta');
					}else{
						console.log('No hubo resultados para tiempo promedio');
					}
					//obteniendo datos para promedio de tiempo
					$http.post('/chartPromedioRespuesta',{nombreSistema:Authentication.user.cuenta.marca,fecha_inicial:$scope.dt,fecha_final:$scope.dt2}).success(function(data_tiempo){
						console.log('Obteniendo el tiempo');
						console.log(data_tiempo);
						if(data_tiempo !== '"No hubo resultados"'){
							console.log('Generando gráfica ');
						var obj_tiempo_respuesta = [];
				    	for(var i in data_tiempo){
				    		obj_tiempo_respuesta.push( new Array(i,data_tiempo[i]) );
				    	}
						$scope.chartTiempoRespuesta = {
				            chart: {
				                plotBackgroundColor: null,
				                plotBorderWidth: null,
				                plotShadow: false
				            },
				            title: {
				                //text: 'Top Temas'
				                text:' '
				            },
				            credits:{
					           	enabled:false
					        },
				            tooltip: {
				                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				            },
				            options:{
				            	legend:{
					                align: 'right',
					                verticalAlign: 'middle',
					                layout: 'vertical',
					                itemMarginBottom: 20
					            },
					            plotOptions: {
					                pie: {
					                    allowPointSelect: true,
					                    cursor: 'pointer',
					                     dataLabels: {
						                    enabled: true,
						                    style: {
						                        fontWeight: 'bold',
						                        color: 'black'
						                    }
						                },
					                    showInLegend: true
					                }
					            }
					        },
				            series: [{
				                type: 'pie',
				                name: 'Total',
				                data: obj_tiempo_respuesta
				            }]
				        };
				    }else{
				    	console.log('No hubo resultados de tiempo promedio');
				    }

				        //Promedio tiempo
				        $http.post('/chartPromedioTiempo',{nombreSistema:Authentication.user.cuenta.marca,fecha_inicial:$scope.dt,fecha_final:$scope.dt2}).success(function(data_promedio_tiempo){
				        	console.log('Imprimiendo el tiempo promedio de respuesta');
				        	$scope.chartPromedioTiempo = data_promedio_tiempo;
				        	$http.post('/chartTwit',{nombreSistema:Authentication.user.cuenta.marca,id_cuenta:Authentication.user.cuenta._id}).success(function(data_twit){
				        		console.log(data_twit);
				        	});
				        });
					});
				});
		    });

    		/*-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ Termina gráfica total atendidos ++-+-+-+-+-+-+-+-+-+-+-+-+-*/
		    $scope.config = {
	        options: {
	            chart: {
	                type: 'pie'
	            },
	            lang: {
			            drillUpText: '<< Regresar a Temas'
			        }
	        },
	        title: {
	            //text: 'Temas y subtemas'
	            text:''
	        },
	        credits:{
	        	enabled:false
	        },
	        xAxis: {
	            type: 'category'
	        },

	        legend: {
	            enabled: false
	        },

	        plotOptions: {
	            series: {
	                borderWidth: 0,
	                dataLabels: {
	                    enabled: true
	                }
	            }
	        },

	        series: [{
	            name: 'Things',
	            colorByPoint: true,
	            data: array
	        }],
	        drilldown: {
	            series: series
	        }
	    };
	    var objTemas = [];
	    //Generando objeto para gráfica temas
	    for(var g in array){
	    	objTemas.push( new Array( array[g].name, array[g].y ) );
	    }
	    $scope.chartTemas = {
		            chart: {
		                plotBackgroundColor: null,
		                plotBorderWidth: null,
		                plotShadow: false
		            },
		            title: {
		                //text: 'Top Temas'
		                text:' '
		            },
		            credits:{
			           	enabled:false
			        },
		            tooltip: {
		                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		            },
		            options:{
		            	legend:{
			                align: 'right',
			                verticalAlign: 'middle',
			                layout: 'vertical',
			                itemMarginBottom: 20
			            },
			            plotOptions: {
			                pie: {
			                    allowPointSelect: true,
			                    cursor: 'pointer',
			                     dataLabels: {
				                    enabled: true,
				                    formatter: function(){
				                    	return this.percentage.toFixed(2)+'%';
                                //if(this.percentage!=0)  return Math.round(this.percentage)  + '%';

                            },
				                   // distance: -50,
				                    style: {
				                        fontWeight: 'bold',
				                        color: 'black'
				                        //textShadow: '0px 1px 2px black'
				                    }
				                },
			                    showInLegend: true
			                }
			            }
			        },
		            series: [{
		                type: 'pie',
		                name: 'Total',
		                data: objTemas
		            }]
		        };

		    //construyendo objSubTemas
		    var objSubTemas = [];

	    for(var e in series){
	    	for(var f in series[e].data){
	    		objSubTemas.push(series[e].data[f]);
	    	}
	    }
		$scope.chartSubTemas = {
		    chart: {
		        plotBackgroundColor: null,
		        plotBorderWidth: null,
		        plotShadow: false
		    },
		    title: {
		        //text: 'Top Temas'
		        text: ' '
		    },
		    credits:{
			  	enabled:false
			},
		    tooltip: {
		        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		    },
		    options:{
		    	legend:{
			        
			        align: 'right',
			        verticalAlign: 'middle',
			        layout: 'vertical',
			        itemMarginBottom: 20
			             
			    },
			    plotOptions: {
			        pie: {
			            allowPointSelect: true,
			            cursor: 'pointer',
			            dataLabels: {
				            enabled: true,
				            formatter: function(){
				             	return this.percentage.toFixed(2)+'%';
				            }
                    	},
                    	showInLegend: true,
				    	distance: -50,
				    	style: {
				       	 	fontWeight: 'bold',
				        	color: 'black'
				        	//textShadow: '0px 1px 2px black'
				    	}
					},
			        showInLegend: true
			    }
			},
		    series: [{
		        type: 'pie',
		        name: 'Total',
		        data: objSubTemas
		    }]
		};

		    var csvContent = 'data:text/csv;charset=utf-8,';
		    if(data !== '0'){
			csv.forEach(function(infoArray, index){
			    var dataString = infoArray.join(',');
			    csvContent += index < csv.length ? dataString+ '\n' : dataString;
			}); 
			var encodedUri = encodeURI(csvContent);
			$scope.archivo = encodedUri;
			//window.open(encodedUri);
		    }else{
			alert('No hubo resultados para ese rango de fechas');
		    }
		});
		function obtenPorcentajes(obj, total){
			var obj_perce = {};
			for(var i in obj){
				obj_perce[i] = ( ( obj[i] * 100 ) / total ).toFixed(2);
			}
			return obj_perce;
		}
	    };
	    $scope.descargaArchivo = function(){
	    	window.open($scope.archivo);
	    };
	    $scope.today = function() {
		var semana_antes = new Date().getDate();
		$scope.dt = new Date().setDate(semana_antes - 7);
		$scope.dt2 = new Date();
	    };
	    
	    $scope.today();
	    
	    $scope.clear = function () {
		$scope.dt = null;
	    };
	    
	    // Disable weekend selection
	    $scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	    };
	    
		  $scope.toggleMin = function() {
		    //$scope.minDate = $scope.minDate ? null : new Date();
		    $scope.minDate = -10;
		  };
		  $scope.toggleMin();

		  $scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.opened = true;
		  };

		  $scope.open2 = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.opened2 = true;
		  };

		  $scope.dateOptions = {
		    formatYear: 'yy',
		    startingDay: 1
		  };

		  $scope.formats = ['dd/MM/yyyy'];
		  $scope.format = $scope.formats[0];



		// Create new Csv
		$scope.create = function() {
			// Create new Csv object
			var csv = new Csvs ({
				name: this.name
			});

			// Redirect after save
			csv.$save(function(response) {
				$location.path('csvs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Csv
		$scope.remove = function( csv ) {
			if ( csv ) { csv.$remove();

				for (var i in $scope.csvs ) {
					if ($scope.csvs [i] === csv ) {
						$scope.csvs.splice(i, 1);
					}
				}
			} else {
				$scope.csv.$remove(function() {
					$location.path('csvs');
				});
			}
		};

		// Update existing Csv
		$scope.update = function() {
			var csv = $scope.csv ;

			csv.$update(function() {
				$location.path('csvs/' + csv._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Csvs
		$scope.find = function() {
			$scope.csvs = Csvs.query();
		};

		// Find existing Csv
		$scope.findOne = function() {
			$scope.csv = Csvs.get({ 
				csvId: $stateParams.csvId
			});
		};
	}
]);

'use strict';

//Csvs service used to communicate Csvs REST endpoints
angular.module('csvs').factory('Csvs', ['$resource',
	function($resource) {
		return $resource('csvs/:csvId', { csvId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('feeds').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Feeds', 'feeds', 'dropdown', '/feeds(/create)?');
		Menus.addSubMenuItem('topbar', 'feeds', 'List Feeds', 'feeds');
		Menus.addSubMenuItem('topbar', 'feeds', 'New Feed', 'feeds/create');
	}
]);
'use strict';

//Setting up route
angular.module('feeds').config(['$stateProvider',
	function($stateProvider) {
		// Feeds state routing
		$stateProvider.
		state('listFeeds', {
			url: '/feeds',
			templateUrl: 'modules/feeds/views/list-feeds.client.view.html'
		}).
		state('filtro', {
			url: '/filtroAccount',
			templateUrl: 'modules/feeds/views/filtro-account.view.html'
		}).
		state('nuevoBuzon', {
			url: '/nuevo',
			templateUrl: 'modules/feeds/views/lista-feeds-buzon.client.view.html'
		}).

		state('getFbFeed',{
			url: '/feeds/getMailBox',
			templateUrl: 'modules/feeds/views/lista.fb.view.html'
		}).
		state('getResueltos',{
			url: '/feeds/resueltos',
			templateUrl: 'modules/feeds/views/lista.resueltos.view.html'
		}).
		state('getDescartados',{
			url: '/feeds/descartados',
			templateUrl: 'modules/feeds/views/lista.descartados.view.html'
		}).
		state('getProcesos',{
			url: '/feeds/proceso',
			templateUrl: 'modules/feeds/views/lista.proceso.view.html'
		}).
		state('createFeed', {
			url: '/feeds/create',
			templateUrl: 'modules/feeds/views/create-feed.client.view.html'
		}).
		state('viewFeed', {
			url: '/feeds/:feedId',
			templateUrl: 'modules/feeds/views/view-feed.client.view.html'
		}).
		state('editFeed', {
			url: '/feeds/:feedId/edit',
			templateUrl: 'modules/feeds/views/edit-feed.client.view.html'
		}).
		state('mailbox', {
			url: '/mailbox',
			templateUrl: 'modules/feeds/views/buzon.view.html'
		});
	}
]);
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
.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})
.filter('searchResultImg', function() {      
        return function(input) {
           	if(input){
           		if(input.atendido){
           			if(input.atendido.usuario_foto){
           				return input.atendido.usuario_foto;
           			}else{
           				if(input.clasificacion.imagen_usuario){
           					return input.clasificacion.imagen_usuario;
           				}else{
           					return '/modules/core/img/usuario-sem-imagem.png';
           					//console.log('No tiene imagen en atendido ni en clasificacion');
           				}
           			}
           		}
           	}
        };
})
.filter('validaImagenDescartado', function() {      
        return function(input) {
           	if (typeof(input) == "undefined" || input === null) {
                return "/modules/core/img/usuario-sem-imagem.png";
            } else { 
            	return input;
            }
        };
})
.filter('validaImgFacebook', function() { 
        return function(input) {
            if (typeof(input.imagen_https) == "undefined") {
                return "/modules/core/img/usuario-sem-imagem.png";
            } else { 
            	if(input.imagen_https.length === 0){         		
	                return "/modules/core/img/usuario-sem-imagem.png";
            	}else{
            		return input.imagen_https;
            	}

            }
        };
})
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
           		replacedText = replacedText.replace(trackers[t],'<span class="tracker">'+trackers[t]+'</span>');
           		//replacedText = replacedText.replace(reemplazar, function(e){
           		//return '<span class="tracker">'+e+'</span>';	
           		//});
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
		$scope.tipo = 'todos';
		$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id,filtro:$scope.tipo}).success(function(data){
			$scope.pendientes = parseInt(data);
			if($scope.tipoBuzon === 'nuevos'){
				$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
			}
			//$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
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
		
/*  
             _               _ _          _____                 _            _ _   _            
            | |             | (_)        |_   _|               | |          (_) | | |           
   __ _  ___| |_ _   _  __ _| |_ ______ _  | |  _ __ ___   __ _| |___      ___| |_| |_ ___ _ __ 
  / _` |/ __| __| | | |/ _` | | |_  / _` | | | | '_ ` _ \ / _` | __\ \ /\ / / | __| __/ _ \ '__|
 | (_| | (__| |_| |_| | (_| | | |/ / (_| |_| |_| | | | | | (_| | |_ \ V  V /| | |_| ||  __/ |   
  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_____|_| |_| |_|\__, |\__| \_/\_/ |_|\__|\__\___|_|   
                                                           __/ |                                
                                                          |___/                                 
*/

		$scope.actualizaImgTwitter = function (mensaje) {	
			for(var i = 0; i<$scope.posts.length;i++){
				if(mensaje._id === $scope.posts[i]._id){
					$scope.posts[i].imagen = 'http://crm.likeable.mx/modules/core/img/loading.gif';
					$scope.posts[i].imagen_https = 'https://crm.likeable.mx/modules/core/img/loading.gif';

				}
			}	
			$http.post('/actualizaImgTwitter', {'cuenta' : $scope.authentication.user.cuenta, 'mensaje' : mensaje}).success(function(imgActualizada){
				if(imgActualizada){
					for(var i = 0; i<$scope.posts.length;i++){
						if(imgActualizada._id === $scope.posts[i]._id){
							$scope.posts[i].imagen_https = imgActualizada.imagen_https;
							$scope.posts[i].imagen = imgActualizada.imagen;
						}
					}
				}
			});	
		};

/*
                 _              _               _ _          _____                 _            _ _   _            
                | |            | |             | (_)        |_   _|               | |          (_) | | |           
   ___ _ __   __| |   __ _  ___| |_ _   _  __ _| |_ ______ _  | |  _ __ ___   __ _| |___      ___| |_| |_ ___ _ __ 
  / _ \ '_ \ / _` |  / _` |/ __| __| | | |/ _` | | |_  / _` | | | | '_ ` _ \ / _` | __\ \ /\ / / | __| __/ _ \ '__|
 |  __/ | | | (_| | | (_| | (__| |_| |_| | (_| | | |/ / (_| |_| |_| | | | | | (_| | |_ \ V  V /| | |_| ||  __/ |   
  \___|_| |_|\__,_|  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_____|_| |_| |_|\__, |\__| \_/\_/ |_|\__|\__\___|_|   
                                                                              __/ |                                
                                                                             |___/                                 
*/
		
		$scope.refreshAux = function(){
			$scope.paginacion_busqueda = false
			delete $scope.posts;
			$scope.posts =$scope.aux;
		};
		$scope.$on('muestraFlash', function(event,str){
			$scope.muestraFlash(str);
		});
		$scope.muestraFlash = function(str){
			console.log(str);
			$scope.flash = true;
			$scope.flash_text = str;
			setTimeout(function(){
				$scope.flash = false;
				$scope.flash_text = '';
			}, 2500);
		}
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
	    var existe_notificacion = false;
	    //funcion que determina en que parte del crm se llamo la nitificacion pra redirigit a buzon
	    $scope.comparaUrl = function(){
	    	var url = window.location.href;
	    	url = url.replace('#object-0','');
	    	window.location.href = url;
	    	//console.log('LOCATION');
	    	$scope.authentication = Authentication;
		    var tieneSesion=$scope.authentication.user.hasOwnProperty('_id');
		    if(tieneSesion===false){
		    	$location.path('/');
		    }
			NotificacionService.getDesempenio().success(function(data){
				$scope.totalDesempenioDiario = data;
			});
		  	if($location.$$search.colec){
			  	$scope.notificacion = {};
			  	$scope.notificacion.coleccion = $location.$$search.colec;
			  	$scope.notificacion.mongo_id = $location.$$search.mo_id;
			  	$scope.notificacion._id = $location.$$search.not_id;
		  	}
		};
		
		$scope.filtroAccount = function(){
			var muestraLoadingPrimario = true;
			var obj = {};
			
			//Parametros generales para todos las gráficas
			obj = {
					first: $location.$$search.first,
					second: $location.$$search.second,
					cuenta: $location.$$search.cuenta+'_consolidada',
					opcion: $location.$$search.opcion
				};
			if($location.$$search.total){
				obj.total = $location.$$search.total;
			}
			//La gráfica es de nube de términos
			if($location.$$search.palabra){
				obj.palabra = $location.$$search.palabra;
			}
			//La gráfica es de sentimiento
			else if($location.$$search.sentiment){
				obj.sentiment = $location.$$search.sentiment;
			}
			//La gráfica es de tipo desempeño por usuario
			if($location.$$search.usuario){
				obj.usuario = $location.$$search.usuario;
				obj.tipo = $location.$$search.tipo;
			}
			//Determinar tipo de grafica
			if($location.$$search.descartado){
				obj.descartado = $location.$$search.descartado;
			}else if($location.$$search.tema){
				obj.tema = $location.$$search.tema;
			}else if($location.$$search.subtema){
				obj.subtema = $location.$$search.subtema;
			}
			obj.skip = 0;
			console.log('El objeto es ');
			console.log(obj);
			$scope.obj_filtro_account = obj;
			$http.post('/obtienePorClick',obj).success(function(data){
				console.log('Datos para mostrar click!');
				console.log(data);
				$scope.numeroResultadosBusqueda = data.length;
				$scope.posts = data;
				$scope.muestraLoadingPrimario = false;
			});
		}
		
		$scope.loadMoreFiltroAccount = function(){
			var obj = $scope.obj_filtro_account;
			obj.skip += 15;
			$http.post('/obtienePorClick',obj).success(function(data){
				console.log('Datos para mostrar click!');
				console.log(data);
				for(var i in data){
					$scope.posts.push(data[i]);
				}
				$scope.posts = $scope.posts.filter(function(){return true;}); 
				$scope.numeroResultadosBusqueda += data.length;
				$scope.muestraLoadingPrimario = false;
			});
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

		$scope.scrollTo = function(element, to, duration) {
			console.log('Scrollenado !');
		    if (duration < 0) return;
		    var difference = to - element.scrollTop;
		    console.log('Diferencia');
		    var perTick = difference / duration * 10;

		    setTimeout(function () {
		        element.scrollTop = element.scrollTop + perTick;
		        console.log('Subiendo');
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
		     body: "Tienes 1 nuevo mensajes de "+data[0].screen_name
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
		Socket.on('auxiliarNotificacion', function(data){
			if(data.cuenta === Authentication.user.cuenta.marca){
				Socket.emit('eliminaNotificacion',data._id);
			}
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

			for(var i in $scope.notificaciones){
				if($scope.notificaciones[i] && $scope.notificacion){
			  		if($scope.notificaciones[i].mongo_id === $scope.notificacion.mongo_id){
			  			existe_notificacion = true;
			  		}
			  	}
			}
			  //	console.log('Mostrando notificacion');
		  	//	console.log(existe_notificacion);
			  	if(existe_notificacion){
			  		if($scope.notificacionesOcultas)
			  			$scope.abrirNotificaciones();
			  		$scope.showNotificacion($scope.notificacion);
			  	}
			  	
			  	if($scope.notificacionesOcultas)
			  		$scope.abrirNotificaciones();


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
	    	console.log('Actualizando tiempo Real Front');
	    	console.log(obj_actualizar);
	    	if(obj_actualizar.cuenta === Authentication.user.cuenta.marca){
				$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id,filtro:$scope.tipo}).success(function(data){
					$scope.pendientes = parseInt(data);
					if($scope.tipoBuzon === 'nuevos'){
						$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
					}
					console.log('TOTALES!!!');
					console.log(_.size($scope.posts));
					if(_.size($scope.posts) < 3){
			    		$scope.loadMoreUnificado();
			    	}
				});
		    	switch($scope.tipoBuzon){
		    		case 'nuevos':	
		    			if(obj_actualizar.regresa){
		    				console.log('El elemento se agrega en su fecha indicada');
		    			}else{
		    				for(var i in $scope.posts){
			    				if($scope.posts[i]._id === obj_actualizar._id){
			    					delete $scope.posts[i];
			    					$scope.posts = $scope.posts.filter(function(){return true;});
			    				}
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
		    		case 'atendidos':
		    			if(obj_actualizar.regresa){
		    				for(var i in $scope.posts){
			    				if($scope.posts[i]._id === obj_actualizar._id){
			    					delete $scope.posts[i];
			    					$scope.posts = $scope.posts.filter(function(){return true;});
			    				}
			    			}
		    			}
		    		break;
		    		case 'todos':
		    			if(obj_actualizar.regresa){
		    				console.log('TODOS !!! con parametro regresa !!');
		    				console.log(obj_actualizar);
		    				for(var i in $scope.posts){
		    					console.log($scope.posts[i]._id +'==='+ obj_actualizar._id);
				    			if($scope.posts[i]._id === obj_actualizar._id){
				    				console.log('Son iguales !');
				    				$scope.posts[i].tipoMensaje = 'nuevo';
				    				console.log($scope.posts[i].atendido);
				    				if($scope.posts[i].clasificacion)
				    					delete $scope.posts[i].clasificacion;
				    				if($scope.posts[i].atendido)
				    					delete $scope.posts[i].atendido;

				    				console.log($scope.posts[i].atendido);
				    				if($scope.posts[i].descartado)
				    					delete $scope.posts[i].descartado;	
				    			}
				    		}
				    		$scope.posts = $scope.posts.filter(function(){return true;});
		    			}
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
		    				if(!obj_actualizar.regresa){
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
				        console.log('Removiendo el hash !')
					    var url = window.location.href;
					    console.log(url);
					   	url = url.replace('#object-0','');
					   	console.log(url);
					    window.location.href = url;
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
			if($scope.fechas){
				var parametros = $scope.fechas.firstdate;
				delete $scope.fechas;
				$scope.muestraLoading=true;
				var idUsuario = $scope.authentication.user._id;
				$http.get('/mailbox/?id='+$scope.authentication.user.cuenta._id+'&firstdate='+parametros+'&eltipo='+tipoFiltro+'&organizacion='+tipoOrganizacion+'&idUsuario='+idUsuario+'&tipoBuzon='+tipoBuzon+'&palabra='+palabra).success(function(data){
		    		//console.log('DATA unificado');
		    		//console.log(data);
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
								if(data[i] !== 'error'){
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
		        		if($scope.posts){
			        		$scope.posts = $scope.posts.filter(function(){return true;}); 
		        		}
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
			//console.log('Datos a bloquear en front');
			//console.log(datos_a_bloquear);
			$scope.ocupados[($scope.ocupados.length)]={_id: datos_a_bloquear._id, user:datos_a_bloquear.user,user_image: datos_a_bloquear.user_image};		
			//console.log($scope.ocupados);
		});
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
				$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id,filtro:$scope.tipo}).success(function(data){
					$scope.pendientes = parseInt(data);
					if($scope.tipoBuzon === 'nuevos'){
						$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
					}
					//$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
				});
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
			var mensajes_asignados = new Array();
			if($scope.authentication.user.cuenta.marca === data.cuenta){
				for(var i in $scope.posts){
					for(var j in data.mensajes){
						if($scope.posts[i]._id === data.mensajes[j]){
							$scope.posts[i].asignado = data.asignado;
							mensajes_asignados.push($scope.posts[i]);
						}	
					}
				}
				if($scope.posts){
					$scope.posts = $scope.posts.filter(function(){return true;});
				}
				if($scope.tipoBuzon === 'asignados'){
					if(Authentication.user._id === data.asignado.usuario_asignado_id){	
						for(var i in mensajes_asignados){
							if($scope.nuevos && $scope.nuevos > 0){
								$scope.nuevos++;
								$scope.mensajeAsignado.push(mensajes_asignados[i]);
							}else{
								$scope.mensajeAsignado.push(mensajes_asignados[i]);
								$scope.nuevos = 1;
							}
						}
					}
				}
				/*data.mensaje.asignado = data.asignado;
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
				}	*/

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
				$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id,filtro:$scope.tipo}).success(function(data){
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
					var obj_actualizar = {
						tema: auxiliar_twit.clasificacion.tema,
						subtema: auxiliar_twit.clasificacion.subtema,
	    				user:$scope.authentication.user._id,
	    				username:$scope.authentication.user.username,
						user_image: Authentication.user.imagen_src,
	    				cuenta:Authentication.user.cuenta.marca
					};
					
					console.log('Actualizando los finalizados !!!+++');
					console.log(data);
					
					for(var i = 0; i < data.length; i++){
	  					obj_actualizar._id = data[i];
		  				Socket.emit('tiempoRealServer', obj_actualizar);
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
			console.log('Pendientes');
			console.log($scope.tipo);
			$http.post('/totalPendientes',{coleccion: Authentication.user.cuenta.marca+'_consolidada',id_cuenta: Authentication.user.cuenta._id,filtro:$scope.tipo}).success(function(data){
				$scope.pendientes = parseInt(data);
				if($scope.tipoBuzon === 'nuevos'){
						$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
					}
				//$scope.textoSelectorBandeja = "Nuevos ("+$scope.pendientes+")";
			});
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

				case 'rating':
				$scope.textoSelectorRed = "<i class='fa fa-facebook' style='color:#375697;'></i>&nbsp;Rating";
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
                //console.log('DATA');
                //console.log(data);
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
                    if($scope.posts[i].conversacion){
                    	delete $scope.posts[i].conversacion;
                    	$scope.posts[i].conversacion = [];
                    	$scope.posts[i].conv_cuenta++;
                    	if($scope.posts[i].conv_cuenta < 1){
                        	$scope.posts[i].conv_cuenta = '';
                    	}
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
	    	console.log('regresando mailbox !!!');
	    	console.log(item);
	    	if(item.descartado){
	    		$scope.regresarDescartado(item._id);
	    	}
	    	if(item.atendido){
	    		$scope.regresarResuelto(item);
	    	}
	    });

	    $scope.regresarDescartado = function(id){
	    	console.log('Entro a regresarDescatado !');
	    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:id});
	    	$http.post('/regresarDescartado',{col:Authentication.user.cuenta.marca+'_consolidada',id:id}).success(function(data){
	    		console.log(data);
	    		if(data.ok){
	    			$scope.muestraFlash('El mensaje está como nuevo');
	    		}
	    		console.log($scope.tipoBuzon);
	    		var obj_actualizar = {
					'_id' : id,
					'regresa': true,
					'cuenta' : $scope.authentication.user.cuenta.marca,
					'tipoBuzon': $scope.tipoBuzon
				};
				console.log('Llamando a tiempoRealServer');
				Socket.emit('tiempoRealServer', obj_actualizar);
	    		/*for(var i in $scope.posts){
	    			if($scope.posts[i]){
		    			if($scope.posts[i]._id === id){
		    				delete $scope.posts[i];
		    				$scope.posts = $scope.posts.filter(function(){return true;}); 
		    			}
	    			}
	    		}*/
	    	}).error(function(err){
	    		console.log('ERROR !!!');
	    		console.log(err)
	    	});
	    };
	    $scope.regresarResuelto = function(twit){
	    	console.log('Entro a regresarResuelto !');
	    	Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:twit._id});
	    	//Socket.emit('actualizaClasificacion')
	    	$http.post('/regresarResuelto',{col:Authentication.user.cuenta.marca+'_consolidada',twit: twit}).success(function(data){
	    		if(data.ok){
	    			$scope.muestraFlash('El mensaje está como nuevo');
	    		}
	    		console.log($scope.tipoBuzon);
	    		var obj_actualizar = {
					'_id' : twit._id,
					'regresa': true,
					'cuenta' : $scope.authentication.user.cuenta.marca,
					'tipoBuzon': $scope.tipoBuzon
				};
				console.log('Llamando a tiempoRealServer');
				Socket.emit('tiempoRealServer', obj_actualizar);
	    		/*for(var i in $scope.posts){
	    			if($scope.posts[i]._id === twit._id){
	    				delete $scope.posts[i];
	    				$scope.posts = $scope.posts.filter(function(){return true;}); 
	    			}
	    		}*/
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
.controller('ModalDemoCtrl', ["$scope", "$modal", "$http", "$location", "$log", "$resource", "Authentication", "Socket", "$rootScope", "CONSTANT", function ($scope, $modal,$http,$location,$log,$resource,Authentication,Socket,$rootScope,CONSTANT) {
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
  
  
  
  /*$scope.comparaUrl = function(){
  	NotificacionService.getDesempenio().success(function(data){
		$scope.totalDesempenioDiario = data;
	});
  	if($location.$$search.colec){
  		console.log('Notificaciones en otra compara ');
  		console.log($scope.notificaciones);
	  	var notificacion = {};
	  	notificacion.coleccion = $location.$$search.colec;
	  	notificacion.mongo_id = $location.$$search.mo_id;
	  	notificacion._id = $location.$$search.not_id;
	    $scope.openNotificacion(notificacion);
  	}
  };*/

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
}])
.controller('ModalInstanceCtrl',["$scope", "$modalInstance", "items", "temas", "$resource", "$http", "Accounts", "Authentication", "Socket", "$rootScope", "$modal", "$timeout", "CONSTANT", function ($scope, $modalInstance, items,temas,$resource,$http,Accounts,Authentication,Socket,$rootScope,$modal,$timeout,CONSTANT) {
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
  	datos_bloqueo.cuenta = $scope.authentication.user.cuenta.marca;
  	datos_bloqueo.user = $scope.authentication.user.displayName;
  	datos_bloqueo._id = items[0]._id;
  	datos_bloqueo.user_image = $scope.authentication.user.imagen_src;
  	//console.log('Bloqueando !!!');
  	//console.log(datos_bloqueo);
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
  	if($scope.items[0].descartado){
  		$scope.respuesta_server = 'No puedes clasificar un descartado';
  		return;
  	}
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
				if(1==1){
				//if(metodo === '2'){
					$scope.items[0].imagenUsuario = Authentication.user.imagen_src;
					$rootScope.$broadcast('finalizarCtrl',$scope.items[0]);
				}
				if($scope.items[0].influencers || $scope.items[0].asignado){
					console.log('Eliminando la notificacion !!! ');
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
						  	Socket.emit('eliminaNotificacion',data[i]);
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
	  				if($scope.items[0].influencers || $scope.items[0].asignado){
						console.log('Eliminando la notificacion !!! ');
				  		Socket.emit('eliminaNotificacion',idPost);
				  	}
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
	  					//$scope.$emit('actualizaPost',$scope.items[0]);
	  					//var obj_actualizar = {descartado:true, _id:$scope.items[0]._id,user: Authentication.user._id,cuenta:Authentication.user.cuenta.marca};
	  					//Socket.emit('actualizaClasificacion',obj_actualizar);
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
   	console.log('Evento multiple !!!');
   	console.log(item);
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

}]).controller('ModalAsignarCtrl', ["$scope", "$modalInstance", "mensaje", "usuarios", "$resource", "$http", "Authentication", "Socket", "$rootScope", "$modal", "$timeout", "CONSTANT", function($scope, $modalInstance, mensaje,usuarios,$resource,$http,Authentication,Socket,$rootScope,$modal,$timeout,CONSTANT){
	$scope.usuarios_cuenta = usuarios;
	$scope.mensaje = mensaje;
	$scope.authentication = Authentication;
    $scope.constant = CONSTANT;
	var datos_bloqueo = {};
	datos_bloqueo.cuenta = $scope.authentication.user.marca;
  	datos_bloqueo.user = $scope.authentication.user.displayName;
  	datos_bloqueo._id = $scope.mensaje._id;
  	datos_bloqueo.user_image = $scope.authentication.user.imagen_src;
  	console.log('Bloqueando el twit !');
  	console.log(datos_bloqueo);
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
				tipo: $scope.mensaje.tipo,
				obj: $scope.mensaje.obj,
				from_id: $scope.mensaje.from_user_id,
				created_time: $scope.mensaje.created_time,
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
				console.log('Respuesta de asgina mensajes !');
				console.log(data);
				if(!data.code){
					console.log('Mensajes asignados !!! ');
					console.log(data);
					console.log('EL MENSAJE');
					console.log($scope.mensaje);
					Socket.emit('liberaOcupado',{cuenta:$scope.authentication.user.cuenta.marca,_id:$scope.mensaje._id});
					//var obj_atendido = {_id:$scope.mensaje._id, cuenta: Authentication.user.cuenta.marca,asignado:obj.asignado,mensaje:$scope.mensaje};
					if(data.ok){
						data = [$scope.mensaje._id];
					}else{
						data.push($scope.mensaje._id);
					}
					var obj_atendido = {mensajes: data,cuenta: Authentication.user.cuenta.marca,asignado:obj.asignado};
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
}]).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0]; 
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});

'use strict';

// Feeds controller
angular
    .module('feeds')
    .controller('FeedsTooltip', ["$scope", function ($scope) {
	console.log($scope);
	$scope.htmlTooltip = '<a data-ng-controller="ModalDemoCtrl" data-ng-click="open({{twit}})">Responder</a><br><a>Descartar</a>';
    }]);



'use strict';

//Feeds service used to communicate Feeds REST endpoints
angular.module('feeds').factory('Feeds', ['$resource',
	function($resource) {
		return $resource('feeds/:feedId', { feedId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('influencers').config(['$stateProvider',
	function($stateProvider) {
		// Influencers state routing
		$stateProvider.
		state('listInfluencers', {
			url: '/influencers',
			templateUrl: 'modules/influencers/views/list-influencers.client.view.html'
		}).
		state('createInfluencer', {
			url: '/influencers/create',
			templateUrl: 'modules/influencers/views/create-influencer.client.view.html'
		}).
		state('viewInfluencer', {
			url: '/influencers/:influencerId',
			templateUrl: 'modules/influencers/views/view-influencer.client.view.html'
		}).
		state('ModalInfluencer', {
			url: '/influencers/modal',
			templateUrl: 'modules/influencers/views/modal.html'
		}).		
		state('editInfluencer', {
			url: '/influencers/:influencerId/edit',
			templateUrl: 'modules/influencers/views/edit-influencer.client.view.html'
		});
	}
]);
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
	}]).controller('ModalInfluencers', ["$scope", "$modal", "$log", "$resource", "Authentication", "Influencers", function ($scope, $modal, $log,$resource,Authentication, Influencers) {

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
	}]).controller('ModalInstanceInfluencers',["idInfluencer", "$scope", "$modalInstance", "$resource", "$http", "Accounts", "Authentication", "Influencers", function (idInfluencer,$scope, $modalInstance,$resource,$http,Accounts,Authentication,Influencers) {

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
}]);
'use strict';

//Influencers service used to communicate Influencers REST endpoints
angular.module('influencers').factory('Influencers', ['$resource',
	function($resource) {
		return $resource('influencers/:influencerId', { influencerId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Articles module
angular.module('themes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Themes', 'themes', 'dropdown', '/themes(/create)?');
		Menus.addSubMenuItem('topbar', 'themes', 'List Themes', 'themes');
		Menus.addSubMenuItem('topbar', 'themes', 'New Theme', 'themes/create');
	}
]);
'use strict';

//Setting up route
angular.module('themes').config(['$stateProvider',
	function($stateProvider) {
		// Themes state routing
		$stateProvider.
		state('listThemes', {
			url: '/themes',
			templateUrl: 'modules/themes/views/list-themes.client.view.html'
		}).
		state('createTheme', {
			url: '/themes/create',
			templateUrl: 'modules/themes/views/create-theme.client.view.html'
		}).
		state('viewTheme', {
			url: '/themes/:themeId',
			templateUrl: 'modules/themes/views/view-theme.client.view.html'
		}).
		state('editTheme', {
			url: '/themes/:themeId/edit',
			templateUrl: 'modules/themes/views/edit-theme.client.view.html'
		});
	}
]);
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
]).controller('ModalTema', ["$scope", "$modal", "$log", "$resource", "Authentication", "Themes", function ($scope, $modal, $log,$resource,Authentication, Themes) {
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
}]).controller('ModalInstanceThemes',["$scope", "$modalInstance", "agregaTema", "agregaSubtema", "agregaRespuesta", "temaEscogido", "subtemaEscogido", "respuestaEliminada", "deleteTema", "deleteSubtema", "deleteRespuesta", "$resource", "$http", "Accounts", "Authentication", "Themes", function ($scope, $modalInstance,agregaTema,agregaSubtema,agregaRespuesta,temaEscogido,subtemaEscogido,respuestaEliminada,deleteTema,deleteSubtema,deleteRespuesta,$resource,$http,Accounts,Authentication,Themes) {
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
}]);

'use strict';

//Themes service used to communicate Themes REST endpoints
angular.module('themes').factory('Themes', ['$resource',
	function($resource) {
		return $resource('themes/:themeId', { themeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
exports=[{
		'rol': 'app-manager',
		'permisos':[1,2]//1: puede ver listas, 2: puede crear cuentas
	},
	{
		'rol': 'account-manager',
		'permisos':[1]//1: puede ver listas
	},
	{
		'rol': 'user',
		'permisos':[0]//1: puede ver listas
	}];
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}
						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

'use strict';
var user; 
var permisos = [	{
		'rol': 'app-manager',
		'permisos':[1,2]//1: puede ver listas, 2: puede crear cuentas
	},
	{
		'rol': 'account-manager',
		'permisos':[1]//1: puede ver listas
	},
	{
		'rol': 'user',
		'permisos':[0]//1: puede ver listas
	}];
// Setting up route
angular.module('users')
	.controller('SettingsController', ['$scope','Authentication',
		function($scope, Authentication) {
			user = Authentication.user;
     	}

	])
	.config(['$stateProvider',
		function($stateProvider) {
			// Users state routing
			$stateProvider.
			state('profile', {
				url: '/settings/profile',
				templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
			}).
			state('password', {
				url: '/settings/password',
				templateUrl: 'modules/users/views/settings/change-password.client.view.html'
			}).
			state('accounts', {
				url: '/settings/accounts',
				templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
			}).
			state('list', {
				url: '/usuarios/listado',
				templateUrl: function(){
					for(var permiso in permisos){
						if (user.roles[0] === permisos[permiso].rol ) {
							if(permisos[permiso].permisos.indexOf(1) <= 0){	
								return 'modules/users/views/user.client.view.html';
							}else{
								return 'modules/users/views/404.html';
							}
						}
					}
				}
			}).
			state('listbyaccount',{
			    url: '/equipo',
			    templateUrl: 'modules/users/views/userbc.client.view.html'
			}).
			state('listaUsuarios',{
			    url: '/users',
			    templateUrl: 'modules/users/views/view-user.list.view.html'
			}).
			state('muestraUsuario', {
				url: '/profile/:usuarioID',
				//url: '/usuario/:usuarioID',
				templateUrl: 'modules/users/views/list/view-user.list.view.html'
			}).
			state('crearUsuario', {
				url: '/users/create',
				templateUrl: 'modules/users/views/list/create-user.client.view.html'
			}).
			state('signup', {
				url: '/signup',
				templateUrl: 'modules/users/views/authentication/signup.client.view.html'
			}).
			state('signin', {
				url: '/signin',
				templateUrl: 'modules/users/views/authentication/signin.client.view.html'
			}).
			state('forgot', {
				url: '/password/forgot',
				templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
			}).
			state('reset-invlaid', {
				url: '/password/reset/invalid',
				templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
			}).
			state('editUser', {
				url: '/user/:usuarioID/edit',
				templateUrl: 'modules/users/views/list/edit-user.client.view.html'
			}).
			state('reset-success', {
				url: '/password/reset/success',
				templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
			}).
			state('resetPassword-success', {
				url: '/password/message',
				templateUrl: 'modules/users/views/password/response-reset.cliente.view.html'
			}).
			state('reset', {
				url: '/password/reset/:token',
				templateUrl: 'modules/users/views/password/reset-password.client.view.html'
			});
		}
	]);

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
]).controller('modalForgotPassword', ["$scope", "$modal", "$log", "$http", function ($scope, $modal, $log,$http) {

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
  

  
}])
.controller('ModalInstanceForgotPassword',["$scope", "$modalInstance", "$http", function ($scope, $modalInstance,$http) {
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

}]);




'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			console.log($scope.credentials);
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				console.log(response);
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;
				$location.path('/password/message');

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			console.log($scope.passwordDetails);
			console.log($stateParams);
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';
angular
    .module('users')
    
/*ESTA DIRECTIVA ES PARA ASEGURAR QUE LA IMAGEN DE FONDO EXISTA*/    

.directive('backImg', ["$http", function($http) {
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
}])
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
				$scope.usuariosTeam($scope.idCuentaSelect,$scope.nombreCuentadefault);
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
}]).controller('TooltipDemoCtrl', ["$scope", function ($scope) {
	$scope.htmlTooltip = '<a href="">I\'ve been made <b>bold</b>!</a>';
}]).controller('ModalEquipo', ["$scope", "$modal", "$log", "$resource", "Authentication", "Users", "Lista", function ($scope, $modal, $log,$resource,Authentication, Users,Lista) {
	
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
}]).controller('ModalInstanceEquipo',["$scope", "$modalInstance", "cuentaDefault", "rolDefault", "idCuenta", "idUsuario", "$resource", "$http", "Accounts", "Authentication", "Users", "Lista", function ($scope, $modalInstance,cuentaDefault,rolDefault,idCuenta,idUsuario,$resource,$http,Accounts,Authentication,Users,Lista) {	
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
}]).controller('ModalInstancePerfil',["$scope", "datosUsuario", "$modalInstance", "$resource", "$http", "Accounts", "Authentication", "Users", "Lista", function ($scope, datosUsuario,$modalInstance,$resource,$http,Accounts,Authentication,Users,Lista) {
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
}]).controller('ModalInstancePassword',["idUsuario", "$scope", "$modalInstance", "$resource", "$http", "$stateParams", "Accounts", "Authentication", "Users", "Lista", function (idUsuario,$scope,$modalInstance,$resource,$http,$stateParams,Accounts,Authentication,Users,Lista) {
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
}]).controller('ModalInstanceFoto',["idUsuario", "$scope", "$modalInstance", "$resource", "$http", "$stateParams", "Accounts", "Authentication", "Users", "Lista", function (idUsuario,$scope,$modalInstance,$resource,$http,$stateParams,Accounts,Authentication,Users,Lista) {
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
}]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
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

'use strict';

//Accounts service used to communicate Accounts REST endpoints
angular.module('users').factory('GetMarca', ['$resource',
	function($resource) {
		return $resource('marca/:marcaId', {marcaId: '@_id'
	}, {
			update: {
				method: 'PUT'
		}
	});
	}
]);
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


'use strict';

// Users service used for communicating with the users REST endpoint
angular
    .module('users')
    .factory('Listabycuenta', 
	     [
		 '$resource',
		 function($resource) {
		     return $resource(
			 'users/listbyaccount/:accId',
			 {accId: '@_id'}, 
			 {update: {method: 'PUT'}}
		     );
		 }
	     ]
	    );


'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

