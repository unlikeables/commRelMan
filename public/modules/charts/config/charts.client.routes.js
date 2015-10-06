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