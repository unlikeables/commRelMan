'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var csvs = require('../../app/controllers/csvs');

	// Csvs Routes
	app.route('/csvs')
		.get(csvs.list)
		.post(users.requiresLogin, csvs.create);

	app.route('/generaArchivo')
	   .post(csvs.generaArchivo);

	app.route('/generaCsv')
		.post(csvs.generaCsv);

	app.route('/csvs/:csvId')
		.get(csvs.read)
		.put(users.requiresLogin, csvs.hasAuthorization, csvs.update)
		.delete(users.requiresLogin, csvs.hasAuthorization, csvs.delete);

	// Finish by binding the Csv middleware
	app.param('csvId', csvs.csvByID);
};