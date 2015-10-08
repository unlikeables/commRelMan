/* solicitudes/getautopp/GET - obtieneFacebookPostsPending */
'use strict';
var express = require('express');
var url    = require('url'), qs     = require('querystring'), _      = require('lodash'), http   = require('http'), https  = require('https');
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET Facebook Inbox. */
router.get('/', function(req, res, next) {
    function requestGraph(path, callback) {
	// console.log(path);
	if (typeof path === 'undefined' || path === null || path === '') {
	    console.log('solicitudes/getautopp/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error', null);	    
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
			console.log('solicitudes/getautopp/requestGraph - hubo un error en solicitud al graph: '+ JSON.stringify(contenido.error));
			return callback(contenido.error, null);
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
	    solicitud.on('error', function(err){
		console.log('solicitudes/getautopp/requestGraph - hubo un error en la conexión al graph: '+err);
		return callback(err, null);
	    });	    
	}
    }

    function requestGraph2(path, callback) {
	if (typeof path === 'undefined' || path === null || path === '') {
	    console.log('solicitudes/getautopp/requestGraph2 - no hubo path, así que no se puede pedir nada al graph');
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
			// console.log('solicitudes/getautopp/requestGraph2 - hubo un error en solicitud al graph: '+ path);
			console.log(JSON.stringify(contenido.error));
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
		console.log('solicitudes/getautopp/requestGraph2 - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
    }

    function obtieneUsuariosDeCuentas(accounts, index, nombres, users, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    return callback(nombres, users);
	}
	else {
	    setImmediate(function(){
		if (typeof accounts[index] !== 'undefined') {
		    var userscritere = {
			$and: 
			[
			    {'cuenta.marca' : accounts[index].nombreSistema},
			    {additionalProvidersData : {$exists : true}},
			    {additionalProvidersData : {$ne : ''}},
			    {'additionalProvidersData.facebook' : {$exists : true}},
			    {'additionalProvidersData.facebook.accessToken' : {$exists: true}}
			]
		    };
		    var usersfields = {
			'_id' : '', 
			'displayName' : '', 
			'cuenta.marca': '',
			'additionalProvidersData.facebook.accessToken' : '',
			'additionalProvidersData.facebook.name': ''
		    };
		    var userssort = {created_time : 1};
		    classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'solicitudes/getautopp/obtieneUsuariosDeCuentas', function(usersarray){
			if (usersarray === 'error' || usersarray.length < 1) {
			    return obtieneUsuariosDeCuentas(accounts, more, nombres, users, callback);
			}
			else {
			    var nombrecta = accounts[index].nombreSistema+'*|*'+accounts[index].datosPage.id+'*|*'+accounts[index].created_time;
			    nombres.push(nombrecta);
			    users[nombrecta] = usersarray;
			    return obtieneUsuariosDeCuentas(accounts, more, nombres, users, callback);
			}
		    });
		}
		else {
		    return obtieneUsuariosDeCuentas(accounts, more, nombres, users, callback);
		}
	    });
	}
    }

    function encuentraCuentaCorrespondiente(pid, pages, index, callback) {
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

    function tokensDeCuenta(nombreCuenta, usuariosDeCuenta, index, validTokens, callback) {
	var more = index+1;
	var cuantosusuarios = usuariosDeCuenta.length;
	var acc_elements = nombreCuenta.split('*|*');
	var nombreSistema = acc_elements[0];
	var page_id = acc_elements[1];	
	var created_time = acc_elements[2];
	if (more > cuantosusuarios) {
	    return callback(validTokens);
	}
	else {
	    setImmediate(function(){
		if (typeof usuariosDeCuenta[index] !== 'undefined') {
		    var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+usuariosDeCuenta[index].additionalProvidersData.facebook.accessToken;
		    requestGraph2(path, function(validacion){
			if (validacion === 'error') {
			    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
			}
			else {
			    var patpath = globales.fbapiversion+'me/accounts?access_token='+validacion.access_token;
			    requestGraph2(patpath, function(pages) {
				if (pages === 'error' || typeof pages.data === 'undefined' || pages.data.length < 1) {
				    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
				}
				else {
				    encuentraCuentaCorrespondiente(page_id, pages.data, 0, function(fbaccount) {
					if (fbaccount === 'not') {
					    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);					    
					}
					else {
					    validTokens.push(fbaccount);
					    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);					    
					}
				    });
				}
			    });
			}
		    });
		}
		else {
		    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
		}
	    });
	}
    }

    function getCtaATs(nombreCta, usuariosCta, callback) {
	var critere = {'nombre_cta': nombreCta};
	var lesort = {created_time: -1};
	classdb.buscarToArray('verifica_auto_pat', critere, {}, 'solicitudes/getautopp/getCtaATs.busca', function(items){
	    if (items === 'error') {
		return callback([]);
	    }
	    else {
		if (items.length < 1) {
		    // no existen access_tokens en bd, los pedimos a fb
		    tokensDeCuenta(nombreCta, usuariosCta, 0, [], function(vtokens){
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
			    classdb.inserta('verifica_auto_pat', objeto, 'solicitudes/getautopp/getCtaATs.inserta', function(insertao){
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
			tokensDeCuenta(nombreCta, usuariosCta, 0, [], function(vtokens){
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
				classdb.actualiza('verifica_auto_pat', criterio_actualizacion, objeto, 'solicitudes/getautopp/getCtaATs', function(actualizao){
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

    function checaAccessTokens(accounts, accountusers, index, ctascvat, userscvat, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    return callback(ctascvat, userscvat);
	}
	else {
	    setImmediate(function(){
		if (typeof accounts[index] !== 'undefined') {
		    var nombrecta = accounts[index];
		    getCtaATs(nombrecta, accountusers[nombrecta], function(tdc){
			if (tdc.length < 1) {
			    return checaAccessTokens(accounts, accountusers, more, ctascvat, userscvat, callback);
			}
			else {
			    ctascvat.push(nombrecta);
			    userscvat[nombrecta] = tdc;
			    return checaAccessTokens(accounts, accountusers, more, ctascvat, userscvat, callback);
			}
		    });
		}
		else {
		    return checaAccessTokens(accounts, accountusers, more, ctascvat, userscvat, callback);
		}
	    });
	}
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

    // mongod insertamos post
    function insertaPost(datosPost, nombreSistema, pa_id, callback){
	datosPost.post.obj = 'facebook';
	datosPost.post.coleccion_orig = nombreSistema+'_fb_comment';
	datosPost.post.coleccion = nombreSistema+'_consolidada';
	classdb.inserta(nombreSistema+'_consolidada', datosPost.post, 'solicitudes/getautopp/insertaPost', function(inserta){
	    if (datosPost.post.from && pa_id !== datosPost.post.from.id) {
		nueMens(datosPost.post.created_time, 'post', nombreSistema);
	    }
	    return callback(inserta);
	});
    }

    // obtenemos comment con todo y para llevar de facebook usando método requestGraph    
    function obtenerPost(token, post_raw, callback) {
	var pageId = post_raw.page_id;
	var tipo = 'post';
	var subtipo = post_raw.item;
	var created_time = post_raw.created_time;
	var objeto = {};

	var basicpath = globales.fbapiversion+post_raw.post_id+globales.path_post_query+'&access_token='+token;
	var fotopath = globales.fbapiversion+post_raw.sender_id+'/picture?redirect=false';
	requestGraph(basicpath, function(error_orig, response_orig) {
	    if (error_orig) {
		console.log('solicitudes/getautopp/obtenerPost - ni siquiera hubo post: '+JSON.stringify(error_orig));
		objeto.error = error_orig;
		return callback(objeto);
	    }
	    else {
		objeto.post = response_orig;
		if (post_raw.photo_id) {
		    objeto.post.photo_id = post_raw.photo_id;
		}
		if (post_raw.share_id) {
		    objeto.post.share_id = post_raw.share_id;
		}
		if (post_raw.video_id) {
		    objeto.post.video_id = post_raw.video_id;
		}
		objeto.post.created_old = response_orig.created_time;
		objeto.post.created_time = created_time;
		if (typeof response_orig.from === 'undefined') {
		    objeto.post.from = {};
		    objeto.post.from.id = post_raw.sender_id;
		    objeto.post.from.name = post_raw.sender_name;
		    objeto.post.from_user_id = ''+post_raw.sender_id;
		    objeto.post.from_user_name = post_raw.sender_name;
		}
		else {
		    objeto.post.from_user_id = ''+response_orig.from.id;
		    objeto.post.from_user_name = response_orig.from.name;
		}
		if (typeof response_orig.attachments !== 'undefined' &&
		    typeof response_orig.attachments.data !== 'undefined' &&
		    response_orig.attachments.data[0].length > 0 &&
		    typeof response_orig.attachments.data[0].media !== 'undefined' &&
		    typeof response_orig.attachments.data[0].media.image !== 'undefined' &&
		    typeof response_orig.attachments.data[0].media.image.src !== 'undefined') {
		    objeto.post.image_attachment = response_orig.attachments.data[0].media.image.src;
		}
		if (typeof response_orig.attachments !== 'undefined' &&
		    typeof response_orig.attachments.data !== 'undefined' &&
		    response_orig.attachments.data[0].length > 0 &&
		    typeof response_orig.attachments.data[0].target !== 'undefined' &&
		    typeof response_orig.attachments.data[0].target.url !== 'undefined') {
		    objeto.post.link_attachment = response_orig.attachments.data[0].target.url;
		}
		requestGraph(fotopath, function(error_foto, response_foto){
		    if (error_foto) {
			objeto.post.foto = '';
			objeto.post.photo_error = error_foto;
			return callback(objeto);
		    }
		    else {
			objeto.post.foto = response_foto.data.url;
			return callback(objeto);
		    }
		});
	    }
	});
    }

    // mongod eliminamos comment
    function eliminaPost(idPost, nombreSistema, callback){
	var criterio = { 'id' : idPost };
	classdb.remove(nombreSistema+'_fb_post_pending', criterio, 'peticiones/getautopp/eliminaPost', function(respons){
	    return callback(respons);
	});	
    }
    
    // mongod verificamos si existe comment
    function validaPost(datosPost, nombreSistema, callback){
	var criterio = { 'id' : datosPost.id };
	classdb.existecount(nombreSistema+'_consolidada', criterio, 'solicitudes/getautopp/validaPost', function(respues){
	    return callback(respues);
	});
    }

    // procesamos cada comment 
    function desglosaPosts(access_token, posts_raw, nombreSistema, page_id, index, callback){
	var more = index+1;
	var cuantosc = posts_raw.length;
	if (more > cuantosc) {
	    callback(nombreSistema+' getautopp ok');	    
	}
	else {
	    setImmediate(function(){
		if (typeof posts_raw[index] !== 'undefined') {
		    validaPost(posts_raw[index], nombreSistema, function(respuestaExistencia){
			if (respuestaExistencia === 'error' || respuestaExistencia === 'existe') {
			    eliminaPost(posts_raw[index].id, nombreSistema, function(eliminacion){
				console.log('solicitudes/getautopp/desglosaPosts - error en verificación o ya existe post - eliminamos pending: '+eliminacion);
				return desglosaPosts(access_token, posts_raw, nombreSistema, page_id, more, callback);
			    });    
			}
			else {
			    obtenerPost(access_token, posts_raw[index], function(obtencion) {
				if (obtencion.error) {
				    eliminaPost(posts_raw[index].id, nombreSistema, function(eliminacion){
					console.log('solicitudes/getautopp/desglosaPosts - imposible obtener post - eliminacion de pending: '+eliminacion);
					return desglosaPosts(access_token, posts_raw, nombreSistema, page_id, more, callback);
				    });	    
				}
				else {
				    insertaPost(obtencion, nombreSistema, page_id, function(insercion){
					eliminaPost(posts_raw[index].id, nombreSistema, function(eliminacion){
					    if (insercion === 'error') {
						console.log('solicitudes/getautopp/desglosaPosts - error al insertar en consolidada - eliminacion de pending: '+eliminacion);
						return desglosaPosts(access_token, posts_raw, nombreSistema, page_id, more, callback);
					    }
					    else {
						return desglosaPosts(access_token, posts_raw, nombreSistema, page_id, more, callback);
					    }
					});
				    });
				}
			    });
			}
		    });
		}
		else {
		    return desglosaPosts(access_token, posts_raw, nombreSistema, page_id, more, callback);
		}
	    });
	}
    }

    function obtienePosts(accounts, accessTokens, index, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    return callback('feeds ok');
	}
	else {
	    setImmediate(function(){
		if (typeof accounts[index] !== 'undefined') {
		    var indice = accounts[index];
		    var acc_elements = indice.split('*|*');
		    var nombreSistema = acc_elements[0];
		    var page_id = acc_elements[1];
		    var cta_created_time = acc_elements[2];
		    var cta_access_tokens = accessTokens[indice];
		    var cta_elegida = cta_access_tokens[Math.floor(Math.random()*cta_access_tokens.length)];
		    var access_page = cta_elegida.access_token;
		    var sort = { created_time : -1 };
		    var limit = 35;
		    
		    classdb.buscarToArrayLimit(nombreSistema+'_fb_post_pending', {}, sort, limit, 'solicitudes/getautopp/obtienePosts '+nombreSistema+'.main', function(items) {
			if (items === 'error' || items.length < 1){
			    // console.log('Error en solicitudes/getautopp/obtienePosts '+nombreSistema+', o bien venía vacío');
			    return obtienePosts(accounts, accessTokens, more, callback);
			}
			else {
			    desglosaPosts(access_page, items, nombreSistema, page_id, 0, function(respuestaDesglose){
				console.log(respuestaDesglose);
				return obtienePosts(accounts, accessTokens, more, callback);
			    });
			    return obtienePosts(accounts, accessTokens, more, callback);
			}
		    });		
		}
		else {
		    return obtienePosts(accounts, accessTokens, more, callback);
		}
	    });
	}
    }

    var ctascriterio = {$and: [{datosPage:{$exists: true}}, {datosPage: {$ne: ''}}, {'datosPage.id':{$exists: true}}]};
    classdb.buscarToArray('accounts', ctascriterio, {nombreSistema: 1}, 'solicitudes/getautomu.main', function(cuentas){
	console.log('**************** solicitudes/getautopp/GET - getFacebook Posts Pending de todas las cuentas conectadas a facebook *****************');
	if (cuentas === 'error' || cuentas.length < 1) {
	    res.jsonp('error');
	}
	else {
	    obtieneUsuariosDeCuentas(cuentas, 0, [], {}, function(ctas, ctasusers){
		checaAccessTokens(ctas, ctasusers, 0, [], {},  function(accts, acctks) {
		    obtienePosts(accts, acctks, 0, function(resultado) {
			console.log('getautocp ok');
		    });
		    var texti = 'se pedirán inbox para: '+accts.join();
		    res.jsonp(texti);
		});
	    });
	}
    });
});

module.exports = router;
