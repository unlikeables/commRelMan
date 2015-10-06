'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
/**
 * Module dependencies.
 */
var bst = require('better-stack-traces').install();
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Account = mongoose.model('User'),
	_ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./users/users.authentication'),
	require('./users/users.authorization'),
	require('./users/users.password'),
	require('./users/users.profile')
);
