'use strict';
/**
 * Dependencias del Controlador / Module dependencies.
 */
var _ = require('lodash');
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var http=require('http');
var https=require('https');
var Twit = require('twit');
var comprueba = require('./feeds.server.controller.js');
var imagesize = require('imagesize');

// getUserPageAT(fb_cuenta, idUsuario, nombreSistema, facebookUserId, access_token, function(pat) {
/**
 * Si no hay datos de access_token de twitter en base de datos, 
 * hacemos fallback a estos Default twitter
 */
var tck_def = 'J6s0rQHWLsD2wJ5LT7ScTerL9';
var tcs_def = 'IEVhbW9qfHGU7nbVS4kNfZFVwkkvGnUZQUOjYjwI8ybNjQjuwi';
var tat_def = '1694381664-qUYMFtqtJET7ky0Nnw7etwAYBNIjQFsl7VTfpLj';
var tats_def = 'nPYv16f64w54YTerqk2fGlbGKcefGz2TIBgnNqjLYVfWa';

// Dependencias locales, de base de datos y configuración
var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');
var accesstokens = require('../../config/accesstokens.js');

// Función que obtiene 5 publicaciones de Facebook de la base de datos
exports.get5PublicacionesFB = function(req,res){
  var nombreSistema = req.body.nombreSistema;
  var coleccion = nombreSistema+'_fb_publicaciones';
  classdb.buscarToStreamLimit(coleccion, {}, {}, 5, 'feeds/get5PublicacionesFB', function(items){
    res.jsonp(items);
  });
};

// Función que obtiene 5 publicaciones de Twitter de la base de datos
exports.get5PublicacionesTW = function(req,res){
  var nombreSistema = req.body.nombreSistema;
  var coleccion = nombreSistema+'_propio';
  classdb.buscarToStreamLimit(coleccion, {}, {}, 5, 'feeds/get5PublicacionesFB', function(items){
    res.jsonp(items);
  });
};

// Función que obtiene la ruta a la imagen de perfil de un usuario de la base de datos
exports.getUserData = function(req, res){
	if(req.query.userId){
		if(req.query.userId !== 'direct-facebook' && req.query.userId !== 'null'){
	    	var userId = req.query.userId;
	    	var criterio = {'_id':userId};
	    	var fields = {'imagen_src':1};
    	    classdb.buscarToArrayFields('users', criterio, fields, {}, 'feeds/getUserData', function(items){
				res.jsonp(items);
    		});
    	}
          else {
            res.jsonp('error');
          }
    }
};

/**
 * Feed authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.feed.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};

/**
 * Función que actualiza clasificación y añade respuesta a un mensaje en la base de datos 
 */
exports.respondePostFb = function(req, res){
  var id_cuenta = req.body.id_cuenta;
  var extra = req.body.clas;
  var coleccion = req.body.coleccion;
  var id = req.body.id;
  var criterio = {id:id};
  var set_clas = {clasificacion:{tema:extra.tema,subtema:extra.subtema,user_name:extra.username,user_id:extra.userid}};
  var set_resps = {respuestas:{user_name:extra.username,user_id:extra.userid,texto:decodeURI(req.body.resp),timestamp:new Date(),id_str:req.body.id_str}};
  classdb.actualiza(coleccion, criterio, set_clas, 'feed/respondePostFb.clasificacion', function(updated){
    if (updated === 'error') {
      console.log('error en el update de la clasificacion');
      res.jsonp('error');
    }
    else {
      classdb.actualizaAddToSet(coleccion, criterio, set_resps, 'feed/respondePostFb.ats_respuesta', function(rupdated){
	if (rupdated === 'error') {
	  console.log('error en el update de las respuestas');
	  res.jsonp('error');
	}
	else {
	  res.json(rupdated);
	}
      });
    }
  });
};

// Función para responder los varios mensajes del mailbox
exports.respondeMailbox = function(req, res){
  // Variables que sacamos del body de este post
  var coleccion = req.body.coleccion;
  var tipoRedSocial = req.body.tipoRedSocial;
  var tipoMensajeRedSocial = req.body.tipoMensajeRedSocial;
  var tema = req.body.clasificacion.tema;
  var subtema = req.body.clasificacion.subtema;
  var sentiment = req.body.sentiment;
  var idUsuario = new ObjectID(req.body.usuario._id);
  var idUsuarioStr = req.body.usuario._id;
  var nombreUsuario = req.body.usuario.username;
  var idMensaje = req.body.idMensaje;
  var respuesta = req.body.respuesta;
  var fecha = req.body.timestamp;
  var opcion = req.body.opcion;
  var nombreSistema = req.body.nombreSistema;
  var cuenta = new ObjectID(req.body.account_id);
  var mensaje = req.body.mensaje;
  var conv_id = mensaje.conversation_id;
  var imagenUsuario = req.body.imagenUsuario;
  var facebookUserId = '';
  var access_token = '';
  if(req.body.usuario.additionalProvidersData){
    facebookUserId = req.body.usuario.additionalProvidersData.facebook.id;
    access_token = req.body.usuario.additionalProvidersData.facebook.accessToken;
    var get_data = querystring.stringify({'access_token' : access_token });
  }
  var obj = {};

  /**
   * Guardamos el sentiment de un mensaje
   * @param {string} coleccion nombre de la colección en la que está el mensaje
   * @param {string} sentiment positivo, negativo o neutro
   * @param {string} idMensaje el mongo_id del mensaje que estamos respondiendo
   * @param {string} username username del usuario que responde a este mensaje
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario
   * @return {string} Mandamos en el callback el string 'error' o 'ok'
   * @guardaSentiment
   */
  function guardaSentiment(coleccion, sentiment, idMensaje, username, idUsuario, imagenUsuario, callback){
    var id = new ObjectID(idMensaje);
    var criterio = {'_id':id};
    //var elset = { sentiment:{ 'sentiment_tipo' : sentiment, 'sentiment_user_name' : username, 'sentiment_user_id' : idUsuario, 'sentiment_fecha' : new Date(), 'imagen_usuario' : imagenUsuario }};
    var elset = {
      'sentimiento' :{
	'tipo' : sentiment,
	'user_name' : username, 
	'user_id' : idUsuario, 
	'fecha' : new Date(),
	'imagen_usuario' : imagenUsuario	
      },
      'sentiment' : sentiment,
      'sentiment_user_name' : username, 
      'sentiment_user_id' : idUsuario, 
      'sentiment_fecha' : new Date(),
      'sentiment_imagen_usuario' : imagenUsuario
    };
    classdb.actualiza(coleccion, criterio, elset, 'feeds/respondeMailbox/guardaSentiment', function(respuestaSentiment){
      return callback(respuestaSentiment);
    });
  }

  /**
   * Guardamos la clasificacion de un mensaje
   * @param {string} coleccion nombre de la colección en la que está el mensaje
   * @param {string} tema asignado por el community al mensaje
   * @param {string} subtema asignado por el communtiy al mensaje
   * @param {string} username username del usuario que responde a este mensaje
   * @param {string} idUsuario id en mongo del usuario que responde a este mensaje
   * @param {string} idMensaje el mongo_id del mensaje que estamos respondiendo
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario
   * @return {string} Mandamos en el callback el string 'error' o 'ok'
   * @guardaClasificacion
   */
  function guardaClasificacion(coleccion, tema, subtema, username, idUsuario, idMensaje, imagenUsuario, callback){
    var id = new ObjectID(idMensaje);
    var criterio = {'_id':id};
    var elset = {	
      clasificacion:{
	'tema' : tema,
	'subtema' : subtema,
	'user_name' : username,
	'user_id' : idUsuario,
	'imagen_usuario' : imagenUsuario,
	'fecha' : new Date()
      }
    };
    classdb.actualiza(coleccion, criterio, elset, 'feeds/respondeMailbox/guardaClasificacion', function(respuestaClasificacion){
      return callback(respuestaClasificacion);	
    });
  }

  /**
   * Obtenemos el id de la Página de Facebook para la cuenta en la que está trabajando el usuario
   * @param {string} account_name nombre corto de la cuenta que se está trabjando
   * @param {string} account_id id de mongo de la cuenta en cuestión
   * @return {string} ya sea mandamos la cadena 'error' o el id de facebook de la página conectada a la cuenta
   * @getFacebookPageByCuenta
   */
  function getFacebookPageByCuenta(account_name, account_id, callback){
    var acc_id = new ObjectID(account_id);
    var criterio = {$and : [{ _id : acc_id }, { nombreSistema : account_name }]};
    classdb.buscarToArray('accounts', criterio, {}, 'accounts/procesaPendientes/getFacebookPageByCuenta', function(items){
      if (items === 'error' || items.length < 1) {
	console.log('accounts/procesaPendientes/getFacebookPageByCuenta - hubo error o el arreglo con la cuenta llegó vacío');
	return callback('error');
      }
      else {
	if (items[0].datosPage && items[0].datosPage.id) {
	  return callback(items[0].datosPage.id);
	}
	else {
	  console.log('accounts/procesaPendientes/getFacebookPageByCuenta - si existe la cuenta pero no tiene conectada ninguna cuenta de facebook por RTUs');
	  return callback('error');
	}
      }
    });
  }

  /**
   * Función que manda respuesta a facebook y la guarda en mongo
   * @param {string} coleccion colección en la que hay que guardar la respueta
   * @param {object} post_data objeto de datos que mandar en el post a facebook
   * @param {string} conv_id id de la conversación a la que vamos a responder
   * @param {object} mensaje objeto con el mensaje al que vamos a responder
   * @param {string} nombreUsuario usuario en crm
   * @param {string} idUsuario id de usuario en crm
   * @param {string} respuesta texto de la respuesta que mandamos a facebook
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario
   * @return {string} regresa ok o error
   */
  function respondeInbox (coleccion, post_data, conv_id, mensaje, nombreUsuario, idUsuario, respuesta, imagenUsuario, callback) {
    globales.options_graph.method = 'POST';
    globales.options_graph.path = globales.fbapiversion+conv_id+'/messages';
    globales.options_graph.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Length': post_data.length
    };

    var post_req = https.request(globales.options_graph, function(response) {
		     response.setEncoding('utf8');
		     var resp = [];
		     var id_respuesta_facebook;
		     response.on('data', function (chunk) {
		       resp.push(chunk);
		     });
		     response.on('end', function(){
		      // id_respuesta_facebook = JSON.parse(Buffer.concat(resp));
		       id_respuesta_facebook = JSON.parse(resp);
			if(id_respuesta_facebook.error){
			 id_respuesta_facebook.tipo = 'facebook';
          console.log(JSON.stringify(id_respuesta_facebook))
			     return callback(id_respuesta_facebook);
         //return callback('error');
		       }else{
			 var criterio = {'_id':new ObjectID(mensaje._id)};
			 var eladdtoset = {	
			   respuestas: {
			     'user_name' : nombreUsuario,
			     'user_id' : idUsuario,
			     'texto' : respuesta,
			     'timestamp' : new Date(),
			     'id_respuesta' :id_respuesta_facebook.id,
			     'imagen_usuario' : imagenUsuario
			   }
			 };
			 classdb.actualizaAddToSetcresult(coleccion, criterio, eladdtoset, 'feed/respinbox/responde', function(addedtoset){
        console.log('Se actualizo la respuesta en mongo de inbox FB !!!!!!');
        //console.log(addedtoset)
			   //return callback(addedtoset);
         return callback(mensaje._id);
			 });
		       }
		     });
		   });
    post_req.write(post_data);
    post_req.end();
    post_req.on('error', function(e){
      console.log('feeds/respInbox/responde error: '+e);
      console.log('Error: ' +e.message); 
      console.log( e.stack ); 
//      return callback('error');
      return callback(e);
    });
  }

  /**
   * Función que manda respuesta a facebook y la guarda en mongo
   * @param {string} coleccion colección en la que hay que guardar la respueta
   * @param {string} access_token access_token de la página de facebook
   * @param {object} post_data objeto de datos que mandar en el post a facebook
   * @param {string} conv_id id de la conversación a la que vamos a responder
   * @param {object} mensaje objeto con el mensaje al que vamos a responder
   * @param {string} nombreUsuario usuario en crm
   * @param {string} idUsuario id de usuario en crm
   * @param {string} respuesta texto de la respuesta que mandamos a facebook
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario
   * @return {string} regresa ok o error
   */
  function respondeFacebook(coleccion, access_token, post_data, conv_id, mensaje, nombreUsuario, idUsuario, respuesta, imagenUsuario, callback){
    //    console.log('entramos a la función respondeFacebook');
    var parent = '';
    if(mensaje.parent_comment === mensaje.parent_post){
      parent =  mensaje.id;
    }else{
      parent = ((mensaje.parent_comment)?mensaje.parent_comment:mensaje.id);
    }
    var resp_sin_encode = respuesta;
    var encodedrespuesta = encodeURIComponent(respuesta);
    globales.options_graph.method = 'POST';
    globales.options_graph.path = globales.fbapiversion+parent+'/comments?message='+encodedrespuesta+'&access_token='+access_token;
    delete globales.options_graph.headers;
    var post_req = https.request(globales.options_graph, function(response) {
                     response.setEncoding('utf8');
                     var resp = [];
		     response.on('data', function (chunk) {
		       resp.push(chunk);
		     });
		     response.on('end', function(){
                       // console.log(resp);
                       // console.log(JSON.parse(resp));
                       var id_respuesta_facebook = JSON.parse(resp);
		       // var id_respuesta_facebook = JSON.parse(Buffer.concat(resp));
                       console.log(id_respuesta_facebook);
		       if(id_respuesta_facebook.error){
                         return callback(id_respuesta_facebook);
		       }else{
                         var criterio = {'_id':new ObjectID(mensaje._id)};
                         var eladdtoset = {	
                           respuestas: {
                             'user_name' : nombreUsuario,
                             'user_id' : idUsuario,
                             'texto' : resp_sin_encode,
                             'timestamp' : new Date(),
                             'id_respuesta' :id_respuesta_facebook.id,
                             'imagen_usuario' : imagenUsuario
                           }
                         };
                         classdb.actualizaAddToSetcresult(coleccion, criterio, eladdtoset, 'feed/respinbox/responde', function(addedtoset){
                                                                                                                  return callback(addedtoset);
                         });
                       }
                     });
                   });
    //post_req.write(post_data);
    post_req.end();
    post_req.on('error', function(e){
      console.log('feeds/respInbox/responde error: '+e);
      console.log('Error: ' +e.message); 
      console.log( e.stack );
      console.log('error numero dos');
      return callback(e);
    });
  }

  /**
   * Función que manda respuesta de direct Message a Twitter y la guarda en Mongo
   * @param {string} idMensaje id del mensaje que tenemos guardado en mongo
   * @param {object} accesos_twitter tiene los datos de acceso de twitter
   * @param {string} coleccion nombre de la colección en que se tiene que actualizar la info
   * @param {object} mensaje el tweet completo al que se va a responder
   * @param {string} respuesta texto de la respuesta
   * @param {string} idUsuario id de usuario del crm
   * @param {string} nombreUsuario nombre de usuario del crm
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario del crm
   * @return {string} regresa ok o error
   */
  function respondeDM(idMensaje, accesos_twitter, coleccion, mensaje, respuesta, idUsuario, nombreUsuario, imagenUsuario, callback ){
    var obj = {};
    var item_id = new ObjectID(idMensaje);
    var T  = new Twit({
      'consumer_key' : accesos_twitter.twitter_consumer_key,
      'consumer_secret' : accesos_twitter.twitter_consumer_secret,
      'access_token' : accesos_twitter.twitter_access_token,
      'access_token_secret' : accesos_twitter.twitter_access_token_secret
    });
    var parametros_twitter = {
      'user_id' : mensaje.sender.id_str, 
      'screen_name' : mensaje.sender.screen_name, 
      'text' : respuesta
    };
    T.post('direct_messages/new', parametros_twitter, function(err_twit, reply) {
      if(err_twit){
	obj.error = err_twit; obj.tipo = 'twitter'; console.log(JSON.stringify(obj));
	return callback(obj);
      } else {
	var criteriou = {'_id' : item_id};
	var addtosetu = {
	  respuestas : {
	    'user_name' : nombreUsuario,
	    'user_id' : idUsuario,
	    'texto' : reply.text,
	    'timestamp' : new Date(),
	    'id_respuesta' : reply.id,
	    'imagen_usuario' : imagenUsuario
	  }
	};
	classdb.actualizaAddToSetcresult(coleccion, criteriou, addtosetu, 'feed/respInbox', function(addedtoset){
	    return callback(addedtoset);
	});	
      }
    });	    
  }

  /**
   * Función que manda respuesta a twitter y la guarda en mongo
   * @param {string} idMensaje id del mensaje que tenemos guardado en mongo
   * @param {object} accesos_twitter tiene los datos de acceso de twitter
   * @param {string} coleccion nombre de la colección en que se tiene que actualizar la info
   * @param {object} mensaje el tweet completo al que se va a responder
   * @param {string} respuesta texto de la respuesta
   * @param {string} idUsuario id de usuario del crm
   * @param {string} nombreUsuario nombre de usuario del crm
   * @param {string} imagenUsuario ruta a la imagen de perfil del usuario del crm
   * @return {string} regresa ok o error
   */
  function respondeTweet(idMensaje, accesos_twitter, coleccion, mensaje, respuesta, idUsuario, nombreUsuario, imagenUsuario, callback){
    var obj = {};
    var item_id = new ObjectID(idMensaje);
    var T  = new Twit({
      'consumer_key'        : accesos_twitter.twitter_consumer_key,
      'consumer_secret'     : accesos_twitter.twitter_consumer_secret,
      'access_token'        : accesos_twitter.twitter_access_token,
      'access_token_secret' : accesos_twitter.twitter_access_token_secret
    });
    T.post('statuses/update', {'status': respuesta, 'in_reply_to_status_id' : mensaje.id_str, 'wrap_links':'true' }, function(error_twit, reply) {
      if(error_twit){
        console.log('ERROR DE TWITTER');
        console.log(error_twit);
	obj.error = error_twit; obj.tipo = 'twitter'; console.log(JSON.stringify(obj));
	return callback(obj);
      }else{
	var criteriou = {'_id' : item_id};
	var eladdtoset = {
	  respuestas : {
	    'user_name' : nombreUsuario,
	    'user_id' : idUsuario,
	    'texto' : reply.text,
	    'timestamp' : new Date(),
	    'id_respuesta' : reply.id_str,
	    'imagen_usuario' : imagenUsuario
	  }
	};
	classdb.actualizaAddToSet(coleccion, criteriou, eladdtoset, 'feeds/respondeTweet', function(larespuesta){
	  return callback(larespuesta);
	});
      }
    });
  }

  function erroresFacebook(data, callback){
    if(data.error.code === 100 || data.error.code === 1705){
        return callback('Este post ya fue eliminado por el usuario');
    }else if(data.error.code === 190){
        return callback('No tienes permiso para contestar esta publicacion');
    }else{
      switch(data.error.message){          
        case 'The access token could not be decrypted':
          return callback('Error de acceso: Favor de volverte a firmar en Facebook');
        break;
                
      case 'No administras esta pagina':
       return callback('No cuentas con permisos para administrar esta página y no puedes responder');
      break;

      case 'Error en respuesta de facebook, intenta mas tarde':
        return callback('Error en respuesta de facebook, intenta mas tarde');
      break;

      case '(#200) Permissions error':
        return callback('El mensaje no se ha podido responder tal vez haya sido eliminado de Facebook');
      break;
                
      default:
        return callback('Error desconocido favor de contactar al administrador');
      }
    }
  }



  // Aquí llamamos cada una de las funciones declaradas más arriba que nos sirven para actualizar el sentiment y la clasificacion
  guardaSentiment(coleccion, sentiment, idMensaje, nombreUsuario, idUsuario, imagenUsuario, function(mensajeSentiment){
    if(mensajeSentiment === 'error'){
      console.log('Error al actualizar el sentiment');
    }
    guardaClasificacion(coleccion, tema, subtema, nombreUsuario, idUsuario, idMensaje, imagenUsuario, function(mensajeClasificacion){
      if(mensajeClasificacion === 'error'){
	       console.log('Error al actualizar clasificacion');
      }
    });
  });

  if(tipoRedSocial === 'facebook'){
    if (respuesta.length !== 0) {
      // Si es facebook y la respuesta no viene vacía conseguimos la página
      getFacebookPageByCuenta(nombreSistema, cuenta, function(fb_cuenta){
        if (fb_cuenta === 'error') {
	         console.log('accounts/procesapendientes.main - no conseguimos la cuenta con id de facebook válido');
	         res.jsonp('error');
        }else {
          // Conseguimos el access_token de la página 
          accesstokens.obtienePagATByUsrAT(nombreSistema, fb_cuenta, idUsuarioStr, facebookUserId, access_token, 'no', function(pat){
	         if (pat === 'error'){
	           obj = { 'error': { name:'errorPageAT', 'message' : 'Error de conexión o No administras esta pagina' }, 'tipo' : 'facebook' };
	           res.jsonp(obj);
	         }else {
              if(tipoMensajeRedSocial === 'facebook_inbox'){
                // Y si es inbox respondemos inbox
		            var post_data = querystring.stringify({ message : respuesta, access_token: pat });
		            respondeInbox(coleccion, post_data, conv_id, mensaje, nombreUsuario, idUsuario, respuesta, imagenUsuario, function(respfbi){
		              if (respfbi.error) {
                    console.log('Hay un error en inbox');
                    console.log(respfbi);
                    console.log('\n\n');
                    erroresFacebook(respfbi, function(mensaje){
                      obj = {'error': {name: 'errorRespInbox', message: mensaje}, 'tipo': 'facebook'};
                      console.log(obj);
                      res.jsonp(obj);
                    });
		              }else {
                    console.log('Retornando la respuesta de la solicitud respInbox !!!');
                    console.log(respfbi);
		                res.jsonp(respfbi);
		              }
		            });
              }else {
                // O si es otro tipo lo respondemos con un comment
                console.log('intentando responder por acá...');
		            var post_data = querystring.stringify({ message : respuesta, access_token: pat });
		            respondeFacebook(coleccion, pat, post_data, conv_id, mensaje, nombreUsuario, idUsuario, respuesta, imagenUsuario, function(respfb){
                  if (respfb.error) {
                    erroresFacebook(respfb, function(mensaje){
                      obj = {'error': {name: 'errorRespFacebook', message: mensaje}, 'tipo': 'facebook'};
                      console.log(obj);
                      res.jsonp(obj);
                    });
		              }else {
		                res.jsonp(respfb);
		              }
		            });
              }
	         }
        });
      }
    });
  }else {
      // respuesta viene vacía, no mandamos nada a ningún lado
      res.jsonp(1);
    }
  } else if(tipoRedSocial === 'twitter'){
    if (tipoMensajeRedSocial === 'tracker') {
      // Los trackers no se responden, solo se registra el sentiment / clasificacion
      res.jsonp(1);        
    }
    else {
      if (respuesta.length !== 0) {
        // Ahora que si es twitter y la respuesta no viene vacía obtenemos datos de Twitter y mandamos respuesta
        var item_id = new ObjectID(idMensaje);
        classdb.buscarToArray('accounts', {'_id' : cuenta}, {}, 'feeds/respondeDM', function(items){
          if (items === 'error') {
            // Si hubo un error al conseguir los datos mandamos el error
	    obj = {'error': {name: 'errorFindAccount', message: 'feeds/respInbox - buscamos Cuenta pero algo malo pasó'}};
	    return callback(obj);
          }
          else {
            // De lo contrario llenamos la variable de datos de acceso y continuamos
	    var accesos_twitter = items[0].datosTwitter;
            // Si no es un tracker revisamos si tenemos los datos de acceso necesarios para responder
            if (accesos_twitter.twitter_consumer_key !== '') {
              if (tipoMensajeRedSocial === 'direct_message') {
                // Si es direct Message lo mandamos a la función correspondiente
                respondeDM(idMensaje, accesos_twitter, coleccion, mensaje, respuesta, idUsuario, nombreUsuario, imagenUsuario, function(respuestaDM){		
	          res.jsonp(respuestaDM);
	        });        
              }
              else {
                // Debe ser un tweet, lo mandamos a respondeTweet
	        respondeTweet(idMensaje, accesos_twitter, coleccion, mensaje, respuesta, idUsuario, nombreUsuario, imagenUsuario, function(respuestaTwitter){		
	          console.log(respuestaTwitter);
            res.jsonp(respuestaTwitter);
	        });
              }
            }
            else {
              // Si no tenemos los datos de acceso de Twitter mandamos el error
              console.log('feeds/respInbox/respondeTweets - Error: no obtuvimos datos para publicar en twitter');
              var obj = {error: {name: 'errorSinPermisosDeTwitter', message:'No tienes permisos para responder a esta cuenta'}, code: 8082};
              return callback(obj);
            }
          }
        });
      }
      else {
        // respuesta venía vacía, no hacemos nada
        res.jsonp(1);
      }
    }
  }
};

