'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var feeds = require('../../app/controllers/feeds');

	// Feeds Routes
/*
    app.route('/feeds')
	.get(feeds.list)
	.post(users.requiresLogin, feeds.create);
  */
/*  
    app.route('/feeds/:feedId')
	.get(feeds.read)
	.put(users.requiresLogin, feeds.hasAuthorization, feeds.update)
	.delete(users.requiresLogin, feeds.hasAuthorization, feeds.delete);
*/
    // Finish by binding the Feed middleware
/*
    app.param('feedId', feeds.feedByID);
 */  
    app.route('/respFb')
	.post(feeds.respondePostFb);

    app.route('/nuevoBuzon')
    .get(feeds.nuevoBuzon);

    app.route('/nuevosPosts')
    .get(feeds.nuevosPosts);

    app.route('/nuevosPostsFiltered')
    .get(feeds.nuevosPostsFiltered);

    app.route('/buscar')
    .get(feeds.buscar);

    app.route('/follow')
    .post(feeds.follow);

    app.route('/asignaMensaje')
    .post(feeds.asignaMensaje);

    app.route('/unfollow')
    .post(feeds.unfollow);

    app.route('/guardaFollow')
    .post(feeds.guardaFollow);

    app.route('/isFollow')
    .post(feeds.isFollow);

    app.route('/changeString')
    .get(feeds.changeString);

  app.route('/cambiainbox')
  .get(feeds.cambiaInbox);

    app.route('/totalPendientes')
    .post(feeds.totalPendientes);
    
    app.route('/descartado')
	.post(feeds.insertaDescarte);

    app.route('/descartadoLote')
    .post(feeds.descartaLote);

    app.route('/respondeInbox')
    .post(feeds.respInbox);

    app.route('/respTwit').
    post(feeds.respondeTweet);

    app.route('/respDM')
    .post(feeds.respDM);
    

    app.route('/regresarDescartado')
    .post(feeds.regresarDescartado);

    app.route('/regresarResuelto')
    .post(feeds.regresarResuelto);

/*    app.route('/getContenidos')
    .get(feeds.getContenidos);*/
    
    /*app.route('/feeds/sentminet/:twit')
     .post(feeds.insertSentmiment);
     app.param('twit',feeds.insertSentmiment);*/
    app.route('/sentiment').post(feeds.insertSentiment);

    app.route('/sentiment/cancel').post(feeds.cancelSentiment);
    app.route('/insertaClasificacion').post(feeds.insertClasif);
    app.route('/finalizar').post(feeds.finalizar);

/*    
    app.route('/getAllFb/:identificador')
	.get(feeds.getAllFb);
    app.param('identificador',feeds.getAllFb);
*/
    app.route('/getMailbox/:identificatore')
	.get(feeds.getMailbox);
    app.param('eltipo',feeds.getMailbox);
    app.param('organizacion',feeds.getMailbox);
    app.param('identificatore',feeds.getMailbox);

    app.route('/getMailboxResuelto/:identi')
    .get(feeds.getMailboxResuelto);
    app.param('organizacion',feeds.getMailbox);
    app.param('identi',feeds.getMailboxResuelto);
    app.param('eltipo',feeds.getMailboxResuelto);

    app.route('/getMailboxProceso/:id_proceso')
    .get(feeds.getMailboxProceso);
    app.param('organizacion',feeds.getMailbox);
    app.param('id_proceso',feeds.getMailboxProceso);
    app.param('eltipo',feeds.getMailboxProceso);

    app.route('/getMailboxDescartados/:iden')
    .get(feeds.getMailboxDescartados);
    app.param('organizacion',feeds.getMailbox);
    app.param('iden',feeds.getMailboxDescartados);
    app.param('eltipo',feeds.getMailboxDescartados);
    
    app.route('/getResolved/:id_resolve')
	.get(feeds.getMailboxResuelto);
    app.param('id_resolve',feeds.getMailboxResuelto);

    app.route('/getDescar/:id_descar')
	.get(feeds.getMailboxDescartados );
    app.param('id_descar',feeds.getMailboxDescartados);

    app.route('/getNuevos/:id_nuevos')
	.get(feeds.getCuentaNuevos);
    app.param('id_nuevos', feeds.getCuentaNuevos);
    
    app.route('/getOneContent')
	.get( feeds.getOneContent );

    app.route('/getPostNotificacion')
    .get(feeds.getPostNotificacion);
    
    app.route('/getHistPend')
	.get( feeds.getHistoricoPendientes );

    app.route('/getMoreComplete')
    .get( feeds.getMoreComplete );

    app.route('/getMoreDescartados')
    .get( feeds.getMoreDescartados ); 

    app.route('/getHistorialPosts')
    .get(feeds.getHistorialPosts);
    
     app.route('/getUserData')
    .get(feeds.getUserData);

    //Nueva Ruta para el mailbox
    app.route('/mailbox')
    .get(feeds.obtieneBuzon);
    app.param('tipoBuzon',feeds.obtieneBuzon);
    app.param('eltipo',feeds.obtieneBuzon);
    app.param('organizacion',feeds.obtieneBuzon);
    app.param('idUsuario',feeds.obtieneBuzon);
    app.param('id',feeds.obtieneBuzon);
    app.param('palabra',feeds.obtieneBuzon);

    app.route('/respondeMailbox')
    .post(feeds.respondeMailbox);


};
