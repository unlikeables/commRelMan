'use strict';
// mongoose (mientras lo sigamos necesitando solamente)
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Account = mongoose.model('Account'),
    Tema = mongoose.model('Tema');

var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');
var accesstokens = require('../../config/accesstokens.js');

// otras dependencias
var _ = require('lodash');
var querystring = require('querystring');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var Twit = require('twit');
var cmd = require("cmd-exec").init();

// hardcoded, un accesstoken mio con esta app
var perm_at = 'access_token=CAAEdYZBfZAiQQBACAacd8eW6y4m0VJgsTHH3ZA7eu97Bl7RRxRfBqWDFLtJpZAwxSZBhN6H1G22dk5ZATjQ0VeBVydRUkImy9sSdfoMqxxddw1khvDPutEZCiI6HZBoCi6t4eIITTs9jlTxjAFM75rMMcusv6aXu7hIcaPCXPKbUKOuh9ZBl7FzLDi4YCsIJUdYoZD';

//Funcion para la creacion de una cuenta
exports.create = function(req, res) {
    var account = new Account(req.body);
    var compara = require('../../escuchadores/escuchador/comparador.js');
    compara.find();
    account.user = req.user;
    account.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(account);	
	}
    });
};

exports.obtieneNombre=function(req,res){
    var idCuenta=req.body.idCuenta;
    Account.findById(idCuenta).populate('user', 'displayName').exec(function(err, account) {
	if (err) { return true; }
	else {
	    res.jsonp(account.marca);
	}
    });
};

/*                 _______                   
                  |__   __|                  
   ___ _ __ ___  __ _| | ___ _ __ ___   __ _ 
  / __| '__/ _ \/ _` | |/ _ \ '_ ` _ \ / _` |
 | (__| | |  __/ (_| | |  __/ | | | | | (_| |
  \___|_|  \___|\__,_|_|\___|_| |_| |_|\__,_|
*/
exports.creaTema = function(req, res){	
    var cuenta = req.body.cuenta;
    var criterio = {'tema':req.body.tema};

    classdb.existefind('temas_'+cuenta, criterio, 'accounts/creaTema', function(existe){
	if (existe === 'error' || existe === 'existe') {
	    res.jsonp(existe);
	}
	else {
	    var objeto = {tema:req.body.tema};
	    classdb.inserta('temas_'+cuenta, objeto, 'accounts/creaTema', function(inserta){
		if (inserta === 'error') {
		    res.jsonp(inserta);
		}
		else {
		    classdb.buscarToArray('temas_'+cuenta, objeto, {}, 'accounts/creaTema', function(items) {
			if (items !== 'error') {
			    var obj = {_id: items[0]._id, tema: items[0].tema};
			    res.jsonp(obj);
			}
		    });
		}
	    });
	}
    });
};
/*               _                    _______                   
                | |                  |__   __|                  
   ___ _ __   __| |   ___ _ __ ___  __ _| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / __| '__/ _ \/ _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | | (__| | |  __/ (_| | |  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|_|  \___|\__,_|_|\___|_| |_| |_|\__,_|
*/


/*_                     _        _____                                 _        
 (_)                   | |      |  __ \                               | |       
  _ _ __  ___  ___ _ __| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
 | | '_ \/ __|/ _ \ '__| __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 | | | | \__ \  __/ |  | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
 |_|_| |_|___/\___|_|   \__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                | |                             
                                                |_|                             
*/
exports.insertaRespuesta = function(req,res){
    var temaActual=req.body.tema;
    var subtemaActual=req.body.subtema;
    var respuesta=req.body.respuesta;
    var cuenta = req.body.cuenta;
    var collection = 'temas_'+cuenta;
    var objectId = new ObjectID();

    function encuentraTema(coleccion, tema, callback) {
		var criterio = { tema : tema };
		classdb.buscarToArray(coleccion, criterio, {}, 'accounts/insertaRespuesta/encuentraTema', function(items){
	    	    callback(items);
		});
    }

    function updateRespuestaTema(coleccion, tema, idRespuesta, respuesta, callback) {
		var criterio = { tema : tema };
		var addtoset = { 'respuestas' : { 'idRespuesta' : idRespuesta, 'respuesta' : respuesta }};
		classdb.actualizaAddToSet(coleccion, criterio, addtoset, 'accounts/insertaRespuesta/updateRespuestaTema', function(actualiza) {
	    	    callback(actualiza);
		});
    }

    function updateRespuestaTemaSubtema(coleccion, tema, subtema, idRespuesta, respuesta, callback) {
		var criterio = { 'tema' : tema, subtemas : { $elemMatch : { 'subtema' : subtema }}};
		var addtoset = { 'subtemas.$.respuestas' : { 'idRespuesta' : idRespuesta, 'respuesta' : respuesta }};
		classdb.actualizaAddToSet(coleccion, criterio, addtoset, 'accounts/insertaRespuesta/updateRespuestaTemaSubtema', function(actualiza) {
	    	    callback(actualiza);
		});
    }

    if (temaActual.length!==0 && subtemaActual.length === 0) {
	// insertamos respuesta solo para el tema
	encuentraTema(collection, temaActual, function(tema) {
	    if (tema === 'error') {
		console.log('Error, no pudimos obtener el tema en mongo');
		res.jsonp(4);
	    }
	    else {
		if (typeof tema[0].respuestas === 'undefined') {
		    // tema no tiene respuestas
		    updateRespuestaTema(collection, temaActual, objectId, respuesta, function(updated) {
			if (updated === 'error') {
			    // error al updatear
			    res.jsonp(3);
			}
			else {
			    // respuesta insertada
			    encuentraTema(collection, temaActual, function(theme){
				if (theme === 'error') {
				    // se insertó pero luego no pudimos obtener el objeto actualizado
				    res.jsonp(0);
				}
				else {
				    // objeto actualizado
				    res.jsonp(theme);
				}
			    }); 
			}
		    });		    
		}
		else {
		    // tema sí tiene respuestas
		    var indexRespuesta = _.findIndex(tema[0].respuestas, function(chr) {
			return chr.respuesta === respuesta;
		    });
		    if (indexRespuesta === -1) {
			// no existia respuesta, insertamos
			updateRespuestaTema(collection, temaActual, objectId, respuesta, function(updated) {
			    if (updated === 'error') {
				// error al updatear
				res.jsonp(3);
			    }
			    else {
				// respuesta insertada
				encuentraTema(collection, temaActual, function(theme){
				    if (theme === 'error') {
					// se insertó pero luego no pudimos obtener el objeto actualizado
					res.jsonp(0);
				    }
				    else {
					// objeto actualizado
					res.jsonp(theme);
				    }
				}); 
			    }
			});
		    }
		    else {
			// respuesta ya existe
			res.jsonp(1);
		    }
		}
	    }
	});
    }
    else if (temaActual.length !== 0 && subtemaActual.length !== 0) {
	// insertamos respuesta en subtema
	encuentraTema(collection, temaActual, function(tema){
	    if (tema === 'error') {
		console.log('Error, no pudimos obtener el tema en mongo');
		res.jsonp(4);
	    }
	    else {
		if (tema[0].subtemas === 'undefined') {
		    // este tema no tiene subtemas ???
		    res.jsonp(5);
		}
		else {
		    // si hay subtemas
		    var indexSubtema = _.findIndex(tema[0].subtemas, function(chr) {
			return chr.subtema === subtemaActual;
		    });
		    if (indexSubtema === -1) {
			// este subtema no existe ???
			res.jsonp(5);
		    }
		    else {
			// el subtema existe y tenemos subíndice
			if (typeof tema[0].subtemas[indexSubtema].respuestas === 'undefined') {
			    // el subtema no tiene respuestas
			    updateRespuestaTemaSubtema(collection, temaActual, subtemaActual, objectId, respuesta, function(updateds){
			    	//	console.log('updated')
				if (updateds === 'error') {
				    // error al updatear
				    res.jsonp(3);
				}
				else {
				    // respuesta insertada
				    encuentraTema(collection, temaActual, function(theme){
					if (theme === 'error') {
					    // se insertó pero luego no pudimos obtener el objeto actualizado
					    res.jsonp(0);
					}
					else {
					    // objeto actualizado
					    res.jsonp(theme);
					}
				    }); 
				}
			    }); 
			}
			else {
			    // el subtema tiene respuestas
			    var indexRespuestaSubtema = _.findIndex(tema[0].subtemas[indexSubtema].respuestas, function(chr) {
				return chr.respuesta === respuesta;
			    });
			    if (indexRespuestaSubtema === -1) {
				// no existia respuesta, insertamos
				updateRespuestaTemaSubtema(collection, temaActual, subtemaActual, objectId, respuesta, function(updateds){
				    if (updateds === 'error') {
					// error al updatear
					res.jsonp(3);
				    }
				    else {
					// respuesta insertada
					encuentraTema(collection, temaActual, function(theme){
					    if (theme === 'error') {
						// se insertó pero luego no pudimos obtener el objeto actualizado
						res.jsonp(0);
					    }
					    else {
						// objeto actualizado
						res.jsonp(theme);
					    }
					}); 
				    }
				}); 				
			    }
			    else {
				// respuesta ya existe
				res.jsonp(1);
			    }
			}
		    }
		}
	    }	    
	});
    }
    else {
	// no hay tema, no hacemos nada
	res.jsonp(2);
    }
};
/*               _   _                     _        _____                                 _        
                | | (_)                   | |      |  __ \                               | |       
   ___ _ __   __| |  _ _ __  ___  ___ _ __| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / _ \ '_ \ / _` | | | '_ \/ __|/ _ \ '__| __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 |  __/ | | | (_| | | | | | \__ \  __/ |  | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|_| |_|\__,_| |_|_| |_|___/\___|_|   \__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                   | |                             
                                                                   |_|                             
*/

