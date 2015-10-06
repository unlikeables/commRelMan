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
