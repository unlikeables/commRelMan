'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var influencers = require('../../app/controllers/influencers');
	
	app.route('/isInfluencer')
		.post(influencers.isInfluencer);

	app.route('/addInfluencer')
		.post(influencers.addInfluencer);
	
	app.route('/getInfluencer')
		.post(influencers.getInfluencer);
	
	app.route('/deleteInfluencer')
		.post(influencers.deleteInfluencer);
	
	app.route('/updateInfluencer')
		.post(influencers.updateInfluencer);

	app.route('/actualizaRangoInfluencers')
		.post(influencers.actualizaRangoInfluencers);

	app.route('/obtieneCuenta')
		.post(influencers.obtieneCuenta);
};