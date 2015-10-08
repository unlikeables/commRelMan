/* solicitudes/getautocp/GET - obtieneCommentsPending */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET Facebook Inbox. */
router.get('/', function(req, res, next) {
    function requestGraph(path, callback) {
	if (typeof path === 'undefined' || path === null || path === '') {
	    console.log('solicitudes/getautocp/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error', null);	    
	}
	else {
	    console.log(path);
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = path;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    console.log(contenido);
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getautocp/requestGraph - hubo un error en solicitud al graph: '+ JSON.stringify(contenido.error));
			return callback(contenido.error, null);
		    }
		    else {
			// console.log('solicitudes/getautocp/requestGraph - tenemos contenido de query: '+path);
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
		console.log('solicitudes/getautocp/requestGraph - hubo un error en la conexión al graph: '+err);
		return callback(err, null);
	    });	    
	}
    }

    function requestGraph2(path, callback) {
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
		console.log('solicitudes/getautocp/requestGraph2 - hubo un error en la conexión al graph: '+e);
		return callback('error');
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
		    classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'solicitudes/getautocp/obtieneUsuariosDeCuentas', function(usersarray){
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
		    console.log(path);
		    requestGraph2(path, function(validacion){
			console.log(validacion);
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
	classdb.buscarToArray('verifica_auto_pat', critere, {}, 'solicitudes/getautocp/getCtaATs', function(items){
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
			    classdb.inserta('verifica_auto_pat', objeto, 'solicitudes/getautocp/getCtaATs', function(insertao){
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
				classdb.actualiza('verifica_auto_pat', criterio_actualizacion, objeto, 'solicitudes/getautocp/getCtaATs', function(actualizao){
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

    // mongod insertamos comment
    function insertaComment(datosComment,comment_raw, nombreSistema,callback){
	var page_id = comment_raw.page_id;
	datosComment.comment.obj = 'facebook';
	datosComment.comment.coleccion_orig = nombreSistema+'_fb_comment';
	datosComment.comment.coleccion = nombreSistema+'_consolidada';
	classdb.inserta(nombreSistema+'_consolidada', datosComment.comment, 'peticiones/getCommentPendientes/insertaComment', function(inserta){
	    if (datosComment.comment.from && page_id !== datosComment.comment.from.id) {
		var lafecha = datosComment.comment.created_time;
		nueMens(lafecha, 'comment', nombreSistema);
	    }
	  return callback(inserta);
	});
    }

    // revisa si los siblings existen y si tienen ya la respuesta
    function procesaSiblings(page_id, account, eltexto, siblings, index, newsiblings, callback) {
	var more = index+1;
	var cuantossib = siblings.length;
	if (more > cuantossib) {
	    return callback('', newsiblings);
	}
	else {
	    if (siblings[index].from.id !== page_id) {
		var critere = { id : siblings[index].id };
		classdb.existefind(account+'_consolidada', critere, 'rtus/index/procesaSiblings', function(existens){
		    if (existens === 'error' || existens === 'noexiste') {
			// error o no está en la base de datos, no hacemos nada
			return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
		    }
		    else {
			classdb.buscarToArray(account+'_consolidada', critere, 'rtus/index/procesaSiblings', function(items){
			    if (items === 'error') {
				// error, no hacemos nada
				return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
			    }
			    else {
				if (typeof items[0].respuestas !== 'undefined') {
				    // comment tiene respuestas
				    var las_respuestas = items[0].respuestas;				    
				    var existerespu = _.findIndex(las_respuestas, function(chr) {
					return chr.texto === eltexto;
				    });
				    if (existerespu === -1) {
					newsiblings.push(siblings[index]);
					return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
				    }
				    else {
					return callback('respondido: comment '+siblings[index]+' ya recibió esa respuesta', newsiblings);
				    }
				}
				else {
				    // comment no tiene respuestas
				    newsiblings.push(siblings[index]);
				    return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
				}
			    }
			});
		    }
		});
	    }
	    else {
		// son de la cuenta en cuestión, no deben responderse
		return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
	    }
	}
    }

    // conseguimos Ids de Siblings
    function obtenerIdsDeSiblings(token, parent_comment, callback) {
	var pathsiblings = globales.fbapiversion+parent_comment+globales.path_siblings+'&access_token='+token.access_token;
	requestGraph2(pathsiblings, function(response) {
	    if (response === 'error') {
		console.log('hubo un error, no conseguimos siblings');
		callback('error');
	    }
	    else {
		callback(response.comments.data);
	    }
	});
    }

    function verificaRespuestas(token, comentario_raw, comentario_procesado, callback) {
	console.log(comentario_procesado);
	if (typeof comentario_procesado.message !== 'undefined' && comentario_procesado.message !== '') {
	    var pcom = comentario_procesado.parent_comment; 
	    var ppos = comentario_procesado.parent_post;
	    var vcuenta = comentario_raw.cuenta; 
	    var colezione = vcuenta+'_consolidada'; 
	    var pa_id = comentario_raw.page_id; 
	    var co_id = comentario_procesado.id;
	    var ctexto = comentario_procesado.message;
	    // el comentario tiene mensaje, empezamos
	    if (pcom  === ppos) {
		 console.log('es respuesta a un comment');
		// es un comment en un comment, posiblemente sea respuesta a uno de sus siblings, hay que ver
		var criteriopc = { id : pcom };
		classdb.existefind(colezione, criteriopc, 'rtus/index/verificaRespuesta.comment', function(existia){
		    if (existia === 'error' || existia === 'noexiste') {
			console.log('Error: el comment en el que va este comment no existe en la colección');
			callback(existia);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopc, {}, 'rtus/index/verificaRespuesta.comment', function(uncomment){
			    if (uncomment === 'error') {
				callback(uncomment);
			    }
			    else {
				if (uncomment.length > 0) {
				    if (typeof uncomment[0].respuestas !== 'undefined') {
					// parent_comment tiene respuestas en db
					var las_respuestas = uncomment[0].respuestas; 
					var existerespu = _.findIndex(las_respuestas, function(chr) {
					    return chr.texto === comentario_procesado.message;
					});
					if (existerespu === -1) {
					    obtenerIdsDeSiblings(token, pcom, function(comments_ids){
					    if (typeof comments_ids.comments !== 'undefined') {
						// ya hay comments en el comment
						var siblings = _(comments_ids.comments.data).reverse().value();
						procesaSiblings(pa_id, vcuenta, ctexto, siblings, 0, [], function(sibst, sibar){
						    if (sibst !== ''){
							console.log(sibst);
							callback('ok');
						    }
						    else {
							if (sibar.length > 0) {
							    var la_reponse = { user_name : 'facebook', user_id : 'direct-facebook', texto : ctexto, timestamp : new Date(), id_str : co_id };
							    var criteres = { id : sibar[0].id };
							    var eladdts = { respuestas : la_reponse };
							    classdb.actualizaAddToSet(colezione, criteres, eladdts, '/rtus/index/verificaRespuesta.comment', function(repondu){
								callback(repondu);
							    });
							}
							else {
							    console.log('no había comments...');
							    callback('error');
							}
						    }
						    
						});
					    }
					    else {
						var la_respuesta = {
						    user_name: 'facebook',
						    user_id: 'direct-facebook',
						    texto: ctexto,
						    timestamp : new Date(),
						    id_str: co_id
						};
						classdb.actualizaAddToSet(colezione, criteriopc, { respuestas: la_respuesta }, '/rtus/index/verificaRespuesta.post', function(respondido) {
						    callback(respondido);
						});
					    }
					});
					}	    
					else {
					    console.log('Error: esta la respuesta ya estaba en el comment');
					    callback('error');
					}
				    }
				    else {
					// no hubo respuestas en el comment de bd
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
				}
				else {
				    console.log('arreglo de comments llegó vacío');
				    callback('error');
				}
			    }
			});
		    }
		});
	    }
	    else {
		 console.log('es respuesta a un post');
		// es un comment a un post buscamos post para adjuntar respuesta
		var criteriopp = { id : ppos };	
		classdb.existefind(colezione, criteriopp, 'rtus/index/verificaRespuesta.post', function(exists) {
		    if (exists === 'error' || exists === 'noexiste') {
			console.log('Error: el post en el que va este comment no existe en la colección');
			callback(exists);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopp, {}, 'rtus/index/verificaRespuesta.post', function(unpost){
			    if (unpost === 'error') {
				callback(unpost);
			    }
			    else {
				if (unpost.length > 0) {
				    if (typeof unpost[0].respuestas !== 'undefined') {
					// parent_post tiene respuestas en db
					var reponses = unpost[0].respuestas;				    
					var existeresp = _.findIndex(reponses, function(chr) {
					    return chr.texto === ctexto;
					});
					if (existeresp === -1) {
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
					else {
					    console.log('Error: esta la respuesta ya estaba en el post');
					    callback('error');
					}
				    }
				    else {
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
				}
				else {
				    console.log('arreglo posts llegó vacío');
				    callback('error');
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

    // obtenemos comment con todo y para llevar de facebook usando método requestGraph    
    function obtenerComment(token, comment_raw, callback) {
	var pageId = comment_raw.page_id;
	var tipo = comment_raw.item;
	var created_time = comment_raw.created_time;
	var objeto = {};

	var basicpath = globales.fbapiversion+comment_raw.comment_id+globales.path_comment_query+'&access_token='+token.access_token;
	var fotopath = globales.fbapiversion+comment_raw.sender_id+'/picture?redirect=false';
	requestGraph(basicpath, function(error_orig, response_orig) {
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
		objeto.comment.created_time = created_time;
		objeto.comment.parent_post = comment_raw.post_id;
		objeto.comment.tipo = tipo;
		objeto.comment.from.id = ''+response_orig.from.id;
		if (typeof response_orig.from === 'undefined') {
		    objeto.comment.from = {};
		    objeto.comment.from.id = ''+comment_raw.sender_id;
		    objeto.comment.from.name = comment_raw.sender_name;
		    objeto.comment.from_user_id = ''+comment_raw.sender_id;
		    objeto.comment.from_user_name = comment_raw.sender_name;
		}
		else {
		    objeto.comment.from_user_id = ''+response_orig.from.id;
		    objeto.comment.from_user_name = response_orig.from.name;
		}
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
		requestGraph(fotopath, function(error_foto, response_foto){
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

    // mongod eliminamos comment
    function eliminaComment(idComment, nombreSistema, callback){
	var criterio = { 'id' : idComment };
	classdb.remove(nombreSistema+'_fb_comment_pending', criterio, 'peticiones/getCommentPendientes/eliminaComment', function(respons){
	    return callback(respons);
	});	
    }
    
    // mongod verificamos si existe comment
    function validaComment(datosComment, nombreSistema, callback){
	var criterio = { 'id' : datosComment.id };
	classdb.existecount(nombreSistema+'_consolidada', criterio, 'peticiones/getCommentPendientes/validaComment', function(respues){
	    return callback(respues);
	});
    }

    // procesamos cada comment 
    function desglosaComments(access_token, comments_raw, nombreSistema, page_id, index, callback){
	var more = index+1;
	var cuantosc = comments_raw.length;
	if (more > cuantosc) {
	    callback(nombreSistema+' getautocp ok');	    
	}
	else {
	    setImmediate(function(){
		if (typeof comments_raw[index] !== 'undefined') {
		    validaComment(comments_raw[index], nombreSistema, function(respuestaExistencia){
			if (respuestaExistencia === 'error' || respuestaExistencia === 'existe') {
			    eliminaComment(comments_raw[index].id, nombreSistema, function(eliminacion){
				console.log('solicitudes/getautocp/desglosaComments - error en verificación o ya existe comment - eliminamos pending: '+eliminacion);
				return desglosaComments(access_token, comments_raw, nombreSistema, page_id, more, callback);
			    });    
			}
			else {
			    obtenerComment(access_token, comments_raw[index], function(obtencion) {
				if (obtencion.error) {
				    eliminaComment(comments_raw[index].id, nombreSistema, function(eliminacion){
					console.log('solicitudes/getautocp/desglosaComments - imposible obtener comment - eliminacion de pending: '+eliminacion);
					return desglosaComments(access_token, comments_raw, nombreSistema, page_id, more, callback);
				    });	    
				}
				else {
				    if (typeof obtencion.comment.from !== 'undefined') {
					if (page_id === obtencion.comment.from.id) {
					    verificaRespuestas(access_token, comments_raw[index], obtencion.comment, function(esrespuesta){
						console.log('verificaRespuesta '+esrespuesta);
					    });
					}
				    }
				    else {
					obtencion.comment.from.id = 'not_available';
				    }
				    insertaComment(obtencion, comments_raw[index], nombreSistema, function(insercion){
					eliminaComment(comments_raw[index].id,nombreSistema,function(eliminacion){
					    if (insercion === 'error') {
						console.log('solicitudes/getautocp/desglosaComments - error al insertar en consolidada - eliminacion de pending: '+eliminacion);
						return desglosaComments(access_token, comments_raw, nombreSistema, page_id, more, callback);
					    }
					    else {
						return desglosaComments(access_token, comments_raw, nombreSistema, page_id, more, callback);
					    }
					});
				    });
				}
			    });
			}
		    });
		}
		else {
		    return desglosaComments(access_token, comments_raw, nombreSistema, page_id, more, callback);
		}
	    });
	}
    }

    function obtieneComments(accounts, accessTokens, index, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    // return callback(ctaselegidas);
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
		    
		    classdb.buscarToArrayLimit(nombreSistema+'_fb_comment_pending', {}, sort, limit, 'solicitudes/getautocp/obtieneComments/'+nombreSistema+'.main', function(items) {
			if (items === 'error' || items.length < 1){
			    console.log('Error en solicitudes/getautocp/obtieneComments/'+nombreSistema+', o bien venía vacío');
			    return obtieneComments(accounts, accessTokens, more, callback);
			}
			else {
			    desglosaComments(cta_elegida, items, nombreSistema, page_id, 0, function(respuestaDesglose){
				console.log(respuestaDesglose);
				return obtieneComments(accounts, accessTokens, more, callback);
			    });
			}
		    });		
		}
		else {
		    return obtieneComments(accounts, accessTokens, more, callback);
		}
	    });
	}
    }

    var ctascriterio = {$and: [{datosPage:{$exists: true}}, {datosPage: {$ne: ''}}, {'datosPage.id':{$exists: true}}]};
    classdb.buscarToArray('accounts', ctascriterio, {nombreSistema: 1}, 'solicitudes/getautomu.main', function(cuentas){
	console.log('**************** solicitudes/getautocp/GET - getFacebook Comments Pending de todas las cuentas conectadas a facebook *****************');
	if (cuentas === 'error' || cuentas.length < 1) {
	    res.jsonp('error');
	}
	else {
	    obtieneUsuariosDeCuentas(cuentas, 0, [], {}, function(ctas, ctasusers){
		checaAccessTokens(ctas, ctasusers, 0, [], {},  function(accts, acctks) {
		    obtieneComments(accts, acctks, 0, function(resultado) {
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
