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
		})
		.state('filtros',{
			url: '/buzon/:red/:tipo',
			templateUrl: 'modules/feeds/views/buzon.view.html'
		});
	}
]);