exports.respondeTweet = function(req, res){
    var item_id = '', cuenta_id = '', coleccion = '', extra = '';
    if (typeof req.body.item_id !== 'undefined') { item_id = new ObjectID(req.body.item_id); }
    if (typeof req.body.id_cuenta !== 'undefined') { cuenta_id = new ObjectID(req.body.id_cuenta); }
    if (typeof req.body.coleccion !== 'undefined') { coleccion = req.body.coleccion; }
    if (typeof req.body.clas !== 'undefined') { extra = req.body.clas; }
    if (coleccion === '') {
	console.log( 'Error, no recibimos todos los datos en el post' );
	res.jsonp( 'Error, no recibimos todos los datos en el post' );
    }
    else {
	var criterioc = { '_id' : cuenta_id };
	classdb.buscarToArray('accounts', criterioc, {}, 'feeds/respondeTweet', function(cuenta) {
	    if (cuenta === 'error') {
		res.jsonp(cuenta);
	    }
	    else {
		var accesos_twitter = cuenta[0].datosTwitter;
		if (accesos_twitter.twitter_consumer_key !== '') {
		    var T  = new Twit({
			'consumer_key'        : accesos_twitter.twitter_consumer_key,
			'consumer_secret'     : accesos_twitter.twitter_consumer_secret,
			'access_token'        : accesos_twitter.twitter_access_token,
			'access_token_secret' : accesos_twitter.twitter_access_token_secret
		    });
		    T.post('statuses/update', {'status': req.body.respuesta, 'in_reply_to_status_id':req.body.id_str, 'wrap_links':'true' }, function(error_twit, reply) {
			if(error_twit){
			  console.log('Error en respuesta twitter');
                          console.log(error_twit);
			  res.jsonp(error_twit);
			}else{
			    var criteriou = {'_id':item_id};
			    var elset = { clasificacion : {tema : extra.tema, subtema : extra.subtema, user_name : extra.username, user_id : extra.userid }};
			    classdb.actualiza(coleccion, criteriou, elset, 'feeds/respondeTweet', function(laclasificacion){
				if (laclasificacion === 'error') {
				    res.jsonp(laclasificacion);
				}
				else {
				    var eladdtoset = {respuestas:{user_name:extra.username,user_id: extra.userid,texto:decodeURI(reply.text),timestamp: new Date(),id_respuesta:reply.id_str}};
				    classdb.actualizaAddToSet(coleccion, criteriou, eladdtoset, 'feeds/respondeTweet', function(larespuesta){
					res.jsonp(larespuesta);
				    });
				}
			    });
			}
		    });
		}
		else {
		    console.log('feeds/respondeTweet - Error: por algún motivo no obtuvimos datos para publicar en twitter');
		    var obj = {code: 8082,message:'No tienes permisos para responder a esta cuenta'};
		    res.jsonp(obj);
		}
	    }
	});
    }
};

/*
  _                     _        _____                           _       
 (_)                   | |      |  __ \                         | |      
  _ _ __  ___  ___ _ __| |_ __ _| |  | | ___  ___  ___ __ _ _ __| |_ ___ 
 | | '_ \/ __|/ _ \ '__| __/ _` | |  | |/ _ \/ __|/ __/ _` | '__| __/ _ \
 | | | | \__ \  __/ |  | || (_| | |__| |  __/\__ \ (_| (_| | |  | ||  __/
 |_|_| |_|___/\___|_|   \__\__,_|_____/ \___||___/\___\__,_|_|   \__\___|
                                                                         
*/
//Método que realiza la actualización del Descarte de algún mensaje
exports.insertaDescarte=function(req,res){
    function getFacebookPageByCuenta(account_name, account_id, callback){
		var acc_id = new ObjectID();//account_id);
		var criterio =  { nombreSistema : account_name };
		classdb.buscarToArray('accounts', criterio, {}, 'accounts/procesaPendientes/getFacebookPageByCuenta', function(items){
	    	if (items === 'error') {
				return callback(items);
	    	}else {
				if (items.length < 1) {
		    		console.log('accounts/procesaPendientes/getFacebookPageByCuenta - arreglo con la cuenta llegó vacío... raro');
		    		return callback('error');
				}else {
		    		if (typeof items[0].datosPage !== 'undefined' && typeof items[0].datosPage.id !== 'undefined') {
						var page_id = items[0].datosPage.id;
						return callback(page_id);
		    		}else {
						console.log('accounts/procesaPendientes/getFacebookPageByCuenta - si hubo cuenta pero no hay datosPage, tal vez datosMonitoreo o solo twitter');
						return callback('error');
		    		}
				}
	    	}
		});
    }   

    function borraPost(item, post_data, callback){
		globales.options_graph.method = 'DELETE';
		globales.options_graph.path = globales.fbapiversion+item;
		globales.options_graph.headers = {
	    	'Content-Type': 'application/x-www-form-urlencoded',
	    	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	    	'Content-Length': post_data.length
		};
	
		//console.log(options_graph);
		var post_req = https.request(globales.options_graph, function(response) {
	    	response.setEncoding('utf8');
	    	var resp = [];
	    	var id_respuesta_facebook;
	    	response.on('data', function (chunk) {
				resp.push(chunk);
	    	});
	    	response.on('end', function(){
			//	id_respuesta_facebook = JSON.parse(Buffer.concat(resp));
				id_respuesta_facebook = JSON.parse(resp);
				//console.log('RESPONSE !'); console.log(id_respuesta_facebook);
				return callback(id_respuesta_facebook);
	    	});
		});
		post_req.write(post_data);
		post_req.end();
		post_req.on('error', function(e){
	    	console.log('feeds/respInbox/responde error: '+e);
	    	console.log('Error: ' +e.message); 
	    	console.log( e.stack );
	    	return callback('error');
		});
    }
    var imagenUsuario = req.body.imagenUsuario;
    var idUsuario=req.body.idUsuario;
    var username=req.body.username;
    var cuenta=req.body.cuenta;
    var motivo=req.body.descartado;
    var coleccion=req.body.coleccion;
    var eliminar = req.body.eliminar;
    var razon_eliminar = req.body.razon_eliminar;
    var id = new ObjectID(req.body.idPost);
    var fbuserid = req.body.fb_usid;
    var uat = req.body.fb_usat;
    var nsist = req.body.nombreSistema;
    var id_fb_post = req.body.id_fb_post;
    var caso;
    var elcriterio = { _id : id };
    var obj = {};
    //Validación que nos ayuda a saber si eliminar el mensaje en facebook o no
    if(eliminar === true){

    	if (coleccion !== '' && cuenta !== '' && uat !== '' ) {
	    getFacebookPageByCuenta(nsist, cuenta, function(fb_cuenta){
		if (cuenta === 'error') {
		    console.log('accounts/procesapendientes.main - no conseguimos la cuenta con id de facebook válido');
		    res.jsonp('error');
		} else {
                  accesstokens.obtienePagATByUsrAT(nsist, fb_cuenta, idUsuario, fbuserid, uat, 'no', function(pat){
			if(pat === 'error-face'){
			    obj = {'errorface':'Facebook no responde por el momento, intenta más tarde.'};
			}
			if (pat === 'error'){
			    //obj = {'error': 'feed/respInbox - no conseguimos page access_token'};
			    obj = {'error': 'noPage_access_token'};
			    res.jsonp(obj);
			}else {
			    var post_data = querystring.stringify({access_token: pat});
			    var elset;
			    borraPost(id_fb_post, post_data, function(respfb){
				if (respfb.error) {
				    if(respfb.error.message === '(#1705) Selected wall post for deletion does not exist.'){
					if(razon_eliminar){
					    elset = {
					    	descartado : { 
					    	    'motivo' : motivo, 
					    	    'usuario' : username, 
					    	    'idUsuario' : idUsuario, 
					    	    'fecha' : new Date(),
					    	    'usuario_foto' : imagenUsuario,
					    	    razon_eliminar : razon_eliminar
					    	},
					    	eliminado : 1
					    };
					}else{
					    elset = {
					    	descartado : { 
					    	    'motivo' : motivo, 
					    	    'usuario' : username, 
					    	    'idUsuario' : idUsuario, 
					    	    'fecha' : new Date(),
						    'usuario_foto' : imagenUsuario
					    	},
					    	eliminado:1
					    };
					}
					classdb.actualiza(coleccion, elcriterio, elset, 'feeds/insertaDescarte', function(descartao){
					    if (descartao === 'error') {
						res.jsonp(2);
					    }else {
						res.jsonp(3);
					    }
					});
				    }else if(respfb.error.message === '(#100) This post could not be loaded'){
					obj = {'error': 'post_noEncontrado'};
					res.jsonp(obj);
				    }else if(respfb.error.message === '(#200) Permissions error'){
					obj = {'error': 'contenido_noEncontrado'};
					res.jsonp(obj);
				    }else if(respfb.error.message === '(#200) Users can only delete their own comments'){
					obj = {'error': 'sinPermisos'};
					res.jsonp(obj);
				    }else{
				    	obj = {'error': 'feed/respInbox - hicimos post pero algo malo pasó'};
				    	console.log(respfb);
				    	res.jsonp(respfb);
				    }
				}else {
				    if(respfb.success) {
					if(razon_eliminar){
					    elset = {
					    	descartado : { 
					    	    'motivo' : motivo, 
					    	    'usuario' : username, 
					    	    'idUsuario' : idUsuario, 
					    	    'fecha' : new Date(),
					    	    'usuario_foto' : imagenUsuario,
					    	    razon_eliminar : razon_eliminar
					    	},
					    	eliminado : 1
					    };
					}else{
					    elset = {
					    	descartado : { 
					    	    'motivo' : motivo, 
					    	    'usuario' : username, 
					    	    'idUsuario' : idUsuario, 
					    	    'fecha' : new Date(),
						    'usuario_foto' : imagenUsuario
					    	},
					    	eliminado:1
					    };
					}
					classdb.actualiza(coleccion, elcriterio, elset, 'feeds/insertaDescarte', function(descartao){
					    if (descartao === 'error') {
						res.jsonp(2);
					    }else {
						res.jsonp(3);
					    }
					});
				    }
				    else {
					res.jsonp(2);
				    }
				}
			    });
			}	
		    });
		}
	    });
	}else{
	    	console.log('feeds/respInbox.main -  no recibimos los datos necesarios para esta operación');
	    	res.jsonp('error');
		}
    }else{
    	var elset = {
    		descartado : { 
    			'motivo' : motivo, 
    			'usuario' : username, 
    			'idUsuario' : idUsuario, 
    			'fecha' : new Date(),
				'usuario_foto' : imagenUsuario
    		}
    	};
    	var eliminacion = {
    		descartado : 1, 
    		atendido : 1,
    		sentiment : 1,
    		sentiment_user_name : 1,
    		sentiment_user_id : 1,
    		sentiment_fecha : 1,
    		sentiment_imagen_usuario : 1,
    		sentimiento : 1,
    		clasificacion : 1
   		};

	    classdb.actualizaUnsetDelete(coleccion, elcriterio, eliminacion, 'feeds/insertaDescarte/eliminaCampos', function(mensajeEliminado){
	    	if(mensajeEliminado === 'error'){
	    		console.log(mensajeEliminado);
	    		res.jsonp(2);
	    	}else{
				classdb.actualiza(coleccion, elcriterio, elset, 'feeds/insertaDescarte', function(descartao){
		    		if (descartao === 'error') {
		    			console.log('Ocurrió un error al actualizar el Descarte');
						res.jsonp(2);
		    		}else {
						res.jsonp(3);
		    		}
				});    	
			}    	
	    });
		/*classdb.actualiza(coleccion, elcriterio, elset, 'feeds/insertaDescarte', function(descartao){
	    	if (descartao === 'error') {
	    		console.log('Ocurrió un error al actualizar el Descarte');
				res.jsonp(2);
	    	}else {
				res.jsonp(3);
	    	}
		});*/
    }
};



exports.descartaLote = function(req, res){
	var imagenUsuario = req.body.imagenUsuario;
	var idUsuario=req.body.idUsuario;
    var username=req.body.username;
    var cuenta=req.body.cuenta;
    var motivo=req.body.descartado;
    var coleccion=req.body.coleccion;
    var nsist = req.body.nombreSistema;
    var lote = req.body.lote;
    var caso;
    var obj = {};
    console.log('El lote es: ');
    console.log(lote)


  function descarta(id,cback){

    var lid =new ObjectID(id);
    var elcriterio = {_id: lid};
    var elset = {
      descartado : { 
    	'motivo' : motivo, 
    	'usuario' : username, 
    	'idUsuario' : idUsuario, 
    	'fecha' : new Date(),
    	'usuario_foto' : imagenUsuario
      }
    };

    classdb.actualiza(coleccion, elcriterio, elset, 'feeds/insertaDescarte', function(descartao){
      if (descartao === 'error') {
	console.log('Ocurrió un error al actualizar el Descarte');
	cback(descartao);
      }else {
	cback(descartao);
      }
    });
  }

  function empiezaDescarte(lote, index, respuesta, cback){

    var more = index +1;
    if(more <= lote.length){
      //descarta(lote[index]._id, function(resp){
        descarta(lote[index], function(resp){
    			          if(resp  !== 'error'){
    				    //respuesta.push(lote[index]._id);
                respuesta.push(lote[index]);
    			          }
    			          empiezaDescarte(lote, more, respuesta, cback);
    		                });
    }else{
      cback(respuesta);
    }
  }

  empiezaDescarte(lote,0,[],function(respuesta){
    res.jsonp(respuesta);
  });
};
/*
                 _   _                     _        _____                           _       
                | | (_)                   | |      |  __ \                         | |      
   ___ _ __   __| |  _ _ __  ___  ___ _ __| |_ __ _| |  | | ___  ___  ___ __ _ _ __| |_ ___ 
  / _ \ '_ \ / _` | | | '_ \/ __|/ _ \ '__| __/ _` | |  | |/ _ \/ __|/ __/ _` | '__| __/ _ \
 |  __/ | | | (_| | | | | | \__ \  __/ |  | || (_| | |__| |  __/\__ \ (_| (_| | |  | ||  __/
  \___|_| |_|\__,_| |_|_| |_|___/\___|_|   \__\__,_|_____/ \___||___/\___\__,_|_|   \__\___|
                                                                                            
*/

exports.activaBloqueo = function(req, res){

};

exports.regresarEntrada = function(req, res){
	var id = new ObjectID(req.body.mensaje._id);
	var coleccion = req.body.col;
	var criterio = {'_id' : id};
	var ellimit = 1;
    var elset = {
    	descartado : 1, 
    	atendido : 1,
    	sentiment : 1,
    	sentiment_user_name : 1,
    	sentiment_user_id : 1,
    	sentiment_fecha : 1,
    	sentiment_imagen_usuario : 1,
    	sentimiento : 1,
    	clasificacion : 1,
    	respuestas : 1
   	};

    classdb.actualizaUnsetDelete(coleccion, criterio, elset, 'feeds/regresarEntrada', function(actualizado){
    	if(actualizado === 'error'){
    		console.log('error');
    		res.jsonp('error');
    	}else{
    		res.jsonp({ok : 'actualizado'});
    	}    	
    });
};

/*                ______        _ _ _                                             
             _   |  ___ \      (_) | |                       _               _    
  ____  ____| |_ | | _ | | ____ _| | | _   ___ _   _     ___| |_  ____  ____| |_  
 / _  |/ _  )  _)| || || |/ _  | | | || \ / _ ( \ / )   /___)  _)/ _  |/ ___)  _) 
( ( | ( (/ /| |__| || || ( ( | | | | |_) ) |_| ) X (   |___ | |_( ( | | |   | |__ 
 \_|| |\____)\___)_||_||_|\_||_|_|_|____/ \___(_/ \_)  (___/ \___)_||_|_|    \___)
(_____|                                                                           
*/

exports.getMailbox = function(req, res, next, id) {
    var first_date = null, eltipo = '', organizacion = '';
    if (typeof req.query.firstdate !== 'undefined') {first_date = new Date(req.query.firstdate);}
    if (typeof req.query.eltipo !== 'undefined') {eltipo = req.query.eltipo;}
    if (typeof req.query.organizacion !== 'undefined') {organizacion = req.query.organizacion;}

    function querybuzon (cole, fecha, page_id, eltipo, organizacion, callback) {
		var criteriopage = { id : { $exists : true }};
		var criteriotipo = { _id : {$exists : true }};
		var criterioobj = { _id : {$exists : true }};
		var lositems = []; 
		if (page_id) {
	    	criteriopage  = {from_user_id : {$ne : page_id.toString()}};
		}
		if (eltipo !== '') {
			if(eltipo === 'facebook' || eltipo === 'twitter'){
				criterioobj = { obj : eltipo };
			}
			else if(eltipo === 'direct_message'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'twitter_public'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = {$and: [{ tipo : {$ne : 'direct_message'}},{ tipo : {$ne : 'tracker'}}]};
			}
			else if(eltipo === 'facebook_inbox'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'facebook_public'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : {$ne : 'facebook_inbox'}};
			}
			else if(eltipo === 'tracker'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
		}
		var elcriterio = 
			{$and : [
		     	{'retweeted_status': {$exists: false}},
		     	{'descartado':{$exists: false}}, 
		     	{'atendido':{$exists: false}}, 
		     	{'eliminado':{$exists: false}},
		     	{'respuestas': {$exists: false}},
		     	{'clasificacion':{$exists:false}},
		     	{'sentiment':{$exists:false}},
		     	criteriopage, 
		     	criterioobj, 
		     	criteriotipo 
		 	]};
		var elsort = '';
		var elCreated = '';
		if(organizacion === 'asc'){
	    	elsort = {'created_time': 1};
	    	elCreated = {'created_time': {$gt: fecha}};
		}else{
	    	elsort = {'created_time': -1};
	    	elCreated = {'created_time': {$lt: fecha}};
		}
		var ellimit = 10;
		if (fecha !== null) {
	    	elcriterio = {
				$and : [
		     		{'retweeted_status': {$exists: false}},
		     		{'descartado':{$exists: false}}, 
		     		{'atendido':{$exists: false}}, 
		     		{'eliminado': {$exists: false}}, 
		     		{'respuestas': {$exists: false}},
		     		{'clasificacion':{$exists:false}},
		     		{'sentiment':{$exists:false}},
		     		elCreated,
				    criteriopage, 
		     		criterioobj, 
		     		criteriotipo 
		 		]
		 	};
		} 
		classdb.buscarToStreamLimit(cole, elcriterio, elsort, ellimit, 'feeds/getMailbox/querybuzon', function(lositems){
	    	return callback(lositems);
		});
    }

    function obtenMensajesSecundarios (cole, mensajes, losmensajes, index, cback) {
		if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    	index = 0;
		}
		var more = index+1;
		var cuantosm = mensajes.length;
		if (more > cuantosm) {
	    	return cback(losmensajes);
		}
		else {
	    	//console.log(mensajes[index].id);
	    	setImmediate(function(){
		    	var fui = ''+mensajes[index].from_user_id,
				mid = mensajes[index].id,
				mtp = mensajes[index].tipo,
				ctm = mensajes[index].created_time;
		    	var parent = '';
		    	if (typeof mensajes[index].parent_post !== 'undefined') {
					parent = mensajes[index].parent_post;
		    	}
		    	querysecundario(cole, mid, mtp, fui, parent, ctm, function(conv){
					if (conv !== 'error') {
			    		mensajes[index].conv_cuenta = conv[0].conv_cuenta;
			    		conv.shift();
			    		mensajes[index].conversacion = conv;
			    		losmensajes.push(mensajes[index]);
			    		return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
					}
					else {
			    		return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
					}
		    	});
		    });
		}
    }

    function querysecundario(cole, m_id, mtp, fu_id, parent, ctime, cback) {
		var parent_post = { id : { $exists : true }};
		//var parent_post = {fro}
		if (parent !== '') {
	    	parent_post = { parent_post : parent };
		}
		var criteriof = {
	    	$and : [
				{'from_user_id':fu_id}, 
				{'atendido': {$exists: false}}, 
				{'descartado': {$exists: false}}, 
				{'eliminado': {$exists: false}},
				{'id': {$ne : m_id}}, 
				{'tipo':mtp}, 
				parent_post,
				{'created_time':{$lte: ctime}}
	    	]
		};
		var sortf = {'created_time': 1};
		var limitf = 1;
		//Agregue el tipo a este criterio: {'tipo':mtp}
		//ancla
		var criterioc = {
	    	$and : [
				{'from_user_id':fu_id}, 
				//{'atendido': {$exists: false}}, 
				//{'descartado': {$exists: false}}, 
				{'eliminado':{$exists: false}},
				{'id': {$ne : m_id}}, 
				//{'tipo':mtp}, 
				//parent_post,
				{'created_time':{$lte: new Date(ctime)}}
	    	]
		};
		classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getMailbox/querySecundario', function(conversacion){
	    	if (conversacion === 'error') {
				return cback(conversacion);
	    	}
	    	else {
				classdb.count(cole, criterioc, 'feeds/getMailbox/querySecundario', function(combien){
		    		if (combien === 'error') {
						return cback(combien);
		    		}
		    		else {
						var cuenta = {conv_cuenta : combien};
						conversacion.unshift(cuenta);
						cback(conversacion);
		    		}
				});
	    	}
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailbox/querySecundario', function(datos){
	   		return callback(datos);
		});
    }

    getdatoscuenta(id, function(datos_cuenta){
	var obj = {};
	var fecha = { firstdate : first_date };
	if (datos_cuenta === 'error') {
	    res.jsonp(obj);
	}
	else {
	    if (datos_cuenta[0]) {
	    	var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
	    	//console.log(coleccion +' '+ new Date());
	    	var page_id = '';
	    	if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
		    //console.log('tiene datosPage y es válido');
		    page_id = datos_cuenta[0].datosPage.id;
	    	}
	    	else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
		    //console.log('tiene datosMonitoreo y es válido');
		    page_id = datos_cuenta[0].datosMonitoreo.id;
	    	}else{
	    	    if(datos_cuenta[0].datosTwitter.twitter_id_principal){
	    	    	page_id = datos_cuenta[0].datosTwitter.twitter_id_principal;
	    	    }
	    	}
	    	//console.log('PAGE ID !!!!!!');
	    	//console.log(page_id);
	    	if (page_id === '') {
		    res.jsonp(obj);
	    	}
	    	else {
		    querybuzon(coleccion, first_date, page_id, eltipo, organizacion, function(losmensajes) {
		    		if (losmensajes === 'error' || losmensajes.length < 1) {
						res.jsonp(obj);			
		    		}
		    		else {
						//console.log(losmensajes[0].id+ ' ' + new Date());
						fecha.firstdate = losmensajes[losmensajes.length-1].created_time;
						obtenMensajesSecundarios(coleccion, losmensajes, [], 0, function(loscomentarios){
			    			var ememasuno = 0;
			    			var todoslosmensajes = '';
			    			var arregloRetorno = [];

			    			if(organizacion !== 'asc'){
			    				todoslosmensajes = _.sortBy((loscomentarios), 'created_time').reverse();
			    			}else{
			    				todoslosmensajes = loscomentarios;
			    			}
			    			
			    			for(var i in todoslosmensajes){
								ememasuno++;
								//obj[m] = todoslosmensajes[m];
								arregloRetorno.push(todoslosmensajes[i]);
								if (todoslosmensajes.length === (ememasuno)) {
				    				obj.fecha = fecha;
				    				arregloRetorno.push(obj);
				    				res.jsonp(arregloRetorno); 
								}
			    			}
						});
		    		}
				});
	    	}
	    }
	    else {
		// no había datos cuenta para este usuario
		console.log('Error. no había datos cuenta para este usuario');
		res.json(obj);
	    }
	}
    });
};


