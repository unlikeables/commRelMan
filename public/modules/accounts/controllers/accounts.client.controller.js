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
	console.log($scope.authentication);
	
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
		    	//console.log(i);
		    	//console.log(sentiment);
		    	//console.log(sentiment[i])
		    	total += sentiment[x];
		    }
		    $scope.sentiment_perce = obtenPorcentajes(sentiment,total);	

		    //Validación que nos sirve para ocultar o mostrar los sentimientos en la gráfica
		   	if((isNaN($scope.sentiment_perce.negativo) === true && isNaN($scope.sentiment_perce.neutro) === true && isNaN($scope.sentiment_perce.positivo) === true) || ($scope.sentiment_perce.negativo === 0 && $scope.sentiment_perce.neutro === 0 && $scope.sentiment_perce.positivo === 0)){
		   		$scope.mostrarSentiment = false;
		   	}else{
		   		$scope.mostrarSentiment = true;
		   	}






			//console.log('************** objeto temas y subtemas ***************');
			
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




			
			//console.log('objeto temastemas');
			//console.log(temasTemas);
			//console.log(subtemasTemas);
			//console.log('************** objeto temas y subtemas ***************');
			
			
			
			
			
			

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
								alert(e.point.name);
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
	    		objTemas.push({name:topTemasDrill[i].name, y:topTemasDrill[i].y});
			}
			if(objTemas.length > 0){
				$scope.mostrarTemas = true;
			}else{
				$scope.mostrarTemas = false;
 			}
			/*for(var i in array){
	    		objTemas.push({name:array[i].name, y:array[i].y});
	    		//objTemas.push({name:array[i].name, y:array[i].y,color:$scope.esquemaColores[i]});

			}
			if(objTemas.length > 0){
				$scope.mostrarTemas = true;
			}else{
				$scope.mostrarTemas = false;
			}*/
			
			
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
				objSubTemasC.push({name:i,y:graf_subtemas[i]});
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
	var total = data.Completos + data.Descartados + data.Entrada + data.Proceso;
	//var total = data.Atendidos + data.Descartados + data.Nuevos;	
	console.log('Regresando TOTALES !!!');
	console.log(data);
	$scope.totalCasos = total;

	var vistos = total - data.Entrada;
	//var vistos = total - data.Nuevos;

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
		

		
		
/*dona*/		
		var casos = {};
		casos.crm = data.Completos + data.Descartados + data.Proceso;
		casos.facebook = data.facebook;
		casos.total = data.Completos + data.Descartados + data.Entrada + data.Proceso + data.facebook;
		casos.resto = casos.total - (casos.crm+casos.facebook);
		console.log(casos);
		
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
					fontWeight: 'bold'
				},

				series : [{
					type : 'pie',
					name : 'Porcentaje de Casos',
					innerSize : '50%',
					data : [
					{
						name: 'Atendidos en CRM',
						color: '#0DBEC8',
						y: casos.crm					
					},
					{
						name: 'Atendidos en Facebook',
						color: '#4A669F',
						y: casos.facebook
					},
					{
						name: 'No Atendidos',
						color: '#EBEEF3',
						y: casos.resto
					}
					,{
						name : 'Proprietary or Undetectable',
						y : 0.2,
						dataLabels : {
							enabled : false
						}
					}],
				dataLabels: {
					enabled:false
				}					
				}],

			}
/*dona*/
		
		
		/*$scope.chartTotalCasos = {
			loading : true,
			options: {
				tooltip:{
					enabled:false
				},
				chart: {
					events:{
						redraw:function(){
							//setTimeout(function(){$scope.loadingTotalCasos = false;},100);
							$scope.chartTotalCasos.loading = false;
						}
					},
					type: 'solidgauge',
					//height:300
				},
				//tooltip: { borderColor:'#465769', backgroundColor:'#465769',color:'#ffffff' },
				//height:200,
				credits:{
					enabled:false
				},
				pane: {
					center: ['50%', '50%'],
					size: '100%',
					startAngle: -90,
					endAngle: 90,
					background: {
						backgroundColor:'#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					}
				},

				
				exporting: { 
					//width: 1000,
					chartOptions:{
						width: 2000,
						margin:[100,100,100,100]
					},
					buttons: { 
						contextButton: {
							//text: 'Exportar', 
							menuItems:[{
								textKey : 'downloadPNG',
								text: 'Exportar a PNG',
								onclick : function() {		
									var nombreCorto = 'total_de_casos';
									var nombreCompleto = 'Total de Casos';
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
			},
			series: [{
				data: [vistos],
				dataLabels: {
					enabled:true,
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    style:{
                    	fontWeight: 400
                    },
					format: '<div style="text-align:center; border:0px !important;"><span style="font-size:14px;color:black;">{y} de '+total+' Casos</span><br/>'
				}
			}],
			title: {
				text: $scope.porcentajeTotalCasos+'%',
				//text:' ',
				//y: 0,
				style:{
					fontWeight: 'bold',
					fontSize:'30px'
				}
			},
			xAxis: {
				tickInterval: 500
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
				tickInterval: 1000,
				minorTickInterval: null,
				tickPixelInterval: 400,
				tickWidth: 0,
				labels: {
					y: 16
				}   
			},
			plotOptions: {
				solidgauge: {
					dataLabels: {
						enabled:false,
						y: 5,
						borderWidth: 0,
						useHTML: true
					}
            }            
        	},	
		


		}*/
		
		
		
		//$scope.loadingTotalCasos = false;
		$scope.loadingPromedioCasos = true;
		$scope.tipoPromedioCasos = 'pie';
