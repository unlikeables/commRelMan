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
