'use strict';
module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var accounts = require('../../app/controllers/accounts');
    var feeds = require('../../app/controllers/feeds');


    app.route('/get5PublicacionesFB')
    .post(feeds.get5PublicacionesFB);

    app.route('/get5PublicacionesTW')
    .post(feeds.get5PublicacionesTW); 

    // Accounts Routes
    app.route('/accounts')
	.get(accounts.list)
	.post(users.requiresLogin, accounts.create)
	.delete(users.requiresLogin, accounts.hasAuthorization, accounts.delete);
    app.route('/accounts/:accountId')
	.get(accounts.read)
	.put(users.requiresLogin, accounts.hasAuthorization, accounts.update)
	.delete(users.requiresLogin, accounts.hasAuthorization, accounts.delete);
    /*
    app.route('/accounts/facebook/callback')
	.get(accounts.facebookGet)
	.post(accounts.facebookPost);
     */

    // Finish by binding the Account middleware
    app.param('accountId', accounts.accountByID);
    //app.route('/getDirectMessages').
    //post(accounts.getInbox);
    app.route('/cuentas/get/:cuentaId')
	.get(accounts.getTwUni);

    // app.param('cuentaId', accounts.getTw);
    app.route('/getDataTwitter').post(accounts.getInfoTwitter);
    app.route('/cuentas/getTemas/:tema')
	.get(accounts.getTemas);
    app.param('tema', accounts.getTemas);
    
    app.route('/dataAccount').post(accounts.dataUpload);
    
    app.route('/cuentas/getTemas')
	.put(accounts.updateTema)
	.post(accounts.creaTema);
    
    app.route('/agregaMonitoreo')
	.post(accounts.agregaMonitoreo);
    
    app.route('/eliminaMonitoreo')
	.post(accounts.eliminaMonitoreo);

    app.route('/insertTrackers')
    .post(accounts.insertTrackers);

    app.route('/eliminaTrackers')
    .post(accounts.eliminaTrackers);
    
    /*
    app.route('/getContenidosVarios')
	.get(accounts.getVariousContents);
     */

    app.route('/getLongToken')
	.get(accounts.getLongToken);
    
    //Rutas que sirve para obtener los temas y substemas 
    /*app.route('/getTemasPantalla/:cuenta')
     .post(accounts.getTemasPantalla);
     app.param('cuenta', accounts.getTemasPantalla);
     
     app.route('/getResTemas')
     .post(accounts.solicitaRespuestasTema);
     
     app.route('/getResSubtemas')
     .post(accounts.solicitaRespuestasSubtema);*/
    
    //Fin de rutas para menu de Temas & Subtemas

    // app.param('idCuenta',accounts.getPostFb);
    
    app.route('/cuentas/getRespuestasTemas')
    // .put(accounts.updateTema)
        .post(accounts.solicitaRespuestasTema);
    
    app.route('/cuentas/getRespuestasSubtemas')
    // .put(accounts.updateTema)
        .post(accounts.solicitaRespuestasSubtema);
    
    app.route('/cuentas/insertRespuesta')
    // .put(accounts.updateTema)
	.post(accounts.insertaRespuesta);
    
    app.route('/setSub').
	post(accounts.creaSubtema);
    
    app.route('/conectFacePage').
	post(accounts.guardaFacePage);
    
    app.route('/deleteFBAccount').
	post(accounts.eliminaFBConnect);
    
    app.route('/connectFBAccount').
	post(accounts.connectFBConnect);
    
    app.route('/desconectaTwitter').
	post(accounts.desconectaTwitter);
    
    app.route('/eliminaListening').
	post(accounts.eliminaListening);

    app.route('/procesapendientes')
	.post(accounts.procesaPendientes);

    app.route('/eliminaCuenta')
    .post(accounts.eliminaCuenta);

    app.route('/informacionCuenta')
    .post(accounts.informacionCuenta);

    app.route('/getDashboard')
    .post(accounts.getDashboard);
};	