/*ajusto nombres de elementos de las graficas*/
for(var o in obj){
	if(obj[o].name == 'En Proceso'){
		obj[o].name = 'Atendidos';
	}
	if(obj[o].name == 'Completos'){
		obj[o].name = 'Resueltos';
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

			for(var i in data_graf_descartados){
				if(i !== 'total'){
				objDescartados.push({name:i,y:data_graf_descartados[i],color:coloresDescartados[i]});	
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
								}]
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
			var miniatura = '';
			for(var i in data_desem){
				if(data_desem[i].total!==0){
					existe_data++;
					images['<span style="text-align:center";>'+data_desem[i].nombre+'<br><span style="font-weight:bold;">'+data_desem[i].total+' Casos</span></span>'] = (data_desem[i].imagen)?'<br><img src="'+data_desem[i].imagen+'" class="circular--ligero" style="width:30px; height:30px;border-radius:50%;">':'<br><img src="/modules/core/img/usuario-sem-imagem.png" class="circular-ligero" style="width:30px; height:30px;border-radius:50%;">';			
					miniatura = data_desem[i].imagen;
					if((miniatura == '') || (typeof miniatura == 'undefined')){
						miniatura = '/modules/core/img/usuario-sem-imagem.png';
					}								
					var totalPorcentaje = (data_desem[i].total / $scope.totalCasos)*100;
					totalPorcentaje = totalPorcentaje.toFixed(2);
					arr_names.push('<div class="datos-desempeno"><a title="'+data_desem[i].nombre+': '+totalPorcentaje +'% \nAtendidos: '+data_desem[i].respuestas+'\nResueltos: '+data_desem[i].atendidos+'\nDescartados: '+data_desem[i].descartado+'\nTotal: '+data_desem[i].total+'"><img src="'+miniatura+'" class="circular-ligero" style="width:30px; cursor:pointer; height:30px;border-radius:50%; max-width:100px;"></a></div>');	
					//arr_names.push('<div class="datos-desempeno"><a title="'+data_desem[i].nombre+': '+totalPorcentaje +'% \nAtendidos: '+data_desem[i].atendidos+'\nDescartados: '+data_desem[i].descartado+'\nTotal: '+data_desem[i].total+'"><img src="'+miniatura+'" class="circular-ligero" style="width:30px; cursor:pointer; height:30px;border-radius:50%; max-width:100px;"></a></div>');	
					aux_respuestas.push(data_desem[i].respuestas);
					aux_atendidos.push(data_desem[i].atendidos);
					aux_descartado.push(data_desem[i].descartado);
				}
			}
			obj_desem.push({
				name: 'Descartados',
				data: aux_descartado,
				color:'#8ed996'
			});
			obj_desem.push({
				name: 'Resueltos',
				data: aux_atendidos,
				//data: aux_respuestas,
				color:'#f67c01'
			});
			obj_desem.push({
				name: 'Atendidos',
				//data: aux_atendidos,
				data: aux_respuestas,
				color:'#32b9d9'
			});
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
			
			$scope.loadingDesempenio = false;
			
			$scope.chartDesempenio = {
				
    			loading: true,				
				options:{
					chart: {
					    type: 'bar',
					    height: 300,
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
            			enabled:true,
					},		
					plotOptions: {
			
						series: {
							stacking: 'normal',
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
	$http.post('/chartPromedioTiempo',{nombreSistema:nombreSistema,fecha_inicial:$scope.dt,fecha_final:$scope.dt2, tipo: opcion}).success(function(data_promedio_tiempo){
		$scope.chartPromedioTiempo = data_promedio_tiempo;
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
				enabled : true
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
			rangeSelector : {
				selected : 4,
				inputEnabled : false,
				buttonTheme : {
					visibility : 'hidden'
				},
				labelStyle : {
					visibility : 'hidden'
				}
			}
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
				if(action == 'create'){
					//console.log('create');
					$scope.palabras = hashtags.concat(mentions,keywords);
					$(elemento).jQCloud($scope.palabras, { autoResize: true,  height: 350,  shape: 'circle'});
					$scope.mostrarNubeTerminos = true;
					$(elemento).jQCloud('update',$scope.palabras);	
				}
				if(action == 'update'){
					//console.log('update');
					palabras =hashtags.concat(mentions,keywords);
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

}]).controller('ModalAccountCtrl', function ($scope, $modal,$location, $log,$resource,Authentication) {
	
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
})
    .controller('ModalAccountInstanceCtrl',function ($scope, $modalInstance, id_cuenta,$resource,$http,Accounts,Authentication) {
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
})
	.directive('scroll', function ($window) {
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
    })
.directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
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
})
    
    
  

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