/*          _ _      _ _        _____                                 _         _______                   
           | (_)    (_) |      |  __ \                               | |       |__   __|                  
  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| | ___ _ __ ___   __ _ 
 / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __| |/ _ \ '_ ` _ \ / _` |
 \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \ |  __/ | | | | | (_| |
 |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_|\___|_| |_| |_|\__,_|
                                               | |                                                        
                                               |_|                                                        
*/
exports.solicitaRespuestasTema = function(req,res){
    var tema=req.body.temaActual;
    var cuenta = req.body.cuenta;
    var criterio = {tema: tema};
    classdb.buscarToArray('temas_'+cuenta, criterio, {}, 'accounts/solicitaRespuestasTema', function(items){
	if (items !== 'error') {
		if(items[0]){
		    var tieneRespuestas=items[0].hasOwnProperty('respuestas');
		    if(tieneRespuestas===false){
			res.jsonp([]);
		    }
		    else{
			res.jsonp(items[0].respuestas);
		    }
		}
	}
    });
};
/*               _             _ _      _ _        _____                                 _         _______                   
                | |           | (_)    (_) |      |  __ \                               | |       |__   __|                  
   ___ _ __   __| |  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` | / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __| |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \ |  __/ | | | | | (_| |
  \___|_| |_|\__,_| |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_|\___|_| |_| |_|\__,_|
                                                                  | |                                                        
                                                                  |_|                                                        
*/

/*          _ _      _ _        _____                                 _             _____       _     _                       
           | (_)    (_) |      |  __ \                               | |           / ____|     | |   | |                      
  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
 / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \____) | |_| | |_) | ||  __/ | | | | | (_| |
 |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                                               | |                                                                            
                                               |_|                                                                            
*/
exports.solicitaRespuestasSubtema = function(req,res){
    var tema=req.body.temaActual;
    var subtema=req.body.subtemaActual;
    var cuenta = req.body.cuenta;
    var criterio = {tema: tema};
    classdb.buscarToArray('temas_'+cuenta, criterio, {}, 'accounts/solicitaRespuestasSubtema', function(items) {
	if (items !== 'error') {
            var arregloSubtemas=[];
	    for(var i = 0; i<items[0].subtemas.length; i++){
		if(subtema===items[0].subtemas[i].subtema && typeof items[0].subtemas[i].respuestas !== 'undefined'){
		    arregloSubtemas.push(items[0].subtemas[i].respuestas);
		}
	    }
	    res.jsonp(arregloSubtemas[0]);
	}
    });
};
/*               _             _ _      _ _        _____                                 _             _____       _     _                       
                | |           | (_)    (_) |      |  __ \                               | |           / ____|     | |   | |                      
   ___ _ __   __| |  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` | / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_| |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                                                                  | |                                                                            
                                                                  |_|                                                                            
*/

exports.mandarSiguiente = function(req,res,id,next){
    req.sender_tema = id;
    next();
};

/*                     _____       _     _                       
                      / ____|     | |   | |                      
   ___ _ __ ___  __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / __| '__/ _ \/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 | (__| | |  __/ (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_|  \___|\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
*/
exports.creaSubtema = function(req,res){
    //var coleccion = 'temas_'+req.body.cuenta;    
    //var id = req.body._id.toString();
    //var subtema_nuevo = req.body.subtema_nuevo.toString();
    //var criterio = {tema:id};
    //var addtoset = {subtemas:{subtema:subtema_nuevo}};
    //classdb.actualizaAddToSet(coleccion, criterio, addtoset, 'accounts/creaSubtema', function(subtema){
    //if (subtema === 'error') {
    //  console.log('error al insertar');
    //	}
    //	else {
    //	    console.log(subtema_nuevo+' insertado correctamente');
    //	}
    //  });
    var cuenta = req.body.cuenta;
	var id = req.body._id.toString();
    var subtema_nuevo = req.body.subtema_nuevo.toString();
    //var subtema=req.body.subtema_nuevo;
    var objectId = new ObjectID();
    var collection = 'temas_'+cuenta;
    var criteriof = {'tema': id};
    var sortf = {tema: 1};
    classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(items){
	if (items === 'error') {
	    res.jsonp(3);
	}
	else {
	    var arregloSubtemas=[];
            var existeSubtema=0;
            var tieneSubtemas=items[0].hasOwnProperty('subtemas');
            if(tieneSubtemas===true) {
		for(var i=0;i<items[0].subtemas.length;i++){
		    arregloSubtemas.push(items[0].subtemas[i]);
		    if(items[0].subtemas[i].subtema===subtema_nuevo){
			existeSubtema++;
		    }
		}
		if(existeSubtema !== 0){
		  //console.log('El subtema ya existe, escriba otro');
		    res.jsonp(2);
		}
		else{
		    var eladdtoset = {'subtemas':{'idSubtema': objectId,subtema:subtema_nuevo}};
		    classdb.actualizaAddToSet(collection, criteriof, eladdtoset, 'themes/agregaSubtema', function(updated){
			if (updated === 'error') {
			    res.jsonp(3);
			}
			else {
			    classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(themes) {
				if (themes === 'error') {
				    res.jsonp(3);
				}
				else {
				    res.jsonp(themes[0].subtemas);
				}
			    });
			}
		    });
		}
	    }
	    else {
		var deraddtoset = {'subtemas' : {'idSubtema' : objectId, subtema : subtema_nuevo}};
		classdb.actualizaAddToSet(collection, criteriof, deraddtoset, 'themes/agreagaSubtema', function(actualizao){
		    if (actualizao === 'error') {
			res.jsonp(3);
		    }
		    else {
			classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(themes){
			    if (themes === 'error') {
				res.jsonp(3);
			    }
			    else {
				res.jsonp(themes[0].subtemas);
			    }
			});
		    }
		});
	    }
	}
    });
};
/*               _                        _____       _     _                       
                | |                      / ____|     | |   | |                      
   ___ _ __   __| |   ___ _ __ ___  __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / __| '__/ _ \/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | | (__| | |  __/ (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|_|  \___|\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
*/

