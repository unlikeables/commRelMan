'use strict';

/**
 * Module dependencies.
 */
 var https=require('https');
var passport = require('passport'),
	url = require('url'),
	FacebookStrategy = require('passport-facebook').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users');
var resultado={};

module.exports = function() {
	// Use facebook strategy
	passport.use(new FacebookStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			//console.log(profile);
			var adminPages=[];
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
		    console.log(profile);
			var providerUserProfile = {
			    // firstName: profile.name.givenName,
			    // lastName: profile.name.familyName,
			    displayName: profile.displayName,
			    // email: profile.emails[0].value,
			    username: profile.displayName,
			    provider: 'facebook',
			    providerIdentifierField: 'id',
			    providerData: profile._json
			};
			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};
