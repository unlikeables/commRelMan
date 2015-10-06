
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