exports.getMailboxProceso = function(req, res, next, id) {
     var first_date = null, eltipo = '', organizacion = '';
    if (typeof req.query.firstdate !== 'undefined') {first_date = new Date(req.query.firstdate);}
    if (typeof req.query.eltipo !== 'undefined') {eltipo = req.query.eltipo;}
    if (typeof req.query.organizacion !== 'undefined') {organizacion = req.query.organizacion;}


    function querybuzon (cole, fecha, page_id, eltipo, organizacion, callback) {
    	var criteriotipo = { _id : {$exists : true }};
		var criterioobj = { _id : {$exists : true }};
		var criteriopage = { id : { $exists : true }};
		var lositems = [];
		if (page_id) {
	    	criteriopage  = {from_user_id : {$ne : page_id.toString()}};
		}
		//Validación para los tipos de filtros
		if (eltipo !== '') {
			if(eltipo === 'facebook' || eltipo === 'twitter'){
				criterioobj = { obj : eltipo };
			}
			else if(eltipo === 'direct_message'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'twitter_public'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = {$and: [{ tipo : {$ne : 'direct_message'}},{ tipo : {$ne : 'tracker'}}]};
			}
			else if(eltipo === 'facebook_inbox'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'facebook_public'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : {$ne : 'facebook_inbox'}};
			}
			else if(eltipo === 'tracker'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
		}
	
		var elcriterio = {$and : [
				{'retweeted_status': {$exists: false}},
	    		{'descartado':{$exists: false}}, 
	    		{'atendido':{$exists: false}}, 
	    		{'eliminado':{$exists: false}},
	    		{$or: 
	     		[
		 		{'sentiment' : { $exists : true }}, 
		 		{'clasificacion.tema' : { $exists : true }},
		 		{'respuestas' : { $exists: true }}
	     		]
	    	},
	    	criteriopage, 
	    	criterioobj, 
	    	criteriotipo ]};
		var elsort = '';
		var elCreated = '';
		if(organizacion === 'asc'){
		    elsort = {'created_time': 1};
		    elCreated = {'created_time': {$gt: fecha}};
		}else{
		    elsort = {'created_time': -1};
		    elCreated = {'created_time': {$lt: fecha}};
		}	

		var ellimit = 10;
		if (fecha !== null) {
	    	elcriterio = { $and : [
				{'retweeted_status': {$exists: false}},
				{'descartado':{$exists: false}}, 
				{'atendido':{$exists: false}}, 
				{'eliminado': {$exists: false}}, 
				elCreated, 
				{$or: 
				 [
		     	{'sentiment': {$exists:true}}, 
		     	{'clasificacion.tema':{$exists:true}},
		     	{'respuestas' : {$exists: true}}
		 		]
			},
			criteriopage,
			criterioobj, 
			criteriotipo
	    	]};
		}
		classdb.buscarToStreamLimit(cole, elcriterio, elsort, ellimit, 'feeds/getMailbox/querybuzon', function(lositems){
	    	return callback(lositems);
		});
    }

    function obtenMensajesSecundarios (cole, mensajes, losmensajes, index, cback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantosm = mensajes.length;
	if (more > cuantosm) {
	    return cback(losmensajes);
	}
	else {
	    //console.log(mensajes[index].id);
	    setImmediate(function(){
		    var fui = ''+mensajes[index].from_user_id,
			mid = mensajes[index].id,
			mtp = mensajes[index].tipo,
			ctm = mensajes[index].created_time;
		    var parent = '';
		    if (typeof mensajes[index].parent_post !== 'undefined') {
			parent = mensajes[index].parent_post;
		    }
		    querysecundario(cole, mid, mtp, fui, parent, ctm, function(conv){
			if (conv !== 'error') {
			    mensajes[index].conv_cuenta = conv[0].conv_cuenta;
			    conv.shift();
			    mensajes[index].conversacion = conv;
			    losmensajes.push(mensajes[index]);
			    return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
			}
			else {
			    return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
			}
		    });
		});
	}
    }

    function querysecundario(cole, m_id, mtp, fu_id, parent, ctime, cback) {
	var parent_post = { id : { $exists : true }};
	if (parent !== '') {
	    parent_post = { parent_post : parent };
	}
	var criteriof = {
	    $and : [
		{'from_user_id':fu_id}, 
		{'atendido': {$exists: false}}, 
		{'descartado': {$exists: false}}, 
		{'eliminado': {$exists: false}},
		{'id': {$ne : m_id}}, 
		{'tipo':mtp}, 
		parent_post,
		{'created_time':{$lte: ctime}}
	    ]
	};
	var sortf = {'created_time': 1};
	var limitf = 1;
	//Agregue el tipo a este criterio: {'tipo':mtp}
	var criterioc = {
	    $and : [
		{'from_user_id':fu_id}, 
		//{'atendido': {$exists: false}}, 
		//{'descartado': {$exists: false}}, 
		{'eliminado':{$exists: false}},
		{'id': {$ne : m_id}}, 
		//{'tipo':mtp}, 
		//parent_post,
		{'created_time':{$lte: ctime}}
	    ]
	};
	classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getMailbox/querySecundario', function(conversacion){
	    if (conversacion === 'error') {
		return cback(conversacion);
	    }
	    else {
		classdb.count(cole, criterioc, 'feeds/getMailbox/querySecundario', function(combien){
		    if (combien === 'error') {
			return cback(combien);
		    }
		    else {
			var cuenta = {conv_cuenta : combien};
			conversacion.unshift(cuenta);
			cback(conversacion);
		    }
		});
	    }
	});
    }

    function getdatoscuenta(id, callback) {
	var mid = new ObjectID(id);
	var criterio = {'_id': mid};
	classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailbox/querySecundario', function(datos){
	    return callback(datos);
	});
    }

    getdatoscuenta(id, function(datos_cuenta){
	var obj = {};
	var fecha = { firstdate : first_date };
	if (datos_cuenta === 'error') {
	    res.jsonp(obj);
	}
	else {
	    var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
	    //console.log(coleccion +' '+ new Date());
	    var page_id = '';
	    if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
		//console.log('tiene datosPage y es válido');
		page_id = datos_cuenta[0].datosPage.id;
	    }
	    else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
		//console.log('tiene datosMonitoreo y es válido');
		page_id = datos_cuenta[0].datosMonitoreo.id;
	    }else{
	    	if(datos_cuenta[0].datosTwitter.twitter_id_principal){
	    	    page_id = datos_cuenta[0].datosTwitter.twitter_id_principal;
	    	}
	    }
	    if (page_id === '') {
		res.jsonp(obj);
	    }
	    else {
		querybuzon(coleccion, first_date, page_id, eltipo, organizacion, function(losmensajes) {
		    if (losmensajes === 'error' || losmensajes.length < 1) {
			res.jsonp(obj);			
		    }
		    else {
			fecha.firstdate = losmensajes[losmensajes.length-1].created_time;
			obtenMensajesSecundarios(coleccion, losmensajes, [], 0, function(loscomentarios){
			    var ememasuno = 0;
			   	var todoslosmensajes = '';
			    var arregloRetorno = [];
			    if(organizacion !== 'asc'){
			   		todoslosmensajes = _.sortBy((loscomentarios), 'created_time').reverse();
			   	}else{
			   		todoslosmensajes = loscomentarios;
			   	}
			    for(var i in todoslosmensajes){
					ememasuno++;
					arregloRetorno.push(todoslosmensajes[i]);
					if (todoslosmensajes.length === (ememasuno)) {
				    	obj.fecha = fecha;
				    	arregloRetorno.push(obj);
				    	res.jsonp(arregloRetorno); 
					}
			    }
			});
		    }
		});
	    }
	}
    });  
};
/*                ______        _ _ _                                   _ 
             _   |  ___ \      (_) | |                                 | |
  ____  ____| |_ | | _ | | ____ _| | | _   ___ _   _     ____ ____   _ | |
 / _  |/ _  )  _)| || || |/ _  | | | || \ / _ ( \ / )   / _  )  _ \ / || |
( ( | ( (/ /| |__| || || ( ( | | | | |_) ) |_| ) X (   ( (/ /| | | ( (_| |
 \_|| |\____)\___)_||_||_|\_||_|_|_|____/ \___(_/ \_)   \____)_| |_|\____|
(_____|                                                                   
*/


/*           _   __  __       _ _ _               _____                      _ _        
            | | |  \/  |     (_) | |             |  __ \                    | | |       
   __ _  ___| |_| \  / | __ _ _| | |__   _____  _| |__) |___  ___ _   _  ___| | |_ ___  
  / _` |/ _ \ __| |\/| |/ _` | | | '_ \ / _ \ \/ /  _  // _ \/ __| | | |/ _ \ | __/ _ \ 
 | (_| |  __/ |_| |  | | (_| | | | |_) | (_) >  <| | \ \  __/\__ \ |_| |  __/ | || (_) |
  \__, |\___|\__|_|  |_|\__,_|_|_|_.__/ \___/_/\_\_|  \_\___||___/\__,_|\___|_|\__\___/ 
   __/ |                                                                                
  |___/                                                                                 
*/
exports.getMailboxResuelto = function(req, res, next, id) {
    var first_date = null, eltipo = '', organizacion = '';
    if (typeof req.query.firstdate !== 'undefined') {first_date = new Date(req.query.firstdate);}
    if (typeof req.query.eltipo !== 'undefined') {eltipo = req.query.eltipo;}
    if (typeof req.query.organizacion !== 'undefined') {organizacion = req.query.organizacion;}

    function querybuzon (cole, fecha, page_id, eltipo, organizacion, callback) {
		var criteriotipo = { _id : {$exists : true }};
		var criterioobj = { _id : {$exists : true }};
		var criteriopage = { id : { $exists : true }};
		var lositems = [];
		if (page_id) {
	    	criteriopage  = {from_user_id : {$ne : page_id.toString()}};
		}
		
		//Validación para los tipos de filtros
		if (eltipo !== '') {
			if(eltipo === 'facebook' || eltipo === 'twitter'){
				criterioobj = { obj : eltipo };
			}
			else if(eltipo === 'direct_message'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'twitter_public'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = {$and: [{ tipo : {$ne : 'direct_message'}},{ tipo : {$ne : 'tracker'}}]};
			}
			else if(eltipo === 'facebook_inbox'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'facebook_public'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : {$ne : 'facebook_inbox'}};
			}
			else if(eltipo === 'tracker'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
		}

		var elcriterio = 
			{$and:[ 
				{'retweeted_status': {$exists: false}},
				{'descartado':{$exists: false}}, 
				{'atendido':{$exists: true}}, 
				{'eliminado':{$exists: false}}, 
				criteriopage, 
				criterioobj, 
				criteriotipo 
			]};

		var elsort = '';
		var elCreated = '';
		if(organizacion === 'asc'){
		    elsort = {'created_time': 1};
		    elCreated = {'created_time': {$gt: fecha}};
		}else{
		    elsort = {'created_time': -1};
		    elCreated = {'created_time': {$lt: fecha}};
		}	

		var ellimit = 10;
		if (fecha !== null) {
	    	elcriterio = 
	    		{$and:[ 
	    			{'retweeted_status': {$exists: false}},
	    			{'descartado':{$exists: false}}, 
	    			{'atendido':{$exists: true}}, 
	    			{'eliminado':{$exists: false}}, 
					elCreated,
	    			criteriopage, 
	    			criterioobj, 
	    			criteriotipo 
	    		]};
		}

		classdb.buscarToStreamLimit(cole, elcriterio, elsort, ellimit, 'feeds/getMailboxResuelto/querybuzon', function(lositems){
	    	return callback(lositems);
		});
    }

    function obtenMensajesSecundarios (cole, mensajes, losmensajes, index, cback) {
		if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    	index = 0;
		}
		var more = index+1;
		var cuantosm = mensajes.length;
		if (more > cuantosm) {
	    	return cback(losmensajes);
		}
		else{
	    	//console.log(mensajes[index].id);
	    	setImmediate(function(){
		    	var fui = ''+mensajes[index].from_user_id,
				mid = mensajes[index].id,
				maid = mensajes[index].atendido._id,
				mtp = mensajes[index].tipo,
				ctm = mensajes[index].created_time;
		    	var parent = '';
		    	if (typeof mensajes[index].parent_post !== 'undefined') {
					parent = mensajes[index].parent_post;
		    	}
		    	querysecundario(cole, mid, maid, mtp, fui, parent, ctm, function(conv){
					if (conv !== 'error') {
			    		mensajes[index].conv_cuenta = conv[0].conv_cuenta;
			    		conv.shift();
			    		mensajes[index].conversacion = conv;
			    		losmensajes.push(mensajes[index]);
			    		return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
					}
					else {
			    		return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
					}
		    	});
		    });
		}
    }

    function querysecundario(cole, m_id, m_aid, mtp, fu_id, parent, ctime, cback) {
		var parent_post = { id : { $exists : true }};
		if (parent !== '') {
	    	parent_post = { parent_post : parent };
		}
		var criteriof = {
	    	$and : [
			{'from_user_id':fu_id}, 
			{'atendido': {$exists: true}}, 
			{'atendido._id': m_aid},
			{'descartado': {$exists: false}}, 
			{'eliminado':{$exists:false}},
			{'id': {$ne : m_id}}, 
			{'tipo':mtp}, 
			parent_post,
			{'created_time':{$lte: ctime}}
	    	]
		};
		var sortf = {'created_time': 1};
		var limitf = 1;
		var criterioc = {
	    	$and : [
			{'from_user_id':fu_id}, 
			//{'atendido': {$exists: true}}, 
			//{'atendido._id': m_aid},
			//{'descartado': {$exists: false}}, 
			{'eliminado':{$exists:false}},
			{'id': {$ne : m_id}}, 
			//{'tipo': mtp},
			//parent_post,
			{'created_time':{$lte: ctime}}
	    	]
		};
		classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getMailboxResuelto/querySecundario', function(conversacion){
	    	if (conversacion === 'error') {
				return cback(conversacion);
	    	}
	    	else {
				classdb.count(cole, criterioc, 'feeds/getMailboxResuelto/querySecundario', function(combien){
		    		if (combien === 'error') {
						return cback(combien);
		    		}
		    		else {
						var cuenta = {conv_cuenta : combien};
						conversacion.unshift(cuenta);
						cback(conversacion);
		    		}
				});
	    	}
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailboxResuelto/querySecundario', function(datos){
	   		return callback(datos);
		});
    }

    getdatoscuenta(id, function(datos_cuenta){ 
		var obj = {};
		var fecha = { firstdate : first_date };
		if (datos_cuenta === 'error') {
	    	res.jsonp(obj);
		}
		else {
	    	var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
	    	var page_id = '';
	    	if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
				page_id = datos_cuenta[0].datosPage.id;
	    	}
	    	else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
				page_id = datos_cuenta[0].datosMonitoreo.id;
	    	}
		    if (page_id === '') {
				res.jsonp(obj);
	    	}
	    	else {
				querybuzon(coleccion, first_date, page_id, eltipo, organizacion, function(losmensajes) {
		    		if (losmensajes === 'error' || losmensajes.length < 1) {
						res.jsonp(obj);
		    		}
		    		else {
						fecha.firstdate = losmensajes[losmensajes.length-1].created_time;
						obtenMensajesSecundarios(coleccion, losmensajes, [], 0, function(loscomentarios){
			    			var ememasuno = 0;
			    			var arregloRetorno = [];
			    			var todoslosmensajes = ''; 
			    			if(organizacion !== 'asc'){
			    				todoslosmensajes = _.sortBy((loscomentarios), 'created_time').reverse();
			    			}else{
			    				todoslosmensajes = loscomentarios;
			    			}
			    			for(var i in todoslosmensajes){
								ememasuno++;
								arregloRetorno.push(todoslosmensajes[i]);
								if (todoslosmensajes.length === (ememasuno)) {
				    				obj.fecha = fecha;
				    				arregloRetorno.push(obj);
				    				res.jsonp(arregloRetorno); 
								}
			    			}
						});
		    		}
				});
	    	}
		}
    });
};

/*               _              _   __  __       _ _ _               _____                      _ _        
                | |            | | |  \/  |     (_) | |             |  __ \                    | | |       
   ___ _ __   __| |   __ _  ___| |_| \  / | __ _ _| | |__   _____  _| |__) |___  ___ _   _  ___| | |_ ___  
  / _ \ '_ \ / _` |  / _` |/ _ \ __| |\/| |/ _` | | | '_ \ / _ \ \/ /  _  // _ \/ __| | | |/ _ \ | __/ _ \ 
 |  __/ | | | (_| | | (_| |  __/ |_| |  | | (_| | | | |_) | (_) >  <| | \ \  __/\__ \ |_| |  __/ | || (_) |
  \___|_| |_|\__,_|  \__, |\___|\__|_|  |_|\__,_|_|_|_.__/ \___/_/\_\_|  \_\___||___/\__,_|\___|_|\__\___/ 
                      __/ |                                                                                
                     |___/                                                                                 
*/


/*           _   __  __       _ _ _               _____                           _            _           
            | | |  \/  |     (_) | |             |  __ \                         | |          | |          
   __ _  ___| |_| \  / | __ _ _| | |__   _____  _| |  | | ___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
  / _` |/ _ \ __| |\/| |/ _` | | | '_ \ / _ \ \/ / |  | |/ _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
 | (_| |  __/ |_| |  | | (_| | | | |_) | (_) >  <| |__| |  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
  \__, |\___|\__|_|  |_|\__,_|_|_|_.__/ \___/_/\_\_____/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/
   __/ |                                                                                                   
  |___/                                                                                                    
*/
exports.getMailboxDescartados = function(req, res, next, id) {
    var first_date = null, eltipo = '', organizacion = '';
    if (typeof req.query.firstdate !== 'undefined') {first_date = new Date(req.query.firstdate);}
    if (typeof req.query.eltipo !== 'undefined') {eltipo = req.query.eltipo;}
    if (typeof req.query.organizacion !== 'undefined') {organizacion = req.query.organizacion;}

    function querybuzon (cole, fecha, page_id, eltipo, organizacion, callback) {
		var criteriotipo = { _id : {$exists : true }};
		var criterioobj = { _id : {$exists : true }};
		var criteriopage = { id : { $exists : true }};
		var lositems = [];
		if (page_id) {
	    	criteriopage  = {from_user_id : {$ne : page_id.toString()}};
		}
		//Validación para los tipos de filtros
		if (eltipo !== '') {
			if(eltipo === 'facebook' || eltipo === 'twitter'){
				criterioobj = { obj : eltipo };
			}
			else if(eltipo === 'direct_message'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'twitter_public'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = {$and: [{ tipo : {$ne : 'direct_message'}},{ tipo : {$ne : 'tracker'}}]};
			}
			else if(eltipo === 'facebook_inbox'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : eltipo};
			}
			else if(eltipo === 'facebook_public'){
				criterioobj = { obj : 'facebook' };
				criteriotipo = { tipo : {$ne : 'facebook_inbox'}};
			}
			else if(eltipo === 'tracker'){
				criterioobj = { obj : 'twitter' };
				criteriotipo = { tipo : eltipo};
			}
		}

		var elcriterio = 
			{$and : [
				{'retweeted_status': {$exists: false}},
				{'descartado':{$exists: true}}, 
				{'atendido':{$exists: false}}, 
				criteriopage, 
				criterioobj, 
				criteriotipo 
			]};
		var elsort = '';
		var elCreated = '';
		if(organizacion === 'asc'){
		    elsort = {'created_time': 1};
		    elCreated = {'created_time': {$gt: fecha}};
		}else{
		    elsort = {'created_time': -1};
		    elCreated = {'created_time': {$lt: fecha}};
		}	
		var ellimit = 10;
		if (fecha !== null) {
	    	elcriterio = 
	    		{$and:[ 
	    			{'retweeted_status': {$exists: false}},
	    			{'descartado':{$exists: true}},
	    			{'atendido':{$exists: false}}, 
	    			elCreated,
	    			criteriopage, 
	    			criterioobj, 
	    			criteriotipo 
	    		]};
		}
		classdb.buscarToStreamLimit(cole, elcriterio, elsort, ellimit, 'feeds/getMailboxDescartados/querybuzon', function(lositems){
	    	return callback(lositems);
		});
    }

    function obtenMensajesSecundarios (cole, mensajes, losmensajes, index, cback) {
		if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    	index = 0;
		}
		var more = index+1;
		var cuantosm = mensajes.length;
		if (more > cuantosm) {
	    	return cback(losmensajes);
		}
		else {
			setImmediate(function(){
		    	console.log(mensajes[index].id);
		    	var fui = mensajes[index].from_user_id,
				mid = mensajes[index].id,
				mtp = mensajes[index].tipo,
				ctm = mensajes[index].created_time;
		    	var parent = '';
		    	if (typeof mensajes[index].parent_post !== 'undefined') {
					parent = mensajes[index].parent_post;
		    	}
		    	querysecundario(cole, mid, mtp, fui, parent, ctm, function(conv){
					mensajes[index].conv_cuenta = conv[0].conv_cuenta;
					conv.shift();
					mensajes[index].conversacion = conv;
					losmensajes.push(mensajes[index]);
					return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
		    	});
		    });
		}
    }

    function querysecundario(cole, m_id, mtp, fu_id, parent, ctime, cback) {
		var parent_post = { id : { $exists : true }};
		if (parent !== '') {
	    	parent_post = { parent_post : parent };
		}
		var criteriof = {
	    	$and : [
				{'from_user_id':fu_id}, 
				{'atendido': {$exists: false}}, 
				{'descartado': {$exists: true}}, 
				{'eliminado':{$exists:false}},
				{'id': {$ne : m_id}}, 
				{'tipo': mtp}, 
				parent_post,
				{'created_time':{$lte: ctime}}
	    	]
		};
		var sortf = {'created_time': 1};
		var limitf = 1;
		var criterioc = {
	    	$and : [
				{'from_user_id':fu_id}, 
				//{'atendido': {$exists: false}}, 
				//{'descartado': {$exists: true}}, 
				{'eliminado':{$exists:false}},
				{'id': {$ne : m_id}}, 
				//{'tipo': mtp},
				//parent_post,
				{'created_time':{$lte: ctime}}
	    	]
		};
		classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getMailboxDescartados/querySecundario', function(conversacion){
	    	if (conversacion === 'error') {
				return cback(conversacion);
	    	}
	    	else {
				classdb.count(cole, criterioc, 'feeds/getMailboxDescartados/querySecundario', function(combien){
		    		if (combien === 'error') {
						return cback(combien);
		    		}
		    		else {
						var cuenta = {conv_cuenta : combien};
						conversacion.unshift(cuenta);
						cback(conversacion);
		    		}
				});
	    	}
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailboxDescartados/querySecundario', function(datos){
			   return callback(datos);
		});
    }

    //console.log('ha entrado getMailboxDescartados');
    getdatoscuenta(id, function(datos_cuenta){ 
		var obj = {};
		var fecha = { firstdate : first_date };
		if (datos_cuenta === 'error') {
	    	res.jsonp(obj);
		}else {
	    	var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
	    	//console.log(coleccion +' '+ new Date());
	    	var page_id = '';
	    	if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
				//console.log('tiene datosPage y es válido');
				page_id = datos_cuenta[0].datosPage.id;
	    	}else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
				//console.log('tiene datosMonitoreo y es válido');
				page_id = datos_cuenta[0].datosMonitoreo.id;
	    	}
	    	
	    	if (page_id === '') {
				res.jsonp(obj);
	    	}else {
				querybuzon(coleccion, first_date, page_id, eltipo, organizacion, function(losmensajes) {
		    		if (losmensajes === 'error' || losmensajes.length < 1) {
						res.jsonp(obj);
		    		}else {
			   	 		fecha.firstdate = losmensajes[losmensajes.length-1].created_time;
						obtenMensajesSecundarios(coleccion, losmensajes, [], 0, function(loscomentarios){
			    			var ememasuno = 0;
			    			var todoslosmensajes = '';
			    			var arregloRetorno = [];
			    			//En el momento que se utilicen los filtros de ascendente y descendente
			    			if(organizacion !== 'asc'){
			    				todoslosmensajes = _.sortBy((loscomentarios), 'created_time').reverse();
			    			}else{
			    				todoslosmensajes = loscomentarios;
			    			}
			   				for(var i in todoslosmensajes){
								ememasuno++;
								arregloRetorno.push(todoslosmensajes[i]);
								if (todoslosmensajes.length === (ememasuno)) {
			    					obj.fecha = fecha;
				    				arregloRetorno.push(obj);
				    				res.jsonp(arregloRetorno); 
								}
			   	 			}		    
						});
		    		}
				});
	    	}
		}
    });
};
/*               _              _   __  __       _ _ _               _____                           _            _           
                | |            | | |  \/  |     (_) | |             |  __ \                         | |          | |          
   ___ _ __   __| |   __ _  ___| |_| \  / | __ _ _| | |__   _____  _| |  | | ___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __| |\/| |/ _` | | | '_ \ / _ \ \/ / |  | |/ _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
 |  __/ | | | (_| | | (_| |  __/ |_| |  | | (_| | | | |_) | (_) >  <| |__| |  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
  \___|_| |_|\__,_|  \__, |\___|\__|_|  |_|\__,_|_|_|_.__/ \___/_/\_\_____/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/
                      __/ |                                                                                                   
                     |___/                                                                                                    
*/


