'use strict';

module.exports = {
	app: {
		title: 'Likeable CRM',
		description: 'App para administrar redes sociales y community managers',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 8080,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/modules/core/css/font-awesome-4.3.0/css/font-awesome.css',
				/*'public/lib/bootstrap/dist/css/bootstrap-theme.css',*/
				'public/lib/ngDialog/css/ngDialog.min.css',
				'public/modules/core/css/animate.css',
				'public/lib/jQCloud/dist/jqcloud.min.css'
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/modules/core/js/angular-locale_es-es.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/jquery/dist/jquery.min.js',
				'//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js',
				'public/lib/ngDialog/js/ngDialog.min.js',
				'public/lib/socket.io-client/socket.io.js',
				'public/lib/angular-socket-io/socket.min.js',
				'public/lib/lodash/lodash.min.js',
				'public/lib/angular-gettext/dist/angular-gettext.js',
				
				'public/lib/jQCloud/dist/jqcloud.min.js',
				'public/lib/highcharts-ng/dist/highcharts-ng.js',
				'public/lib/highcharts-release/adapters/standalone-framework.js',
				'public/lib/highcharts-release/highstock.js',
				//'public/lib/highcharts-release/highcharts.js',
				'public/lib/highcharts-ng/src/highcharts-ng.js',
				//'public/modules/core/js/hmaps/js/highmaps.js',
				'public/modules/core/js/hmaps/js/modules/map.js',
				'public/modules/core/js/hmaps/js/modules/exporting.js',
				
				'//code.highcharts.com/maps/modules/map.js',
				'//code.highcharts.com/mapdata/countries/mx/mx-all.js',
				'//code.highcharts.com/mapdata/custom/world.js',
				'//cdnjs.cloudflare.com/ajax/libs/jquery.isotope/2.2.0/isotope.pkgd.min.js',
				'public/lib/angular-img-fallback/angular.dcb-img-fallback.min.js',
				//'public/modules/core/js/functions.js'

			]
		},
		css: [
			//'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
