'use strict';

// Configuring the Articles module
angular.module('accounts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Empresas', 'accounts', 'dropdown', '/accounts(/create)?');
		Menus.addSubMenuItem('topbar', 'accounts', 'Listado de las Empresas', 'accounts');
		Menus.addSubMenuItem('topbar', 'accounts', 'Añadir Empresa', 'accounts/create');
	}
]);