/*
        _     _   _                 ____                       
       | |   | | (_)               |  _ \                      
   ___ | |__ | |_ _  ___ _ __   ___| |_) |_   _ _______  _ __  
  / _ \| '_ \| __| |/ _ \ '_ \ / _ \  _ <| | | |_  / _ \| '_ \ 
 | (_) | |_) | |_| |  __/ | | |  __/ |_) | |_| |/ / (_) | | | |
  \___/|_.__/ \__|_|\___|_| |_|\___|____/ \__,_/___\___/|_| |_|
                                                               
*/
exports.obtieneBuzon = function(req, res) {
	var palabra = req.query.palabra;
	var idUsuario = req.query.idUsuario;
	var id = req.query.id;
    var first_date = null, eltipo = '', organizacion = '', tipoBuzon = '';
    if (typeof req.query.firstdate !== 'undefined') {first_date = new Date(req.query.firstdate);}
    if (typeof req.query.eltipo !== 'undefined') {eltipo = req.query.eltipo;}
    if (typeof req.query.organizacion !== 'undefined') {organizacion = req.query.organizacion;}
    if (typeof req.query.tipoBuzon !== 'undefined') {tipoBuzon = req.query.tipoBuzon;}
	
	function regex(string) {
	    var charac = string;
	    var accents=  [];
	    accents.a = ['aá'];
	    accents.e = ['eé'];
	    accents.i = ['ií'];
	    accents.o = ['oó'];
	    accents.u = ['uúü'];
	    var is_accent = false;
	    var reg = '';
	    for(var i in charac){
	        for(var j in accents){
	            if(charac[i] === j){
	                reg += '['+accents[j]+']';
	                is_accent = true;
	                break;
	            }else{
	                is_accent = false;
	            }
	        }
	        if(!is_accent){
	            reg += charac[i];
	        }
	    }
	    return reg;
	}

    function actualizaEntrada(subtema,coleccion,idPrincipal,callback){
        var id = new ObjectID(idPrincipal);
		var objectId = new ObjectID();
		var criterio = {'_id' : id};
		var eladdtoset = { 'subtemas': { 'idSubtema' : objectId, 'subtema' : subtema.subtema }};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/cloneThemes/insertaSubtema', function(updated){
			desglosaResSub(subtema.respuestas,coleccion,idPrincipal,objectId,0,function(respuestaDesg){               
				//console.log(respuestaDesg);
			});
			return callback(updated);
		});
    }
    
	function consultaTipoBuzon(eltipo, criteriopage, criterioobj, criteriotipo, criterioPalabra, idUsuario, elCreated){
		var elcriterio = '';
		switch(tipoBuzon){
			case 'nuevos':
				elcriterio = {
					$and : [
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: false}}, 
						{'atendido':{$exists: false}}, 
						{'eliminado':{$exists: false}},
						{'sentiment' : {$exists : false}},
						{'clasificacion' : {$exists : false}},
						{'respuestas' : {$exists:false}},
						criteriopage, 
						criterioobj, 
						criteriotipo,
						criterioPalabra,
						elCreated
					] 
				};	
			break;

			case 'atendidos':
				elcriterio = {
					$and:[ 
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: false}}, 
						{'atendido':{$exists: true}}, 
						{'eliminado':{$exists: false}}, 
						{$or: [
							{'sentiment' : { $exists : true }}, 
							{'clasificacion' : { $exists : true }},
							{'respuestas' : { $exists: true }}				
						]},
						criteriopage, 
						criterioobj, 
						criteriotipo,
						criterioPalabra,
						elCreated
					]
				};
			break;

			case 'descartados':
				elcriterio = {
					$and:[
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: true}}, 
						criteriopage, 
						criterioobj, 
						criteriotipo,
						criterioPalabra,
						elCreated
					]
				};
			break;

			case 'asignados':
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}},
						{'asignado':{$exists:true}},
						{'asignado.usuario_asignado_id':idUsuario},
						{'atendido':{$exists: false}},
						{'descartado':{$exists: false}},
						{'sentiment' : { $exists : false }}, 
						{'clasificacion' : { $exists : false }},
						{'respuestas' : { $exists: false }},
						criteriopage, 
						criterioobj, 
						criteriotipo,
						criterioPalabra,
						elCreated
					]
				}; 
			break;

			case 'todos':
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}}, 
						criteriopage, 
						criterioobj, 
			 			criteriotipo,
						criterioPalabra,
						elCreated
					]
				};
			break;

			default:
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}}, 
						criteriopage, 
						criterioobj, 
			 			criteriotipo,
						criterioPalabra,
						elCreated
					]
				};
		}
		return elcriterio;
	}
    
    function querybuzon (cole, fecha, page_id, eltipo, organizacion, tipoBuzon, palabra, callback) {
		var criteriopage = { id : { $exists : true }};
		var criteriotipo = { _id : {$exists : true }};
		var criterioobj = { obj : {$exists : true }};
		var criterioPalabra = { created_time : {$exists : true}};
		var lositems = [];
		if(palabra !== ''){
			criterioPalabra = {
				$or:[
	  				{'from_user_name':new RegExp(regex(palabra),'i')},
	  				{'user.screen_name': new RegExp(regex(palabra),'i')},
	  				{'sender.name': new RegExp(regex(palabra),'i')}
				]
			};
		}

		if (page_id) {
			criteriopage  = {from_user_id : {$ne : page_id}};
		}
		
		if (eltipo !== '') {
			switch(eltipo){
				case 'facebook':
					case 'twitter':
					criterioobj = { obj : eltipo };
				break;

				case  'direct_message':
					criterioobj = { obj : 'twitter' };
					criteriotipo = { tipo : eltipo};	
				break;

				case 'twitter_public':
					criterioobj = { obj : 'twitter' };
					criteriotipo = {$and: [{ tipo : {$ne : 'direct_message'}},{ tipo : {$ne : 'tracker'}}]};
				break;

				case 'tracker':
					criterioobj = { obj : 'twitter' };
					criteriotipo = { tipo : eltipo};
				break;


				case 'influencer':
					criterioobj = { obj : 'twitter' };
					criteriotipo = { influencers : {$exists : true}};
				break;

				case 'facebook_inbox':
					criterioobj = { obj : 'facebook' };
					criteriotipo = { tipo : eltipo};
				break;

				case 'rating':
					criterioobj = { obj : 'facebook' };
					criteriotipo = { tipo : eltipo};
				break;
				case 'facebook_public':
					criterioobj = { obj : 'facebook' };
					criteriotipo = { tipo : {$ne : 'facebook_inbox'}};
				break;
				default:
					console.log('Tipo Invalido en obtieneBuzon');
			}
		}

		var elcriterio = '';
		var elsort = '';
		var elCreated = '';

		//Criterio sin fechas
		elcriterio = consultaTipoBuzon(eltipo, criteriopage, criterioobj, criteriotipo, criterioPalabra, idUsuario, {});
		if(organizacion === 'asc'){
			elsort = {'created_time': 1};
			elCreated = {'created_time': {$gt: fecha}};
		}else{
			elsort = {'created_time': -1};
			elCreated = {'created_time': {$lt: fecha}};
		}
		var ellimit = 10;
		if (fecha !== null) {
			elcriterio = consultaTipoBuzon(eltipo, criteriopage, criterioobj, criteriotipo, criterioPalabra, idUsuario, elCreated);
		} 
		classdb.buscarToStreamLimit(cole, elcriterio, elsort, ellimit, 'feeds/getMailbox/querybuzon', function(lositems){
			for(var i=0;i<lositems.length;i++){
				if(lositems[i].descartado){    
					lositems[i].tipoMensaje = 'descartado';
                }else if(!lositems[i].descartado && !lositems[i].eliminado && (lositems[i].respuestas || lositems[i].sentiment || lositems[i].clasificacion || lositems[i].atendido)){
					lositems[i].tipoMensaje = 'atendido';
                }else if(!lositems[i].descartado && !lositems[i].atendido && !lositems[i].eliminado && !lositems[i].sentiment && !lositems[i].clasificacion){
					lositems[i].tipoMensaje = 'nuevo';
				}else{
					console.log('No entro a un buzon valido');
					console.log(lositems[i]);
					console.log('\n\n');
				}
				if(lositems[i].obj==='twitter'){
					if(lositems[i].tipo === 'direct_message'){ 
						lositems[i].nombre = lositems[i].sender_screen_name;
						lositems[i].imagen = lositems[i].sender.profile_image_url;
						lositems[i].imagen_https = lositems[i].sender.profile_image_url_https;
						lositems[i].texto = lositems[i].text;
						lositems[i].urlEnlace = '#';
						lositems[i].urlUsuario = 'https://twitter.com/'+lositems[i].sender.screen_name;
					}else{
						lositems[i].nombre = lositems[i].user.screen_name;
						lositems[i].imagen = lositems[i].user.profile_image_url;
						lositems[i].imagen_https = lositems[i].user.profile_image_url_https;
						lositems[i].texto = lositems[i].text;
						lositems[i].urlEnlace = lositems[i].tw_url;
						lositems[i].urlUsuario = 'https://twitter.com/'+lositems[i].user.screen_name;
					} 	           
				}else if(lositems[i].obj==='facebook'){
					var post = '';
					var comentario = '';
					var id = '';
				    if (lositems[i].foto) {
					var img = lositems[i].foto.replace('https', 'http');
					lositems[i].imagen = img;
				    }
				    else {
					lositems[i].imagen = '';
				    }
					lositems[i].nombre = lositems[i].from.name;
					lositems[i].imagen_https = lositems[i].foto;
					lositems[i].texto = lositems[i].message;
					lositems[i].urlUsuario = 'http://facebook.com/'+lositems[i].from.id;
					if (lositems[i].tipo === 'comment') {
						if (lositems[i].parent_post === lositems[i].parent_comment) {
							//si es un bucomentario
							id = lositems[i].id.split('_');
							post = lositems[i].parent_post.split('_');
							comentario = lositems[i].parent_comment.split('_');
							lositems[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/' + post[0] + '?comment_id=' + post[1] + '&reply_comment_id=' + id[1] + '';
						} else {
							if(typeof lositems[i].parent_post !== 'undefined'){
							    post = lositems[i].parent_post.split('_');
							    if (lositems[i].parent_comment) {
								comentario = lositems[i].parent_comment.split('_');
								lositems[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/'+ post[1]+'?comment_id='+comentario[1];
							    }
							}else{                                                  
							    if (lositems[i].parent_comment) {
								comentario = lositems[i].parent_comment.split('_');
								lositems[i].urlEnlace = 'https://www.facebook.com/' + post[0] + '/posts/' + post[1] + '?comment_id=' + comentario[1];
							    }
							}
						}
    				} else if (lositems[i].tipo === 'facebook_inbox') {
					  	lositems[i].urlEnlace = lositems[i].conversation_link;
                    } else if (lositems[i].tipo === 'post') {
						//si es un post
						id = lositems[i].id.split('_');
						lositems[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/'+id[1]; 
					}else{
						lositems[i].urlEnlace = lositems[i].rating_link;
					}        
                }                               
            }
			return callback(lositems);
		});
    }
    
    function obtenMensajesSecundarios (cole, mensajes, losmensajes, index, cback) {
		if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
			index = 0;
		}
		var more = index+1;
		var cuantosm = mensajes.length;
		if (more > cuantosm) {
			return cback(losmensajes);
		}
		else {
			//console.log(mensajes[index].id);
			var fui = ''+mensajes[index].from_user_id,
                        mid = mensajes[index].id,
                        mtp = mensajes[index].tipo,
                        ctm = mensajes[index].created_time;
			var parent = '';
			if (typeof mensajes[index].parent_post !== 'undefined') {
				parent = mensajes[index].parent_post;
			}
            querysecundario(cole, mid, mtp, fui, parent, ctm, function(conv){
				if (conv !== 'error') {
					mensajes[index].conv_cuenta = conv[0].conv_cuenta;
					conv.shift();
					mensajes[index].conversacion = conv;
					losmensajes.push(mensajes[index]);
					return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
				}
				else {
					return obtenMensajesSecundarios(cole, mensajes, losmensajes, more, cback);
				}
            });
        }
    }

	function querysecundario(cole, m_id, mtp, fu_id, parent, ctime, cback) {
		var parent_post = { id : { $exists : true }};
		//var parent_post = {fro}
		if (parent !== '') {
			parent_post = { parent_post : parent };
		}
		var criteriof = {
			$and : [
				{'from_user_id':fu_id}, 
				{'id': {$ne : m_id}}, 
            ]
        };
		var sortf = {'created_time': 1};
		var limitf = 1;
		//Agregue el tipo a este criterio: {'tipo':mtp}
		//ancla
		var criterioc = {
            $and : [
				{'from_user_id':fu_id}, 
				//{'atendido': {$exists: false}}, 
				//{'descartado': {$exists: false}}, 
				{'eliminado':{$exists: false}},
				{'id': {$ne : m_id}}, 
				//{'tipo':mtp}, 
				//parent_post,
				//{'created_time':{$lte: new Date(ctime)}}
            ]
        };
		
		classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getMailbox/querySecundario', function(conversacion){
			if (conversacion === 'error') {
				return cback(conversacion);
           	}
            else {
				classdb.count(cole, criterioc, 'feeds/getMailbox/querySecundario', function(combien){
					if (combien === 'error') {
						return cback(combien);
					}
					else {
						var cuenta = {conv_cuenta : combien};
						conversacion.unshift(cuenta);
						for(var c in conversacion){
							if (conversacion[c].obj === 'twitter') {
								switch(conversacion[c].tipo) {

									case 'direct_message':
										conversacion[c].nombre = conversacion[c].sender_screen_name;
										conversacion[c].imagen = conversacion[c].sender.profile_image_url;
										conversacion[c].imagen_https = conversacion[c].sender.profile_image_url_https;
										conversacion[c].texto = conversacion[c].text;
										conversacion[c].urlEnlace = '#';
										conversacion[c].urlUsuario = 'https://twitter.com/' + conversacion[c].sender.screen_name;
									break;
									
									case 'twit':
										conversacion[c].nombre = conversacion[c].user.screen_name;
										conversacion[c].imagen = conversacion[c].user.profile_image_url;
										conversacion[c].imagen_https = conversacion[c].user.profile_image_url_https;
										conversacion[c].texto = conversacion[c].text;
										conversacion[c].urlEnlace = conversacion[c].tw_url;
										conversacion[c].urlUsuario = 'https://twitter.com/' + conversacion[c].user.screen_name;
									break;

									case 'tracker':
										conversacion[c].nombre = conversacion[c].user.screen_name;
										conversacion[c].imagen = conversacion[c].user.profile_image_url;
										conversacion[c].imagen_https = conversacion[c].user.profile_image_url_https;
										conversacion[c].texto = conversacion[c].text;
										conversacion[c].urlEnlace = conversacion[c].tw_url;
										conversacion[c].urlUsuario = 'https://twitter.com/' + conversacion[c].user.screen_name;
									break;
									
									default:
										console.log('Entro a una opcion invalida en switch twitter');
										console.log('Tipo');
										console.log(conversacion[c].tipo);
								}//switch
							}//if twitter
							
							if (conversacion[c].obj === 'facebook') {
								switch(conversacion[c].tipo) {

									case 'facebook_inbox':
										conversacion[c].nombre = conversacion[c].from.name;
										conversacion[c].imagen = conversacion[c].foto;
										conversacion[c].texto = conversacion[c].message;
										conversacion[c].urlEnlace = conversacion[c].conversation_link;
										conversacion[c].urlUsuario = 'https://www.facebook.com/'+conversacion[c].from.id;
									break;

									case 'comment':
										conversacion[c].nombre = conversacion[c].from.name;
										conversacion[c].imagen = conversacion[c].foto;
										conversacion[c].texto = conversacion[c].message;
										conversacion[c].urlUsuario = 'https://www.facebook.com/'+conversacion[c].from.id;
										var post = conversacion[c].parent_post.split('_');
										var id = conversacion[c].id.split('_');
										conversacion[c].urlEnlace = 'https://www.facebook.com/'+post[0]+'/posts/'+post[1]+'?comment_id='+id[1];
									break;
									
									case 'post':
										var idSeparado = conversacion[c].id.split('_');
										conversacion[c].nombre = conversacion[c].from.name;
										conversacion[c].imagen = conversacion[c].foto;
										conversacion[c].texto = conversacion[c].message;
										//conversacion[c].urlUsuario = 'https://www.facebook.com/'+conversacion[c].from.id;                                                          $
										conversacion[c].urlEnlace = 'https://www.facebook.com/'+idSeparado[0]+'/post/'+idSeparado[1];
									break;

									default:
										console.log('Entro a una opcion invalida en switch Faceboook');
										console.log('Tipo');
										console.log(conversacion[c].tipo);
								}//switch
							}//if facebook
						}
	  					return cback(conversacion);
					}
				});
			}
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/mailbox/querySecundario', function(datos){
			return callback(datos[0]);
		});
    }

    function pideFotoTwitter(cuenta, mensaje, callback){
	   	var accesos_twitter =  cuenta.datosTwitter;
	    var T  = new Twit({
			'consumer_key' : accesos_twitter.twitter_consumer_key,
			'consumer_secret' : accesos_twitter.twitter_consumer_secret,
			'access_token' : accesos_twitter.twitter_access_token,
			'access_token_secret' : accesos_twitter.twitter_access_token_secret
	    });
	    var parametros_twitter = {
	    	'screen_name' : mensaje.from_user_screen_name
	    };
	   	
	   	T.get('users/show', parametros_twitter, function(error, reply) {
			if(error){
				console.log('ERROR DE TWITTER');
				console.log(error);
				console.log('\n\n');
				return callback(mensaje);
			}else{
				var criterio = {'_id' : new ObjectID(mensaje._id)};
				var elset = {};
				if(mensaje.obj === 'twitter' && mensaje.tipo === 'direct_message'){					
					elset = { 
						'sender.profile_image_url' : reply.profile_image_url,
						'sender.profile_image_url_https' : reply.profile_image_url_https
					};
					classdb.actualiza(cuenta.nombreSistema+'_consolidada', criterio, elset, 'feeds/pideFotoTwitter', function(updated){
			    		if (updated === 'error') {
							console.log(updated);	
			    		}
					});

				}else if(mensaje.obj === 'twitter' && (mensaje.tipo === 'tracker' || mensaje.tipo === 'twit')){					
					elset = { 
						'user.profile_image_url' : reply.profile_image_url,
						'user.profile_image_url_https' : reply.profile_image_url_https
					};
					classdb.actualiza(cuenta.nombreSistema+'_consolidada', criterio, elset, 'feeds/pideFotoTwitter', function(updated){
			    		if (updated === 'error') {
							console.log(updated);	
			    		}

					});
				}else{
					console.log('EL TIPO / '+mensaje.obj+' / '+mensaje.tipo);
				}
				mensaje.imagen = reply.profile_image_url;
  				mensaje.imagen_https = reply.profile_image_url_https;
				return callback(mensaje);
			}
	    });	 
    }


    function validaImagenURL(cuenta, mensaje, callback){
		if(mensaje.obj === 'twitter'){
	    	var request = https.get(mensaje.imagen_https, function (response) {
	  			imagesize(response, function (err, result) {
	  				if(err){
	  					pideFotoTwitter(cuenta, mensaje, function(mensajeConFoto){
	  						if(mensajeConFoto !== 'error'){
	  							return callback(mensajeConFoto);
	  						}else{
			  					mensajeConFoto.imagen = 'http://crm.likeable.mx/modules/core/img/usuario-sem-imagem.png';
			  					mensajeConFoto.imagen_https = 'https://crm.likeable.mx/modules/core/img/usuario-sem-imagem.png';
			  					return callback(mensajeConFoto);
	  						}
	  					});
	  				}else{
	  					return callback(mensaje);
	  				}
	  			});
			});	
	    }else{
	    	return callback(mensaje);
	    }
    }

	getdatoscuenta(id, function(datos_cuenta){
		var obj = {};
		var fecha = { firstdate : first_date };
		if (datos_cuenta === 'error') {
			res.jsonp(obj);
		}else {
			if (datos_cuenta) {
				var coleccion = datos_cuenta.nombreSistema+'_consolidada';
				var page_id = '';
				if (typeof datos_cuenta.datosPage !== 'undefined' && typeof datos_cuenta.datosPage.id !== 'undefined' && datos_cuenta.datosPage.id !== -1) {
					page_id = datos_cuenta.datosPage.id;
				}else if (typeof datos_cuenta.datosMonitoreo !== 'undefined' && datos_cuenta.datosMonitoreo.id !== 'undefined') {
					page_id = datos_cuenta.datosMonitoreo.id;
				}else{
					if(datos_cuenta.datosTwitter.twitter_id_principal){
						page_id = datos_cuenta.datosTwitter.twitter_id_principal;
					}
				}
				if (page_id === '') {
					res.jsonp(obj);
				}else {
					querybuzon(coleccion, first_date, page_id, eltipo, organizacion, tipoBuzon, palabra, function(losmensajes) {
					    if (losmensajes === 'error' || losmensajes.length < 1) {
						res.jsonp(obj);                 
						}else {
						    //console.log(losmensajes[0].id+ ' ' + new Date());
						    fecha.firstdate = losmensajes[losmensajes.length-1].created_time;
						    obtenMensajesSecundarios(coleccion, losmensajes, [], 0, function(loscomentarios){
							var ememasuno = 0;
							var todoslosmensajes = '';
							var arregloRetorno = [];
							if(organizacion !== 'asc'){
							    todoslosmensajes = _.sortBy((loscomentarios), 'created_time').reverse();
							    }else{
								todoslosmensajes = loscomentarios;
								}
							for(var i in todoslosmensajes){
							    ememasuno++;
							    //obj[m] = todoslosmensajes[m];
							    arregloRetorno.push(todoslosmensajes[i]);
							    if (todoslosmensajes.length === (ememasuno)) {
								obj.fecha = fecha;
								arregloRetorno.push(obj);
								res.jsonp(arregloRetorno); 
								}
							    }
							});
						    }
					    });
				}
			}else {
				// no había datos cuenta para este usuario
				console.log('Error. no había datos cuenta para este usuario');
				res.json(obj);
			}
		}
    });
};
/*
                 _         _     _   _                 ____                       
                | |       | |   | | (_)               |  _ \                      
   ___ _ __   __| |   ___ | |__ | |_ _  ___ _ __   ___| |_) |_   _ _______  _ __  
  / _ \ '_ \ / _` |  / _ \| '_ \| __| |/ _ \ '_ \ / _ \  _ <| | | |_  / _ \| '_ \ 
 |  __/ | | | (_| | | (_) | |_) | |_| |  __/ | | |  __/ |_) | |_| |/ / (_) | | | |
  \___|_| |_|\__,_|  \___/|_.__/ \__|_|\___|_| |_|\___|____/ \__,_/___\___/|_| |_|
                                                                                  
*/
/*
             _    _____                 _        _   _                           
            | |  / ____|               | |      | \ | |                          
   __ _  ___| |_| |    _   _  ___ _ __ | |_ __ _|  \| |_   _  _____   _____  ___ 
  / _` |/ _ \ __| |   | | | |/ _ \ '_ \| __/ _` | . ` | | | |/ _ \ \ / / _ \/ __|
 | (_| |  __/ |_| |___| |_| |  __/ | | | || (_| | |\  | |_| |  __/\ V / (_) \__ \
  \__, |\___|\__|\_____\__,_|\___|_| |_|\__\__,_|_| \_|\__,_|\___| \_/ \___/|___/
   __/ |                                                                         
  |___/                                                                          
*/
exports.getCuentaNuevos = function(req, res, next ,id){
    var last_ct = null;
    var tipo = null;
    if (typeof req.query.lastct !== 'undefined') { last_ct =req.query.lastct; }
    if (typeof req.query.tipo !== 'undefined') { tipo =req.query.tipo; }

    function querybuzon (cole, fecha, page_id, tipo,callback) {
    	var criterio_tipo;
		var criteriored = {'obj': {$exists : true}};
		if(tipo && tipo !== 'todos'){
			criterio_tipo = {'tipo':{$eq:tipo}};
		}else{
			criterio_tipo = {'_id' : {$exists : true}};
		}	
		if (page_id) {
		    criteriored = {'from_user_id' : {$ne: page_id}};
		}
		var newDate = new Date(fecha);
		var criterio = {$and:
				[ 
				    {'descartado':{$exists: false}}, 
				    {'atendido':{$exists: false}}, 
				    {'eliminado':{$exists:false}},
				    {'clasificacion.tema':{$exists:false}}, 
				    {'sentiment':{$exists:false}},
				    {'respuestas':{$exists:false}}, 
				    {'created_time': {$gt: newDate}},
				    {'retweeted_status':{$exists:false}},
				    criteriored,
				    criterio_tipo
				]
			       };
	 	classdb.count(cole, criterio, 'feeds/getCuentaNuevos/querybuzon', function(cuenta){
	 		//console.log(cuenta);
		    return callback(cuenta);
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToArray('accounts', criterio, {}, 'feeds/getCuentaNuevos/queryBuzon', function(datos){
	   		return callback(datos);
		});
    }

    getdatoscuenta(id, function(datos_cuenta){

    if(datos_cuenta[0]){	
	var cuenta = datos_cuenta[0].nombreSistema;
	var obj = {};
	if (datos_cuenta !== 'error' & datos_cuenta.length > 0) {
	    var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
	    //console.log(coleccion +' '+ new Date());
	    var page_id = '';
	    if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
		//console.log('tiene datosPage y es válido');
		page_id = datos_cuenta[0].datosPage.id;
	    }
	    else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
		//console.log('tiene datosMonitoreo y es válido');
		page_id = datos_cuenta[0].datosMonitoreo.id;
	    }
	    if (page_id === '') {
	    	console.log('Page Id es igual a vacio');
		res.jsonp(obj);
	    }
	    else {
		querybuzon(coleccion, last_ct, page_id, tipo, function(lacuenta) {
		    if (lacuenta === 'error') {
			res.jsonp(obj);
		    }
		    else {
			obj.cuenta = lacuenta;
			res.jsonp(obj);
		    }
		});		
	    }
	}
}
    });
};
/*               _              _    _____                 _        _   _                           
                | |            | |  / ____|               | |      | \ | |                          
   ___ _ __   __| |   __ _  ___| |_| |    _   _  ___ _ __ | |_ __ _|  \| |_   _  _____   _____  ___ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __| |   | | | |/ _ \ '_ \| __/ _` | . ` | | | |/ _ \ \ / / _ \/ __|
 |  __/ | | | (_| | | (_| |  __/ |_| |___| |_| |  __/ | | | || (_| | |\  | |_| |  __/\ V / (_) \__ \
  \___|_| |_|\__,_|  \__, |\___|\__|\_____\__,_|\___|_| |_|\__\__,_|_| \_|\__,_|\___| \_/ \___/|___/
                      __/ |                                                                         
                     |___/                                                                          
*/

