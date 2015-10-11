'use strict';
var globales = require('../globals.js');
module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/likeable-crm-dev',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/modules/core/css/font-awesome-4.3.0/css/font-awesome.css',
				/*'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',*/
				'public/lib/ngDialog/css/ngDialog.min.css',
				'public/modules/core/css/animate.css',
				'public/lib/jQCloud/dist/jqcloud.min.css',
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/modules/core/js/angular-locale_es-es.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/jquery/dist/jquery.min.js',
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
				'public/lib/angular-img-fallback/angular.dcb-img-fallback.min.js'
				//'public/modules/core/js/functions.js'
			]
		},
		/*css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'*/
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
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || globales.fb_app_id,
		clientSecret: process.env.FACEBOOK_SECRET || globales.fb_app_secret,
		callbackURL: 'https://'+globales.options_likeable.hostname+'/auth/facebook/callback'
	    /*
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	     */
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'J6s0rQHWLsD2wJ5LT7ScTerL9',
		clientSecret: process.env.TWITTER_SECRET || 'IEVhbW9qfHGU7nbVS4kNfZFVwkkvGnUZQUOjYjwI8ybNjQjuwi',
		callbackURL: '/auth/twitter/callback'
	    /*
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	     */
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/github/callback'
	},
	mailer: {
		from: 'Likeable CRM',
		options: {
		    service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
		    auth: {
			user: process.env.MAILER_EMAIL_ID || 'crm@likeable.mx',
			pass: process.env.MAILER_PASSWORD || 'L1k3@bl3MX*!'
		    }
		}
	    /*
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	     */
	}
};
