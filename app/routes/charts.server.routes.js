'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var charts = require('../../app/controllers/charts');

	app.route('/chartPromedioCasos')
		.post(charts.chartPromedioCasos);

	app.route('/chartDescartados')
		.post(charts.chartDescartados);

	app.route('/chartDesempenio')
		.post(charts.chartDesempenio);

	app.route('/chartPromedioRespuesta')
		.post(charts.chartPromedioRespuesta);

	app.route('/chartDatosCuenta')
		.post(charts.chartDatosCuenta);

	app.route('/chartPromedioTiempo')
		.post(charts.chartPromedioTiempo);

	app.route('/chartDesempenioHora')
		.post(charts.chartDesempenioHora);

	app.route('/chartNivelServicio')
		.post(charts.chartNivelServicio);

	app.route('/chartTwit')
		.post(charts.chartTwit);	

	app.route('/chartSentiment')	
		.post(charts.chartSentiment);

    app.route('/getStringTagCloud')
    	.get(charts.getStringTagCloud);	

    app.route('/getStringTagCloudEspecialTwitter')
    	.get(charts.getStringTagCloudEspecialTwitter);	

	app.route('/getDescartados')
		.post(charts.getDescartados);

	app.route('/chartRating')
		.post(charts.chartRating);

	app.route('/chartTopTemas')
		.post(charts.chartTopTemas);

	app.route('/chartTopSubtemas')
		.post(charts.chartTopSubtemas);

	app.route('/chartFacebookEngagement')
		.post(charts.chartFacebookEngagement);
};