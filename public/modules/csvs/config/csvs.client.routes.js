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