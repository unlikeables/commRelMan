'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

angular.module(ApplicationConfiguration.applicationModuleName).constant('CONSTANT', {
    host: 'pruebas.likeable.mx', //globales.options_likeable.hostname,
    fbapiversion: '2.4', //globales.fbapiversion,
    csv: 'pruebas-csvs.likeable.mx', //globales.options_likeable_csvs,
    charts: 'pruebas-charts.likeable.mx'
    //urls: $window.globals
});

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

//console.log(globales);