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