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
};//graficaTags 

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