/*           _   _    _ _     _             _       _ _____          _       
            | | | |  | (_)   | |           (_)     | |  __ \        | |      
   __ _  ___| |_| |__| |_ ___| |_ ___  _ __ _  __ _| | |__) |__  ___| |_ ___ 
  / _` |/ _ \ __|  __  | / __| __/ _ \| '__| |/ _` | |  ___/ _ \/ __| __/ __|
 | (_| |  __/ |_| |  | | \__ \ || (_) | |  | | (_| | | |  | (_) \__ \ |_\__ \
  \__, |\___|\__|_|  |_|_|___/\__\___/|_|  |_|\__,_|_|_|   \___/|___/\__|___/
   __/ |                                                                     
  |___/                                                                      
*/
exports.getHistorialPosts = function (req, res) {
    var content_id = null, coleccion = null, user_id = null, created_time = null, obj = {};
    if (typeof req.query.cont_id !== 'undefined') { content_id = req.query.cont_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }
    if (typeof req.query.us_id !== 'undefined') { user_id = req.query.us_id; }
    if (typeof req.query.created !== 'undefined') { created_time = new Date(req.query.created); }

    function querysecundario(cole, cont_id, user_id, ctime, callback) {
	var criterio = { 
	    $and : [ 
		{'from_user_id':user_id}, 
		{'atendido': {$exists: false}}, 
		{'descartado': {$exists: false}}, 
		{'eliminado':{$exists:false}},
		{'id': {$ne : cont_id}}, 
		{'created_time':{$lte: ctime}} 
	    ]
	};
	var elsort = {'created_time': 1};
	classdb.buscarToStream(cole, criterio, elsort, 'feeds/getHistorialPosts/querysecundario', function(items){
	    callback(items);
	});
    }

    if (content_id !== null && coleccion !== null && user_id !== null && created_time !== null) {
	var contenido = {
	    conversacion: []
	};
	querysecundario(coleccion, content_id, user_id, created_time, function(conversacion){
	    if (conversacion === 'error') {
		obj = {'error': 'feeds/getHistorialPosts - no obtuvimos datos secundarios de la bd'};
		res.jsonp(obj);
	    }
	    else {
		contenido.conversacion = conversacion;
		obj = contenido;
		res.jsonp(obj);
	    }
	});
    }
    else {
	obj = {'error' : 'feeds/getHistorialPosts - no recibimos todos los parámetros'};
	res.jsonp(obj);
    }
};
/*               _              _   _    _ _     _             _       _ _____          _       
                | |            | | | |  | (_)   | |           (_)     | |  __ \        | |      
   ___ _ __   __| |   __ _  ___| |_| |__| |_ ___| |_ ___  _ __ _  __ _| | |__) |__  ___| |_ ___ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __|  __  | / __| __/ _ \| '__| |/ _` | |  ___/ _ \/ __| __/ __|
 |  __/ | | | (_| | | (_| |  __/ |_| |  | | \__ \ || (_) | |  | | (_| | | |  | (_) \__ \ |_\__ \
  \___|_| |_|\__,_|  \__, |\___|\__|_|  |_|_|___/\__\___/|_|  |_|\__,_|_|_|   \___/|___/\__|___/
                      __/ |                                                                     
                     |___/                                                                      
*/

/*           _   _    _ _     _             _           _____               _ _            _            
            | | | |  | (_)   | |           (_)         |  __ \             | (_)          | |           
   __ _  ___| |_| |__| |_ ___| |_ ___  _ __ _  ___ ___ | |__) |__ _ __   __| |_  ___ _ __ | |_ ___  ___ 
  / _` |/ _ \ __|  __  | / __| __/ _ \| '__| |/ __/ _ \|  ___/ _ \ '_ \ / _` | |/ _ \ '_ \| __/ _ \/ __|
 | (_| |  __/ |_| |  | | \__ \ || (_) | |  | | (_| (_) | |  |  __/ | | | (_| | |  __/ | | | ||  __/\__ \
  \__, |\___|\__|_|  |_|_|___/\__\___/|_|  |_|\___\___/|_|   \___|_| |_|\__,_|_|\___|_| |_|\__\___||___/
   __/ |                                                                                                
  |___/                                                                                                 
*/
exports.getHistoricoPendientes = function (req, res) {
    var content_id = null, coleccion = null, user_id = null, created_time = null, mtp = null,parent = null, obj = {};
    if (typeof req.query.cont_id !== 'undefined') { content_id = req.query.cont_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }
    if (typeof req.query.us_id !== 'undefined') { user_id = req.query.us_id; }
    if (typeof req.query.mtp !== 'undefined') { mtp = req.query.mtp; }
    if (typeof req.query.parent !== 'undefined') { parent = req.query.parent; }
    if (typeof req.query.created !== 'undefined') { created_time = req.query.created; }


    function querysecundario(cole, cont_id, user_id, ctime, mtp,callback) {
	var criterio = {
	    $and : [ 
		{'from_user_id': user_id}, 
		//{'atendido': {$exists: false}}, 
		//{'descartado': {$exists: false}}, 
		{'eliminado':{$exists:false}}, 
		{'id': {$ne : cont_id}}
		//{'tipo':mtp},
		//{'created_time':{$lte: new Date(ctime)}} 
	    ]
	};
	/*var criterioc = {
	    	$and : [
			{'from_user_id':fu_id}, 
			{'atendido': {$exists: true}}, 
			{'atendido._id': m_aid},
			{'descartado': {$exists: false}}, 
			{'eliminado':{$exists:false}},
			{'id': {$ne : m_id}}, 
			{'tipo': mtp},
			parent_post,
			{'created_time':{$lte: ctime}}
	    	]
		};*/
	var elsort = {'created_time': -1};
	classdb.buscarToStream(cole, criterio, elsort, 'feeds/getHistoricoPendientes/querysecundario', function(conversacion){
	    return callback(conversacion);
	});
    }

    if (content_id !== null, coleccion !== null && user_id !== null && created_time !== null) {
	// user_id = parseInt(user_id);
	var contenido = {
	    conversacion: []
	};

	querysecundario(coleccion, content_id, user_id, created_time, mtp, function(conversacion){
	    if (conversacion === 'error') {
		obj = {'error': 'feeds/getHistoricoPendientes - no obtuvimos datos secundarios de la bd'};
		res.jsonp(obj);
	    }
	    else {
		contenido.conversacion = conversacion;
		obj = contenido;
		res.jsonp(obj);
	    }
	});	
    }
    else {
	obj = {'error' : 'feeds/getHistoricoPendientes - no recibimos todos los parámetros'};
	res.jsonp(obj);
    }
};
/*               _              _   _    _ _     _             _           _____               _ _            _            
                | |            | | | |  | (_)   | |           (_)         |  __ \             | (_)          | |           
   ___ _ __   __| |   __ _  ___| |_| |__| |_ ___| |_ ___  _ __ _  ___ ___ | |__) |__ _ __   __| |_  ___ _ __ | |_ ___  ___ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __|  __  | / __| __/ _ \| '__| |/ __/ _ \|  ___/ _ \ '_ \ / _` | |/ _ \ '_ \| __/ _ \/ __|
 |  __/ | | | (_| | | (_| |  __/ |_| |  | | \__ \ || (_) | |  | | (_| (_) | |  |  __/ | | | (_| | |  __/ | | | ||  __/\__ \
  \___|_| |_|\__,_|  \__, |\___|\__|_|  |_|_|___/\__\___/|_|  |_|\___\___/|_|   \___|_| |_|\__,_|_|\___|_| |_|\__\___||___/
                      __/ |                                                                                                
                     |___/                                                                                                 
*/
exports.getMoreComplete = function (req, res) {
   // console.log('ENTRO A getMoreComplete ');
   // console.log(req.query);
    var content_id = null, coleccion = null, user_id = null, created_time = null, mtp = null,parent = null, obj = {};
    if (typeof req.query.cont_id !== 'undefined') { content_id = req.query.cont_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }
    if (typeof req.query.us_id !== 'undefined') { user_id = req.query.us_id; }
    if (typeof req.query.mtp !== 'undefined') { mtp = req.query.mtp; }
    if (typeof req.query.parent !== 'undefined') { parent = req.query.parent; }
    if (typeof req.query.created !== 'undefined') { created_time = req.query.created; }


    function querysecundario(cole, cont_id, user_id, ctime, mtp, callback) {
	var criterio = {
	    $and : [ 
		{'from_user_id': user_id}, 
		//{'atendido': {$exists: true}}, 
		//{'descartado': {$exists: false}}, 
		{'eliminado':{$exists:false}}, 
		{'id': {$ne : cont_id}} 
		//{'tipo':mtp}, 
		//{'created_time':{$lte: new Date(ctime)}} 
	    ]
	};
	var elsort = {'created_time': -1};
	classdb.buscarToStream(cole, criterio, elsort, 'feeds/getHistoricoPendientes/querysecundario', function(conversacion){
	    return callback(conversacion);
	});
    }

    if (content_id !== null, coleccion !== null && user_id !== null && created_time !== null) {
	// user_id = parseInt(user_id);
	var contenido = {
	    conversacion: []
	};

	querysecundario(coleccion, content_id, user_id, created_time, mtp, function(conversacion){
	    if (conversacion === 'error') {
		obj = {'error': 'feeds/getHistoricoPendientes - no obtuvimos datos secundarios de la bd'};
		res.jsonp(obj);
	    }
	    else {
		contenido.conversacion = conversacion;
		obj = contenido;
		//console.log(obj);
		res.jsonp(obj);
	    }
	});	
    }
    else {
	obj = {'error' : 'feeds/getHistoricoPendientes - no recibimos todos los parámetros'};
	res.jsonp(obj);
    }
};

exports.getMoreDescartados = function (req, res) {
   // console.log('ENTRO A getMoreComplete ');
   // console.log(req.query);
    var content_id = null, coleccion = null, user_id = null, created_time = null, mtp = null,parent = null, obj = {};
    if (typeof req.query.cont_id !== 'undefined') { content_id = req.query.cont_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }
    if (typeof req.query.us_id !== 'undefined') { user_id = req.query.us_id; }
    if (typeof req.query.mtp !== 'undefined') { mtp = req.query.mtp; }
    if (typeof req.query.parent !== 'undefined') { parent = req.query.parent; }
    if (typeof req.query.created !== 'undefined') { created_time = req.query.created; }


    function querysecundario(cole, cont_id, user_id, ctime, mtp, callback) {
	var criterio = {
	    $and : [ 
		{'from_user_id': user_id}, 
		//{'atendido': {$exists: false}}, 
		//{'descartado': {$exists: true}}, 
		//{'eliminado':{$exists:false}}, 
		{'id': {$ne : cont_id}}, 
		//{'tipo':mtp}, 
		//{'created_time':{$lte: new Date(ctime)}} 
	    ]
	};
	var elsort = {'created_time': -1};
	classdb.buscarToStream(cole, criterio, elsort, 'feeds/getHistoricoPendientes/querysecundario', function(conversacion){
	    return callback(conversacion);
	});
    }

    if (content_id !== null, coleccion !== null && user_id !== null && created_time !== null) {
	// user_id = parseInt(user_id);
	var contenido = {
	    conversacion: []
	};

	querysecundario(coleccion, content_id, user_id, created_time, mtp, function(conversacion){
	    if (conversacion === 'error') {
		obj = {'error': 'feeds/getHistoricoPendientes - no obtuvimos datos secundarios de la bd'};
		res.jsonp(obj);
	    }
	    else {
		contenido.conversacion = conversacion;
		obj = contenido;
		//console.log(obj);
		res.jsonp(obj);
	    }
	});	
    }
    else {
	obj = {'error' : 'feeds/getHistoricoPendientes - no recibimos todos los parámetros'};
	res.jsonp(obj);
    }
};
/*           _    ____              _____            _             _   
            | |  / __ \            / ____|          | |           | |  
   __ _  ___| |_| |  | |_ __   ___| |     ___  _ __ | |_ ___ _ __ | |_ 
  / _` |/ _ \ __| |  | | '_ \ / _ \ |    / _ \| '_ \| __/ _ \ '_ \| __|
 | (_| |  __/ |_| |__| | | | |  __/ |___| (_) | | | | ||  __/ | | | |_ 
  \__, |\___|\__|\____/|_| |_|\___|\_____\___/|_| |_|\__\___|_| |_|\__|
   __/ |                                                               
  |___/                                                                
*/
exports.getOneContent = function (req, res) {
    var mongoid = null, coleccion = null, obj = {};
    if (typeof req.query.mo_id !== 'undefined') { mongoid = req.query.mo_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }

    function queryUno (coleccion, mongoid, callback) {
		var mid = new ObjectID(mongoid);
		var criterio = { '_id' : mid };
		classdb.buscarToArray(coleccion, criterio, {}, 'feeds/getOneContent/queryUno', function(items){
            if (items.length < 1) {
                return callback([]);
            }else {
				var parent_post = {id:{$exists:true}};
				var criterioc = {
			    	$and : [
						{'from_user_id':items[0].from_user_id}, 
						{'eliminado':{$exists: false}},
						{'id': {$ne : items[0].id}}, 
						{'created_time':{$lte: items[0].created_time}}
			    	]
				};
				classdb.count(coleccion, criterioc, 'feeds/getMailbox/querySecundario', function(combien){
					if (combien === 'error') {
						return callback(combien);
					}else {
						items[0].conv_cuenta = combien;
						return callback(items);
					}
				});
            }
        });	
    }

    function querysecundario(cole, cont_id, fu_id, ctime, tipo, callback) {
		var criteriof = {
	    	$and : [
				{'from_user_id':fu_id}, 
				{'atendido': {$exists: false}}, 
				{'descartado': {$exists: false}}, 
				{'eliminado':{$exists: false}},
				{'id': {$ne : cont_id}}, 
				{'tipo':tipo}, 
				{'created_time':{$lte: ctime}}
	    	]
		};
		var sortf = {'created_time': 1};
		var limitf = 2;
		classdb.buscarToStreamLimit(cole, criteriof, sortf, limitf, 'feeds/getOneContent/querysecundario', function(conv){
			return callback(conv);
		});		
    }
    
    function actualizaMensaje(mensaje){
    	//Validacion que nos sirve para saber en que buzon esta
    	if(mensaje.descartado){    
			mensaje.tipoMensaje = 'descartado';
        }else if(!mensaje.descartado && !mensaje.eliminado && (mensaje.respuestas || mensaje.sentiment || mensaje.clasificacion || mensaje.atendido)){
			mensaje.tipoMensaje = 'atendido';
        }else if(!mensaje.descartado && !mensaje.atendido && !mensaje.eliminado && !mensaje.sentiment && !mensaje.clasificacion){
			mensaje.tipoMensaje = 'nuevo';
		}else{
			console.log('No entro a un buzon valido');
		}
		
		if (mensaje.obj === 'twitter') {
			switch(mensaje.tipo) {

				case 'direct_message':
					mensaje.nombre = mensaje.sender_screen_name;
					mensaje.imagen = mensaje.sender.profile_image_url;
					mensaje.imagen_https = mensaje.sender.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = '#';
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.sender.screen_name;
				break;
									
				case 'twit':
					mensaje.nombre = mensaje.user.screen_name;
					mensaje.imagen = mensaje.user.profile_image_url;
					mensaje.imagen_https = mensaje.user.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = mensaje.tw_url;
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.user.screen_name;
				break;

				case 'tracker':
					mensaje.nombre = mensaje.user.screen_name;
					mensaje.imagen = mensaje.user.profile_image_url;
					mensaje.imagen_https = mensaje.user.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = mensaje.tw_url;
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.user.screen_name;
				break;
									
				default:
					console.log('Entro a una opcion invalida en switch twitter');
					console.log('Tipo');
					console.log(mensaje.tipo);
			}//switch
		}else if (mensaje.obj === 'facebook') {
			switch(mensaje.tipo) {

				case 'facebook_inbox':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlEnlace = mensaje.conversation_link;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;
				break;

				case 'comment':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;
					var post = mensaje.parent_post.split('_');
					var id = mensaje.id.split('_');
					mensaje.urlEnlace = 'https://www.facebook.com/'+post[0]+'/posts/'+post[1]+'?comment_id='+id[1];
				break;
									
				case 'post':
					var idSeparado = mensaje.id.split('_');
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
                          console.log(mensaje.from.id);
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;                                                    
					mensaje.urlEnlace = 'https://www.facebook.com/'+idSeparado[0]+'/post/'+idSeparado[1];
				break;
				
				case 'rating':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id; 
					mensaje.urlEnlace = mensaje.rating_link;
				break;



				default:
					console.log('Entro a una opcion invalida en switch Faceboook');
					console.log('Tipo');
					console.log(mensaje.tipo);
			}//switch
		}//if facebook  
		return mensaje;  	
    }

    if (coleccion !== null && mongoid !== null) {
		queryUno(coleccion, mongoid, function(datos){
	    	if (datos !== 'error' && datos.length > 0) {
				var contenido = datos[0];
				querysecundario(coleccion, contenido.id, contenido.from_user_id, contenido.created_time, contenido.tipo, function(conversacion){
		    		if (conversacion === 'error') {
						obj = {'error': 'feeds/getOneContent - no obtuvimos datos secundarios de la bd'};
						res.jsonp(obj);
		    		}else {
						contenido.conversacion = conversacion;
						obj = contenido;
						var mensajeActualizado = actualizaMensaje(obj);
						res.jsonp(mensajeActualizado);
		    		}
				});
	    	}else {
				obj = {'error': 'feeds/getOneContent - no obtuvimos nada de la bd'};
				res.jsonp(obj);
	    	}
		});	
    }else {
		obj = {'error' : 'feeds/getOneContent - no recibimos los parámetros'};
		res.jsonp(obj);
    }
};
/*               _              _    ____              _____            _             _   
                | |            | |  / __ \            / ____|          | |           | |  
   ___ _ __   __| |   __ _  ___| |_| |  | |_ __   ___| |     ___  _ __ | |_ ___ _ __ | |_ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __| |  | | '_ \ / _ \ |    / _ \| '_ \| __/ _ \ '_ \| __|
 |  __/ | | | (_| | | (_| |  __/ |_| |__| | | | |  __/ |___| (_) | | | | ||  __/ | | | |_ 
  \___|_| |_|\__,_|  \__, |\___|\__|\____/|_| |_|\___|\_____\___/|_| |_|\__\___|_| |_|\__|
                      __/ |                                                               
                     |___/                                                                
*/

/*           _   _____          _   _   _       _   _  __ _                _             
            | | |  __ \        | | | \ | |     | | (_)/ _(_)              (_)            
   __ _  ___| |_| |__) |__  ___| |_|  \| | ___ | |_ _| |_ _  ___ __ _  ___ _  ___  _ __  
  / _` |/ _ \ __|  ___/ _ \/ __| __| . ` |/ _ \| __| |  _| |/ __/ _` |/ __| |/ _ \| '_ \ 
 | (_| |  __/ |_| |  | (_) \__ \ |_| |\  | (_) | |_| | | | | (_| (_| | (__| | (_) | | | |
  \__, |\___|\__|_|   \___/|___/\__|_| \_|\___/ \__|_|_| |_|\___\__,_|\___|_|\___/|_| |_|
   __/ |                                                                                 
  |___/                                                                                  
*/
exports.getPostNotificacion = function (req, res) {
    var mongoid = null, coleccion = null, obj = {};
    if (typeof req.query.mo_id !== 'undefined') { mongoid = req.query.mo_id; }
    if (typeof req.query.colec !== 'undefined') { coleccion = req.query.colec; }

    function queryUno (coleccion, mongoid, callback) {
	var mid = new ObjectID(mongoid);
	var criterio = {_id: mid};
	classdb.buscarToArray(coleccion, criterio, {}, 'feeds/getPostNotificacion/queryUno', function(items){
	    return callback(items);
	});
    }

    function querysecundario(cole, cont_id, usr_id, ctime, callback) {
	var criterio = {
	    $and : [
		{'from_user_id':usr_id}, 
		{'atendido': {$exists: false}}, 
		{'descartado': {$exists: false}}, 
		{'id': {$ne : cont_id}}, 
		{'created_time':{$lte: ctime}}
	    ]
	};
	var elsort = {'created_time': 1};
	var ellimit = 1;

	classdb.buscarToStreamLimit(cole, criterio, elsort, ellimit, 'feeds/getPostNotificacion/querysecundario', function(conversacion){
	    return callback(conversacion);
	});
    }

    if (coleccion !== null && mongoid !== null) {
	queryUno(coleccion, mongoid, function(datos){
	    if (datos !== 'error' && datos.length > 0) {
		var contenido = datos[0];
		contenido.coleccion = coleccion;
		querysecundario(coleccion, contenido.id, contenido.from_user_id, contenido.created_time, function(conversacion){
		    if (conversacion === 'error') {
			obj = {'error': 'feeds/getPostNotificacion - no obtuvimos datos secundarios de la bd'};
			res.jsonp(obj);
		    }
		    else {
			contenido.conversacion = conversacion;
			obj = contenido;
			res.jsonp(obj);
		    }
		});
	    }
	    else {
		obj = {'error': 'feeds/getPostNotificacion - no obtuvimos nada de la bd'};
		res.jsonp(obj);
	    }
	});
    }
    else {
	obj = {'error' : 'feeds/getPostNotificacion - no recibimos los parámetros'};
	res.jsonp(obj);
    }
};
/*               _              _   _____          _   _   _       _   _  __ _                _             
                | |            | | |  __ \        | | | \ | |     | | (_)/ _(_)              (_)            
   ___ _ __   __| |   __ _  ___| |_| |__) |__  ___| |_|  \| | ___ | |_ _| |_ _  ___ __ _  ___ _  ___  _ __  
  / _ \ '_ \ / _` |  / _` |/ _ \ __|  ___/ _ \/ __| __| . ` |/ _ \| __| |  _| |/ __/ _` |/ __| |/ _ \| '_ \ 
 |  __/ | | | (_| | | (_| |  __/ |_| |  | (_) \__ \ |_| |\  | (_) | |_| | | | | (_| (_| | (__| | (_) | | | |
  \___|_| |_|\__,_|  \__, |\___|\__|_|   \___/|___/\__|_| \_|\___/ \__|_|_| |_|\___\__,_|\___|_|\___/|_| |_|
                      __/ |                                                                                 
                     |___/                                                                                  
*/