//Funcion que muestra la cuenta actual
exports.read = function(req, res) {
    res.jsonp(req.account);
};

//Funcion que sirve para realizar la actualizacion de la cuenta
exports.update = function(req, res) {
    var account = req.account ;
    var compara = require('../../escuchadores/escuchador/comparador.js');
    compara.find();
    account = _.extend(account , req.body);
    account.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(account);
	}
    });
};

//Funcion que sirve para responder tweeter
exports.respondeTweet = function(req, res){
    var id_cuenta = req.body.id_cuenta;
    var Db = require('mongodb').Db;
    var Server = require('mongodb').Server;
    var db = new Db('likeable-crm-dev', new Server('localhost', 27017));
    var coleccion = req.body.coleccion;
    Account.findById(id_cuenta).exec(function(err, account){

	    var T  = new Twit({
	        'consumer_key'        : account.datosTwitter.twitter_consumer_key,
	        'consumer_secret'     : account.datosTwitter.twitter_consumer_secret,
	        'access_token'        : account.datosTwitter.twitter_access_token,
	        'access_token_secret' : account.datosTwitter.twitter_access_token_secret
	    });
	
	T.post('statuses/update', {'status': req.body.resp, 'in_reply_to_status_id':req.body.id, 'wrap_links':'true' }, function(err, reply) {
            if(err) return (res.jsonp(err.allErrors[0].code));
            //guardamos la respuesta en mongo	
	    db.open(function(err, db) {
		var id = req.body.id;
		var subtema_nuevo = req.body.subtema.toString();
		var col = db.collection(coleccion);
		if(err === null){
		    col.update({id_str:id},{$set:{clasificacion:{tema:req.body.tema,subtema:req.body.subtema}}},function(err,updated){
		 	col.update({id_str:id},{$addToSet:{respuestas:{usuario:req.body.user,texto:req.body.resp,timestamp:req.body.tiempo,id_str:reply.id_str}}},function(err,updated){
		 	    console.log(updated+' : Agregado  '+err);
		 	});
		    });
		}else{
		    res.jsonp('Error en la conexión: '+err);
		}
	    });
            return true;
	});
    });
};

exports.updateTema = function(req,res){
    var tema = req.guardado;
    tema = _.extend(tema , req.body);
    
    tema.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(tema);
	}
    });
};

//funcion que sirve para eliminar la cuenta
exports.delete = function(req, res) {
    var account = req.account ;
    var compara = require('../../escuchadores/escuchador/comparador.js');
    compara.find();
    account.remove(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(account);
	}
    });
};

/**
 * List of Accounts
 */
exports.list = function(req, res) { 
    // console.log(req.body);
    // console.log(req.user.cuenta._id);
    if(req.user.roles[0] === 'app-manager'){
	Account.find().sort('-created').populate('user', 'displayName').exec(function(err, accounts) {
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		res.jsonp(accounts);
	    }
	});
    }else{
	//console.log('No es app-manager');
	Account.findById(req.user.cuenta._id).populate('user', 'displayName').exec(function(err, account) {
	    //console.log(account);
	    if (err) return;
	    /*var obj = [];
	     for( var i = 0; i < account.length; i++){
	     obj[i] = account[i];
	     }
	     res.jsonp(obj);*/
	    var obj = [account];
	    res.jsonp(obj);
	});
    }	
};

/*                                    _____               _ _            _            
                                     |  __ \             | (_)          | |           
  _ __  _ __ ___   ___ ___  ___  __ _| |__) |__ _ __   __| |_  ___ _ __ | |_ ___  ___ 
 | '_ \| '__/ _ \ / __/ _ \/ __|/ _` |  ___/ _ \ '_ \ / _` | |/ _ \ '_ \| __/ _ \/ __|
 | |_) | | | (_) | (_|  __/\__ \ (_| | |  |  __/ | | | (_| | |  __/ | | | ||  __/\__ \
 | .__/|_|  \___/ \___\___||___/\__,_|_|   \___|_| |_|\__,_|_|\___|_| |_|\__\___||___/
 | |                                                                                  
 |_|                                                                                  
*/


