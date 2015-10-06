'use strict';

// Configuring the Articles module
angular.module('feeds').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Feeds', 'feeds', 'dropdown', '/feeds(/create)?');
		Menus.addSubMenuItem('topbar', 'feeds', 'List Feeds', 'feeds');
		Menus.addSubMenuItem('topbar', 'feeds', 'New Feed', 'feeds/create');
	}
]);