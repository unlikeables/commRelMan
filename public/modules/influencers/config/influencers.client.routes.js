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