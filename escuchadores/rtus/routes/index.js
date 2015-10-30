'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https'), ObjectID = require('mongodb').ObjectID;
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var urlParts = url.parse(req.url, true), 
	query = urlParts.query;
    function ahonda(objeto) {
	var oo = {}, t, parts, part;
	for (var k in objeto) {
    	    t = oo;
    	    parts = k.split('.');
    	    var key = parts.pop();
    	    while (parts.length) {
      		part = parts.shift();
      		t = t[part] = t[part] || {};
    	    }
	    t[key] = objeto[k];
  	}
  	return oo;
    }
    var objetoarreglado = ahonda(query);
    console.log(objetoarreglado);
    if (typeof objetoarreglado.hub !== 'undefined' && typeof objetoarreglado.hub.challenge !== 'undefined') {
	res.setHeader('Content-Type', 'application/json');
	res.end(objetoarreglado.hub.challenge);
    }
    else {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(objetoarreglado));
	// res.end(JSON.stringify('no hubo challenge'));
    }
    // res.render('index', { title: 'Expresssss' });

});

router.post('/', function(req, res){
    // mongo - vemos si lo que sea que se quiere insertar ya existe en base de datos
    function verificaExistencia (coleccion, id, callback) {
	var elemcol = coleccion.split('_'), 
	    primtermcol = elemcol[0], 
	    segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], 
	    lasttermcol = elemcol[elemcol.length - 1];
	var criterio = {'id': id};
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		var cole = primtermcol+'_consolidada';
		classdb.existecount(cole, criterio, 'rtus/index/verificaExistencia', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		var colec = primtermcol+'_other';
		classdb.existecount(colec, criterio, 'rtus/index/verificaExistencia', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.existecount(coleccion, criterio, 'rtus/index/verificaExistencia', function(respuesta){
		return callback(respuesta);
	    });			
	}
    }

    // mongo - insertamos elemento en base de datos
    function insertaBase (coleccion,objetoFacebook,tipo,coleccionError, callback) {
	var elemcol = coleccion.split('_'), 
	    primtermcol = elemcol[0], 
	    segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], 
	    lasttermcol = elemcol[elemcol.length - 1];
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		objetoFacebook.tipo = lasttermcol;
		objetoFacebook.coleccion_orig = coleccion;
		objetoFacebook.coleccion = primtermcol+'_consolidada';
		objetoFacebook.obj = 'facebook';
		var cole = primtermcol+'_consolidada';
		classdb.inserta(cole, objetoFacebook, 'rtus/index/insertaBase', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		var colec = primtermcol+'_other';			    
		classdb.inserta(colec, objetoFacebook, 'rtus/index/insertaBase', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.inserta(coleccion, objetoFacebook, 'rtus/index/insertaBase', function(respuesta){
		return callback(respuesta);
	    });
	}
    }

    // mongo - actualizamos elemento en base de datos
    function actualizaBase (coleccion, objetoface, tipo, colerror, callback) {
	var elemcol = coleccion.split('_'), 
	    primtermcol = elemcol[0], 
	    segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], 
	    lasttermcol = elemcol[elemcol.length - 1];
	var criterio = { id : objetoface.id };
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		objetoface.tipo = tertermcol;
		objetoface.coleccion_orig = coleccion;
		objetoface.coleccion = primtermcol+'_consolidada';
		objetoface.obj = 'facebook';
		coleccion = primtermcol+'_consolidada';
		classdb.actualiza(coleccion, criterio, objetoface, 'rtus/index/actualizaBase', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		coleccion = primtermcol+'_other';			    
		classdb.actualiza(coleccion, criterio, objetoface, 'rtus/index/actualizaBase', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.actualiza(coleccion, criterio, objetoface, 'rtus/index/actualizaBase', function(respuesta){
		return callback(respuesta);
	    });
	}
    }

    // mongo - ponemos índice de eliminado en documento de mongo
    function objetoEliminado (coleccion, id_eliminado, callback) {
	var elemcol = coleccion.split('_'), primtermcol = elemcol[0], segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], lasttermcol = elemcol[elemcol.length - 1];
	var criterio = { id : id_eliminado };
	var set = {eliminado : 1};
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		coleccion = primtermcol+'_consolidada';
		classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEliminado', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		coleccion = primtermcol+'_other';			    
		classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEliminado', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEliminado', function(respuesta){
		return callback(respuesta);
	    });
	}
    }
    
    function objetoEscondido (coleccion, id_escondido, callback) {
	var elemcol = coleccion.split('_'), primtermcol = elemcol[0], segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], lasttermcol = elemcol[elemcol.length - 1];
	var criterio = { id : id_escondido };
	var set = {escondido : 1};
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		coleccion = primtermcol+'_consolidada';
		classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEscondido', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		coleccion = primtermcol+'_other';			    
		classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEscondido', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.actualiza(coleccion, criterio, set, 'rtus/index/objetoEscondido', function(respuesta){
		return callback(respuesta);
	    });
	}
    }

    function eliminaEntrada (coleccion, elemento_id, callback) {
	var criterio = { id : elemento_id };
	classdb.remove(coleccion, criterio, 'rtus/index/eliminaEntrada', function(eliminado){
	    return callback(eliminado);
	});
    }

    function nueMens(fecha, tipo, cuenta) {
	var dadate = fecha.toString();
	var nm_data = querystring.stringify(
	    {
		obj: 'facebook',
		tipo: tipo,
		created_time: dadate,
		cuenta: cuenta
	    }
	);
	var nm_options = {
	    hostname: globales.options_likeable.hostname,
	    port: 443,
	    path: '/nuevoMensaje',
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Content-Length': nm_data.length
	    }
	};
	var nmpost_req = https.request(nm_options, function(resnm) {
	    resnm.setEncoding('utf8');
	    resnm.on('data', function (nmchunk) {
	    });
	});
	nmpost_req.write(nm_data);
	nmpost_req.end();
	nmpost_req.on('error', function(e){
	    console.log('escuchador/post-nuevoMensaje varios error: '+e);
	    console.log("Error: " +e.message); 
	    console.log( e.stack );
	});
    }

    function objetoDesEscondido (coleccion, id_desescondido, callback) {
	var elemcol = coleccion.split('_'), primtermcol = elemcol[0], segtermcol = elemcol[1], 
	    tertermcol = elemcol[2], lasttermcol = elemcol[elemcol.length - 1];
	var criterio = { id : id_desescondido };
	var elunset = {escondido : ''};
	if (lasttermcol !== 'raw' && lasttermcol !== 'pending' && lasttermcol !== 'like') { 
	    if (lasttermcol !== 'photo' && lasttermcol !== 'story' && lasttermcol !== 'status' && lasttermcol !== 'video') {
		coleccion = primtermcol+'_consolidada';
		classdb.actualizaUnset(coleccion, criterio, elunset, 'rtus/index/objetoDesEscondido', function(respuesta){
		    return callback(respuesta);
		});
	    }
	    else {
		coleccion = primtermcol+'_other';			    
		classdb.actualizaUnset(coleccion, criterio, elunset, 'rtus/index/objetoDesEscondido', function(respuesta){
		    return callback(respuesta);
		});
	    }
	}
	else {
	    classdb.actualizaUnset(coleccion, criterio, elunset, 'rtus/index/objetoDesEscondido', function(respuesta){
		return callback(respuesta);
	    });
	}

    }
    
    // mongo - insertamos error en su propia colección en mongo
    function insertaBaseError (coleccion, objetoFacebook, callback) {
	classdb.inserta(coleccion, objetoFacebook, 'rtus/index/insertaBaseError', function(respuesta){
	    return callback(respuesta);
	});
    }

    function requestGraph2 (path, callback) {
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
			// console.log('solicitudes/getautocp/requestGraph2 - hubo un error en solicitud al graph: '+ path);
			console.log('rtus/index/requestGraph2.error: '+path);
			console.log(JSON.stringify(contenido.error));
			if (typeof contenido.error.code !== 'undefined' && 
			    contenido.error.code === 190 && 
			    typeof contenido.error.error_subcode !== 'undefined' 
			    && contenido.error.error_subcode === 460) {
			    console.log('access_token inválido');
			    return callback('invalid');
			}
			else {
			    return callback('error');
			}
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

    function obtieneUsuariosConAccessToken (callback) {
	var criterium = {
	    $and: [
		{'additionalProvidersData.facebook': { $exists: true }},
		{'additionalProvidersData.facebook.accessToken': {$exists: true}}
	    ]
	};
	var usersfields = {
	    '_id' : '', 
	    'displayName' : '', 
	    'username' : '',
	    'cuenta.marca': '',
	    'additionalProvidersData.facebook.accessToken' : '',
	    'additionalProvidersData.facebook.name': ''
	};
	classdb.buscarToArrayFields('users', criterium, usersfields, {}, 'rtus/index/obtieneUsuariosConAccessToken', function(dieusern){	
	    return callback(dieusern);
	});
    }

    function quitaAdditionalProvidersData (alusuario, altoken, callback){
	var critere = {
	    $and: [
		{displayName : alusuario},
		{'additionalProvidersData.facebook.accessToken' : altoken}
	    ]
	};
	var leunset = {additionalProvidersData : ''};
	classdb.actualizaUnset('users', critere, leunset, 'rtus/index/quitaAdditionalProvidersData', function(lareponse){
	    return callback(lareponse);
	});
    }

    function tokensDeUsuarios (los_usuarios, index, validTokens, callback) {
	var more = index+1;
	var cuantosusuarios = los_usuarios.length;
	if (more > cuantosusuarios) {
	    return callback(validTokens);
	}
	else {
	    setImmediate(function(){
		if (typeof los_usuarios[index] !== 'undefined') {
		    var eltoken = los_usuarios[index].additionalProvidersData.facebook.accessToken;
		    var eldisplayname = los_usuarios[index].displayName;
		    var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+eltoken;
		    requestGraph2(path, function(validacion){
			if (validacion === 'error' || validacion === 'invalid') {
			    return tokensDeUsuarios(los_usuarios, more, validTokens, callback);
			}
			else if(validacion === 'invalid') {
			    quitaAdditionalProvidersData(eldisplayname, eltoken, function(eliminato){
				console.log('access_token de '+eldisplayname+' eliminado - '+eliminato);
				return tokensDeUsuarios(los_usuarios, more, validTokens, callback);
			    });
			}
			else {
			    validTokens.push(validacion.access_token);
			    return tokensDeUsuarios(los_usuarios, more, validTokens, callback);
			}
		    });
		}
		else {
		    return tokensDeUsuarios(los_usuarios, more, validTokens, callback);
		}
	    });
	}
    }

    function obtieneAccessTokensValidosDeTodos (callback) {
	var critere = {'nombre_cta': 'todos'};
	var lesort = {created_time: -1};
	var lostokensvalidos = [];
	classdb.buscarToArray('verifica_auto_uat', critere, {}, 'rtus/index/getCtaATs', function(items){
	    if (items === 'error') {
		return callback(lostokensvalidos);
	    }
	    else {
		if (items.length < 1) {
		    // no existen access_tokens en bd, los pedimos a fb
		    obtieneUsuariosConAccessToken(function(usuarios){
			if (usuarios === 'error') {
			    return callback(lostokensvalidos);
			}
			else {
			    tokensDeUsuarios(usuarios, 0, [], function(validtokens){
				if (validtokens.length < 1) {
				    // no hay tokens para esta cuenta
				    return callback(lostokensvalidos);
				}
				else {
				    var objeto = {
					nombre_cta: 'todos',
					created_time: new Date(),
					valid_tokens: validtokens
				    };
				    lostokensvalidos = validtokens;
				    classdb.inserta('verifica_auto_uat', objeto, 'solicitudes/getautocp/getCtaATs', function(insertao){
					return callback(lostokensvalidos);
				    });
				}
			    });
			}
		    });
		}
		else {
		    var ts = items[0].created_time.getTime();
		    var tsm1 = (ts) + 3600000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			obtieneUsuariosConAccessToken(function(usuarios){
			    if (usuarios === 'error') {
				return callback(lostokensvalidos);
			    }
			    else {
				tokensDeUsuarios(usuarios, 0, [], function(validtokens){
				    if (validtokens.length < 1) {
					// no hay tokens para esta cuenta
					return callback(lostokensvalidos);
				    }
				    else {
					var objeto = {
					    nombre_cta: 'todos',
					    created_time: new Date(),
					    valid_tokens: validtokens
					};
					lostokensvalidos = validtokens;
					classdb.inserta('verifica_auto_uat', objeto, 'solicitudes/getautocp/getCtaATs', function(insertao){
					    return callback(lostokensvalidos);
					});
				    }
				});
			    }
			});
		    }
		    else {
			// y sigue vigente
			lostokensvalidos = items[0].valid_tokens;
			return callback(lostokensvalidos);
		    }
		}
	    }
	});	
    }

    // Graph - cualquier solicitud que no se pueda lograr con el app access_token, la intentamos con otro access_token personal y permanente
    function requestGraphConPAT (path, callback) {
	obtieneAccessTokensValidosDeTodos(function(access_tokens) {
	    if (access_tokens.length > 0) {	
		var at_elegido = access_tokens[Math.floor(Math.random()*access_tokens.length)];	
		globales.options_graph.method = 'GET';
		globales.options_graph.path = path+'&access_token='+at_elegido;
		var solicitud = https.request(globales.options_graph, function(resp) {
		    var chunks = [];
		    // resp.setEncoding('utf8');
		    resp.on('data', function(chunk) {
			chunks.push(chunk);
		    });
		    resp.on('end', function() {
			var contenido = JSON.parse(Buffer.concat(chunks));
			if (typeof contenido.error !== 'undefined') {
			    console.log('rtus/index/requestGraphConPAT.error: '+path);
			    console.log(JSON.stringify(contenido));
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
		solicitud.on('error', function(err){
		    console.log('accounts/getPublicaciones/getPostsConPAT - Error en el request a facebook: '+err);
		    return callback('error');
		});
	    }
	    else {
		return callback('error');
	    }
	});
    }
    
    // Graph - hacemos cualquier solicitud según un path al graph de facebook
    function requestGraph (token, path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var ruta = '';
	    if (token === 'not') {
		ruta = path;
	    }
	    else {
		ruta = path+'&'+token;
	    }
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = ruta;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			if (token === 'not') {
			    console.log('/rtus/index/requestGraph-not.error: '+ruta);
			    console.log(JSON.stringify(contenido.error));
			    return callback(contenido.error, null);
			}
			else {
			    console.log('/rtus/index/requestGraph.error: '+ruta);
			    console.log(JSON.stringify(contenido.error));
			    requestGraphConPAT(path, function(resultados) {
				if (resultados === 'error') { return callback('error', null); }
				else { return callback(null, resultados); }
			    });
			}
		    }
		    else {
			return callback(null, contenido);
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
		console.log('rtus/index/requestGraph - hubo un error en la conexión al graph: '+e);
		return callback('error', null);
	    });
	}
	else {
	    console.log('rtus/index/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error', null);
	}
    }

    // Graph - solicitamos accessToken a facebook
    function requestAT (callback) {
	var bmpString, access_token;	
	var path = globales.fbapiversion+globales.path_app_at;
	globales.options_graph.method = 'GET';
	globales.options_graph.path = path;
	var solicitud = https.request(globales.options_graph, function(resp) {
	    var chunks = [];
	    resp.on('data', function(dati) {
		chunks.push(dati);
		// access_token += dati;
	    }).on('end', function() {
		var access_token = JSON.parse(Buffer.concat(chunks));
		if (access_token.error) {
		    console.log('solicitudes/getpb/requestAT - error en access_token: '+access_token);
		    return callback('error');
		}
		else {
		    return callback(access_token);
		}
	    });
	});
	solicitud.end();
	solicitud.on('error', function(erra){
	    console.log('rtus/index/requestAT - error en el request: '+erra);
	    return callback('error');
	});
    }

    // mongo/Graph - obtenemos el access token ya sea de nuestra base de datos o de facebook
    function getAppAT (callback) {
	classdb.buscarToArray('verifica_at', {}, {}, 'rtus/index/getAppAT', function(items){
	    if (items === 'error') {
		return callback(items);
	    }
	    else {
		if (items.length < 1) {
		    // no existe access_token en bd, lo pedimos a fb
		    requestAT(function(at) {
			// console.log(typeof at);
			// console.log(typeof at.access_token);
			if (at === 'error' || typeof at === 'undefined' || typeof at.access_token === 'undefined') {
			    // hubo un error, no access token, gosh
			    console.log('rtus/index/getAppAT - access_token error en request o venía vacío');
			    return callback('error');
			}
			else {
			    // hubo respuesta por parte de facebook
			    var objeto = {};
			    objeto = { at: 'access_token='+at.access_token, ts: new Date() };
			    classdb.inserta('verifica_at', objeto, 'rtus/index/getAppAT', function(respuesta){
				return callback('access_token='+at.access_token);
			    });
			}
		    });		    
		}
		else {
		    var ts = items[0].ts.getTime();
		    var tsm1 = (ts) + 3600000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			requestAT(function(at) {
			    if (at === 'error' || typeof at === 'undefined' || typeof at.access_token === 'undefined') {
				// no hubo respuesta por parte de facebook o hubo un error, no access token
				console.log('rtus/index/getAppAT - access_token error en request o venía vacío');
				return callback('error');
			    }
			    else {
				// hubo respuesta por parte de facebook
				var criterio_actualizacion = { _id : items[0]._id };
				var objeto = {};
				objeto = { at: 'access_token='+at.access_token, ts: new Date() };
				classdb.actualiza('verifica_at', criterio_actualizacion, objeto, 'solicitudes/getol/getAppAT', function(respuestau) {
				    return callback('access_token='+at.access_token);
				});
			    }
			});
		    }
		    else {
			// y sigue vigente
			return callback(items[0].at);
		    }
		}
	    }
	});
    }
    
    // Hacemos un arreglo con un mini-condensado de la info de las cuentas
    function refinaCuentas (cuentas, index, ctasrefinadas, callback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantasc = cuentas.length;
	if (more > cuantasc) {
	    return callback(ctasrefinadas);
	}
	else {
	    setImmediate(function() {
		if (typeof cuentas[index] !== 'undefined') {
		    var datosSistema = {
			'nombreSistema' : cuentas[index].nombreSistema,
			'idSistema' : cuentas[index].datosPage.id,
			'created_time' : cuentas[index].created_time,
			'ts' : new Date()
		    };
		    ctasrefinadas.push(datosSistema);
		    return refinaCuentas(cuentas, more, ctasrefinadas, callback);
		}
		else {
		    return refinaCuentas(cuentas, more, ctasrefinadas, callback);
		}
	    });
	}
    }
    
    // mongo - obtenemos cuentas conectadas a fanpages de facebook 
    function getCuentas (callback) {
	var criterio = {
	    $and: [
		{'nombreSistema' : {$exists : true}}, 
		{'datosPage' : {$exists : true}}, 
		{'datosPage.id' : {$exists : true}}, 
		{'datosPage.id' : {$ne: -1}}, 
		{'datosPage.id' : {$ne: ''}}]
	};
	classdb.buscarToStream('accounts', criterio, {}, 'rtus/index/getCuentas', function(cuentas){
	    refinaCuentas(cuentas, 0, [], function(refinadas){
		return callback(refinadas);
	    });
	});
    }

    // iteración - relacionamos las entradas y las cuentas para su uso posterior		
    function relentrctas (entries, ctas, index, entradas, callback) {
	var more = index+1;
	var cuantas_ent = entries.length;
	if (more > cuantas_ent) {
	    return callback(entradas);
	}
	else {
	    setImmediate(function(){
		if (typeof entries === 'undefined' || typeof entries[index] === 'undefined') {
		    // no hubo entries o entry
		    return relentrctas(entries, ctas, more, entradas, callback);
		}
		else {
		    var idc = _.chain(ctas).pluck('idSistema').indexOf(entries[index].id).value();
		    if (idc === -1) {
			console.log('entrada de página no registrada en las cuentas: '+ JSON.stringify(entries[index]));
			return relentrctas(entries, ctas, more, entradas, callback);
		    }
		    else {
			entries[index].nombreSistema = ctas[idc].nombreSistema;
			entries[index].acc_ctime = ctas[idc].created_time;
			entradas.push(entries[index]);
			return relentrctas(entries, ctas, more, entradas, callback);
		    }
		}
	    });
	}
    }
    
    // iteración - estandarizamos los datos de los cambios 
    function estandarizaCambios (entrada, cambios, index, cambiosprocesados, callback) {
	var more = index+1;
	var cuantoscambios = cambios.length;
	if (more > cuantoscambios) {
	    return callback(cambiosprocesados);
	}
	else {
	    setImmediate(function(){
		if (typeof cambios[index] !== 'undefined') {
		    cambios[index].value.page_id = entrada.id;
		    cambios[index].value.cuenta = entrada.nombreSistema;
		    cambios[index].value.acc_ctime = entrada.acc_ctime;
		    if (typeof cambios[index].value.created_time !== 'undefined') {
			cambios[index].value.tstamp = cambios[index].value.created_time;
			cambiosprocesados.push(cambios[index].value);			
			return estandarizaCambios(entrada, cambios, more, cambiosprocesados, callback);
		    }
		    else {
			cambios[index].value.created_time = entrada.time;
			cambios[index].value.tstamp = entrada.time;
			cambiosprocesados.push(cambios[index].value);
			return estandarizaCambios(entrada, cambios, more, cambiosprocesados, callback);
		    }
		}
		else {
		    return estandarizaCambios(entrada, cambios, more, cambiosprocesados, callback);
		}
	    });
	}
    }
    
    // iteración - estandarizamos y aplanamos los datos de los cambios en las entradas
    function estandarizaEntradas (arregloEntradas, index, procesadas, callback) {
	var more = index+1;
	var cuantasentradas = arregloEntradas.length;
	if (more > cuantasentradas) {
	    return callback(procesadas);
	}
	else {
	    setImmediate(function(){
		if (typeof arregloEntradas[index] !== 'undefined') {
		    estandarizaCambios(arregloEntradas[index], arregloEntradas[index].changes, 0, [], function(cprocesados){
			if (cprocesados.length < 1) {
			    return estandarizaEntradas(arregloEntradas, more, procesadas, callback);
			}
			else {
			    procesadas = procesadas.concat(cprocesados);
			    return estandarizaEntradas(arregloEntradas, more, procesadas, callback);
			}
		    });
		}
		else {
		    return estandarizaEntradas(arregloEntradas, more, procesadas, callback);
		}
	    });
	}
    }
    
    // obtenemos comment con todo y para llevar de facebook usando método requestGraph
    function obtenerComment (token, comment_raw, callback) {
	var pageId = comment_raw.page_id;
	var created_time = comment_raw.created_time;
	var tipo = comment_raw.item;
	var objeto = {};
	var basicpath = globales.fbapiversion+comment_raw.comment_id+globales.path_comment_query;
	var fotopath = globales.fbapiversion+comment_raw.sender_id+'/picture?redirect=false';
	requestGraph(token, basicpath, function(error_orig, response_orig) {
	    if (error_orig) {
		console.log('rtus/index/obtenerComment - ni siquiera hubo comment: '+JSON.stringify(error_orig));
		objeto.error = error_orig;
		return callback(objeto);
	    }
	    else {
		// no hubo error, asignamos comment y seguimos pidiendo cosas
		objeto.comment = response_orig;
		objeto.comment.page_id = comment_raw.page_id;
		objeto.comment.created_old = comment_raw.tstamp;
		objeto.comment.created_time = new Date(comment_raw.tstamp * 1000);
		objeto.comment.parent_post = comment_raw.post_id;
		objeto.comment.from.id = ''+response_orig.from.id;
		if (typeof response_orig.parent !== 'undefined' && 
		    typeof response_orig.parent.id !== 'undefined') {
		    objeto.comment.parent_comment = response_orig.parent.id;
		}
		else {
		    objeto.comment.parent_comment = comment_raw.parent_id;
		}
		if (typeof response_orig.attachment !== 'undefined' &&
		    typeof response_orig.attachment.media !== 'undefined' &&
		    typeof response_orig.attachment.media.image !== 'undefined' &&
		    typeof response_orig.attachment.media.image.src !== 'undefined') {
		    objeto.comment.image_attachment = response_orig.attachment.media.image.src;
		}
		if (typeof response_orig.attachment !== 'undefined' &&
		    typeof response_orig.attachment.target !== 'undefined' &&
		    typeof response_orig.attachment.target.url) {
		    objeto.comment.link_attachment = response_orig.attachment.target.url;
		}
		requestGraph('not', fotopath, function(error_foto, response_foto){
		    if (error_foto) {
			// no tenemos foto, mandamos así
			objeto.comment.foto = '';
			console.log('rtus/index/obtenerComment - error en  foto '+error_foto);
			objeto.comment.photo_error = error_foto;
			return callback(objeto);
		    }
		    else {
			objeto.comment.foto = response_foto.data.url;
			return callback(objeto);
		    }
		});		    
	    }
	});
    }
    
    // obtenemos siblings de comments nuestros, para ver cuales no tienen respuesta
    function obtenerIdsDeSiblings (token, parent_comment, callback) {
	var pathsiblings = globales.fbapiversion+parent_comment+globales.path_siblings;
	requestGraph(token, pathsiblings, function(error_sib, response_sib) {
	    if (error_sib) {
		console.log('rtus/index/obtenerIdsDeSiblings.error');
		return callback('error');
	    }
	    else if(typeof response_sib.comments === 'undefined' ) {
		console.log('rtus/index/obtenerIdsDeSiblings.vacio');
		return callback('empty');
	    }
	    else {
		return callback(response_sib.comments.data);
	    }
	});
    }

    // vemos a qué sibling se le está respondiendo, para editarlo en el mongo
    function procesaSiblings (page_id, account, eltexto, siblings, index, newsiblings, callback) {
	var more = index+1;
	var cuantossib = siblings.length;
	if (more > cuantossib) {
	    return callback('', newsiblings);
	}
	else {
	    setImmediate(function(){
		if (typeof siblings[index] !== 'undefined') {
		    if (siblings[index].from.id === page_id) {
			// son de la cuenta en cuestión, no deben responderse
			return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
		    }
		    else {
			var critere = { id : siblings[index].id };
			// vemos si sibling existe en colección
			classdb.existefind(account+'_consolidada', critere, 'rtus/index/procesaSiblings', function(existens){
			    if (existens === 'error' || existens === 'noexiste') {
				return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
			    }
			    else {
				// sí existe, lo obtenemos para revisarlo
				classdb.buscarToArray(account+'_consolidada', critere, {}, 'rtus/index/procesaSiblings', function(items){
				    if (items === 'error') {
					// error, no hacemos nada
					return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
				    }
				    else {
					if (typeof items[0].respuestas === 'undefined') {
					    // comment no tiene respuestas, sumémoslo
					    newsiblings.push(siblings[index]);
					    return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
					}
					else {
					    // comment tiene respuestas, revisamos si la que tenemos ya está entre ellas
					    var las_respuestas = items[0].respuestas;
					    var existerespu = _.findIndex(las_respuestas, function(chr) {
						return chr.texto === eltexto;
					    });
					    if (existerespu !== -1) {
						// la respuesta ya está en un comment, a otra cosa mariposa
						return callback('respondido: comment '+siblings[index]+' ya recibió esa respuesta', newsiblings);
					    }
					    else {
						// no está esta respuesta en este sibling, sumémoslo
						newsiblings.push(siblings[index]);
						return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
					    }
					}
				    }
				});
			    }
			});
		    }
		}
		else {
		    return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
		}
	    });
	}
    }

    // si es nuestro, verificamos si no es una respuesta a algún comment y si esa respuesta fue hecha directamente en facebook
    function verificaRespuesta (token, comentario_raw, comentario_procesado, callback) {
	if (typeof comentario_procesado.message !== 'undefined' && comentario_procesado.message !== '') {
	    var pcom = comentario_procesado.parent_comment, ppos = comentario_procesado.parent_post,
		vcuenta = comentario_raw.cuenta, colezione = vcuenta+'_consolidada', pa_id = comentario_raw.page_id,
		co_id = comentario_procesado.id, ctexto = comentario_procesado.message;
	    // el comentario tiene mensaje, empezamos
	    if (pcom === ppos) {
		 console.log('es respuesta a un post');
		var criteriopp = { id : ppos };	
		classdb.existefind(colezione, criteriopp, 'rtus/index/verificaRespuesta.post', function(exists) {
		    if (exists === 'error' || exists === 'noexiste') {
			console.log('Error: el post en el que va este comment '+co_id+' no existe en la colección');
			callback(exists);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopp, {}, 'rtus/index/verificaRespuesta.post', function(unpost){
			    if (unpost === 'error') { callback(unpost); }
			    else {
				if (unpost.length < 1) {
				    console.log('arreglo con el parent post de '+co_id+' llegó vacío');
				    callback('error');
				}
				else {
				    if (typeof unpost[0].respuestas === 'undefined') {
					// parent_post aun no tiene respuestas, insertamos
					var dieantwort = {
					    user_name: 'facebook',
					    user_id: 'direct-facebook',
					    texto: ctexto,
					    timestamp : new Date(),
					    id_str: co_id
					};
					classdb.actualizaAddToSet(colezione, criteriopp, { respuestas : dieantwort }, '/rtus/index/verificaRespuesta.post', function(answered) {
					    callback(answered);
					});
				    }
				    else {
					// parent_post tiene respuestas en db
					var reponses = unpost[0].respuestas;				    
					var existeresp = _.findIndex(reponses, function(chr) {
					    return chr.texto === ctexto;
					});
					if (existeresp !== -1) {
					    console.log('Error: comentario de respuesta '+co_id+' ya estaba en el post');
					    callback('error');
					}
					else {
					    // esta respuesta no existe dentro de las demás respuestas, la insertamos
					    var larespuesta = {
						user_name: 'facebook',
						user_id: 'direct-facebook',
						texto: ctexto,
						timestamp : new Date(),
						id_str: co_id
					    };
					    classdb.actualizaAddToSet(colezione, criteriopp, { respuestas : larespuesta }, '/rtus/index/verificaRespuesta.post', function(respondido) {
						callback(respondido);
					    });
					}
				    }
				}
			    }
			});
		    }
		});
	    }
	    else {
		 console.log('es respuesta a un comment');
		var criteriopc = { id : pcom };
		classdb.existefind(colezione, criteriopc, 'rtus/index/verificaRespuesta.comment', function(existia){
		    if (existia === 'error' || existia === 'noexiste') {
			console.log('Error: el comment en el que va este otro comment '+co_id+' no existe en la colección');
			callback(existia);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopc, {}, 'rtus/index/verificaRespuesta.comment', function(uncomment){
			    if (uncomment === 'error') { callback(uncomment); }
			    else {
				if (uncomment.length < 1) {
				    console.log('arreglo con el parent comment de '+co_id+' llegó vacío');
				    callback('error');
				}
				else {
				    if (typeof uncomment[0].respuestas === 'undefined') {
					// parent comment todavía no tiene respuestas
					var theanswer = {
					    user_name: 'facebook',
					    user_id: 'direct-facebook',
					    texto: ctexto,
					    timestamp : new Date(),
					    id_str: co_id
					};
					classdb.actualizaAddToSet(colezione, criteriopc, {respuestas: theanswer}, '/rtus/index/verificaRespuesta.post', function(answered) {
					    callback(answered);
					});
				    }
				    else {
					// parent_comment tiene respuestas en db
					var las_respuestas = uncomment[0].respuestas; 
					var existerespu = _.findIndex(las_respuestas, function(chr) {
					    return chr.texto === comentario_procesado.message;
					});
					if (existerespu !== -1) {
					    console.log('Error: este comment de respuesta '+co_id+' ya estaba entre las respuestas al comment');
					    callback('error');
					}
					else {
					    obtenerIdsDeSiblings(token, pcom, function(comments_ids){
						if (comments_ids === 'error') {
						    console.log('no conseguimos siblings para: '+co_id);
						    callback('error');
						}
						else if (comments_ids === 'empty') {
						    var la_respuesta = {
							user_name: 'facebook',
							user_id: 'direct-facebook',
							texto: ctexto,
							timestamp : new Date(),
							id_str: co_id
						    };
						    classdb.actualizaAddToSet(colezione, criteriopc, { respuestas: la_respuesta }, '/rtus/index/verificaRespuesta.comment', function(respondido) {
							callback(respondido);
						    });
						}
						else {
						    // ya hay comments en el comment
						    var siblings = _(comments_ids).reverse().value();
						    procesaSiblings(pa_id, vcuenta, ctexto, siblings, 0, [], function(sib_str, sib_arr){
							if (sib_str !== ''){
							    console.log(sib_str);
							    callback('ok');
							}
							else {
							    if (sib_arr.length < 1) {
								console.log('no había comments...');
								callback('error');
							    }
							    else  {
								// añadimos la respuesta al primer sibling sin respuestas
								var la_reponse = { 
								    user_name : 'facebook', 
								    user_id : 'direct-facebook', 
								    texto : ctexto, 
								    timestamp : new Date(), 
								    id_str : co_id 
								};
								var criteres = { id : sib_arr[0].id };
								var eladdts = { respuestas : la_reponse };
								classdb.actualizaAddToSet(colezione, criteres, eladdts, '/rtus/index/verificaRespuesta.comment', function(repondu){
								    callback(repondu);
								});
							    }
							}
							
						    });
						}

						if (typeof comments_ids.comments !== 'undefined') {
						}
						else {
						}
					    });
					}	    
				    }
				}
			    }
			});
		    }
		});
	    }
	}
	else {
	    // comentario no tiene mensaje, mandamos error
	    console.log('Error: comentario venía vacío, no hay nada que insertar');
	    callback('error');
	}
    }

    // procesamos el comment
    function procesaComment (token, comment_raw, callback) {
 	// Declaramos variables necesarias
	var ctnm = comment_raw.cuenta, pageId = comment_raw.page_id, tipo = comment_raw.item, comment_id = comment_raw.comment_id;
	var coleccion_raw = ctnm+'_fb_comment_raw', coleccion_comment = ctnm+'_fb_comment', 
	    coleccion_pending = ctnm+'_fb_comment_pending', coleccion_mongoerror = ctnm+'_fb_comment_merror';
	var created_time = new Date(comment_raw.tstamp * 1000);

	comment_raw.id = comment_id;
	if (comment_raw.verb === 'add') {
	    verificaExistencia(coleccion_comment, comment_raw.id, function(comentariomongo) {
		if (comentariomongo === 'error' || comentariomongo === 'existe') {
		    return callback('rtus/index/procesaComment.add/verificaExistencia '+comment_id+' '+comentariomongo);
		}
		else {
		    obtenerComment(token, comment_raw, function(comentario) {
			if (typeof comentario.error !== 'undefined') {

			    comentario.comment = comment_raw;
			    comentario.comment.error = comentario.error;
			    comentario.comment.created_old = comment_raw.tstamp;
			    comentario.comment.created_time = created_time;
			    comentario.comment.from_user_id = ''+comment_raw.sender_id;
			    comentario.comment.from_user_name = comment_raw.sender_name;
			    insertaBaseError(coleccion_pending, comentario.comment, function(respo) {
				return callback('rtus/index/procesaComment.add/obtenerComment.error '+ctnm+' - '+comment_id+' - '+respo);
			    });
			}
			else {
			    if (typeof comentario.comment === 'undefined') {
				return callback('rtus/index/procesaComment.add/obtenerComment.ok '+ctnm+' - '+comment_id+' - venía vacío');
			    }
			    else {
				// aquí está el comment, usémoslo.
				comentario.comment.created_old = comentario.comment.created_time;
				comentario.comment.created_time = created_time;
				if (typeof comentario.comment.from !== 'undefined') {
				    comentario.comment.from_user_id = ''+comentario.comment.from.id;
				    comentario.comment.from_user_name = comentario.comment.from.name;
				    if (pageId === comentario.comment.from.id)  {
					verificaRespuesta(token, comment_raw, comentario.comment, function(esrespuesta){
					    console.log('verificaRespuesta '+esrespuesta);
					});
				    }
				}
				else {
				    comentario.comment.from_user_id = 'not_available';
				}
				insertaBase(coleccion_comment, comentario.comment, tipo, coleccion_mongoerror, function(respcom){
				    if (comentario.comment.from && pageId !== comentario.comment.from.id) {
					nueMens(created_time, 'comment', ctnm);
				    }
				    return callback('rtus/index/procesaComment.add/obtenerComment.ok - cta: '+ctnm+' - comment: '+comment_id+' - insert: '+respcom);
				});
			    }
			}
		    });
		}
	    });
	}
	else if (comment_raw.verb === 'edited') {
	    verificaExistencia(coleccion_comment, comment_raw.id, function(comentariomongo) {
		if (comentariomongo === 'error' || comentariomongo === 'noexiste') {
		    return callback('rtus/index/procesaComment.edited/verificaExistencia '+comment_id+' '+comentariomongo);
		}
		else {
		    obtenerComment(token, comment_raw, function(comentario) {
			if (typeof comentario.error !== 'undefined') {
			    comentario.comment = comment_raw;
			    comentario.comment.error = comentario.error;
			    comentario.comment.created_old = comment_raw.tstamp;
			    comentario.comment.created_time = created_time;
			    comentario.comment.from_user_id = ''+comment_raw.sender_id;
			    comentario.comment.from_user_name = comment_raw.sender_name;
			    insertaBaseError(coleccion_pending, comentario.comment, function(respo) {
				return callback('rtus/index/procesaComment.edited/obtenerComment.error '+ctnm+' - '+comment_id+' - '+respo);
			    });
			}
			else {
			    if (typeof comentario.comment === 'undefined') {
				return callback('rtus/index/procesaComment.edited/obtenerComment.ok '+ctnm+' - '+comment_id+' - venía vacío');
			    }
			    else {
				// aquí está el comment, usémoslo.
				comentario.comment.created_old = comentario.comment.created_time;
				comentario.comment.created_time = created_time;
				if (typeof comentario.comment.from !== 'undefined') {
				    comentario.comment.from_user_id = ''+comentario.comment.from.id;
				    comentario.comment.from_user_name = comentario.comment.from.name;
				    if (pageId === comentario.comment.from.id)  {
					verificaRespuesta(token, comment_raw, comentario.comment, function(esrespuesta){
					    console.log('verificaRespuesta '+esrespuesta);
					});
				    }
				}
				else {
				    comentario.comment.from_user_id = 'not_available';
				}
				insertaBase(coleccion_comment, comentario.comment, tipo, coleccion_mongoerror, function(respcom){
				    return callback('rtus/index/procesaComment.edited/obtenerComment.ok - cta: '+ctnm+' - comment: '+comment_id+' - insert: '+respcom);
				});
			    }
			}
		    });
		}
	    });
	}
	else if (comment_raw.verb === 'remove'){
	    var comentario_id = comment_raw.id;
	    verificaExistencia(coleccion_comment, comentario_id, function(comentariomongo) {
		if (comentariomongo === 'error' || comentariomongo === 'noexiste') {
		    verificaExistencia(coleccion_pending, comentario_id, function(comentariopending) {
			if (comentariopending === 'error' || comentariopending === 'noexiste') {
			    return callback('rtus/index/procesaComment.remove/verificaExistencia '+comentario_id+' '+comentariopending);			    
			}
			else {
			    eliminaEntrada(coleccion_pending, comentario_id, function(bbborrar){
				return callback('rtus/index/procesaComment.remove/pending.verificaExistencia.ok/objetoEliminado: '+comentario_id+' eliminado '+bbborrar);				
			    });
			}
		    });
		}
		else {
		    objetoEliminado(coleccion_comment, comentario_id, function(eliminar){
			return callback('rtus/index/procesaComment.remove/verificaExistencia.ok/objetoEliminado: '+comentario_id+' eliminado '+eliminar);
		    });	
		}
	    });
	}
	else if (comment_raw.verb === 'hide') {
	    verificaExistencia(coleccion_comment, comment_raw.id, function(comentariomongo){
		if (comentariomongo === 'error' || comentariomongo === 'noexiste') {
		    return callback('rtus/index/procesaComment.hide/verificaExistencia '+comment_id+' '+comentariomongo);
		}
		else {
		    objetoEscondido(coleccion_comment, comment_raw.id, function(esconder){
			return callback('rtus/index/procesaComment.hide/verificaExistencia.ok/objetoEscondido: '+comment_id+' escondido '+esconder);
		    });
		}
	    });
	}
	else if (comment_raw.verb === 'unhide') {
	    verificaExistencia(coleccion_comment, comment_raw.id, function(comentariomongo){
		if (comentariomongo === 'error' || comentariomongo === 'noexiste') {
		    return callback('rtus/index/procesaComment.unhide/verificaExistencia '+comment_id+' '+comentariomongo);
		}
		else {
		    objetoDesEscondido(coleccion_comment, comment_raw.id, function(desesconder){
			return callback('rtus/index/procesaComment.unhide/verificaExistencia.ok/objetoDesEscondido: '+comment_id+' des-escondido '+desesconder);
		    });
		}
	    });

	}
	else {
	    console.log(comment_raw);
	    return callback('rtus/index/procesaComment.unknown verb: '+comment_raw.verb);
	}
    }
		
    // procesamos el post
    function procesaPost (token, post_raw, callback) {
	var coleccion_post_raw = post_raw.cuenta+'_fb_post_raw';
	var coleccion_post = post_raw.cuenta+'_fb_post';
	var coleccion_post_pending = post_raw.cuenta+'_fb_post_pending';
	var coleccion_post_mongoerror = post_raw.cuenta+'_fb_post_merror';
	var pageId = post_raw.page_id;
	var created_time = new Date(post_raw.tstamp * 1000);
	var tipo = 'post';
	var subtipo = post_raw.item;
	var objeto = {};
	post_raw.id = post_raw.post_id;
	// procesa post si se está añadiendo
	if (post_raw.verb === 'add') {
	    verificaExistencia(coleccion_post, post_raw.id, function(postmongo) {
		if (postmongo === 'error' || postmongo === 'existe') {
		    return callback('rtus/index/procesaPost.add/verificaExistencia - ' + post_raw.id + ' ' + postmongo);
		}
		else {
		    var basicpath = globales.fbapiversion+post_raw.post_id+globales.path_post_query;
		    var fotopath = globales.fbapiversion+post_raw.sender_id+'/picture?redirect=false';
		    requestGraph(token, basicpath, function(error_post, response_post){
			if(error_post) {
			    post_raw.error = error_post;
			    insertaBaseError(coleccion_post_pending, post_raw, function(resp){
				return callback('rtus/index/procesaPost.add/insertaBaseError ' +post_raw.id+ ' ' +resp);
			    });
			}
			else {
			    objeto.post = response_post;
			    if (post_raw.photo_id) {
				objeto.post.photo_id = post_raw.photo_id;
			    }
			    if (post_raw.share_id) {
				objeto.post.share_id = post_raw.share_id;
			    }
			    if (post_raw.video_id) {
				objeto.post.video_id = post_raw.video_id;
			    }
			    objeto.post.created_old = response_post.created_time;
			    objeto.post.created_time = created_time;
			    if (typeof response_post.from === 'undefined') {
				objeto.post.from = {};
				objeto.post.from.id = post_raw.sender_id;
				objeto.post.from.name = post_raw.sender_name;
				objeto.post.from_user_id = ''+post_raw.sender_id;
				objeto.post.from_user_name = post_raw.sender_name;
			    }
			    else {
				objeto.post.from_user_id = ''+response_post.from.id;
				objeto.post.from_user_name = response_post.from.name;
			    }
			    if (typeof response_post.attachments !== 'undefined' &&
				typeof response_post.attachments.data !== 'undefined' &&
				response_post.attachments.data[0].length > 0 &&
				typeof response_post.attachments.data[0].media !== 'undefined' &&
				typeof response_post.attachments.data[0].media.image !== 'undefined' &&
				typeof response_post.attachments.data[0].media.image.src !== 'undefined') {
				objeto.post.image_attachment = response_post.attachments.data[0].media.image.src;
			    }
			    if (typeof response_post.attachments !== 'undefined' &&
				typeof response_post.attachments.data !== 'undefined' &&
				response_post.attachments.data[0].length > 0 &&
				typeof response_post.attachments.data[0].target !== 'undefined' &&
				typeof response_post.attachments.data[0].target.url !== 'undefined') {
				objeto.post.link_attachment = response_post.attachments.data[0].target.url;
			    }
			    requestGraph('not', fotopath, function(error_foto, response_foto){
				if (error_foto) {
				    objeto.post.foto = '';
				    objeto.post.photo_error = error_foto;
				    insertaBase(coleccion_post, objeto.post, tipo, coleccion_post_mongoerror, function(respo){
					return callback('rtus/index/procesaPost.add/requestGraph.fotopath' + objeto.post.id+ ' ' +respo);
				    });
				}
				else {
				    objeto.post.foto = response_foto.data.url;
				    insertaBase(coleccion_post, objeto.post, tipo, coleccion_post_mongoerror, function(respo){
					if (objeto.post.from && pageId !== objeto.post.from.id) {
					    nueMens(created_time, 'post', post_raw.cuenta);
					}
					return callback('rtus/index/procesaPost.add/requestGraph.fotopath' + objeto.post.id+ ' ' +respo);
				    });
				}
			    });
			}
		    });
		}
	    });
	}
	else if (post_raw.verb === 'remove') {
	    var elpostid = post_raw.id;
	    verificaExistencia(coleccion_post, elpostid, function(postmongo) {
		if (postmongo === 'error' || postmongo === 'noexiste') {
		    verificaExistencia(coleccion_post_pending, elpostid, function(postpending) {
			if (postpending === 'error' || postpending === 'noexiste') {
			    return callback('rtus/index/procesaPost.remove.pending/verificaExistencia '+elpostid+' '+postpending);			    
			}
			else {
			    eliminaEntrada(coleccion_post_pending, elpostid, function(bbborrar){
				return callback('rtus/index/procesaPost.remove.pending/verificaExistencia.ok/objetoEliminado: '+elpostid+' eliminado '+bbborrar);				
			    });
			}
		    });
		}
		else {
		    objetoEliminado(coleccion_post, post_raw.id, function(eliminar){
			return callback('rtus/index/procesaPost.remove - post: '+post_raw.id+' eliminado: '+eliminar);
		    });
		}
	    });
	}
	else {
	    console.log(post_raw);
	    return callback('rtus/index/procesaPost.unknown verb: '+post_raw.verb);
	}
    }

    function encuentraCuentaCorrespondiente (pid, pages, index, callback) {
	var more = index+1;
	var cuantas_pags = pages.length;
	if (more > cuantas_pags) {
	    return callback('not');
	}
	else {
	    setImmediate(function(){
		if (typeof pages[index] !== 'undefined') {
		    if(pages[index].id !== pid) {
			return encuentraCuentaCorrespondiente(pid, pages, more, callback);
		    }
		    else {
			if (pages[index].perms.indexOf('CREATE_CONTENT') > -1) {
			    return callback(pages[index]);
			}
			else {
			    return encuentraCuentaCorrespondiente(pid, pages, more, callback);
			}
		    }
		}
		else {
		    return encuentraCuentaCorrespondiente(pid, pages, more, callback);
		}
	    });
	}
    }

    function tokensDeCuenta (nombreCuenta, thepageid, usuariosDeCuenta, index, validTokens, callback) {
	var more = index+1;
	var cuantosusuarios = usuariosDeCuenta.length;
	var nombreSistema = nombreCuenta;
	var page_id = thepageid;	
	if (more > cuantosusuarios) {
	    return callback(validTokens);
	}
	else {
	    setImmediate(function(){
		if (typeof usuariosDeCuenta[index] !== 'undefined') {
		    var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+usuariosDeCuenta[index].additionalProvidersData.facebook.accessToken;
		    requestGraph2(path, function(validacion){
			if (validacion === 'error' || validacion === 'invalid') {
			    return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
			}
			else {
			    var patpath = globales.fbapiversion+'me/accounts?access_token='+validacion.access_token;
			    requestGraph2(patpath, function(pages) {
				if (pages === 'error' || pages === 'invalid' || typeof pages.data === 'undefined' || pages.data.length < 1) {
				    return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
				}
				else {
				    encuentraCuentaCorrespondiente(page_id, pages.data, 0, function(fbaccount) {
					if (fbaccount === 'not') {
					    return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);					    
					}
					else {
					    validTokens.push(fbaccount);
					    return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);					    
					}
				    });
				}
			    });
			}
		    });
		}
		else {
		    return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
		}
	    });
	}
    }

    function getCtaATs (nombreCta, pageid, usuariosCta, callback) {
	var critere = {'nombre_cta': nombreCta};
	var lesort = {created_time: -1};
	classdb.buscarToArray('verifica_auto_pat', critere, {}, 'rtus/index/getCtaATs', function(items){
	    if (items === 'error') {
		return callback([]);
	    }
	    else {
		if (items.length < 1) {
		    // no existen access_tokens en bd, los pedimos a fb
		    tokensDeCuenta(nombreCta, pageid, usuariosCta, 0, [], function(vtokens){
			if (vtokens.length < 1) {
			    // no hay tokens para esta cuenta
			    return callback([]);
			}
			else {
			    var objeto = {
				nombre_cta: nombreCta,
				created_time: new Date(),
				valid_tokens: vtokens
			    };
			    classdb.inserta('verifica_auto_pat', objeto, 'rtus/index/getCtaATs', function(insertao){
				return callback(vtokens);
			    });
			}
		    });
		}
		else {
		    var ts = items[0].created_time.getTime();
		    var tsm1 = (ts) + 3600000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			tokensDeCuenta(nombreCta, pageid, usuariosCta, 0, [], function(vtokens){
			    if (vtokens.length < 1) {
				// no hay tokens para esta cuenta
				return callback([]);
			    }
			    else {
				var criterio_actualizacion = {nombre_cta: items[0].nombre_cta};
				var objeto = {
				    nombre_cta: nombreCta,
				    created_time: new Date(),
				    valid_tokens: vtokens
				};
				classdb.actualiza('verifica_auto_pat', criterio_actualizacion, objeto, 'rtus/index/getCtaATs', function(actualizao){
				    return callback(vtokens);
				});
			    }
			});
		    }
		    else {
			// y sigue vigente
			return callback(items[0].valid_tokens);
		    }
		}
	    }
	});
    }

    function revisaMensajesAnteriores (mensajesp, page_id, mensaje, index, mant, callback) {
	var more = index+1;
	var cuantosmes = mensajesp.length;
	if (more > cuantosmes) {
	    return callback(mant);
	}
	else {
	    setImmediate(function(){
		if (typeof mensajesp[index] !== 'undefined') {
		    if (mensajesp[index].from.id !== page_id) {
			if (typeof mensajesp[index].respuestas === 'undefined') {
			    mant.push(mensajesp[index]);
			    return revisaMensajesAnteriores(mensajesp, page_id, index, mant, callback);
			}
			else {
			    var las_respuestas = mensajesp[index].respuestas; 
			    var existerespu = _.findIndex(las_respuestas, function(chr) {
				return chr.texto === mensaje.message;
			    });
			    if (existerespu === -1) {
				mant.push(mensajesp[index]);
				return revisaMensajesAnteriores(mensajesp, page_id, index, mant, callback);
			    }
			    else {
				return revisaMensajesAnteriores(mensajesp, page_id, index, mant, callback);			    
			    }
			}
		    }
		    else {
			return revisaMensajesAnteriores(mensajesp, page_id, index, mant, callback);
		    }
		}
		else {
		    return revisaMensajesAnteriores(mensajesp, page_id, index, mant, callback);
		}
	    });
	}
    }

    function verificaRespuestas (nombresys, page_id, message, callback) {
	var colezione = nombresys+'_consolidada';
	if (typeof message.message !== 'undefined' && message.message !== '') {
	    var conv_id = message.conversation_id;
	    var mes_id = message.id;
	    var mtexto = message.message;
	    var criteriom = {$and: [{conversation_id: conv_id}, {id : {$ne: mes_id}}, {created_time: {$lte: message.created_time}}]};
	    var sortm = {created_time: -1};
	    classdb.buscarToArrayLimit(colezione, criteriom, sortm, 5, 'rtus/index/verificaRespuestas', function(mensajes_ant){
		if (mensajes_ant === 'error' || mensajes_ant.length < 1) {
		    console.log('rtus/index/verificaRespuestas Error en query o no hay mensajes anteriores de esta conversacion');
		    callback('error');
		}
		else {
		    var prev_messages = _(mensajes_ant).reverse().value();
		    revisaMensajesAnteriores(prev_messages, page_id, message, 0, [], function(msresp){
			if (msresp.length > 0) {
			    var respondiendoa = msresp[0];
			    var criterior = { id : respondiendoa.id };
			    var la_reponse = { user_name : 'facebook', user_id : 'direct-facebook', texto : mtexto, timestamp : new Date(), id_str : mes_id };
			    var eladdts = { respuestas : la_reponse };
			    classdb.actualizaAddToSet(colezione, criterior, eladdts, '/rtus/index/verificaRespuesta.inbox', function(repondu){
				callback(repondu);
			    });
			}
			else {
			    console.log('rtus/index/verificaRespuestas Error: no hubo mensaje al que responderle... raro');
			    callback('error');
			}
		    });
		}
	    });
	}
	else {
	    // comentario no tiene mensaje, mandamos error
	    console.log('Error: mensaje venía vacío, no hay nada que insertar');
	    callback('error');
	}
    }

    function guardaBaseMensaje (nombreSistema, mensaje, page_id, accct, cback){
	var criterio = {'id': mensaje.id};
	classdb.existefind(nombreSistema+'_consolidada', criterio, 'rtus/index/guardaBaseMensaje', function(existe) {
	    if (existe === 'error' || existe === 'existe') {
		return cback(existe);
	    }
	    else {
	    	//coleccion, criterio, sort, metodo, callback
	    	if( Date.parse(mensaje.created_time) > Date.parse(accct) ){
	    	    // console.log('Lo guardamos por que es mayor a la fecha');
	    	    var fotopath = globales.fbapiversion+mensaje.from.id+'/picture?redirect=false';
		    requestGraph2(fotopath, function(foto){
			if (foto === 'error' || foto === 'invalid') {
			    mensaje.foto = '';
			    classdb.inserta(nombreSistema+'_consolidada', mensaje, 'rtus/index/guardaBaseMensaje', function(inserta) {
				if (mensaje.from.id === page_id) {
				    verificaRespuestas(nombreSistema, page_id, mensaje, function(risposta){
					console.log('verificaRespuestas '+risposta);
				    });
				}
				else {
				    nueMens(mensaje.created_time, 'facebook_inbox', nombreSistema);
				}
				console.log('mensaje '+mensaje.id+' de la conversacion '+mensaje.conversation_id+' insertado correctamente');
				return cback(inserta);
			    });			
			}
			else {
			    mensaje.foto = foto.data.url;
			    classdb.inserta(nombreSistema+'_consolidada', mensaje, 'rtus/index/guardaBaseMensaje', function(inserta) {
				if (mensaje.from.id === page_id) {
				    verificaRespuestas(nombreSistema, page_id, mensaje, function(risposta){
					console.log('verificaRespuestas '+risposta);
				    });
				}
				else {
				    nueMens(mensaje.created_time, 'facebook_inbox', nombreSistema);
				}
				console.log('mensaje '+mensaje.id+' de la conversacion '+mensaje.conversation_id+' insertado correctamente');
				return cback(inserta);
			    });
			}
		    });
	    	} else {
	    	    // console.log('No se guarda por que es menor a la fecha');
	    	    return cback(existe);
	    	}
	    }
	});
    }

    function insertaMensajes (nombreSistema, messages, page_id, account_cretime, index, cback){
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantosm = messages.length;
	if (more > cuantosm) {
	    return cback('insertm_fin_ok');
	}
	else {
	    setImmediate(function(){
		if (typeof messages[index] !== 'undefined') {
		    guardaBaseMensaje(nombreSistema, messages[index], page_id, account_cretime, function(resp){
			if (resp === 'error' || resp === 'existe') {
			    console.log('rtus/index/insertaMensajes - '+messages[index].id+' '+resp);
			    return insertaMensajes(nombreSistema, messages, page_id, account_cretime, more, cback);
			}
			else {
			    // console.log('rtus/index/insertaMensajes - el mensaje '+messages[index].id+' es nuevo, insertamos');
			    return insertaMensajes(nombreSistema, messages, page_id, account_cretime, more, cback);
			}
		    }); 
		}
		else {
		    return insertaMensajes(nombreSistema, messages, page_id, account_cretime, more, cback);
		}
	    });
	}
    }

    function procesaMensajes (nombreSistema, updated_time, conv_id, conv_link, mensajes, index, mensajesarray, cback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantosm = mensajes.length;
	if (more > cuantosm) {
	    return cback(mensajesarray);
	}
	else {
	    setImmediate(function() {
		if (typeof mensajes[index] !== 'undefined') {
		    mensajes[index].update_time = updated_time;
		    mensajes[index].conversation_id = conv_id;
		    mensajes[index].conversation_link = conv_link;
		    mensajes[index].created_time = new Date(mensajes[index].created_time.replace('+','.'));
		    mensajes[index].obj = 'facebook';
		    mensajes[index].coleccion = nombreSistema+'_consolidada';
		    mensajes[index].tipo = 'facebook_inbox';
		    mensajes[index].from_user_id = ''+mensajes[index].from.id;
		    mensajes[index].from_user_name = mensajes[index].from.name;
		    if (typeof mensajes[index].attachments !== 'undefined' && 
			typeof mensajes[index].attachments.data !== 'undefined' &&
			mensajes[index].attachments.data[0].length > 0 && 
		        typeof mensajes[index].attachments.data[0].image_data !== 'undefined') {
			mensajes[index].image_attachment = mensajes[index].attachments.data[0].image_data.url;
		    }
		    mensajesarray.push(mensajes[index]);
		    return procesaMensajes(nombreSistema, updated_time, conv_id, conv_link, mensajes, more, mensajesarray, cback);
		}
		else {
		    return procesaMensajes(nombreSistema, updated_time, conv_id, conv_link, mensajes, more, mensajesarray, cback);
		}
	    });
	}
    }

    function mensajesDeConversacion (nsys, pag_id, a_ctime, conversacion, cback) {
	var updated_time = new Date(conversacion.updated_time.replace('+','.'));
	var conv_id = conversacion.id;
	var conv_link = 'https://www.facebook.com'+conversacion.link;
	procesaMensajes(nsys, updated_time, conv_id, conv_link, _(conversacion.messages.data).reverse().value(), 0, [], function(mensajesprocesados){
	    insertaMensajes(nsys, mensajesprocesados, pag_id, a_ctime, 0, function(resultados){
		if (resultados === 'insertm_fin_ok') {
		    cback('ok');
		}
		else {
		    cback('error');
		}
	    });		
	});
    }

    function procesaRating (ratingdata, callback) {
	var nombrecta = ratingdata.cuenta;
	var page_id = ratingdata.page_id;
	var rating = {
	    id : ratingdata.open_graph_story_id,
	    rating : ratingdata.rating,
	    from : {
		id: ratingdata.reviewer_id,
		name: ratingdata.reviewer_name
	    },
	    created_time: ratingdata.created_time,
	    page_id : page_id,
	    cuenta: nombrecta,
	    rating_link: 'https://www.facebook.com/'+ratingdata.reviewer_id+'/activity/'+ratingdata.open_graph_story_id,
	    message: '',
            obj: 'facebook',
            tipo: 'rating'
	};
	if (ratingdata.review_text) {
	    rating.message = ratingdata.review_text;
	}
	guardaBaseMensaje(nombrecta, rating, page_id, ratingdata.acc_ctime, function(resp){
	    if (resp === 'error' || resp === 'existe') {
		console.log('rtus/index/procesaRating - '+ratingdata.open_graph_story_id+' '+resp);
		return callback('rtus/index/procesaRating - '+resp);
	    }
	    else {
		return callback('rtus/index/procesaRating - '+resp);
	    }
	}); 
	
    }

    function procesaConversacion (convdata, callback) {
	var conversation = {};
	var nombrecta = convdata.cuenta;
	var page_id = convdata.page_id;
	var criterium = {
	    $and: [
		{ 'cuenta.marca' : nombrecta}, 
		{'additionalProvidersData.facebook': { $exists: true }}
	    ]
	};
	var usersfields = {
	    '_id' : '', 
	    'displayName' : '', 
	    'cuenta.marca': '',
	    'additionalProvidersData.facebook.accessToken' : '',
	    'additionalProvidersData.facebook.name': ''
	};
	classdb.buscarToArrayFields('users', criterium, usersfields, {}, 'rtus/index/obtieneUsuariosDeCta', function(dieusern){
	    if (dieusern === 'error') {
		return callback(dieusern);
	    }
	    else {
		getCtaATs(nombrecta, page_id, dieusern, function(tdc){
		    if (tdc.length < 1) {
			console.log('no había tokens válidos para '+nombrecta);
			return callback('error');
		    }
		    else {
			var at_elegido = tdc[Math.floor(Math.random()*tdc.length)];
			var derpath = globales.fbapiversion+convdata.thread_id+globales.path_conv_messages+'&access_token='+at_elegido.access_token;
			requestGraph2(derpath, function(conversation){
			    if(conversation === 'error' || conversation === 'invalid') {
				conversation = convdata;
				conversation.error = conversation;
				insertaBaseError(nombrecta+'_convs_pending', conversation, function(resp){
				    return callback('rtus/index/procesaConversacion.obtener/insertaBaseError ' +convdata.thread_id+ ' ' +resp);
				});
			    }
			    else {
				mensajesDeConversacion(nombrecta, convdata.page_id, convdata.acc_ctime, conversation, function(procesadas){
				    return callback('rtus/index/procesaConversacion.obtener/convsprocesadas '+convdata.thread_id+' - '+procesadas);
				});
			    }
			});
		    }
		});		
	    }
	});	
    }

    // revisamos cada cambio para ver qué hay que procesar y donde
    function asignaCambios (token, cambios, index, callbac) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantosc = cambios.length;
	if (more > cuantosc) {
	    return callbac(index);
	}
	else {
	    setImmediate(function(){
		if (typeof cambios[index] !== 'undefined') {
		    var tipo = cambios[index].item;
		    cambios[index].created_time = new Date(cambios[index].tstamp * 1000);
		    if(tipo === 'like'){
			var cuenta = cambios[index].cuenta;
			cambios[index].created_time = new Date(cambios[index].tstamp * 1000);
			var colectionLike = cuenta+'_fb_like_raw';
			var colectionErrorLike=cuenta+'_fb_like_pending';
			insertaBase(colectionLike, cambios[index], tipo, colectionErrorLike, function(resultado_like){
			    return asignaCambios (token, cambios, more, callbac);
			});			    
		    }
		    else if (tipo === 'comment') {
			console.log(cambios[index]);
			procesaComment(token, cambios[index], function(resultado_comment){
			    console.log(resultado_comment);
			    return asignaCambios (token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'post') {
			console.log(cambios[index]);
			procesaPost(token, cambios[index], function(resultado_post){
			    console.log(resultado_post);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'share') {
			console.log(cambios[index]);
			procesaPost(token, cambios[index], function(resultado_post){
			    console.log(resultado_post);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'photo') {
			console.log(cambios[index]);
			procesaPost(token, cambios[index], function(resultado_post) {
			    console.log(resultado_post);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'rating') {
			console.log(cambios[index]);
			procesaRating(cambios[index], function(resultado_review) {
			    console.log(resultado_review);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'story') {
			var coleccion_story_raw = cambios[index].cuenta+'_fb_story_raw';
			var colection_story_pending = cambios[index].cuenta+'_fb_story_pending';
			insertaBase(coleccion_story_raw,cambios[index],tipo,colection_story_pending, function(resultado_story){
			    console.log('rtus/index/asignaCambios.story/insertaBase - '+resultado_story);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'status') {
			var coleccion_status_raw = cambios[index].cuenta+'_fb_status_raw';
			var colection_status_pending = cambios[index].cuenta+'_fb_status_pending';
			insertaBase(coleccion_status_raw,cambios[index],tipo,colection_status_pending, function(resultado_status){
			    console.log('rtus/index/asignaCambios.status/insertaBase - '+resultado_status);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else if (tipo === 'video') {
			console.log(cambios[index]);
			procesaPost(token, cambios[index], function(resultado_post){
			    console.log(resultado_post);
			    return asignaCambios(token, cambios, more, callbac);
			});
		    }
		    else{
			if (typeof cambios[index].thread_id !== 'undefined') {
			    console.log('es una conversación de '+cambios[index].cuenta+'!!!');
			    console.log(cambios[index]);
			    procesaConversacion(cambios[index], function(resultado_conv) {
				console.log(resultado_conv);
				return asignaCambios(token, cambios, more, callbac);
			    });
			}
			else {
			    console.log('\n\n');
			    console.log(cambios[index]);
			    console.log('rtus/index/asignaCambios - No es un like, ni un commentario ni nada registrado');
			    console.log('\n\n');
			    return asignaCambios(token, cambios, more, callbac);
			}
		    }
		}
		else {
		    return asignaCambios (token, cambios, more, callbac);
		}
	    });
	}
    }
    
    // aquí empieza todo cada que nos mandan un post
    var chain = req.body;
    getCuentas (function(cuentas) {
	if (cuentas === 'error') {
	    console.log('rtus/index.main/error al conseguir las cuentas');
	    res.jsonp('error');
	}
	else {
	    relentrctas (chain.entry, cuentas, 0, [], function(entradas) {
		if (typeof entradas === 'string') {
		    console.log('rtus/index.main/no había entradas, algo raro sucedió en el post');
		    res.jsonp('error');
		}
		else {
		    // console.log(JSON.stringify(entradas));
		    estandarizaEntradas (entradas, 0, [], function(cambios) {
			getAppAT (function(token){
			    if (token === 'error') {
				console.log('rtus/index.main/ sin access_token');
				res.jsonp('error');
			    }
			    else {
				asignaCambios (token, cambios, 0, function(index){
				    res.jsonp('200 ok');
				});
			    }
			});
		    });
		}
	    });
	}
    });
});

module.exports = router;