exports.insertSentiment = function(req, res){
    var obj = {};
    var col = req.body.coleccion;
    var sentiment = req.body.sentiment;
    var id = new ObjectID(req.body.twit);
    var userName = req.body.user_name;
    var userId = req.body.user_id;
    var criterio = {'_id':id};
    var elset = {sentiment:sentiment,sentiment_user_name:userName, sentiment_user_id: userId, sentiment_fecha:new Date()};
    classdb.actualiza(col, criterio, elset, 'feeds/inserSentiment', function(sentiment){
	if (sentiment === 'error') {
	    obj = {'error': 'feed/insertSentiment - en conexión a mongo'};
	    res.jsonp(obj);
	}
	else {
	    obj = {'sentiment' : sentiment};
	    res.jsonp(obj);
	}
    });
};



exports.cancelSentiment = function(req,res){
    var obj = {};
    var col = req.body.coleccion;
    var id =new ObjectID(req.body.twit);
    
    var criterio = {'_id':id};
    var elunset = {sentiment: ''};
    classdb.actualizaUnsetcresult(col, criterio, elunset, 'feeds/cancelSentiment', function(sentiment){
	if (sentiment === 'error') {
	    obj = {'error': 'feed/cancelSentiment - en conexión a mongo'};
	    res.jsonp(obj);
	}
	else {
	    obj = {'unset_sentiment' : sentiment};
	    res.jsonp(obj);
	}
    });
};

exports.insertClasif = function(req, res){
    var obj = {};
    var extra = req.body.clas;
    var coleccion = req.body.coleccion;
    var id =new ObjectID(req.body.id);

    var criterio = {_id:id};
    var elset = {clasificacion:{tema:extra.tema,subtema:extra.subtema, user_id: extra.userid,user_name:extra.username}};
    classdb.actualizacresult(coleccion, criterio, elset, 'feeds/insertClasif', function(clasificacion){
	if (clasificacion === 'error') {
	    obj = {'error': 'feed/insertClasif - en conexión a mongo'};
	    res.jsonp(obj);
	}
	else {
	    obj = {'clasificacion' : clasificacion };
	    res.jsonp(obj);
	}
    });
};

exports.respInbox = function(req,res){
var obj = {}, mensaje = '', respuesta = '', coleccion = '', conv_id = '', cuenta = '', usid = '', nsist='', fbuserid = '', uat = '';
    if (req.body.obj) { mensaje = req.body.obj; conv_id = mensaje.conversation_id; }
    if (req.body.respuesta) { respuesta = req.body.respuesta; }
    if (req.body.coleccion) { coleccion = req.body.coleccion; }
    if (req.body.id) { cuenta = new ObjectID(req.body.id); }
    if (req.body.extra.userid) {usid = new ObjectID(req.body.extra.userid);}
    if (req.body.extra.nombreSistema) { nsist = req.body.extra.nombreSistema; }
    if (req.body.extra.fb_usid) { fbuserid = req.body.extra.fb_usid; }
    if (req.body.access_user) { 
	uat = req.body.access_user;
	var get_data = querystring.stringify({ access_token: req.body.access_user });
    }

  function getFacebookPageByCuenta(account_name, account_id, callback){
    var acc_id = new ObjectID(account_id);
    var criterio = {$and : [{ _id : acc_id }, { nombreSistema : account_name }]};
    classdb.buscarToArray('accounts', criterio, {}, 'accounts/procesaPendientes/getFacebookPageByCuenta', function(items){
      if (items === 'error') {
	return callback(items);
      }
      else {
	if (items.length < 1) {
	  console.log('accounts/procesaPendientes/getFacebookPageByCuenta - arreglo con la cuenta llegó vacío... raro');
	  return callback('error');
	}
	else {
	  if (typeof items[0].datosPage !== 'undefined' && typeof items[0].datosPage.id !== 'undefined') {
	    var page_id = items[0].datosPage.id;
	    return callback(page_id);
	  }
	  else {
	    console.log('accounts/procesaPendientes/getFacebookPageByCuenta - si hubo cuenta pero no hay datosPage, tal vez datosMonitoreo o solo twitter');
	    return callback('error');
	  }
	}
      }
    });
  }

  function responde (coleccion, post_data, conv_id, mensaje, callback) {
    //console.log(coleccion);	console.log(post_data);	console.log(conv_id); console.log(mensaje._id);	console.log('!!!!!!!! CONVER');	console.log(conv_id);
    globales.options_graph.method = 'POST';
    globales.options_graph.path = globales.fbapiversion+conv_id+'/messages';
    globales.options_graph.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Length': post_data.length
    };

    // console.log(globales.options_graph);
    var post_req = https.request(globales.options_graph, function(response) {
	             console.log('Respuesta de la solicitud inbox !!!!!! !! ! ! ! ! ! ! !');
	             response.setEncoding('utf8');
	             var resp = [];
	             var id_respuesta_facebook;
	             response.on('data', function (chunk) {
	    	       // console.log('A');
		       resp.push(chunk);
	             });
	             response.on('end', function(){
		       id_respuesta_facebook = JSON.parse(Buffer.concat(resp));
	    	       // console.log('RESPONSE !'); console.log(id_respuesta_facebook); console.log(mensaje._id);
		       var criterio = {'_id':new ObjectID(mensaje._id)};
		       var elset = {	
		         clasificacion:{
			   tema:req.body.extra.tema,
			   subtema:req.body.extra.subtema,
			   user_name: req.body.extra.username,
			   user_id: req.body.extra.userid
		         }
		       };
		       var eladdtoset = {	
		         respuestas: {
			   user_name:req.body.extra.username,
			   user_id: req.body.extra.userid,
			   texto:req.body.respuesta,
			   timestamp: new Date(),
			   id_respuesta:id_respuesta_facebook.id
		         }
		       };
		       // console.log('Apunto de actualizar clasificacion');
		       classdb.actualiza(coleccion, criterio, elset, 'feed/respinbox/responde', function(actualized){
		         // console.log(actualized);
		         if (actualized === 'error') {
			   return callback('error');
		         }
		         else {
		    	   // console.log('Apunto de actualizar respuesta');
			   classdb.actualizaAddToSetcresult(coleccion, criterio, eladdtoset, 'feed/respinbox/responde', function(addedtoset){
			     // console.log(addedtoset);
			     return callback(addedtoset);
			   });
		         }
		       });
	             });
	           });
    post_req.write(post_data);
    post_req.end();
    post_req.on('error', function(e){
      console.log('feeds/respInbox/responde error: '+e);
      console.log('Error: ' +e.message); 
      console.log( e.stack );
      return callback('error');
    });
  }

  // console.log('Respondiendo inbox Imprimiendo el valor de req.body++++++++++++++++++++++++++++++++++++++');
  // console.log(req.body);
  if (coleccion !== '' && cuenta !== '' && uat !== '' ) {
    // console.log('iniciando getFacebookPageByCuenta ++++++++');
    getFacebookPageByCuenta(nsist, cuenta, function(fb_cuenta){
      //console.log('El resutado de getFacebookPageByCuenta ++++++++++ id de la cuenta facebook');
      // console.log(cuenta);
      if (cuenta === 'error') {
	console.log('accounts/procesapendientes.main - no conseguimos la cuenta con id de facebook válido');
	res.jsonp('error');
      } else {
	//console.log('Obteniendo el accesToken de la pagina +++++++++++');
	//console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');
	//console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');
	//console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');
	//console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');
        accesstokens.obtienePagATByUsrAT(nsist, fb_cuenta, usid, fbuserid, uat, 'no', function(pat) {
	  // obtenPAT(coleccion, cuenta, uat, function(pat){
	  // console.log('REGRESANDO DE OBTENPAT !!!!');
	  // console.log(pat);
	  if(pat === 'error-face'){
	    obj = {'error-face': 'Error en respuesta de facebook, intenta mas tarde'};
	    res.jsonp(obj);
	  }else if (pat === 'error'){
	    obj = {'error': 'feed/respInbox - no conseguimos page access_token'};
	    res.jsonp(obj);
	  }
	  else {
	    var post_data = querystring.stringify({ message : respuesta, access_token: pat });
	    responde(coleccion, post_data, conv_id, mensaje, function(respfb){
	      if (respfb === 'error') {
		obj = {'error': 'feed/respInbox - hicimos post pero algo malo pasó'};
		res.jsonp(obj);
	      }
	      else {
		res.jsonp(respfb);
	      }
	    });
	  }
	});
      }
    });
  }
  else {
    console.log('feeds/respInbox.main -  no recibimos los datos necesarios para esta operación');
    res.jsonp('error');
  }
};

exports.respDM = function(req, res){
  // console.log('Respondiendo Direct MEssa');
    var obj = {};
    var item_id = new ObjectID(req.body.item._id);
    var cuenta_id = new ObjectID(req.body.cuenta);
    var consol = req.body.coleccion;
    var extra = req.body.clas;
    var criteriof = {'_id':cuenta_id};
    
    classdb.buscarToArray('accounts', criteriof, {}, 'feeds/respDM', function(items){
	if (items === 'error') {
	    obj = {'error': 'feed/respInbox - hicimos post pero algo malo pasó'};
	    res.jsonp(obj);
	}
	else {
	    var accesos_twitter = items[0].datosTwitter;
	    var T  = new Twit({
		'consumer_key'        : accesos_twitter.twitter_consumer_key,
		'consumer_secret'     : accesos_twitter.twitter_consumer_secret,
		'access_token'        : accesos_twitter.twitter_access_token,
		'access_token_secret' : accesos_twitter.twitter_access_token_secret
	    });
	    var parametros_twitter = {'user_id': req.body.item.sender.id_str, 'screen_name':req.body.item.sender.screen_name, 'text':req.body.respuesta};
	    T.post('direct_messages/new', parametros_twitter, function(err_twit, reply) {
		if(err_twit){
		    console.log(err_twit);
		    res.jsonp(err_twit);
		}else{
			// console.log(comprueba.compruebaDescartado(item_id, consol));
		    var criteriou = {'_id':item_id};
		    var setu = {
			clasificacion:{
			    tema:extra.tema,
			    subtema:extra.subtema,
			    user_name: extra.username,
			    user_id: extra.userid
			}
		    };
		    var addtosetu = {
			respuestas:{
			    user_name:extra.username,
			    user_id: extra.userid,
			    texto:decodeURI(reply.text),
			    timestamp: new Date(),
			    id_respuesta:reply.id
			}
		    };
		    classdb.actualiza(consol, criteriou, setu, 'feed/respInbox', function(updated){
			if (updated === 'error') {
			    obj = {'error': 'no pudimos actualizar mongo con tema/subtema'};
			    res.jsonp(obj);
			}
			else {
			    classdb.actualizaAddToSetcresult(consol, criteriou, addtosetu, 'feed/respInbox', function(addedtoset){
				if (addedtoset === 'error') {
				    obj = {'error': 'no pudimos guardar la respuesta en mongo'};
				    res.jsonp(obj);
				}
				else {
				    res.jsonp(addedtoset);
				}
			    });
			}
		    });
		}
	    });	    
	}
    });
};


exports.compruebaDescartado = function(id, coleccion){
	//var ObjectID = require('mongodb').ObjectID;
	//console.log('Llamando a comprueba descartado !!!!!!!!!!!! ');
	//console.log(id);
	//console.log(coleccion);
	id  = new ObjectID(id);
	var criterio = {'_id': id};
	classdb.buscarToStream(coleccion, criterio, {}, 'feeds/compruebaDescartado', function(item){
		if(item === 'error'){
			console.log('Error en compruebaDescartado');
		}else{
		    //console.log(item[0]);
		    if(typeof item[0] !== 'undefined' && item[0].descartado){
				var id_post = new ObjectID(item[0]._id);
				var criterio = {'_id':id_post};
			    var elset = {descartado: 1};
			    classdb.actualizaUnsetDelete(coleccion, criterio, elset, 'feeds/compruebaDescartado', function(actualizado){
			    	if(actualizado === 'error'){
			    		console.log('error');
			    	}else{
			    		//console.log('Descartado eliminado !!!!!!!');
			    		//console.log(actualizado);
			    		return true;
			    	}	
			    });
			}else{
				return false;
			}
		}
	});
};

exports.finalizar = function(req, res){

    function finalizaConversacion(coleccion, twit, conversacion, user_id, user_name, objectId, imagenUsuario, sentimientoGeneral, clasificacionGeneral, cback){
		var clasificacion = clasificacionGeneral;
		var id = new ObjectID(conversacion._id);
		if(!conversacion.sentiment) {
	    	conversacion.sentiment = sentimientoGeneral.tipo;
	    	conversacion.sentiment_fecha = sentimientoGeneral.fecha;
	    	conversacion.sentiment_imagen_usuario = sentimientoGeneral.imagen_usuario;
	    	conversacion.sentiment_user_id = sentimientoGeneral.user_id;
	    	conversacion.sentiment_user_name = sentimientoGeneral.user_name;	
		}
		if (!conversacion.clasificacion) {
	    	conversacion.clasificacion = clasificacion;
		}
		conversacion.clasificacion.imagen_usuario = imagenUsuario;
		
		if(!conversacion.descartado){
			var criterious = {_id : id};
			var setus = {
	    		atendido : {
					_id : objectId,
					usuario_id : user_id,
					usuario_nombre : user_name,
					fecha : new Date(),
					usuario_foto : imagenUsuario
	    		}, 
	    		clasificacion : conversacion.clasificacion, 
	    		sentiment : conversacion.sentiment, 
	    		sentiment_fecha : conversacion.sentiment_fecha,
	    		sentiment_imagen_usuario : conversacion.sentiment_imagen_usuario,
	    		sentiment_user_name : conversacion.sentiment_user_name, 
	    		sentiment_user_id : conversacion.sentiment_user_id,
	    		sentimiento : {
	    			tipo : conversacion.sentiment,
	    			user_name : conversacion.sentiment_user_name,
	    			user_id : conversacion.sentiment_user_id,
	    			fecha : conversacion.sentiment_fecha,
	    			imagen_usuario : conversacion.sentiment_imagen_usuario
	    		}
			};
			classdb.actualizacresult(coleccion, criterious, setus, 'feeds/finalizar/finalizaConversacion', function(updated){
		    	console.log('actualizando el resultado en finalizaConversacion');
          console.log(updated);
          if(updated === 'error'){
		    		return cback('error');
		    	//}else if(updated === 1){
          }else{
					var cuenta = coleccion.split('_');
					if(twit.influencers || twit.asignado){
						var socketio = req.app.get('socketio'); // take out socket instance from the app container
						socketio.sockets.in(cuenta[0]).emit('auxiliarNotificacion',{_id:id,cuenta:cuenta[0]});
					}
            console.log('Se actualizo el siguiente twit !!!');
            console.log(conversacion._id);
		    		return cback(conversacion._id);
		    	}
			});
		}else{
			return cback(conversacion._id);
		}
    }

    function procesaConversaciones(coleccion, contenido, user_id, user_name, objectId, contenidos, index, contenidosprocesados, imagenUsuario, sentimientoGeneral, clasificacionGeneral, callback){
		var more = index+1;
		var cuantos = contenidos.length;
		if (more > cuantos) {
	    	return callback(contenidosprocesados);
		}else {
			setImmediate(function(){
		    	finalizaConversacion(coleccion, contenido, contenidos[index], user_id, user_name, objectId, imagenUsuario, sentimientoGeneral, clasificacionGeneral, function(conv){
					
             console.log('Regresando de procesaConversaciones prubas');
        console.log(conv);

          if (conv === 'error'){
			    		return procesaConversaciones(coleccion, contenido, user_id, user_name, objectId, contenidos, more, contenidosprocesados, imagenUsuario, sentimientoGeneral, clasificacionGeneral, callback);
					}else{
			    		contenidosprocesados.push(conv);
			    		return procesaConversaciones(coleccion, contenido, user_id, user_name, objectId, contenidos, more, contenidosprocesados, imagenUsuario, sentimientoGeneral, clasificacionGeneral, callback);
					}
		    	});
			});
		}	
    }

    function mensajeActualizado(coleccion, idMensaje, callback){
    	var mensajeId = new ObjectID(idMensaje);
    	classdb.buscarToArray(coleccion, {'_id' : mensajeId}, {}, 'feeds/respondeMailbox/mensajeActualizado', function(mensaje){
			if (mensaje === 'error') {
	    		obj = {'error': 'feed/respondeMailbox/mensajeActualizado - error al pedir mensajeActualizado'};
	    		return callback(obj);
			}
			else {
				return callback(mensaje);
			}
		});
  	}

	var imagenUsuario = req.body.twit.imagenUsuario;
    var obj = {};
    var conversaciones = [];
    var objectId = new ObjectID();
    var twit = req.body.twit;
    var user_id  = req.body.user_id;
    var user_name = req.body.user_name;
    var twit_id = new ObjectID(req.body.twit._id);
    var coleccion = req.body.coleccion;
    var criteriou = {_id : twit_id};
    var setu = {
		atendido:{
	    	_id : objectId,
	    	usuario_id : user_id,
	    	usuario_nombre : user_name,
	    	fecha : new Date(),
			usuario_foto : imagenUsuario
		}
    };

    classdb.actualiza(coleccion, criteriou, setu, 'feeds/finalizar', function(updated){
		if (updated === 'error') {
		    obj = {'error': 'no pudimos finalizar la conversacion'};
		    res.jsonp(obj);
		}else {
			mensajeActualizado(coleccion, twit_id, function(mensajeActualizado){
				if(mensajeActualizado.error || mensajeActualizado.length < 1){
				  obj = {'error': 'no pudimos pedir el mensaje actualizado'};
		    		  res.jsonp(obj);
				}else{
				  mensajeActualizado = mensajeActualizado[0];
				  var clasificacionGeneral = mensajeActualizado.clasificacion;
    				  var sentimientoGeneral = mensajeActualizado.sentimiento;
				  var tipo = {};
					if(mensajeActualizado.obj === 'facebook'){
						if(mensajeActualizado.tipo !== 'facebook_inbox'){
							tipo = { 
								$or: [ 
									{tipo : {$eq : 'comment'}},
									{tipo : {$eq : 'post' }} 
								] 
							};
						}else{
							tipo = {
								tipo : {$eq : 'facebook_inbox'}
							};
						}
					}else{
						if(mensajeActualizado.tipo === 'direct_message'){
							tipo = {
								tipo : {$eq:'direct_message'}
							};
						}else{
							tipo = {
								tipo: {$eq:'twit'}
							};
						}
					}

					var criteriof = {
						$and : [
					    	{'from_user_id' : mensajeActualizado.from_user_id}, 
					    	{'atendido' : {$exists : false}}, 
					    	{'descartado': {$exists : false}}, 
					    	{'id' : {$ne : mensajeActualizado.id}}, 
					    	{'eliminado' : {$exists : false}},
					    	tipo,
					    	{'created_time':{$lt : new Date(mensajeActualizado.created_time)}}
						]
				    };
				    
				    classdb.buscarToArray(coleccion, criteriof, {}, 'feeds/finalizar', function(items){
						if(items === 'error'){
							//console.log(obj);
					    	obj = {'error': 'se actualizó correctamente pero no el historial'};
					    	res.jsonp(obj);
						}else {
					    	if (items.length > 0) {
                console.log('Si tiene historial !!! ');
								procesaConversaciones(coleccion, mensajeActualizado, user_id, user_name, objectId, items, 0, [], imagenUsuario, sentimientoGeneral, clasificacionGeneral, function(resp_pc){
						    		console.log('Se actualizaron estos registros ');
                    console.log(resp_pc);
                    res.jsonp(resp_pc);
								});
					    	}else {
								obj = {'ok': 'se actualizó contenido, y no tenía historial'};
								res.jsonp(obj);
					    	}
						}
				    });
				}
			});
		}
    });
};

