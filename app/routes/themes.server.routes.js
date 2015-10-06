'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var themes = require('../../app/controllers/themes');

	app.route('/getTemasPantalla/')
	.post(themes.getTemasPantalla);

	app.route('/getSubtemasPantalla/')
	.post(themes.getSubtemasPantalla);

	app.route('/agregaSubtema/')
	.post(themes.agregaSubtema);

	app.route('/agregaTema/')
	.post(themes.creaTema);

	app.route('/getResTemas/')
	.post(themes.solicitaRespuestasTema);

	app.route('/getResSubtemas/')
	.post(themes.solicitaRespuestasSubtema);

	app.route('/editaTema/')
	.post(themes.editaTema);

	app.route('/editaSubtema/')
	.post(themes.editaSubtema);

	app.route('/editaRespuesta/')
	.post(themes.editaRespuesta);

	app.route('/eliminaTema/')
	.post(themes.eliminaTema);

	app.route('/eliminaSubtema/')
	.post(themes.eliminaSubtema);

	app.route('/eliminaRespuesta/')
	.post(themes.eliminaRespuesta);

	app.route('/insertRespuesta')
    .post(themes.insertaRespuesta);

    app.route('/cloneThemes')
    .get(themes.cloneThemes);
};