exports.procesaPendientes = function(req, res){

    //Función que obtiene el id de la cuenta que administra el usuario
    /*
    function getFacebookPageByCuenta(account_name, account_id, callback){
	var acc_id = new ObjectID(account_id);
	var criterio = {$and : [{ _id : acc_id }, { nombreSistema : account_name }]};
	// console.log(JSON.stringify(criterio));
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

    function requestUserPages(fbuserid, fbuserAT, acname, username, vez, callback) {
	var path = globales.fbapiversion+fbuserid+'/accounts?access_token='+fbuserAT;
	globales.options_graph.method = 'GET';
	globales.options_graph.path = path;
	var solicitud = https.request(globales.options_graph, function(risposta) {
	    var chunks = [];
	    var chunks2 = '';
	    risposta.on('data', function(dati) {
	    	if(dati){
	    	    chunks2 += dati;
		    chunks.push(dati);
	    	}
	    }).on('end', function() {
	    	var primero = chunks2.substr(0,1);
		if(primero === '{') {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    console.log('accounts/procesaPendientes/requestUserPages - obtenemos paginas del usuario para '+username+' cta: '+acname);
		    if (typeof contenido.error !== 'undefined') {
			console.log('accounts/procesaPendientes/requestUserPages - '+JSON.stringify(contenido.error));
			return callback('error');
		    }
		    else {
			return callback(contenido.data);
		    }
		}else{
		    return callback('error');
		}
	    });
	});
	solicitud.on('socket', function(socket){
	    socket.setTimeout(5000);
	    socket.on('timeout', function(){
	    	solicitud.abort();
	    });
	});
	solicitud.end();
	solicitud.on('error', function(err){
	    console.log('facebookPost/requestAT - error en el request: '+err);
	    return callback('error');
	});
    }

    function descartaCuentas(idCuenta, arregloCuentas, index, callback) {
	var cuantas = arregloCuentas.length;
	var more = index+1;
	if (more > cuantas) {
	    return callback('cuentas ok');
	}
	else {
		setImmediate(function(){
		    if (typeof arregloCuentas[index] === 'undefined') {
			return descartaCuentas(idCuenta, arregloCuentas, more, callback);		
		    }
		    else {
				if (arregloCuentas[index].id !== idCuenta) {
				    return descartaCuentas(idCuenta, arregloCuentas, more, callback);
				}
				else {
				    return callback(arregloCuentas[index]);
				}
		    }
		});
	}
    }

    function getUserPageAT(idCuenta ,user_id, account_name, screenname, fbuserid, fbuserAT, callback){
	var criteriof = { $and : [ { user_id : user_id }, { account_name : account_name } ] };
	classdb.buscarToArray('verifica_user_at', criteriof, {}, 'accounts/procesaPendientes/getUserPageAT', function(token){
	    if (token === 'error') {
		console.log('accounts/procesaPendientes/getUserPageAT - error en consulta de bd, no obtuvimos user-token');
		return callback(token);
	    }
	    else {
		if (token.length < 1) {
		    // token todavía no existe en la base de datos
		    requestUserPages(fbuserid, fbuserAT, account_name, screenname, 0, function(cuentas) {
			if(cuentas === 'error') {
			    console.log('accounts/procesaPendientes/getUserPageAT.at_nuevo - error al conseguir las fanpages en facebook, tal vez no se otorgó el permiso de pages-admin');
			    return callback('error');
			}
			else if(cuentas.length < 1) {
			    console.log('accounts/procesaPendientes/getUserPageAT.at_nuevo - arreglo venía vacío, usuario no administra ninguna página');
			    return callback('error');
			}
			else {
			    // hubo respuesta de facebook, ya tenemos fanpages administradas, ahora veamos si la cuenta coincide con la que administramos aqui 
			    descartaCuentas(idCuenta, cuentas, 0, function(cuenta){
				if (cuenta === 'cuentas ok') {
				    console.log('accounts/procesaPendientes/getUserPageAT.at_nuevo - el usuario administra cuentas pero ninguna coincide con la cuenta solicitada');
				    return callback('error');
				}
				else {
				    var pageAccessToken = cuenta.access_token;
				    var objeto = {
					user_at: fbuserAT,
					page_at: pageAccessToken,
					user_id: user_id,
					account_name: account_name,
					timestamp: new Date()
				    };
				    classdb.inserta('verifica_user_at', objeto, 'accounts/procesaPendientes/getUserPageAT.at_nuevo', function(inserta){
					if (inserta === 'error'){
					    console.log('accounts/procesaPendientes/getUserPageAT.at_nuevo - error en insert a la bd, no insertamos nuevo token');
					}
					return callback(pageAccessToken);
				    });
				}
			    });
			}
		    });
		}
		else {
		    var ts = token[0].timestamp.getTime();
		    var tsm1 = (ts) + 3595000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			// pero ya venció, lo pedimos a fb
			requestUserPages(fbuserid, fbuserAT, account_name, screenname, 0, function(cuentas) {
			    // hubo respuesta de facebook, ya tenemos fanpages administradas, ahora veamos si la cuenta coincide con alguna
			    if (cuentas === 'error') {
				console.log('accounts/procesaPendientes/getUserPageAT.at_updated - error al conseguir las fanpages en facebook, tal vez no se otorgó el permiso pages-admin');
				return callback('error');
			    }
			    else if (cuentas.length < 1) {
				console.log('accounts/procesaPendientes/getUserPageAT.at_updated - arreglo venía vacío, usuario no administra ninguna página');
				return callback('error');
			    }
			    else {
				descartaCuentas(idCuenta, cuentas, 0, function(cuenta){
				    if (cuenta === 'cuentas ok') {
					console.log('accounts/procesaPendientes/getUserPageAT.at_updated - el usuario administra cuentas pero ninguna coincide con la cuenta solicitada');
					return callback('error');
				    }
				    else {
					var pageAccessToken = cuenta.access_token;
					var criteriou = { 'user_id' : token[0].user_id };
					var objeto = {
					    user_at: fbuserAT,
					    page_at: pageAccessToken,
					    user_id: user_id,
					    account_name: account_name,
					    timestamp: new Date()
					};
					classdb.actualiza('verifica_user_at', criteriou, objeto, 'accounts/procesaPendientes/getUserPageAT.at_updated', function(inserta){
					    if (inserta === 'error'){
						console.log('accounts/procesaPendientes/getUserPageAT.at_updated - error en insert a la bd, no insertamos nuevo token');
					    }
					    return callback(pageAccessToken);
					});
					
				    }
				});
			    }
			});
		    }
		    else {
			// y sigue vigente
			return callback(token[0].page_at);
		    }
		}
	    }
	});
    }

    function revisalast(datos_obj,lassolicitudes,callback) {
	var cuantas_sols = (lassolicitudes.length - 1);
	var criterio = {$and: [{cuenta: datos_obj.cuenta}, {user_id : datos_obj.user_id}]};
	var sort = {created : -1};
	var limit = 1;
	var solicitud = {};
	classdb.buscarToArrayLimit('peticiones_automaticas_pat', criterio, sort, limit, 'accounts/procesaPendientes/revisalast', function(items){
	    if (items === 'error'){
		return callback('error');
	    }
	    else {
		if (items.length < 1) {
		    // aun no existe solicitud para esta cuenta/usuario
		    solicitud.created = new Date();
		    solicitud.cuenta = datos_obj.cuenta;
		    solicitud.pa_at = datos_obj.access_page;
		    solicitud.user_id = datos_obj.user_id;
		    solicitud.us_at = datos_obj.user_access;
		    solicitud.path = lassolicitudes[0];
		    solicitud.next = lassolicitudes[1];
		    classdb.inserta('peticiones_automaticas_pat', solicitud, 'accounts/procesaPendientes/revisalast', function(inserte){
			if (inserte === 'error') {
			    console.log('accounts/procesaPendientes/revisalast - no pudimos insertar solicitud a la base de datos');
			    return callback(solicitud);
			}
			else {
			    return callback(solicitud);
			}
		    });
		}
		else {
		    // ya existe solicitud en la bd
		    var last = items[0];
		    solicitud = items[0];
		    var ts = last.created.getTime();
		    var tsm2m = (ts) + 120000;
		    var ahora = new Date().getTime();
		    if (tsm2m < ahora) {
			// y la solicitud se hizo hace más de 2 minutos
			var actual = last.next;
			var indice = lassolicitudes.indexOf(actual);
			var indicem1 = indice + 1;
			if (indice === cuantas_sols) {
			    solicitud.created = new Date();
			    solicitud.pa_at = datos_obj.access_page;
			    solicitud.us_at = datos_obj.user_access;
			    solicitud.path = lassolicitudes[indice];
			    solicitud.next = lassolicitudes[0];
			}
			else {
			    solicitud.created = new Date();
			    solicitud.pa_at = datos_obj.access_page;
			    solicitud.us_at = datos_obj.user_access;
			    solicitud.path = actual;
			    solicitud.next = lassolicitudes[indicem1];
			}
			var criteriou = { $and : [ { cuenta : datos_obj.cuenta }, { user_id : datos_obj.user_id } ] };
			classdb.actualiza('peticiones_automaticas_pat', criteriou, solicitud, 'accounts/procesaPendientes/revisalast', function(actualice){
			    if (actualice === 'error') {
				console.log('accounts/procesaPendientes/revisalast - no pudimos updatear solicitud en la base de datos');
				return callback(solicitud);
			    }
			    else {
				return callback(solicitud);
			    }
			});
		    }
		    else {
			// y la solicitud se hizo hace menos de 2 minutos
			return callback('not-yet');
		    }
		}
	    }
	});
    }
     */

    // function peticion_automatica(solicitude, callback) {
	// console.log('peticion: '+solicitude.path);
	// var estatus = '';
	// var post_data = querystring.stringify({ access_page: solicitude.pa_at, account_name: account_name });
	// globales.options_likeable_servs.method = 'POST';
	// globales.options_likeable_servs.path = solicitude.path;
	// globales.options_likeable_servs.headers = {
	//     'Content-Type': 'application/x-www-form-urlencoded',
	//     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	//     'Content_Length' : post_data.length
	// };
	// var solicitud_likeable = https.request(globales.options_likeable_servs, function(respu) {
	//     respu.setEncoding('utf8');
	//     respu.on('data', function(dati) {
	// 	estatus += dati;
	//     });
	//     respu.on('end', function(){
	// 	console.log(solicitude.path);
	// 	return callback(solicitude.path);
	//     });
	// });
	// solicitud_likeable.write(post_data);
	// solicitud_likeable.end();
	// solicitud_likeable.on('error', function(errum){
	//     console.log('Peticiones automaticas/https_request -  error en el request: ' +errum);
	//     return callback('error');
	// });    
    // }
    /*
    var fbuserAT = req.body.access_token;
    var fbuserid = req.body.fbuid;
    var account_name = req.body.account_name;
    var account_id = req.body.account_id;
    var screen_name = req.body.screen_name;
    var user_id = req.body.user_id;

    var solicitud = {};
    var solicitudes = ['/getcp','/getpp']; // añadir un obtieneMonitoreo pero de la página en cuestión con access token y todo
    console.log(screen_name+' --- '+account_id+' --- '+account_name+' --- '+fbuserAT);
    console.log('ENTRO A procesaPendientes');
    getFacebookPageByCuenta(account_name, account_id, function(cuenta){
	if (cuenta === 'error') {
	    console.log('accounts/procesapendientes.main - no conseguimos la cuenta con id de facebook válido');
	    res.jsonp('error');
	} else {
	    getUserPageAT(cuenta, user_id, account_name, screen_name, fbuserid, fbuserAT, function(access_page){
		if (access_page === 'error') {
		    console.log('accounts/procesapendientes.main - no conseguimos el access page para '+account_name);
		    res.jsonp('error');
		}
		else {
		    var datos_obj = {
			cuenta : account_name,
			access_page: access_page,
			user_id: user_id,
			user_access: fbuserAT
		    };

		    revisalast(datos_obj, solicitudes, function(sol) {
			if (typeof sol.path === 'undefined') {
			    console.log('not-yet');
			    res.jsonp('not-yet');
			}
			else {
			    peticion_automatica(sol, function(respuesta){
				console.log(respuesta);
				res.jsonp(respuesta);
			    });
			}
		    });

		}
	    });
	}
    });
     */
    res.jsonp('ok');    
};
/*               _                                       _____               _ _            _            
                | |                                     |  __ \             | (_)          | |           
   ___ _ __   __| |  _ __  _ __ ___   ___ ___  ___  __ _| |__) |__ _ __   __| |_  ___ _ __ | |_ ___  ___ 
  / _ \ '_ \ / _` | | '_ \| '__/ _ \ / __/ _ \/ __|/ _` |  ___/ _ \ '_ \ / _` | |/ _ \ '_ \| __/ _ \/ __|
 |  __/ | | | (_| | | |_) | | | (_) | (_|  __/\__ \ (_| | |  |  __/ | | | (_| | |  __/ | | | ||  __/\__ \
  \___|_| |_|\__,_| | .__/|_|  \___/ \___\___||___/\__,_|_|   \___|_| |_|\__,_|_|\___|_| |_|\__\___||___/
                    | |                                                                                  
                    |_|                                                                                  
*/