exports.follow = function(req, res){
    var screen_name_follow = req.body.screen_name;
    var user_id_follow = req.body.user_id;
    var cuenta_id = new ObjectID(req.body.id_cuenta);
    var criteriof = {'_id':cuenta_id};
    var obj = {};
    
    classdb.buscarToArray('accounts', criteriof, {}, 'feeds/respDM', function(items){
		if (items === 'error') {
		    obj = {'error': 'feed/respInbox - hicimos post pero algo malo pasó'};
		    res.jsonp(obj);
		}
		else {
		    var accesos_twitter = items[0].datosTwitter;
		    var T  = new Twit({
			'consumer_key'        : accesos_twitter.twitter_consumer_key,
			'consumer_secret'     : accesos_twitter.twitter_consumer_secret,
			'access_token'        : accesos_twitter.twitter_access_token,
			'access_token_secret' : accesos_twitter.twitter_access_token_secret
		    });
		    var parametros_twitter = {'screen_name':screen_name_follow,'user_id':user_id_follow,'follow':true};
		    T.post('friendships/create', parametros_twitter, function(err_follow, reply){
		    	if(err_follow){
		    		console.log('Error en follow');
		    		res.jsonp(err_follow);
		    	}else{
		    		//console.log('Correcto !');
		    		//console.log(reply);
		    		res.jsonp(reply);
		    	}
		    });
		}
	});
};
exports.totalPendientesEscondido = function(req,res){
	console.log(socketio.sockets)
	console.log('METODO VACIO TOTAL PENDIENTES ');
}
exports.totalPendientes = function(req,res){
	var socketio = req.app.get('socketio');
	var coleccion = req.body.coleccion;
	var id_cuenta = req.body.id_cuenta;
	var criteriopage = { id : { $exists : true }};
	var criteriotipo = { _id : {$exists : true }};
	var criterioobj = { _id : {$exists : true }};
	var tipo = req.body.filtro;
	var criterio_filtro = {};

	switch(tipo){
		case 'facebook':
			criterio_filtro = {obj:{$eq:'facebook'}};
		break;
		case 'facebook_public':
			criterio_filtro = {
				$or: [ 
					{'tipo':{$eq: 'comment'}}, 
					{'tipo':{$eq:'post'}},
					{'tipo':{$eq:'rating'}},
          {type:"video"},
          {type:"link"},
          {type:"status"}
				]
			};
		break;
		case 'facebook_inbox':
			criterio_filtro = {tipo:{$eq:'facebook_inbox'}};
		break;	
		case 'rating':
			criterio_filtro = {tipo:{$eq:'rating'}};
		break;	
		case 'twitter':
			criterio_filtro = {obj:{$eq:'twitter'}};
		break;
		case 'twitter_public':
			criterio_filtro = {tipo:{$eq:'twit'}};
		break;
		case 'direct_message':
			criterio_filtro = {tipo:{$eq:'direct_message'}};
		break;
		case 'tracker':
			criterio_filtro = {tipo:{$eq:'tracker'}};
		break;			
																												
	}




	function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailboxResuelto/querySecundario', function(datos){
		   return callback(datos);
		});
	}

	getdatoscuenta(id_cuenta, function(datosCuenta){
		var criterio = {};
		var elcriterio = {
		    $and : [
			{'descartado':{$exists: false}}, 
			{'atendido':{$exists: false}}, 
			{'clasificacion':{$exists: false}},
			{'eliminado':{$exists: false}},
			{'retweeted_status':{$exists:false}},
			{'sentiment':{$exists:false}},
      //{'tipo':{$exists:true}},
    //{'obj':{$exists:true}},
			criteriopage, 
			criterioobj, 
			criteriotipo,
			criterio_filtro
		    ]
		};

		if(datosCuenta[0] && datosCuenta[0].datosPage){
			   criterio = {
			       $and : [
				   {'from_user_id' : {$ne : datosCuenta[0].datosPage.id}},
				   {'descartado':{$exists: false}}, 
				   {'atendido':{$exists: false}}, 
				   {'eliminado':{$exists: false}},
				   {'sentiment':{$exists:false}},
				   {'clasificacion':{$exists:false}},
				   {'retweeted_status':{$exists:false}},
				   {'respuestas':{$exists: false}},
				   criteriopage, 
				   criterioobj, 
				   criteriotipo,
				   criterio_filtro ]};
		}else if(datosCuenta[0] && datosCuenta[0].datosMonitoreo){
			criterio = {
				$and : [
				    {'from_user_id' : {$ne : datosCuenta[0].datosMonitoreo.id}},
				    {'atendido': {$exists: false}}, 
				    {'descartado': {$exists: false}}, 
				    {'sentiment': {$exists : false}}, 
					criterio_filtro,
				  //  {'clasificacion.tema':{$exists: false}},
				    {'respuestas':{$exists: false}}
				],
				$or: [ 
					{'clasificacion':{$exists: false}}, 
					{'clasificacion.tema':{$eq:'Tema'}}
				]
			    };
			criterio = {
			    $and : [
				{'from_user_id' : {$ne : datosCuenta[0].datosMonitoreo.id}},
				{'descartado':{$exists: false}}, 
				{'atendido':{$exists: false}}, 
				{'eliminado':{$exists: false}},
				{'sentiment':{$exists:false}},
				{'clasificacion':{$exists:false}},
				criterio_filtro,
				criteriopage, 
				criterioobj, 
				criteriotipo ]};
		}else{
			criterio = {
				$and : [
				    {'atendido': {$exists: false}}, 
				    {'descartado': {$exists: false}}, 
				    {'sentiment': {$exists : false}}, 
				    {'clasificacion':{$exists: false}},
				    {'respuestas':{$exists: false}},
					criterio_filtro
				]
			    };
			//criterio = {$and : [{{'from_user_id' : {$ne : datosCuenta[0].datosPage.id}},'descartado':{$exists: false}}, {'atendido':{$exists: false}}, {'eliminado':{$exists: false}},{'clasificacion.tema':{$exists:false}},{'clasificacion.tema':{$ne:'Tema'}},{sentiment:{$exists:false}},criteriopage, criterioobj, criteriotipo ]};
		}
	    //console.log('Imprimiento query para obtener Nuevos del metodo');
      //console.log(coleccion.split('_')[0]);
		//console.log('criterioerio de busqueda');
		//console.log();
		// console.log(JSON.stringify(criterio));
	    classdb.count(coleccion,criterio,{},function(count){
		 //console.log('count !!!!!!!!!');
		 //console.log(count);
		if(count === 'error'){
		    console.log('error');
		}else{
		    res.jsonp(count);
		    var cuenta = coleccion.split('_')[0];
		    socketio.sockets.in(cuenta).emit('socketPendientes',count);
		}
	    });
	});
};
exports.guardaFollow = function(req, res){
	var obj = req.body.obj;
	var coleccion = req.body.coleccion;
	classdb.inserta(coleccion, obj, 'feeds/influencersInserta', function(inserta){
		if(inserta === 'error'){
			console.log('Error al insertar influencer');
		}else{
			// console.log('Influencer agregado correctamente !!!!');
			res.jsonp('Correcto');
		}
	});
};
exports.unfollow = function(req, res){
	var screen_name_follow = req.body.screen_name;
	var user_id_follow = req.body.user_id;
    var cuenta_id = new ObjectID(req.body.id_cuenta);
    var criteriof = {'_id':cuenta_id};
    var obj = req.body.obj_save;
    var coleccion = req.body.coleccion;
    classdb.buscarToArray('accounts', criteriof, {}, 'feeds/respDM', function(items){
		if (items === 'error') {
		    obj = {'error': 'feed/respInbox - hicimos post pero algo malo pasó'};
		    res.jsonp(obj);
		}
		else {
		    var accesos_twitter = items[0].datosTwitter;
		    var T  = new Twit({
			'consumer_key'        : accesos_twitter.twitter_consumer_key,
			'consumer_secret'     : accesos_twitter.twitter_consumer_secret,
			'access_token'        : accesos_twitter.twitter_access_token,
			'access_token_secret' : accesos_twitter.twitter_access_token_secret
		    });
		    var parametros_twitter = {'screen_name':screen_name_follow,'user_id':user_id_follow};
		    T.post('friendships/destroy', parametros_twitter, function(err_follow, reply){
		    	if(err_follow){
		    		console.log('Error en unfollow');
		    		res.jsonp(err_follow);
		    	}else{
					var coleccion = req.body.coleccion;
					var criterio ={
						$and : [
						    {'user_follow_id':obj.user_follow_id}, 
						    {'user_follow_screenname': obj.user_follow_screenname} 
						]
					};
					classdb.remove(coleccion, criterio, 'feeds/EliminaInfluencer', function(inserta){
						if(inserta === 'error'){
							console.log('Error al eliminar influencer');
						}else{
							//console.log('Influencer agregado correctamente !!!!');
							res.jsonp('Correcto');
						}
					});
		    	}
		    });
		}
	});
};
exports.isFollow = function(req, res){
	//console.log('Is follow !!!!!!!!!!!!!!!!!!!!!!!');
	//console.log(req.body);
	var user_id_follow = req.body.user_follow_id;
	var user_screenname_follow = req.body.user_follow_screenname;
	var coleccion = req.body.coleccion;
	
	var criterio = { $or: [ { 'user_follow_id': user_id_follow}, { 'user_follow_screenname': user_screenname_follow } ] };
	classdb.existefind(coleccion, criterio,'ClassDb/getFollows',function(existe){
		//console.log('LLamando a isFollow SErvers');
		//console.log(existe);
		if(existe === 'error'){
			res.jsonp('false');
		}else{
			if(existe === 'noexiste'){
				res.jsonp('false');
			}else{
				res.jsonp('true');
			}
		}
	});
};

exports.cambiaInbox = function(req, res) {
  function getAccounts(callback) {
    var accountfields = {
      '_id' : '', 
      'nombreSistema' : '', 
      'created_time' : ''
    };

    classdb.buscarToArrayFields('accounts', {}, accountfields, {}, 'feeds/cambiaInbox/getAccounts', function(diecuenten) {
    return callback(diecuenten);
    });
  };

  function iteraCtasGetConsolidadas(ctas, index, callback) {
    var more = index+1;
    var cuantas = ctas.length;
    if (more > cuantas) {
      return callback('ok');
    }
    else {
      setImmediate(function(){
        if (typeof ctas[index] !== 'undefined') {
          var critere = {
              $and : [
                {$or:
                 [
                   {'clasificacion' : {$exists:true}},
                   {'sentiment': {$exists:true}},
                   {'respuestas': {$exists: true}}
                 ]
                },
                {'atendido': {$exists: false}}
              ]
          };
          var lacuenta = ctas[index].nombreSistema+'_consolidada';
          classdb.buscarToArray(lacuenta, critere, {}, 'feeds/cambiaInbox/iteraCtasGetConsolidadas', function(items){
            //console.log('**************************** items de la cuenta: '+lacuenta);
            //console.log(JSON.stringify(items));
            return iteraCtasGetConsolidadas(ctas, more, callback);
          });
        }
        else {
          return iteraCtasGetConsolidadas(ctas, more, callback);
        }
      });
    }
    
  }
  
// obtener cuentas y revisar las colecciones consolidadas

// En cada colección debemos de buscar con criterios: todas las que tengan sentiment, clasificación y/o respuestas

// Si cumple con el criterio adecuado lo cerramos, si le falta sentiment o clasificacion; les ponemos una bandera
// fin
  getAccounts(function(cuentas){
    iteraCtasGetConsolidadas(cuentas, 0, function(respuesta){
      if (respuesta === 'ok') {
        //console.log(cuentas);
        res.jsonp(cuentas);
      }
    });
  });
};

exports.changeString = function(req,res){
  var coleccion = 'arabela_consolidada';
  var obj = {};
  function procesaObjetoToString(array, index, coleccion, cback){
    var more = index + 1;
    if(array.length > index){
      setImmediate(function(){
	if(array[index].tipo === 'comment' && array[index].from){
          //console.log('CAMBIANDO !!!!!!!!!');
          //console.log(array[index]);
	  var criterio = {_id: array[index]._id};
	  var set = {from_user_id: array[index].from.id.toString()};
	  classdb.actualiza(coleccion,criterio,set, 'Actualizando elemento '+index, function(actualiza){
	    if(actualiza!== 'error'){
	      procesaObjetoToString(array,more,coleccion,cback);
	    }
	  });
	}else{
	  procesaObjetoToString(array,more,coleccion,cback);
	}
      });
    }else{
      cback('listo '+coleccion);
    }		
  }

  classdb.buscarToArray(coleccion,{},{},'Imprimiendo los resultados del changeString',function(data){
    if (data === 'error') {
      res.jsonp(data);
    }
    else {
      procesaObjetoToString(data, 0, coleccion, function(resultado){
        res.jsonp(resultado);
      });
    }
  });
};

exports.asignaMensaje = function(req, res){
	
	
    function procesaConversaciones(coleccion, asignado, contenidos, index, contenidosprocesados, callback){
	var more = index+1;
	var cuantos = contenidos.length;
	if (more > cuantos) {
	    return callback(contenidosprocesados);
	}
	else {
		setImmediate(function(){
		    finalizaConversacion(coleccion, contenidos[index], asignado, function(conv){
			if (conv === 'error'){
			    return procesaConversaciones(coleccion, asignado, contenidos, more, contenidosprocesados, callback);
			}
			else{
        console.log('El resultado de finalizaConversacion conv');
        console.log(conv);
			    contenidosprocesados.push(conv);
			    return procesaConversaciones(coleccion,asignado, contenidos, more, contenidosprocesados, callback);
			}
		    });
		});
	}	
    }

    function finalizaConversacion(coleccion, mensaje,asignado, cback){
	var id = new ObjectID(mensaje._id);
	var criterious = {_id : id};
	var setus = {
	    asignado:asignado
	    };
	classdb.actualizacresult(coleccion, criterious, setus, 'feeds/finalizar/finalizaConversacion', function(updated){
	    console.log('IMPRIMIENDO EL ACTUALIZA !!!!');
	    console.log(updated);
	    if(updated === 'error'){
	    	return cback('error');
	    }else{
	    	return cback(mensaje._id);
	    }
	});
    }	
	function asignaConversacion(obj,cback){
		var tipo;
		if(obj.obj === 'facebook'){
			//console.log('Es tipo facebook !!!');
			if(obj.tipo !== 'facebook_inbox'){
				tipo = { $or: [ { tipo:'comment' }, { tipo:'post' } ] };
			}else{
				tipo = {tipo:'facebook_inbox'};
			}
		}else{
			//console.log('Es tipo twitter');
			if(obj.tipo === 'direct_message'){
				tipo = {tipo: 'direct_message'};
			}else{
				tipo = {tipo: 'twit'};
			}
		}
		//console.log('Se asigno un tipo y es !! ');
		//console.log(tipo);


	    var criteriof = {
		$and : [
		    {'from_user_id':obj.from_user_id}, 
		    {'atendido': {$exists: false}}, 
		    {'descartado': {$exists: false}}, 
		    //{'id': {$ne : twit.id}}, 
		    {'eliminado':{$exists:false}},
		    //{'type':twit.type},
		    //{'created_time':{$lt: new Date(obj.created_time)}},
			 tipo
		]
	    };
		//console.log('STRINGIFU !!!!');
		//console.log(JSON.stringify(criteriof));
		//console.log(coleccion);
		//console.log(obj);
	    classdb.buscarToArray(coleccion, criteriof, {}, 'feeds/finalizar', function(items){
		if(items === 'error'){
		    obj = {'error': 'se actualizó correctamente pero no el historial'};
		    res.jsonp(obj);
		}
		else {
		    if (items.length > 0) {
		    	//console.log('++++++++++++   Items a resolver !!!!!!');
		    	//console.log(items);
		    	//console.log('NUMERO !!!');
		    	//console.log(items.length);
			procesaConversaciones(coleccion,obj.asignado,items, 0, [], function(resp_pc){
			   //console.log('Imprimiendo el resultado de finalizaConversacion !!!! +++++++++++');
			    //console.log(resp_pc);
			    res.jsonp(resp_pc);
			});
		    }
		    else {
			obj = {'ok': 'se actualizó contenido, y no tenía historial'};
			res.jsonp(obj);
		    }
		}
	    });
	};
	
	

  // console.log('Asignando mensaje ++++++++++++');
  var id = new ObjectID(req.body.id);
  var coleccion = req.body.coleccion+'_consolidada';
  var asignado = req.body.asignado;
  var criterio = {_id:id};
  var socketio = req.app.get('socketio'); // take out socket instance from the app container
  var error = {};
  var obj_asigna = {coleccion:coleccion, asignado:asignado,_id:id,tipo:req.body.tipo,obj:req.body.obj,from_user_id:req.body.from_id,created_time:req.body.created_time};
  classdb.actualiza(coleccion, criterio,{asignado : asignado}, 'Asignando el mensaje en base', function(respuesta){
    if (respuesta === 'error') {
      //Regresamos error
      error = {
	code:100,
	message: 'Error al asignar mensaje'
      };
      res.jsonp(error);
    }
    else {
      //console.log(respuesta);
      //Obtenemos el mensaje asignado
      classdb.buscarToStream(coleccion, criterio, {}, 'Obteniendo el mensaje asignado', function(mensaje){
        if (mensaje === 'error') {
	  error = {
	    code:100,
	    message: 'Error al obtener el mensaje para notificar'
	  };
	  res.jsonp(error);
        }
        else {
	  //console.log(mensaje);
	  var notificacion = {
	    mongo_id: req.body.id,
	    coleccion: coleccion,
	    cuenta: req.body.coleccion,
	    profile_image: req.body.usuario_asignador_foto,
	    text: req.body.asignado.de_name+' te ha asignado un mensaje',
	    user_screen_name: req.body.asignado.usuario_asignado_displayName,
	    created_time: new Date(),
	    usuarios:[{_id:new ObjectID(req.body.asignado.usuario_asignado_id)}]
	  };

	  classdb.existefind('notificaciones',{mongo_id:req.body.id},'Buscando notificaciones en base',function(existe){
	    if(existe === 'error'){
	      error = {
		code:100,
		message: 'Error en buscar notificacion activa'
	      };
	      res.jsonp(error);
	    }else{
	      //console.log(existe);
	      if(existe === 'existe'){
		//console.log('Entro a eliminar notificacion!');
		var id_notificacion = req.body.id;
		//console.log('Eliminando notificacion en el server !!! ');
		//console.log(id_notificacion);
		var critere = {$or:[{'_id': new ObjectID(id_notificacion)},{mongo_id:id_notificacion.toString()}]};
		classdb.remove('notificaciones', critere, 'express/.main', function(removed) {
		  if (removed === 'error') {
		    //console.log('Error al borrar la notificación');
                    error = {
		      code:100,
		      message: 'Error al borrar la notificacion'
	            };
	            res.jsonp(error);
		  }
		  else {
		    //console.log('Notificacion eliminada');
		    socketio.sockets.emit('quitaNotificacion', id_notificacion);
		    classdb.insertacresult('notificaciones', notificacion, 'core/notificacion.main', function(data){
		      if (data === 'error') {
		      	console.log('Error al insertar notificacion');
            error = {
		          code:100,
		          message: 'Error al insertar la notificacion'
	                };
			res.jsonp(error);
		      }else{
			socketio.sockets.emit('notify', data[0]); // emit an event for all connected client
			asignaConversacion(obj_asigna, function(items){
				console.log('Se asignaran estos elementos');
				res.jsonp(items);
			});
			
		      }
		    });
		  }
		});
	      }
              else {
		//console.log('La notificacion no existe vamos a insertarla');
		classdb.insertacresult('notificaciones', notificacion, 'core/notificacion.main', function(data){
		  if (data === 'error') {
		    console.log('Error al insertar notificacion');
                    error = {
		      code:100,
		      message: 'Error al insertar la notificacion'
	            };
		    res.jsonp(error);
		  }else{
		    console.log('Notificacion insertada correctamente');
		    console.log(data);
		    socketio.sockets.in(data[0].cuenta).emit('notify', data[0]); // emit an event for all connected client
		    //res.jsonp(data);
			asignaConversacion(obj_asigna, function(items){
				//console.log('Se asignaran estos elementos')
				res.jsonp(items);
			});
		  }
		});
	      }
	    }
	  });
	}	
      });
    }
  });
};

exports.nuevoBuzon = function(req, res){
	var coleccion = req.query.coleccion;
	var cuenta_id = req.query.cuenta_id;
	var inicio = parseInt(req.query.inicio);
	classdb.nuevoBuzon(coleccion,cuenta_id,inicio,'nuevoBuzon / probando ', function(data){
		res.jsonp(data);
	});
};

exports.buscar = function(req, res){
  var criterio = req.query.criterio;
  var nombreSistema = req.query.coleccion;
  var coleccion = req.query.coleccion+'_consolidada';
  var tipo = req.query.tipo;
  var skip = parseInt(req.query.skip);

  if(!skip){
    skip = 0;
  }
  classdb.buscarToArrayFields('accounts',{nombreSistema:nombreSistema},{datosPage:1,_id:0},{},'Buscando cuenta en metodo busqueda',function(account){
    var query = {};
    var page_id = {_id:{$exists:true}};
    if(account!== 'error'){
      page_id = {from_user_id:{$ne:account[0].datosPage.id}};
    }
    switch(tipo){
      case 'entrada':
      //console.log('Es entrada !!');
      query = {$and:[
	{'clasificacion':{$exists:false}},
	{'respuestas':{$exists: false}},
	{'sentiment':{$exists: false}},
	{'atendido':{$exists: false}},
	{'descartado': {$exists: false}},
	{'eliminado':{$exists:false}},
	{'retweeted_status':{$exists: false}},
	{$or:[
	  {'from_user_name':new RegExp(regex(criterio),'i')},
	  {'user.screen_name': new RegExp(regex(criterio),'i')}
	]},
	page_id						
      ]};
      break;
      case 'proceso':
      //console.log('Es proceso !!');
      query = {$and:[
	{'retweeted_status':{$exists: false}},
	{'atendido':{$exists:false}},
	{'descartado': {$exists: false}},
	{'eliminado':{$exists:false}},
	{$or:[
	  {'from_user_name':new RegExp(regex(criterio),'i')},
	  {'user.screen_name': new RegExp(regex(criterio),'i')}
	]},
	page_id,
	{$or: [
	  {'sentiment' : { $exists : true }}, 
	  {'clasificacion' : { $exists : true }},
	  {'respuestas' : { $exists: true }}		
	]}					
      ]};
      break;
      case 'resueltos':
      //console.log('Es resueltos !!');
      query = {$and:[
	{'retweeted_status':{$exists: false}},
	{$or:[
	  {'from_user_name':new RegExp(regex(criterio),'i')},
	  {'user.screen_name': new RegExp(regex(criterio),'i')}
	]},
	{'atendido':{$exists:true}},
	{'eliminado':{$exists:false}},
	page_id			
      ]};
      break;
      case 'descartados':
      //console.log('Es descartados !!');
      query = {$and:[
	{'retweeted_status':{$exists: false}},
	{'from_user_name':new RegExp(regex(criterio),'i')},
	{'descartado':{$exists:true}},
	page_id			
      ]};
      break;
      default:
      console.log('error no recibimos tipo !'); 
      return;
    }

    classdb.buscarToStreamLimitSkip(coleccion,query,{'created_time':-1},15,skip,'Query busqueda entrada', function(data){
      if(data.length > 0){
	obtieneHistorialCuenta(data,0,tipo,page_id,coleccion,function(respuesta){
	   res.jsonp(respuesta);
	 });
      }else{
	res.jsonp(data);
      }
    });
  });

  function obtieneHistorialCuenta(data,index,tipo,page_id,coleccion,cback){
    var more = index + 1;
    if(more <= data.length) {
      var querysecundario = {};
	  switch(tipo){
	    case 'entrada':
	    case 'proceso':
	    querysecundario = {
	      $and : [
		{'from_user_id':data[index].from_user_id},
		//{'atendido': {$exists: false}}, 
		//{'descartado': {$exists: false}}, 
		{'eliminado':{$exists: false}},
		{'id': {$ne : data[index].id}}, 
		{'created_time':{$lte: new Date(data[index].created_time)}}
	      ]
	    };
	    break;
	    case 'resueltos':
	    querysecundario = {
	      $and : [
		{'from_user_id':data[index].from_user_id},
		//{'atendido': {$exists: true}}, 
		//{'descartado': {$exists: false}}, 
		{'eliminado':{$exists: false}},
		{'id': {$ne : data[index].id}}, 
		{'created_time':{$lte: new Date(data[index].created_time)}}
	      ]
	    };
	    break;
	    case 'descartados':
	    querysecundario = {
	      $and : [
		{'from_user_id':data[index].from_user_id}, 
		//{'atendido': {$exists: false}}, 
		//{'descartado': {$exists: true}}, 
		{'eliminado':{$exists:false}},
		{'id': {$ne : data[index].id}}, 
		{'created_time':{$lte: new Date(data[index].created_time)}}
	      ]
	    };
	    break;
	  }

      classdb.count(coleccion, querysecundario,'Contando en busqueda',function(conv_cuenta){
        data[index].conv_cuenta = conv_cuenta + 1;
        data[index].conversacion = [];
	obtieneHistorialCuenta(data,more,tipo,page_id,coleccion,cback);
      });
    }else{
      cback(data);
    }
  }

	function regex(string) {
	    var charac = string;
	    var accents=  [];
	    accents.a = ['aá'];
	    accents.e = ['eé'];
	    accents.i = ['ií'];
	    accents.o = ['oó'];
	    accents.u = ['uúü'];
	    var is_accent = false;
	    var reg = '';
	    for(var i in charac){
	        for(var j in accents){
	            if(charac[i] === j){
	                reg += '['+accents[j]+']';
	                is_accent = true;
	                break;
	            }else{
	                is_accent = false;
	            }
	        }
	        if(!is_accent){
	            reg += charac[i];
	        }
	    }
	    return reg;
	}

};
exports.nuevosPosts = function(req, res){
	console.log('Llamando a nuevospost Server');
	console.log(req.query);
	var last_ct = null;
    var tipo = null;
    var id_cuenta = null;
    if (typeof req.query.lastct !== 'undefined') { last_ct =req.query.lastct; }
    if (typeof req.query.tipo !== 'undefined') { tipo =req.query.tipo; }
    if (typeof req.query.id_cuenta !== 'undefined') { id_cuenta =req.query.id_cuenta; }


    getdatoscuenta(id_cuenta, function(datos_cuenta){
    	//console.log('Llamando a getdatoscuenta');
	    if(datos_cuenta[0]){	
			var cuenta = datos_cuenta[0].nombreSistema;
			var obj = {};
			if (datos_cuenta !== 'error' & datos_cuenta.length > 0) {
			    var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
			    //console.log(coleccion +' '+ new Date());
			    var page_id = '';
			    if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
				//console.log('tiene datosPage y es válido');
				page_id = datos_cuenta[0].datosPage.id;
			    }
			    else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
				//console.log('tiene datosMonitoreo y es válido');
				page_id = datos_cuenta[0].datosMonitoreo.id;
			    }
			    if (page_id === '') {
			    	//console.log('Page Id es igual a vacio');
				res.jsonp(obj);
			    }
			    else {
				querybuzon(coleccion, last_ct, page_id, tipo, function(lacuenta) {
				    if (lacuenta === 'error') {
					res.jsonp(obj);
				    }
				    else {
					obj.cuenta = lacuenta;
					res.jsonp(obj);
				    }
				});		
			    }
			}
		}
    });

	function querybuzon (cole, fecha, page_id, tipo,callback) {
    	    var criterio_tipo = {created_time: {$exists : true}};
	    var criteriored = {'obj': {$exists : true}};
		if(tipo && tipo !== 'todos'){
		    criterio_tipo = {'tipo':{$eq:tipo}};
		}	
		if (page_id) {
		    criteriored = {'from_user_id' : {$ne: page_id}};
		}
		var newDate = new Date(fecha);
		//console.log('Fecha');
		//console.log(fecha);
		var criterio = {$and:
				[ 
				    {'descartado':{$exists: false}}, 
				    {'atendido':{$exists: false}}, 
				    {'eliminado':{$exists:false}},
				    {'clasificacion.tema':{$exists:false}}, 
				    {'sentiment':{$exists:false}},
				    {'respuestas':{$exists:false}}, 
				    {'created_time': {$gt: newDate}},
				    {'retweeted_status':{$exists:false}},
				    criteriored,
				    criterio_tipo
				]
			       };
		//console.log(JSON.stringify(criterio));
	 	classdb.buscarToArray(cole, criterio,{}, 'feeds/getCuentaNuevos/querybuzon', function(cuenta){
	 		//console.log(cuenta.length);
		    return callback(cuenta);
		});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToArray('accounts', criterio, {}, 'feeds/getCuentaNuevos/queryBuzon', function(datos){
	   		return callback(datos);
		});
    }
	
};

