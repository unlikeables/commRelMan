'use strict';
var globales = require('../globals.js');
module.exports = {
	db: 'mongodb://localhost/likeable-crm-dev',
	app: {
		title: 'Likeable CRM'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || globales.fb_app_id,
		clientSecret: process.env.FACEBOOK_SECRET || globales.fb_app_secret,
		callbackURL: 'https://'+globales.options_likeable.hostname+'/auth/facebook/callback'
	//	callbackURL: 'http://localhost:8080/auth/facebook/callback'

	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'J6s0rQHWLsD2wJ5LT7ScTerL9',
		clientSecret: process.env.TWITTER_SECRET || 'IEVhbW9qfHGU7nbVS4kNfZFVwkkvGnUZQUOjYjwI8ybNjQjuwi',
		callbackURL: '/auth/twitter/callback'
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
	}
};