exports.getTwUni = function(req,res){
    res.jsonp(req.tw);
};

exports.getTemas = function(req,res,next,tema){
    classdb.buscarToArray('temas_'+tema, {}, {}, 'accounts/getTemas', function(items) {
	if (items === 'error') {
	    res.jsonp('error');
	}
	else {
	    var temas = {};
	    var topindex = (items.length - 1);
	    for(var i = 0; i < items.length; i++){
		temas[i] = items[i];
	    }
	    res.jsonp(temas);
	}
    });
};

//Función que sirve para llamar todos los temas disponibles
//Creadas por Gabriel Aguilar Regato el 11 de Diciembre
exports.getTemasPantalla = function(req,res,next,tema){
    var cuenta=req.body.cuenta;
    classdb.buscarToArray('temas_'+cuenta, {}, {}, 'accounts/getTemas', function(items) {
	if (items === 'error') {
	    res.jsonp('error');
	}
	else {
	    var temas = {};
	    var topindex = (items.length - 1);
	    for(var i = 0; i < items.length; i++){
		temas[i] = items[i];
	    }
	    res.jsonp(temas);
	}
    });
};

/**
 * Account middleware
 */
exports.accountByID = function(req, res, next, id) { 
    Account.findById(id).populate('user', 'displayName').exec(function(err, account) {
	if (err) return next(err);
	if (! account) return next(new Error('Failed to load Account ' + id));
	req.account = account ;
	next();
    });
};

/**
 * Account authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    // console.log(req.user.roles[0]);
    //if (req.account.user.id !== req.user.id) {
    switch(req.user.roles[0]){
    case 'app-manager':
	next();
	break;
    case 'account-manager':
	next();
	break;
    default:
	res.status(403).send('User is not authorized');
	break;
    }
    /*if(req.user.roles[0] !== 'app-manager'){
     return res.status(403).send('User is not authorized');
     }*/
};