exports.nuevosPostsFiltered = function(req, res){

	var last_ct = null;
    var tipo = null;
    var obj = null;
    var id_cuenta = null;
    if (typeof req.query.lastct !== 'undefined') { last_ct =req.query.lastct; }
    if (typeof req.query.tipo !== 'undefined') { tipo =req.query.tipo; }
    if (typeof req.query.obj !== 'undefined') { obj =req.query.obj; }
    if (typeof req.query.id_cuenta !== 'undefined') { id_cuenta =req.query.id_cuenta; }

    function querybuzon (cole, fecha, page_id, tipo,callback) {
    	console.log('DENTRO DE QUERY BUZON');
    	var criterio_tipo = { created_time: {$exists : true} };
    	var criteriored_page = { id : {$exists : true} };
    	var criteriored = { _id : {$exists : true} };

    	if(obj !== 'todos'){
    		criteriored = {'obj':{$eq:obj}};
    	}
	if(tipo && tipo !== 'todos'){
	    criterio_tipo = {'tipo':{$eq:tipo}};
	}	
	if (page_id) {
	    criteriored_page = {'from_user_id' : {$ne: page_id}};
	}
	var newDate = new Date(fecha);
	var criterio = {
	    $and:[ 
		{'descartado':{$exists: false}}, 
		{'atendido':{$exists: false}}, 
		{'eliminado':{$exists:false}},
		{'clasificacion.tema':{$exists:false}}, 
		{'sentiment':{$exists:false}},
		{'respuestas':{$exists:false}}, 
		{'created_time': {$gt: newDate}},
		{'retweeted_status':{$exists:false}},
		criteriored,
		criterio_tipo,
		criteriored_page
	    ]
	};
  console.log('PETICION QUERY !!');
  console.log(JSON.stringify(criterio));
	classdb.buscarToArray(cole, criterio,{created_time:1}, 'feeds/getCuentaNuevos/querybuzon', function(cuenta){
	    console.log('cuenta !');
	    console.log(cuenta);
	    return callback(cuenta);
	});
    }

    function getdatoscuenta(id, callback) {
		var mid = new ObjectID(id);
		var criterio = {'_id': mid};
		classdb.buscarToArray('accounts', criterio, {}, 'feeds/getCuentaNuevos/queryBuzon', function(datos){
	   		return callback(datos);
		});
    }
    getdatoscuenta(id_cuenta, function(datos_cuenta){
      console.log('DATOS DE LA CUENTA');
      console.log(datos_cuenta);
	    if(datos_cuenta[0]){	
			var cuenta = datos_cuenta[0].nombreSistema;
			var obj = {};
			if (datos_cuenta !== 'error' & datos_cuenta.length > 0) {
			    var coleccion = datos_cuenta[0].nombreSistema+'_consolidada';
          console.log('COLECCION ');
          console.log(coleccion);
			  //console.log(coleccion +' '+ new Date());
			    var page_id = '';
			    if (typeof datos_cuenta[0].datosPage !== 'undefined' && typeof datos_cuenta[0].datosPage.id !== 'undefined' && datos_cuenta[0].datosPage.id !== -1) {
				console.log('tiene datosPage y es válido');
				page_id = datos_cuenta[0].datosPage.id;
			    }
			    else if (typeof datos_cuenta[0].datosMonitoreo !== 'undefined' && datos_cuenta[0].datosMonitoreo.id !== 'undefined') {
				console.log('tiene datosMonitoreo y es válido');
				page_id = datos_cuenta[0].datosMonitoreo.id;
			    }
				querybuzon(coleccion, last_ct, page_id, tipo, function(lacuenta) {
					if (lacuenta === 'error') {
						res.jsonp(obj);
				    }else {
						for(var i=0;i<lacuenta.length;i++){
							if(lacuenta[i].descartado){    
								lacuenta[i].tipoMensaje = 'descartado';
			                }else if(!lacuenta[i].descartado && !lacuenta[i].eliminado && (lacuenta[i].respuestas || lacuenta[i].sentiment || lacuenta[i].clasificacion || lacuenta[i].atendido)){
								//console.log('PROCESO');
								lacuenta[i].tipoMensaje = 'atendido';
			                }else if(!lacuenta[i].descartado && !lacuenta[i].atendido && !lacuenta[i].eliminado && !lacuenta[i].sentiment && !lacuenta[i].clasificacion){
								//console.log('ENTRADA');
								lacuenta[i].tipoMensaje = 'nuevo';
							}else{
								console.log('No entro a un buzon valido');
								console.log(lacuenta[i]);
								console.log('\n\n');
							}
		
							if(lacuenta[i].obj==='twitter'){
								if(lacuenta[i].tipo === 'direct_message'){ 
									lacuenta[i].nombre = lacuenta[i].sender_screen_name;
									lacuenta[i].imagen = lacuenta[i].sender.profile_image_url;
									lacuenta[i].imagen_https = lacuenta[i].sender.profile_image_url_https;
									lacuenta[i].texto = lacuenta[i].text;
									lacuenta[i].urlEnlace = '#';
									lacuenta[i].urlUsuario = 'https://twitter.com/'+lacuenta[i].sender.screen_name;
								}else{
									lacuenta[i].nombre = lacuenta[i].user.screen_name;
									lacuenta[i].imagen = lacuenta[i].user.profile_image_url;
									lacuenta[i].imagen_https = lacuenta[i].user.profile_image_url_https;
									lacuenta[i].texto = lacuenta[i].text;
									lacuenta[i].urlEnlace = lacuenta[i].tw_url;
									lacuenta[i].urlUsuario = 'https://twitter.com/'+lacuenta[i].user.screen_name;
								} 	           
							}else if(lacuenta[i].obj==='facebook'){
						    	if (lacuenta[i].foto) {
									var img = lacuenta[i].foto.replace('https', 'http');
									lacuenta[i].imagen = img;
						    	}else {
									lacuenta[i].imagen = '';
						    	}
								lacuenta[i].nombre = lacuenta[i].from.name;
								lacuenta[i].imagen_https = lacuenta[i].foto;
								lacuenta[i].texto = lacuenta[i].message;
								lacuenta[i].urlUsuario = 'http://facebook.com/'+lacuenta[i].from.id;
								if (lacuenta[i].tipo == 'comment') {
									var post = '';
									var comentario = '';
									if (lacuenta[i].parent_post == lacuenta[i].parent_comment) {
										//si es un bucomentario
										var id = lacuenta[i].id.split('_');
										post = lacuenta[i].parent_post.split('_');
										comentario = lacuenta[i].parent_comment.split('_');
										lacuenta[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/' + post[0] + '?comment_id=' + post[1] + '&reply_comment_id=' + id[1] + '';
									} else {
										if(typeof lacuenta[i].parent_post !== 'undefined'){
									    	post = lacuenta[i].parent_post.split('_');
									    	if (lacuenta[i].parent_comment) {
												comentario = lacuenta[i].parent_comment.split('_');
												lacuenta[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/'+ post[1]+'?comment_id='+comentario[1];
									    	}
										}else{                                                  
									    	if (lacuenta[i].parent_comment) {
												comentario = lacuenta[i].parent_comment.split('_');
												lacuenta[i].urlEnlace = 'https://www.facebook.com/' + post[0] + '/posts/' + post[1] + '?comment_id=' + comentario[1];
									    	}
										}
									}
		    				   	} else if (lacuenta[i].tipo == 'facebook_inbox') {
							  		lacuenta[i].urlEnlace = lacuenta[i].conversation_link;
								} else if (lacuenta[i].tipo == 'post') {
									//si es un post
									var id = lacuenta[i].id.split('_');
									lacuenta[i].urlEnlace = 'https://www.facebook.com/'+page_id+'/posts/'+id[1]; 
						        }else{
									lacuenta[i].urlEnlace = lacuenta[i].rating_link;
						        }        
		                	}                               
	           	 		}
						obj.cuenta = lacuenta;
						res.jsonp(obj);
				    }
				});		
			    }
			}		
    });
};

exports.obtienePorClick = function(req, res){

	function consultaTipoBuzon(criteriopage, criterioobj, criterioTema, criterioSubtema, tipoBuzon, idUsuario, fechaInicial, fechaFinal){
		var elcriterio = '';
		switch(tipoBuzon){
			case 'nuevos':
				elcriterio = {
					$and : [
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: false}}, 
						{'atendido':{$exists: false}}, 
						{'eliminado':{$exists: false}},
						{'sentiment' : {$exists : false}},
						{'clasificacion' : {$exists : false}},
						{'respuestas' : {$exists:false}},
						criteriopage, 
						criterioobj, 
						fechaInicial,
						fechaFinal
					] 
				};	
			break;

			case 'atendidos':
				elcriterio = {
					$and:[ 
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: false}}, 
						{'atendido':{$exists: true}}, 
						{'eliminado':{$exists: false}},
						{'atendido.usuario_id':idUsuario}, 
						{$or: [
							{'sentiment' : { $exists : true }}, 
							{'clasificacion' : { $exists : true }},
							{'respuestas' : { $exists: true }}				
						]},
						criteriopage, 
						criterioobj, 
						fechaInicial,
						fechaFinal
					]
				};
			break;

			case 'descartados':
				elcriterio = {
					$and:[
						{'retweeted_status': {$exists: false}},
						{'descartado':{$exists: true}}, 
						{'descartado.idUsuario' : idUsuario},
						criteriopage, 
						criterioobj, 
						fechaInicial,
						fechaFinal
					]
				};
			break;

			case 'asignados':
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}},
						{'asignado':{$exists:true}},
						{'asignado.usuario_asignado_id':idUsuario},
						{'atendido':{$exists: false}},
						{'descartado':{$exists: false}},
						{'sentiment' : { $exists : false }}, 
						{'clasificacion' : { $exists : false }},
						{'respuestas' : { $exists: false }},
						criteriopage, 
						criterioobj, 
						fechaInicial,
						fechaFinal
					]
				}; 
			break;

			case 'todos':
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}}, 
						criteriopage, 
						criterioobj, 
						fechaInicial,
						fechaFinal
					]
				};
			break;

			default:
				elcriterio ={
					$and : [
						{'retweeted_status': {$exists: false}},
						{'eliminado':{$exists: false}}, 
						criteriopage, 
						criterioobj, 
            criterioTema,
            criterioSubtema,
						fechaInicial,
						fechaFinal
					]
				};
		}
		return elcriterio;
	}
    
    function actualizaMensaje(mensaje){
    	//Validacion que nos sirve para saber en que buzon esta
    	if(mensaje.descartado){    
			mensaje.tipoMensaje = 'descartado';
        }else if(!mensaje.descartado && !mensaje.eliminado && (mensaje.respuestas || mensaje.sentiment || mensaje.clasificacion || mensaje.atendido)){
			mensaje.tipoMensaje = 'atendido';
        }else if(!mensaje.descartado && !mensaje.atendido && !mensaje.eliminado && !mensaje.sentiment && !mensaje.clasificacion){
			mensaje.tipoMensaje = 'nuevo';
		}else{
			console.log('No entro a un buzon valido');
		}
		
		if (mensaje.obj === 'twitter') {
			switch(mensaje.tipo) {
				case 'direct_message':
					mensaje.nombre = mensaje.sender.name;
					mensaje.imagen = mensaje.sender.profile_image_url;
					mensaje.imagen_https = mensaje.sender.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = '#';
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.sender.screen_name;
				break;
									
				case 'twit':
					mensaje.nombre = mensaje.user.name;
					mensaje.imagen = mensaje.user.profile_image_url;
					mensaje.imagen_https = mensaje.user.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = mensaje.tw_url;
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.user.screen_name;
				break;

				case 'tracker':
					mensaje.nombre = mensaje.user.name;
					mensaje.imagen = mensaje.user.profile_image_url;
					mensaje.imagen_https = mensaje.user.profile_image_url_https;
					mensaje.texto = mensaje.text;
					mensaje.urlEnlace = mensaje.tw_url;
					mensaje.urlUsuario = 'https://twitter.com/' + mensaje.user.screen_name;
				break;
									
				default:
					console.log('Entro a una opcion invalida en switch twitter');
					console.log('Tipo');
					console.log(mensaje.tipo);
			}//switch
		}else if (mensaje.obj === 'facebook') {
			switch(mensaje.tipo) {

				case 'facebook_inbox':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlEnlace = mensaje.conversation_link;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;
				break;

				case 'comment':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;
					var post = mensaje.parent_post.split('_');
					var id = mensaje.id.split('_');
					mensaje.urlEnlace = 'https://www.facebook.com/'+post[0]+'/posts/'+post[1]+'?comment_id='+id[1];
				break;
									
				case 'post':
					var idSeparado = mensaje.id.split('_');
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id;
					mensaje.urlEnlace = 'https://www.facebook.com/'+idSeparado[0]+'/posts/'+idSeparado[1];
				break;
				
				case 'rating':
					mensaje.nombre = mensaje.from.name;
					mensaje.imagen = mensaje.foto;
					mensaje.imagen_https = mensaje.foto;
					mensaje.texto = mensaje.message;
					mensaje.urlUsuario = 'https://www.facebook.com/'+mensaje.from.id; 
					mensaje.urlEnlace = mensaje.rating_link;
				break;

				default:
					console.log('Entro a una opcion invalida en switch Faceboook');
					console.log('Tipo');
					console.log(mensaje.tipo);
			}//switch
		}//if facebook  
		return mensaje;  	
    }


	var tipoBuzon = req.body.tipo;
	var opcion = req.body.opcion;
	var cuenta = req.body.cuenta;
  var tema = req.body.tema;
  var subtema = req.body.subtema;
	var skip = req.body.skip;
	var fechaInicial = {created_time: {$gte: new Date(req.body.first)}};
	var fechaFinal = {created_time : {$lte: new Date(req.body.second)}}; 
	var criteriopage = { id : { $exists : true }};
  var criterioTema = { id : { $exists : true }};
  var criterioSubtema = { id : { $exists : true }};
	var criteriotipo = { _id : {$exists : true }};
	var criterioobj = { obj : {$exists : true }};
	var page_id = req.body.iCuenta;
	var idUsuario = req.body.usuario;
	var lositems = [];
	if (page_id) {
		criteriopage  = {from_user_id : {$ne : page_id}};
	}
		
	if (opcion !== 'general') {
		criterioobj = { obj : opcion };
	}

  if(tema){
    criterioTema = {
      'clasificacion' : {$exists : true},
      'clasificacion.tema' : tema,
      'descartado' : {$exists : false}
    };
  }

  if(subtema){
    criterioSubtema = {
      'clasificacion' : {$exists : true},
      'clasificacion.subtema' : subtema,
      'descartado' : {$exists : false}
    };
  }



	var elcriterio = '';

	//Criterio
	elcriterio = consultaTipoBuzon(criteriopage, criterioobj, criterioTema, criterioSubtema, tipoBuzon, idUsuario, fechaInicial, fechaFinal);

	var arregloMensajes = [];
	classdb.buscarToStreamLimitSkip(cuenta, elcriterio, {created_time:1}, 15, skip,'feeds/getUserData', function(items){
		for(var i in items){
			arregloMensajes.push(actualizaMensaje(items[i]));
		}
		res.jsonp(arregloMensajes);
    });
};

exports.actualizaImgTwitter = function(req, res){
	var idCuenta = req.body.cuenta._id;
	var nombreSistema = req.body.cuenta.marca;
	var mensaje = req.body.mensaje;

	//console.log('actualizaImgTwitter');
	//console.log(idCuenta);
	//console.log(nombreSistema);

	function datosCuenta(idCuenta, callback) {
		var id = new ObjectID(idCuenta);
		var criterio = {'_id' : id};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/actualizaImgTwitter/datosCuenta', function(datos){
			return callback(datos[0]);
		});
    }

	function pideFotoTwitter(cuenta, mensaje, callback){
	   	var accesos_twitter =  cuenta.datosTwitter;
	   	if(accesos_twitter.twitter_consumer_secret !== '' && accesos_twitter.twitter_consumer_key !== '' && accesos_twitter.twitter_access_token && accesos_twitter.twitter_access_token_secret !== ''){
		    var T  = new Twit({
				'consumer_key' : accesos_twitter.twitter_consumer_key,
				'consumer_secret' : accesos_twitter.twitter_consumer_secret,
				'access_token' : accesos_twitter.twitter_access_token,
				'access_token_secret' : accesos_twitter.twitter_access_token_secret
		    });
		}else{
		    var T  = new Twit({
				'consumer_key' : tck_def,
				'consumer_secret' : tcs_def,
				'access_token' : tat_def,
				'access_token_secret' : tats_def
		    });
		}
	    var parametros_twitter = {
	    	//'screen_name' : mensaje.from_user_screen_name
	    	'user_id' : mensaje.from_user_id
	    };
	   	
	   	T.get('users/show', parametros_twitter, function(error, reply) {
			if(error){
				console.log('ERROR DE TWITTER');
				console.log(mensaje.from_user_screen_name);
				console.log(mensaje.from_user_id);
				console.log(error);
				console.log('\n\n');
				return callback(mensaje);
			}else{
				var criterio = {'_id' : new ObjectID(mensaje._id)};
				var elset = {};
				if(mensaje.obj === 'twitter' && mensaje.tipo === 'direct_message'){					
					elset = { 
						'sender.profile_image_url' : reply.profile_image_url,
						'sender.profile_image_url_https' : reply.profile_image_url_https
					};
					classdb.actualiza(cuenta.nombreSistema+'_consolidada', criterio, elset, 'feeds/pideFotoTwitter', function(updated){
			    		if (updated === 'error') {
							console.log(updated);	
			    		}

					});

				}else if(mensaje.obj === 'twitter' && (mensaje.tipo === 'tracker' || mensaje.tipo === 'twit')){					
					elset = { 
						'user.profile_image_url' : reply.profile_image_url,
						'user.profile_image_url_https' : reply.profile_image_url_https
					};
					classdb.actualiza(cuenta.nombreSistema+'_consolidada', criterio, elset, 'feeds/pideFotoTwitter', function(updated){
			    		if (updated === 'error') {
							console.log(updated);	
			    		}

					});
				}else{
					console.log('EL TIPO / '+mensaje.obj+' / '+mensaje.tipo);
				}
				mensaje.imagen = reply.profile_image_url;
  				mensaje.imagen_https = reply.profile_image_url_https;
				return callback(mensaje);
			}
	    });	 
    }

    datosCuenta(idCuenta, function(cuenta){
    	if(cuenta){
    		pideFotoTwitter(cuenta, mensaje, function(mensajeConFoto){
	  			if(mensajeConFoto !== 'error'){
	  				res.jsonp(mensajeConFoto);
	  			}else{
    				res.jsonp(mensajeConFoto);
    			}
    		});
    	}
    });
};

exports.actualizaImagenInbox = function(req, res){

	function getFacebookPageByCuenta(account_name, account_id, callback){
		var acc_id = new ObjectID(account_id);
    	var criterio = {$and : [{ _id : acc_id }, { nombreSistema : account_name }]};
    	classdb.buscarToArray('accounts', criterio, {}, 'accounts/procesaPendientes/getFacebookPageByCuenta', function(items){
      		if (items === 'error') {
				return callback(items);
      		}
      		else {
				if (items.length < 1) {
	  				console.log('accounts/procesaPendientes/getFacebookPageByCuenta - arreglo con la cuenta llegó vacío... raro');
	  				return callback('error');
				}
				else {
	  				if (typeof items[0].datosPage !== 'undefined' && typeof items[0].datosPage.id !== 'undefined') {
	    				var page_id = items[0].datosPage.id;
	    				return callback(page_id);
	  				}
	  				else {
	    				console.log('accounts/procesaPendientes/getFacebookPageByCuenta - si hubo cuenta pero no hay datosPage, tal vez datosMonitoreo o solo twitter');
	    				return callback('error');
	  				}
				}
      		}
    	});
  	}

  	function actualizaMensaje(mensaje, imagenActualizada, nombreSistema, callback){
		var criterio = {'_id' : new ObjectID(mensaje._id)};
		var elset = {
			'image_attachment' : imagenActualizada
		};

		classdb.actualiza(nombreSistema+'_consolidada', criterio, elset, 'feeds/actualizaImagenInbox/actualizaMensaje', function(updated){
			if (updated === 'error') {
				return callback(updated);	
			}else{
				mensaje.image_attachment = imagenActualizada;
				return callback(mensaje);  		
			}
		});
  	}

	var  access_token = '';
	var nombreSistema = req.body.cuenta.marca;
	var obj = {};
	var cuenta = req.body.cuenta._id;
	var idUsuario = new ObjectID(req.body.usuario._id);
	var facebookUserId = '';
	var mensaje = req.body.mensaje;

	if(req.body.usuario.additionalProvidersData){
		facebookUserId = req.body.usuario.additionalProvidersData.facebook.id;
	}
	if(req.body.usuario.additionalProvidersData){
		access_token = req.body.usuario.additionalProvidersData.facebook.accessToken;
		var get_data = querystring.stringify({'access_token' : access_token });
	}

	if(req.body.usuario.additionalProvidersData){
    	getFacebookPageByCuenta(nombreSistema, cuenta, function(fb_cuenta){
			if (fb_cuenta === 'error') {
				obj = {
					'error' : {
						'message' : 'Error con la cuenta de Facebook'
					}
				};
				res.jsonp(obj);
			}else {
                          accesstokens.obtienePagATByUsrAT(nombreSistema, fb_cuenta, idUsuario, facebookUserId, access_token, 'no', function(pat){
					if(pat === 'error-face'){
						obj = {
							'error' : {
								'message' : 'Error en respuesta de facebook, intenta más tarde'
							}
						};
					   res.jsonp(obj);
					}else if (pat === 'error'){
						obj = {
							'error': {
							    'message' : 'No administras esta página'
							}
						};
						res.jsonp(obj);
					}else {
						var path = globales.fbapiversion+req.body.mensaje.id+'?access_token='+pat+'&fields=attachments';
						globales.options_graph.method = 'GET';
						globales.options_graph.path = path;
						delete globales.options_graph.headers;
						var solicitud = https.request(globales.options_graph, function(respuestaIMGInbox) {
							var chunks = [];
							var chunks2 = '';
							respuestaIMGInbox.on('data', function(data) {
								if(data){
									chunks2 += data;
									chunks.push(data);
								}
							}).on('end', function() {
								var primero = chunks2.substr(0,1);
								if(primero === '{'){
									var contenido = JSON.parse(Buffer.concat(chunks));
									if (typeof contenido.error !== 'undefined') {
										console.log('feeds/respInbox/requestUserPages - '+JSON.stringify(contenido.error));
										res.jsonp(contenido.error);
									}else {
										actualizaMensaje(mensaje, contenido.attachments.data[0].image_data.preview_url, nombreSistema, function(mensajeActualizado){
											if(mensajeActualizado === 'error'){
												obj = {
													'error': {
														'message' : 'Error al actualizar'
													}
												};
												res.jsonp(obj);
											}else{
												res.jsonp(mensajeActualizado);
											}
										});
									}
								}else{
									obj = {
										'error': {
											'message' : 'Error de Facebook'
										}
									};
								}
							});
						});
						solicitud.end();
						solicitud.on('error', function(err){
							obj = {
								'error': {
									'message' : err
								}
							};
							console.log('facebookPost/requestAT - error en el request: '+err);
							res.jsonp(obj);
						});
					}
				});
			}    				
		});
	}else{
		obj = {
			'error': {
				'message' : 'La cuenta no esta conectada a Facebook'
			}
		};
		res.jsonp(obj);
	}
};
