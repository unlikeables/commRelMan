'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users');
	var accounts = require('../../app/controllers/accounts');
	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	app.route('/cuentas')
	.get(users.cuentas);

	app.route('/usuarios')
	.get(users.getUsuariosByAccount);
	
	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/users/AdminPassword').post(users.changePasswordAdmin);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);
	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Accounts Routes
	//auth/list contiene la funcion que devuelve el json de los usuarios registrados
	app.route('/users/list')
	.get(users.hasAuthorization, users.list)
	.post(users.requiresLogin, users.create)
	.delete(users.requiresLogin, users.hasAuthorization, users.delete);

	app.route('/users/list/:userId')
	.get(users.read)
	.put(users.requiresLogin, users.hasAuthorization, users.update)
	.delete(users.requiresLogin, users.hasAuthorization, users.delete);
	// Finish by binding the article middleware
	app.param('userId', users.userByID);

       app.route('/users/listbyaccount/:accId')
        .get(users.listbyaccount);
        app.param('accId', users.usersByAccount);
	
	//Rutas creadas para revisar pendings en facebook
    /*
	app.route('/pendientes')
	.get(users.pendings)
	.post(users.pendings);
     */
	//Ruta para obtener 
	app.route('/listadoEquipo/')
	.post(users.listadoEquipo);

	app.route('/listadoUsuarios/')
	.post(users.listadoUsuarios);

	app.route('/eliminaEquipo/')
	.post(users.eliminaEquipo);

	app.route('/actualizaEquipo/')
	.post(users.actualizaEquipo);

	app.route('/actualizaPerfil')
	.post(users.actualizaPerfil);

	app.route('/actualizaFoto')
	.post(users.actualizaFoto);

	app.route('/nombreCuenta')
	.post(accounts.obtieneNombre);

	app.route('/listAccounts')
	//.post(users.listAccounts);
	.post(accounts.list);
	
	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email','manage_pages','public_profile','publish_actions','publish_pages','read_insights','read_page_mailboxes','user_friends']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));
	
	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
	//Para obtener la marca
	app.route('/marca/:marcaId')
	.get(users.accountRead);
	app.param('marcaId',users.marcaByID);
};