exports.dataUpload = function(req, res){
  var multiparty = require('multiparty');
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    var fs = require('fs');
    if (typeof files.file !== 'undefined') {
      var img = files.file[0];
      // hay que darle formato al nombre del archivo para que no haya espacios ni caracteres especiales
      fs.readFile(img.path,function(err,data){
	var path = './public/images/account/'+img.originalFilename;
	var src_imagen = 'images/account/'+img.originalFilename;
        var nombreSistema = fields.nombre_corto[0];
        var lacoleccion = nombreSistema+'_consolidada';
        var marca = fields.nombre[0];
        fs.writeFile(path,data,function(err){
	  if(err){
	    console.log(err);
            res.jsonp('error en el archivo');
	  }else{
	    var objeto = { nombreSistema: nombreSistema, marca: marca, imagen_path: path, imagen_src: src_imagen,datosPage: '',datosTwitter:'', created_time: new Date()};
	    classdb.inserta('accounts', objeto, 'accounts/dataUpload', function(insertado){
              if (insertado === 'error') {
                console.log('dataUpload.insert.error');
                res.jsonp('error en el insert');
              }
              else {
                var objetoInicial = {
                  id : '0',
                  from_user_id : '0',
                  from_user_name: 'Sistema CRM',
                  message :  'Este es el post inicial',
                  created_time: new Date(),
                  obj: 'crm',
                  tipo: 'primer-mensaje',
                  asignado: {},
                  sentimiento: {},
                  clasificacion: {tema: '', subtema:''},
                  atendido: {},
                  eliminado: 1
                };
                classdb.inserta(lacoleccion, objetoInicial, 'accounts/dataUpload.primerPost', function(inserte) {
                  if (inserte === 'error') {
                    console.log('dataUpload.inserPrimerPost.error');
                    res.jsonp('error en insert de primer post');
                  }
                  else {
                    // creamos índices:
                    classdb.creaIndexSinTexto(lacoleccion, {id:1}, 'accounts/dataUpload.index.id', function(indexid){
                      classdb.creaIndexSinTexto(lacoleccion, {from_user_id:1}, 'accounts/dataUpload.index.from_user_id', function(indexfuid) {
                        classdb.creaIndexSinTexto(lacoleccion, {from_user_name:1}, 'accounts/dataUpload.index.from_user_name', function(funm) {
                          classdb.creaIndexSinTexto(lacoleccion, {created_time:1}, 'accounts/dataUpload.index.created_time', function(indexct) {
                            classdb.creaIndexSinTexto(lacoleccion, {obj:1}, 'accounts/dataUpload.index.obj', function(indexobj) {
                              classdb.creaIndexSinTexto(lacoleccion, {tipo:1}, 'accounts/dataUpload.index.tipo', function(indextipo) {
                                classdb.creaIndexSinTexto(lacoleccion, {sentimiento:1}, 'accounts/dataUpload.index.sentimiento', function(indexsent) {
                                  classdb.creaIndexSinTexto(lacoleccion, {'clasificacion.tema':1}, 'accounts/dataUpload.index.clasificacion.tema', function(indexctema) {
                                    classdb.creaIndexSinTexto(lacoleccion, {'clasificacion.subtema':1}, 'accounts/dataUpload.index.clasificacion.subtema', function(indexcsub) {
                                      classdb.creaIndexSinTexto(lacoleccion, {atendido:1}, 'accounts/dataUpload.index.atendido', function(indexatend) {
                                        classdb.creaIndexSinTexto(lacoleccion, {eliminado:1}, 'accounts/dataUpload.index.eliminado', function(indexelim) {
	                                  res.jsonp(insertado);
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  }
                });
              }
	    });
	  }
	});
      });
    }
    else {
      console.log('dataUpload error');
      res.jsonp('sin archivo');
    }
  });
};

exports.getInfoTwitter = function(req, res){
  function cuentaSetDataQuery(data, id, opcion, callback){
    var objectId = new ObjectID(id);
    var cadenaInsercion = {};
    var criterio = { _id : objectId };
    ///data._id = objectId;
    if(opcion === 0) {
      cadenaInsercion={
 	'twitter_consumer_secret':'',
 	'twitter_consumer_key':'',
 	'twitter_access_token':'',
 	'twitter_access_token_secret':'',
 	'twitter_id_principal' :data.twitter_id_principal,
 	'twitter_id_respuesta' : data.twitter_id_respuesta,
 	'twitter_screenname_respuesta' : data.twitter_screenname_respuesta,
 	'twitter_screenname_principal' : data.twitter_screenname_principal
      };
      classdb.actualiza('accounts', criterio, { datosTwitter : cadenaInsercion }, 'accounts/getInfoTwitter/cuentaSetDataQuery', function(actualizao){
        cmd.exec("pm2 restart escuchador_cuentas", function(error_restart, respu_restart) {
          if (error_restart) {
            console.log(error_restart);
            return callback(error_restart);
          } else {
            console.log(respu_restart);
            return callback(respu_restart);
          }
        });
      });
    }else if(opcion===1) {
      cadenaInsercion={
 	'twitter_consumer_secret':data.consumer_key,
 	'twitter_consumer_key':data.consumer_secret,
 	'twitter_access_token':data.access_token,
 	'twitter_access_token_secret':data.access_token_secret,
 	'twitter_id_principal' :data.twitter_id_principal,
 	'twitter_id_respuesta' : data.twitter_id_respuesta,
 	'twitter_screenname_respuesta' : data.twitter_screenname_respuesta,
 	'twitter_screenname_principal' : data.twitter_screenname_principal
      };
      var set = { datosTwitter : cadenaInsercion };
      classdb.actualiza('accounts', criterio, { datosTwitter : cadenaInsercion }, 'accounts/getInfoTwitter/cuentaSetDataQuery', function(actualizao){
        cmd.exec("pm2 restart escuchador_cuentas", function(error_restart, respu_restart) {
          if (error_restart) {
            console.log(error_restart);
            return callback(error_restart);
          } else {
            console.log(respu_restart);
            return callback(respu_restart);
          }
        });
      });
    }
  }//Fin de function cuentaSetDataQuery

    var consumer_key=req.body.twitter_consumer_key;
    var consumer_secret=req.body.twitter_consumer_secret;
    var access_token=req.body.twitter_access_token;
    var access_token_secret=req.body.twitter_access_token_secret;
    var opcion = 0;
    var llaves = {};
    
    if(typeof consumer_key==='undefined'){
    	consumer_key='';
    }
    if(typeof consumer_secret==='undefined'){
    	consumer_secret='';
    }
    if(typeof access_token==='undefined'){
    	access_token='';
    }
    if(typeof access_token_secret==='undefined'){
    	access_token_secret='';
    }
    
    if(consumer_key.length===0 || consumer_secret.length===0 || access_token.length===0 || access_token_secret.length===0){
	opcion=0;
	llaves={
	    'consumer_key'        : 'lutOodQP4NsPbVSPCn6udwXZi',
	    'consumer_secret'     : 'dtMAXgMFUJZLdyg4UHxDOIe7uE3DAFrxnKHh2YtU24MHfDCwol',
	    'access_token'        : '231684217-C2Au3LKtQSIEdxnQQhGtCEwHTVg1xGFLHOJlPIzD',
	    'access_token_secret' : 'xKSN3zJK0nkDBedifna0cTu0yqYwDAE5srcpKPhKe6Wua'
	};
    }
    else{
    	opcion=1;
	llaves={
	    'consumer_key'        : req.body.twitter_consumer_key,
	    'consumer_secret'     : req.body.twitter_consumer_secret,
	    'access_token'        : req.body.twitter_access_token,
	    'access_token_secret' : req.body.twitter_access_token_secret
	};	
    }
    var element ={};
    element.consumer_secret = req.body.twitter_consumer_key;
    element.consumer_key = req.body.twitter_consumer_secret;
    element.access_token = req.body.twitter_access_token;
    element.access_token_secret = req.body.twitter_access_token_secret;
    var T  = new Twit(llaves);
    T.get('users/show', {'screen_name': req.body.twitter_screenname_principal}, function(err, data) {
        if(err){
            console.log(err);
 	    if(err.code===89){
        	res.jsonp(2);
            }else{
        	res.jsonp(0);
            }
            console.log('El usuario de twitter no existe');
        }
        else{
            var idUserPrincipal=data.id;
            //console.log(req.body.twitter_screenname_respuesta);
            if(req.body.twitter_screenname_respuesta){
        	T.get('users/show', {'screen_name': req.body.twitter_screenname_respuesta}, function(errorPeticion2, data2) {
		    if(errorPeticion2){
			console.log(errorPeticion2);
			console.log('El usuario de twitter no existe');
			res.jsonp(1);//error en usuario secundario
		    }
		    else{
			var idUserSecundario = data2.id;
			element.twitter_id_principal = idUserPrincipal;
			element.twitter_id_respuesta = idUserSecundario;
			element.twitter_screenname_respuesta = req.body.twitter_screenname_respuesta;
			element.twitter_screenname_principal = req.body.twitter_screenname_principal;
			//console.log('Imprimiendo el elemento a ingresar a la base de datos');
			//console.log(element);
			cuentaSetDataQuery(element,req.body.id,opcion, function(reiniciaserv){
			  res.jsonp(element);
                        });
		    }
		});
            }else{
		element.twitter_id_principal = idUserPrincipal;
		element.twitter_screenname_principal = req.body.twitter_screenname_principal;
		//console.log('Imprimiendo el elemento a ingresar a la base de datos');
		cuentaSetDataQuery(element, req.body.id, opcion, function(reiniciaserv){
		  res.jsonp(element);                  
                });
            }
        }
    });	
};

exports.guardaFacePage = function(req, res){
    // console.log(req.body.datosPage);
    var upt = req.body.datosPage;
    var objectId = new ObjectID(req.body._id);
    var criterio = {_id : objectId};
    var elset = {datosPage: upt};
    classdb.actualiza('accounts', criterio, elset, 'accounts/guardaFacePage', function(updated){
	res.jsonp(updated);
    });
};

exports.eliminaFBConnect=function(req,res){
    var idPage=req.body.idPage;
    var access_token=req.body.tokenPage;
    globales.options_graph.method = 'DELETE';
    globales.options_graph.path = globales.fbapiversion+idPage+'/subscribed_apps?access_token='+access_token;	
    var solicitud = https.request(globales.options_graph, function(resp) {
	var chunks = [];
	resp.on('data', function(chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var contenido = JSON.parse(Buffer.concat(chunks));
	    var objectId = new ObjectID(req.body.idCuenta);
	    var criterio = {'_id':objectId};
	    var unset = { 'datosPage' : '' };
	    
	    classdb.actualizaUnset('accounts', criterio, unset, 'accounts/eliminaFBConnect', function(updated){
		res.jsonp(updated);
	    });
	});
    });
    solicitud.end();
    solicitud.on('error', function(err){
	console.log('Hubo un error');
	console.log(err);
	res.jsonp('error');
    });
};

exports.agregaMonitoreo=function(req,res){
    function requestGraph (path, callback) {
	if (typeof path === 'undefined' || path === null || path === '') {
	    console.log('solicitudes/getautocp/requestGraph2 - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
	else {
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = path;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getautocp/requestGraph2 - hubo un error en solicitud al graph: '+ path);
			//console.log('rtus/index/requestGraph2.error: '+path);
			//console.log(JSON.stringify(contenido.error));
			return callback('error');
		    }
		    else {
			return callback(contenido);
		    }
		});
	    });
	    solicitud.on('socket', function(socket){
		socket.setTimeout(30000);
		socket.on('timeout', function(){
	    	    solicitud.abort();
		});
	    });
	    solicitud.end();
	    solicitud.on('error', function(e){
		console.log('solicitudes/getautocp/requestGraph2 - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
    }

  accesstokens.obtieneAppAT('yes', function(appat){
    console.log('entra a función para obtener access tokens');
    if (appat === 'error') {
      console.log('accounts.server.controller/agregaMonitoreo.main/accesstokens.obtieneAppAT error');
      accesstokens.obtieneUsrsATAmongAllUsrs('yes', function(usrsat){
        if (usrsat === 'error') {
          console.log('accounts.server.controller/agregaMonitoreo.main/accesstokens.obtieneUsrsATAmongAllUsrs');
          res.jsonp(1);
        }
        else {
          var derpathen = globales.fbapiversion+req.body.monitoreo+'?'+usrsat;
          requestGraph(derpathen, function(segundarespuesta){
            if (segundarespuesta === 'error') {
	      res.jsonp(1);
	    }
	    else {
	      var objectId = new ObjectID(req.body._id);
	      var criterio = {_id:objectId};
	      var elset = {'datosMonitoreo':{'id':segundarespuesta.id,'name':req.body.monitoreo}};
	      classdb.actualiza('accounts', criterio, elset, 'accounts/agregaMonitoreo', function(updated){
		if (updated === 'error') {
		  res.jsonp(1);
		}
		else {
		  res.jsonp(2);
		}	
	      });		    
	    }
          });          
        }
      });
    }
    else {
      var elpath = globales.fbapiversion+req.body.monitoreo+'?'+appat;
      requestGraph(elpath, function(primerarespuesta){
        if (primerarespuesta === 'error') {
          console.log('no se pudo con el access token de app');
          accesstokens.obtieneUsrsATAmongAllUsrs('yes', function(usersat){
            if (usersat === 'error') {
              res.jsonp(1)
            }
            else {
              console.log('Y EL ACCESS TOKEN DEL USUARIO ESSSS:')
              console.log(usersat);
              console.log('ACCESS TOKEN DEL USUARIO END');
              var derpathen = globales.fbapiversion+req.body.monitoreo+'?'+usersat;
              requestGraph(derpathen, function(segundarespuesta){
                if (segundarespuesta === 'error') {
		  res.jsonp(1);
		}
		else {
		  var objectId = new ObjectID(req.body._id);
		  var criterio = {_id:objectId};
		  var elset = {'datosMonitoreo':{'id':segundarespuesta.id,'name':req.body.monitoreo}};
		  classdb.actualiza('accounts', criterio, elset, 'accounts/agregaMonitoreo', function(updated){
		    if (updated === 'error') {
		      res.jsonp(1);
		    }
		    else {
		      res.jsonp(2);
		    }	
		  });		    
		}
              });
            }
          });
        }
        else {
          var objectId = new ObjectID(req.body._id);
	  var criterio = {_id:objectId};
	  var elset = {'datosMonitoreo':{'id':primerarespuesta.id,'name':req.body.monitoreo}};
	  classdb.actualiza('accounts', criterio, elset, 'accounts/agregaMonitoreo', function(updated){
	    if (updated === 'error') {
	      res.jsonp(1);
	    }
	    else {
	      res.jsonp(2);
	    }	
	  }); 
        }
      });
    }
  });
};

exports.eliminaMonitoreo=function(req,res){
    var objectId = new ObjectID(req.body._id);
    var criterio = {_id:objectId};
    var unset = {'datosMonitoreo':''};
    classdb.actualizaUnset('accounts', criterio, unset, 'accounts/eliminaMonitoreo', function(updated){
	res.jsonp(updated);
    });
};

exports.connectFBConnect=function(req,res){
    var idPage=req.body.idCuenta;
    var access_token=req.body.accessToken;
    //console.log('CONECTANDO PAGINA DE FACEBOOK !!!!');
    //	deleteFB.path = '/'+idPage+'/subscribed_apps?access_token='+access_token;	
    globales.options_graph.method = 'POST';
    globales.options_graph.path = globales.fbapiversion+idPage+'/subscribed_apps?access_token='+access_token;
    var solicitud = https.request(globales.options_graph, function(resp) {
	var chunks = [];
	resp.on('data', function(chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var contenido = JSON.parse(Buffer.concat(chunks));
	    var objectId = new ObjectID(req.body._id);	    
	    var upt =req.body.datosPage;	    
	    var criterio = {_id:objectId};
	    var elset = {datosPage: upt};
	    classdb.actualiza('accounts', criterio, elset, 'accounts/connectFBConnect', function(updated){
		res.jsonp(updated);
	    });
	});
    });
    solicitud.end();
    solicitud.on('error', function(err){
	console.log(err);
	res.jsonp('error');
    });
};

exports.desconectaTwitter = function(req, res){
    //console.log('Llamando a desconectaTwitter en server');
    var objectId = new ObjectID(req.body._id);
    var criterio = {'_id':objectId};
    var elset = { 'datosTwitter' : '' };
    classdb.actualiza('accounts', criterio, elset, 'accounts/desconectaTwitter', function(updated){
	if (updated === 'error') {
	    res.jsonp(updated);
	}
	else {
          cmd.exec("pm2 restart escuchador_cuentas", function(error_restart, respu_restart) {
            if (error_restart) {
              console.log(error_restart);
              res.jsonp('error');
            } else {
              console.log(respu_restart);
              res.jsonp(updated);
            }
          });          
	}
    });
};

exports.eliminaListening = function(req, res){
    //console.log('Llamando a elimina Listening en server');
    var objectId = new ObjectID(req.body._id);
    var criterio = {'_id':objectId};
    var elset = {'datosTwitter.twitter_screenname_respuesta':'-1'};
    classdb.actualiza('accounts', criterio, elset, 'accounts/eliminaListening', function(updated){
	res.jsonp(updated);
    });
};

exports.getLongToken = function(req, res) {
    if (req.body.paccess_token) {
	var short_access_token=req.body.paccess_token;

	var path = globales.fbapiversion+'oauth/access_token?grant_type=fb_exchange_token&client_id='+globales.fb_app_id+'&client_secret='+globales.fb_app_secret+'&fb_exchange_token='+short_access_token;
	globales.options_graph.method = 'GET';
	globales.options_graph.path = path;
	var solicitud = https.request(globales.options_graph, function(resp) {
	    var respuesta = '';
	    resp.setEncoding('utf8');
	    resp.on('data', function(chunk) {
		respuesta += chunk;
	    });
	    resp.on('end', function() {
		// var contenido = JSON.parse(Buffer.concat(respuesta));
		res.jsonp(respuesta);
	    });
	});
	solicitud.end();
	solicitud.on('error', function(e){
	    console.log('facebookPost/requestGraph - hubo un error en la conexión al graph: '+e);
	    res.jsonp('error');
	});
    }
    else {
	res.jsonp('no se recibió --paccess_token-- token personal de corta duración');
    }
};

exports.eliminaCuenta = function(req, res){
    var compara = require('../../escuchadores/escuchador/comparador.js');
    var cuenta=req.body.nombreSistema;
   	var collection = 'accounts';
   	var users = 'users';
   	var sort = {nombreSistema: 1};
	classdb.remove(collection, {'nombreSistema':cuenta}, 'accounts/eliminaCuenta', function(resultado){    
    	if(resultado==='error'){
        	res.jsonp('error');
        }else{
			classdb.remove(users, {'cuenta.marca':cuenta}, 'accounts/eliminaCuenta/RemoveUsers', function(resultadoUsers){    
				if(resultadoUsers === 'error'){
					res.jsonp('error');
				}else{
					compara.find();
        			res.jsonp('ok');
				}

        	
			//classdb.buscarToArray(collection, {}, sort, 'themes/editaRespuesta', function(themes){
			//	if(themes==='error'){
			//		res.jsonp(3);
			//	}else{
			  //  	res.jsonp(themes);
				//}
		    });
        }
	});
	//console.log('Entro a la eliminación de la cuenta en el server');
	//res.jsonp('JUAN');
};

exports.informacionCuenta = function(req, res){
    var cuenta=req.body.nombreSistema;
   	var collection = 'accounts';
   	var sort = {nombreSistema: 1};
	classdb.buscarToArray(collection, {'nombreSistema':cuenta}, {}, 'accounts/informacionCenta', function(resultado){    
    	if(resultado==='error'){
        	res.jsonp('error');
        }else{
        	res.jsonp(resultado);
        }
	});
};

exports.getDashboard=function(req,res){
	
	function getCuentas(datos,callback){
		var collection = 'accounts';
		classdb.buscarToArray(collection, {}, {}, 'accounts/getDashboard', function(resultado){    
    		if(resultado==='error'){
        		res.jsonp('error');
        	}else{
        		return callback(resultado);
        	}
		});
	}

	function obtieneMensajes(cuenta,callback){
		var objeto={};
		var nombreCuenta=cuenta.marca;
		var nombreSistema=cuenta.nombreSistema;
		var imagenCuenta=cuenta.imagen_src;
		classdb.count(nombreSistema+'_consolidada', {}, {}, function(data){
			if(data === 'error'){
				return callback('error');		
			}else{
				objeto.imagenCuenta=imagenCuenta;
				objeto.nombreCuenta=nombreCuenta;
				objeto.nombreSistema=nombreSistema;
				objeto.totalMensajes=data;
				if(cuenta.datosTwitter.twitter_access_token){
					objeto.monitoreo='no';
				}else{
					objeto.monitoreo='si';
				}
				if(nombreSistema === 'dish'){
					objeto.version='v1';
				}else{
					objeto.version='v2';
				}
				return callback(objeto);
			}
		});	
	}

	function obtieneUsuarios(objeto,callback){
		var nombreSistema=objeto.nombreSistema;
		classdb.count('users', {'cuenta.marca':nombreSistema}, {}, function(data){
			if(data === 'error'){
				return callback('error');		
			}else{
				objeto.totalUsuarios=data;
				return callback(objeto);
			}
		});	
	}

	function desglosaCuentas(cuentas,index,arreglo,callback){
		var cuantos = cuentas.length;
		var more = index+1;
		if (more <= cuantos) {
			setImmediate(function(){
				obtieneMensajes(cuentas[index], function(mensajes){
					if(mensajes === 'error'){
						console.log('Error mensajes');
						desglosaCuentas(cuentas,more,arreglo,callback);
					}
					else{
						obtieneUsuarios(mensajes,function(usuarios){
							if(usuarios === 'error'){
								console.log('Error en usuarios');
								desglosaCuentas(cuentas,more,arreglo,callback);
							}else{
								arreglo.push(usuarios);
								desglosaCuentas(cuentas,more,arreglo,callback);
							}
						});
					}
				});
			});
		}
		else {
	    	return callback(arreglo);
		}	
	}

	getCuentas('',function(cuentas){
		if(cuentas === 'error'){
			res.jsonp('error');
		}else{
			desglosaCuentas(cuentas,0,[],function(objetoFinal){
				res.jsonp(objetoFinal);
			});
			
		}
	});
};

exports.insertTrackers = function(req, res){
	var coleccion = 'accounts';
	var idCuenta = new ObjectID(req.body.infoCuenta._id);
	var criterio = { '_id' : idCuenta };
	var eladdtoset = {'trackers' : req.body.objetoTrackers};
	classdb.actualizacresult(coleccion, criterio, eladdtoset, 'insertTrackers/', function(updated){
          if (updated === 'error') {
	    res.jsonp(updated);
          }
          else {
            cmd.exec("pm2 restart escuchador_trackers", function(error_restart, respu_restart) {
              if (error_restart) {
                console.log(error_restart);
                res.jsonp('error');
              } else {
                console.log(respu_restart);
                res.jsonp(updated);
              }
            });
          }       
	});
};

exports.eliminaTrackers = function(req, res){
  var coleccion = 'accounts';
  var idCuenta = new ObjectID(req.body.infoCuenta._id);
  var criterio = { '_id' : idCuenta };
  var unset = {'trackers':''};
  classdb.actualizaUnset(coleccion, criterio, unset, '/eliminaTrackers', function(updated){
    if (updated === 'error') {
      res.jsonp(updated);
    }
    else {
      cmd.exec("pm2 restart escuchador_trackers", function(error_restart, respu_restart) {
        if (error_restart) {
          console.log(error_restart);
          res.jsonp('error');
        } else {
          console.log(respu_restart);
          res.jsonp(updated);
        }
      });
    }
  });

};
