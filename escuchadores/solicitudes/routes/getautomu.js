/* solicitudes/getautomu/GET - obtieneMuros */
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
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = path;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			// console.log('solicitudes/getautomu/requestGraph - hubo un error en solicitud al graph: '+ path);
			// console.log(JSON.stringify(contenido.error));
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
		console.log('solicitudes/getautomu/requestGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getautomu/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
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
		    classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'solicitudes/getautomu/obtieneUsuariosDeCuentas', function(usersarray){
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

    function tokensDeCuenta(nombreCuenta, usuariosDeCuenta, index, validTokens, callback) {
	var more = index+1;
	var cuantosusuarios = usuariosDeCuenta.length;
	if (more > cuantosusuarios) {
	    return callback(validTokens);
	}
	else {
	    setImmediate(function(){
		if (typeof usuariosDeCuenta[index] !== 'undefined') {
		    var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+usuariosDeCuenta[index].additionalProvidersData.facebook.accessToken;
		    requestGraph(path, function(validacion){
			if (validacion === 'error') {
			    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
			}
			else {
			    validTokens.push(validacion.access_token);
			    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
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
	classdb.buscarToArray('verifica_auto_uat', critere, {}, 'solicitudes/getautocp/getCtaATs', function(items){
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
			    classdb.inserta('verifica_auto_uat', objeto, 'solicitudes/getautocp/getCtaATs', function(insertao){
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
				classdb.actualiza('verifica_auto_uat', criterio_actualizacion, objeto, 'solicitudes/getautocp/getCtaATs', function(actualizao){
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

    function procesaSiblings(page_id, account, eltexto, siblings, index, newsiblings, callback) {
	var more = index+1;
	var cuantossib = siblings.length;
	if (more > cuantossib) {
	    return callback('', newsiblings);
	}
	else {
	    if (siblings[index].from.id !== page_id) {
		var critere = { id : siblings[index].id };
		classdb.existefind(account+'_consolidada', critere, 'solicitudes/getautomu/procesaSiblings', function(existens){
		    if (existens === 'error' || existens === 'noexiste') {
			// error o no está en la base de datos, no hacemos nada
			return procesaSiblings(page_id, account, eltexto, siblings, more, newsiblings, callback);
		    }
		    else {
			classdb.buscarToArray(account+'_consolidada', critere, {}, 'solicitudes/getautomu/procesaSiblings', function(items){
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

    function obtenerIdsDeSiblings(token, parent_comment, callback) {
	var pathsiblings = globales.fbapiversion+parent_comment+globales.path_siblings+'&access_token='+token;
	requestGraph(pathsiblings, function(response_sib) {
	    if (response_sib === 'error') {
		// console.log('hubo un error, no conseguimos siblings');
		callback('error');
	    }
	    else {
		if (typeof response_sib.comments === 'undefined' || response_sib.comments.data < 1) {
		    callback('error');
		}
		else {
		    callback(response_sib.comments.data);
		}
	    }
	});
    }

    function verificaRespuestas(token, nombreSyst, pag_id, comentario_procesado, callback) {
	// console.log(comentario_procesado);
	if (typeof comentario_procesado.message !== 'undefined' && comentario_procesado.message !== '') {
	    var vcuenta = nombreSyst; 
	    var colezione = vcuenta+'_consolidada'; 
	    var pa_id = pag_id; 
	    var co_id = comentario_procesado.id;
	    var ctexto = comentario_procesado.message;
	    var ppos = comentario_procesado.parent_post;
	    var pcom = comentario_procesado.parent_comment;
	    // el comentario tiene mensaje, empezamos
	    if (pcom === ppos) {
		// console.log('es respuesta a un comment');
		// es un comment en un comment, posiblemente sea respuesta a uno de sus siblings, hay que ver
		var criteriopc = { id : pcom };
		classdb.existefind(colezione, criteriopc, 'solicitudes/getautomu/verificaRespuesta.comment', function(existia){
		    if (existia === 'error' || existia === 'noexiste') {
			console.log('solicitudes/getautomu/verificaRespuestas - Error: el comment en el que va este comment no existe en la colección');
			callback(existia);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopc, {}, 'solicitudes/getautomu/verificaRespuesta.comment', function(uncomment){
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
							    classdb.actualizaAddToSet(colezione, criteres, eladdts, 'solicitudes/getautomu/verificaRespuesta.comment', function(repondu){
								callback(repondu);
							    });
							}
							else {
							    console.log('solicitudes/getautomu/verificaRespuesta.comment - no había sibling comments...');
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
						classdb.actualizaAddToSet(colezione, criteriopc, { respuestas: la_respuesta }, 'solicitudes/getautomu/verificaRespuesta.comment', function(respondido) {
						    callback(respondido);
						});
					    }
					});
					}	    
					else {
					    console.log('solicitudes/getautomu/verificaRespuesta - Error: la respuesta ya estaba en el comment');
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
					classdb.actualizaAddToSet(colezione, criteriopc, {respuestas: theanswer}, 'solicitudes/getautomu/verificaRespuesta.comment', function(answered) {
					    callback(answered);
					});
				    }
				}
				else {
				    console.log('solicitudes/getautomu/verificaRespuesta.comment - arreglo de comments llegó vacío');
				    callback('error');
				}
			    }
			});
		    }
		});
	    }
	    else {
		// console.log('es respuesta a un post');
		// es un comment a un post buscamos post para adjuntar respuesta
		var criteriopp = { id : ppos };	
		classdb.existefind(colezione, criteriopp, 'solicitudes/getautomu/verificaRespuesta.post', function(exists) {
		    if (exists === 'error' || exists === 'noexiste') {
			console.log('solicitudes/getautomu/verificaRespuesta.post - Error: el post en el que va este comment no existe en la colección');
			callback(exists);
		    }
		    else {
			classdb.buscarToArray(colezione, criteriopp, {}, 'solicitudes/getautomu/verificaRespuesta.post', function(unpost){
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
					    classdb.actualizaAddToSet(colezione, criteriopp, { respuestas : larespuesta }, 'solicitudes/getautomu/verificaRespuesta.post', function(respondido) {
						callback(respondido);
					    });
					}
					else {
					    // console.log('solicitudes/getautomu/verificaRespuesta.post - Esta la respuesta ya estaba en el post, no es error');
					    callback('ok');
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
					classdb.actualizaAddToSet(colezione, criteriopp, { respuestas : dieantwort }, 'solicitudes/getautomu/verificaRespuesta.post', function(answered) {
					    callback(answered);
					});
				    }
				}
				else {
				    console.log('solicitudes/getautomu/verificaRespuesta.post - arreglo posts llegó vacío');
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
	    console.log('solicitudes/getautomu/verificaRespuesta.main - Error: comentario venía vacío, no hay nada que insertar');
	    callback('error');
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

    function guardaBaseComment(token, nombreSistema, p_id, fechacta, comment, cback){
	if (!comment.from) {
	    console.log(comment);
	}
	else {
	    var criterio = {'id': comment.id};
	    var fotopath = globales.fbapiversion+comment.from.id+'/picture?redirect=false';
	    var coleccion = nombreSistema+'_consolidada';
	    if (typeof comment.created_time !== 'undefined') {
		var created_time = comment.created_time;
	    }
	    if (typeof created_time !== 'undefined' && Date.parse(created_time) > Date.parse(fechacta)) {
		classdb.existefind(coleccion, criterio, 'solicitudes/geautotmu/guardaBaseComment', function(existe) {
		    if (existe === 'error' || existe === 'existe') {
			return cback(existe);
		    }
		    else {
			requestGraph(fotopath, function(foto){
			    if (foto === 'error') {
				comment.foto = '';
				classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getautomu/guardaBaseComment', function(inserta) {
				    if (comment.from && p_id !== comment.from.id) {
					nueMens(comment.created_time, 'comment', nombreSistema);
				    }
				    return cback(inserta);
				});			
			    }
			    else {
				comment.foto = foto.data.url;
				classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getautomu/guardaBaseComment', function(inserta) {
				    if (comment.from && p_id !== comment.from.id) {
					nueMens(comment.created_time, 'comment', nombreSistema);
				    }
				    return cback(inserta);
				});			
			    }
			});		    
		    }
		});
	    }
	}
    }

    function procesaCommentsdecom(ns, tk, pid, cm, facta, comentarios, index, callback) {
	var more = index+1;
	var cuantoscodc = comentarios.length;
	if (more > cuantoscodc) {
	    return callback('ok');
	}
	else {
	    setImmediate(function() {
		if (typeof comentarios[index] !== 'undefined') {
		    
		    if (typeof comentarios[index].parent !== 'undefined' && 
			typeof comentarios[index].parent.id !== 'undefined') {
			comentarios[index].parent_comment = comentarios[index].parent.id;
		    }
		    else {
			comentarios[index].parent_comment = cm.id;
		    }
		    if (typeof comentarios[index].attachment !== 'undefined' &&
			typeof comentarios[index].attachment.media !== 'undefined' &&
			typeof comentarios[index].attachment.media.image !== 'undefined' &&
			typeof comentarios[index].attachment.media.image.src !== 'undefined') {
			comentarios[index].image_attachment = comentarios[index].attachment.media.image.src;
		    }
		    if (typeof comentarios[index].attachment !== 'undefined' &&
			typeof comentarios[index].attachment.target !== 'undefined' &&
			typeof comentarios[index].attachment.target.url) {
			comentarios[index].link_attachment = comentarios[index].attachment.target.url;
		    }
		    if (typeof comentarios[index].from !== 'undefined') {
			comentarios[index].from_user_id = ''+comentarios[index].from.id;
			comentarios[index].from_user_name = comentarios[index].from.name;
			if (pid === comentarios[index].from.id) {
			    verificaRespuestas(tk, ns, pid, comentarios[index], function(esrespuesta){
				if (esrespuesta !== 'ok') {
				    console.log('verificaRespuesta '+esrespuesta);
				}
			    });
			}
		    }
		    else {
			comentarios[index].from_user_id = 'not_available';
		    }
		    comentarios[index].parent_post = pid;
		    comentarios[index].created_old = comentarios[index].created_time;
		    comentarios[index].created_time = new Date(comentarios[index].created_time.replace('+','.'));
		    comentarios[index].obj = 'facebook';
		    comentarios[index].coleccion_orig = ns+'_fb_comment';
		    comentarios[index].coleccion = ns+'_consolidada';
		    comentarios[index].tipo = 'comment';

		    guardaBaseComment(tk, ns, pid, facta, comentarios[index], function(resp){
			if(resp === 'error' || resp === 'existe') {
			    return procesaCommentsdecom(ns, tk, pid, cm, facta, comentarios, more, callback);
			}
			else {
			    return procesaCommentsdecom(ns, tk, pid, cm, facta, comentarios, more, callback);
			}
		    });		    
		}
	    });
	}
    }

    function obtieneCommentsdeComment(token, commentaire, callback) {
	var path = globales.fbapiversion+commentaire.id+globales.path_comments_de_comments+'&access_token='+token;
	requestGraph(path, function(haycomments){
	    if (haycomments === 'error' || typeof haycomments.comments === 'undefined') {
		return callback('error');
	    }
	    else {
		return callback(haycomments.comments.data);
	    }
	});
    }

    function insertandoComments(nombreSyst, token, page_id, post_id, altacuenta, cmnts, index, callback) {
	var more = index+1;
	var cuantosco = cmnts.length;
	if (more > cuantosco) {
	    return callback('getautomu - insertac_fin_ok');
	}
	else {
	    setImmediate(function() {
		if (typeof cmnts[index] !== 'undefined') {
		    cmnts[index].parent_post = post_id;
		    cmnts[index].parent_comment = cmnts[index].id;
		    cmnts[index].created_old = cmnts[index].created_time;
		    cmnts[index].created_time = new Date(cmnts[index].created_time.replace('+','.'));
		    cmnts[index].obj = 'facebook';
		    cmnts[index].coleccion_orig = nombreSyst+'_fb_comment';
		    cmnts[index].coleccion = nombreSyst+'_consolidada';
		    cmnts[index].tipo = 'comment';

		    if (typeof cmnts[index].parent !== 'undefined' && 
			typeof cmnts[index].parent.id !== 'undefined') {
			cmnts[index].parent_comment = cmnts[index].parent.id;
		    }
		    else {
			cmnts[index].parent_comment = post_id;
		    }
		    if (typeof cmnts[index].attachment !== 'undefined' &&
			typeof cmnts[index].attachment.media !== 'undefined' &&
			typeof cmnts[index].attachment.media.image !== 'undefined' &&
			typeof cmnts[index].attachment.media.image.src !== 'undefined') {
			cmnts[index].image_attachment = cmnts[index].attachment.media.image.src;
		    }
		    if (typeof cmnts[index].attachment !== 'undefined' &&
			typeof cmnts[index].attachment.target !== 'undefined' &&
			typeof cmnts[index].attachment.target.url) {
			cmnts[index].link_attachment = cmnts[index].attachment.target.url;
		}
		    if (typeof cmnts[index].from !== 'undefined') {
			cmnts[index].from_user_id = ''+cmnts[index].from.id;
			cmnts[index].from_user_name = cmnts[index].from.name;
			if (page_id === cmnts[index].from.id)  {
			    verificaRespuestas(token, nombreSyst, page_id, cmnts[index], function(esrespuesta){
				if (esrespuesta !== 'ok') {
				    console.log('verificaRespuesta '+esrespuesta);
				}
			    });
			}
		    }
		    else {
			cmnts[index].from_user_id = 'not_available';
		    }
		    guardaBaseComment(token, nombreSyst, page_id, altacuenta, cmnts[index], function(resp){
			if(resp === 'error' || resp === 'existe') {
			    return insertandoComments(nombreSyst, token, page_id, post_id, altacuenta, cmnts, more, callback);
			}
			else {
			    // console.log('insertamos');
			    obtieneCommentsdeComment(token, cmnts[index], function(tienecomments) {
				if (tienecomments !== 'error') {
				    procesaCommentsdecom(nombreSyst, token, page_id, cmnts[index], altacuenta, _(tienecomments).reverse().value(), 0, function(commentsdecom){
					console.log('solicitudes/getautomu/insertandoComments - comments del comment '+cmnts[index].id+' '+commentsdecom);
				    });
				}
			    });
			    return insertandoComments(nombreSyst, token, page_id, post_id, altacuenta, cmnts, more, callback);
			}
		    });
		}
		else{
		    console.log('solicitudes/getautomu/insertandoComments - comment raro, venía undefined');
		    return insertandoComments(nombreSyst, token, page_id, post_id, altacuenta, cmnts, more, callback);
		}
	    });
	}
    }

    function insertaPost(nombreSistema, post, page_id, callback) {
	var criterio = {'id': post.id};
	classdb.existefind(nombreSistema+'_consolidada', criterio, 'solicitudes/getautomu/insertaPost', function(existe){
	    if (existe === 'error' || existe === 'existe') {
		return callback(existe);
	    }
	    else {
		var fotopath = globales.fbapiversion+post.from.id+'/picture?redirect=false';
		requestGraph(fotopath, function(foto) {
		    if (foto === 'error') {
			post.foto = '';
			classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getautomu/insertaPost', function(inserta) {
			    if (post.from && page_id !== post.from.id) {
				nueMens(post.created_time, 'post', nombreSistema);
			    }
			    return callback(inserta);
			});			
		    }
		    else {
			post.foto = foto.data.url;
			classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getautomu/guardaBaseMensaje', function(inserta) {
			    if (post.from && page_id !== post.from.id) {
				nueMens(post.created_time, 'post', nombreSistema);
			    }
			    return callback(inserta);
			});
		    }
		});
	    }
	});
    }

    function postDeFeed(post, nombreSistema, pagid, altacta, callback) {
	var created_time = '';
	if (typeof post.created_time !== 'undefined') {
	    created_time = new Date(post.created_time.replace('+','.'));
	}
	else {
	    post.created_time = new Date();
	}
	if (created_time !== '' && Date.parse(created_time) > Date.parse(altacta)) {
	    var post_id = post.id;
	    var comments = [];
	    post.created_old = post.created_time;
	    post.created_time = created_time;
	    if (typeof post.updated_time !== 'undefined') {
		post.updated_time = new Date(post.updated_time.replace('+','.'));	    
	    }
	    post.obj = 'facebook';
	    post.coleccion = nombreSistema+'_consolidada';
	    post.tipo = 'post';
	    post.subtipo = post.type;
	    if (typeof post.attachments !== 'undefined' &&
		typeof post.attachments.data !== 'undefined' &&
		post.attachments.data[0].length > 0 &&
		typeof post.attachments.data[0].media !== 'undefined' &&
		typeof post.attachments.data[0].media.image !== 'undefined' &&
		typeof post.attachments.data[0].media.image.src !== 'undefined') {
		post.image_attachment = post.attachments.data[0].media.image.src;
	    }
	    if (typeof post.attachments !== 'undefined' &&
		typeof post.attachments.data !== 'undefined' &&
		post.attachments.data[0].length > 0 &&
		typeof post.attachments.data[0].target !== 'undefined' &&
		typeof post.attachments.data[0].target.url !== 'undefined') {
		post.link_attachment = post.attachments.data[0].target.url;
	    }
	    if (typeof post.from !== 'undefined') {
		post.from_user_id = ''+post.from.id;
		post.from_user_name = post.from.name;
	    }
	    else {
		console.log('ERROR: post anónimo, investigar más:');
		console.log(post);
		return callback('error');
	    }
	    insertaPost(nombreSistema, post, pagid, function(postInsertado) {
		if (postInsertado === 'error') { return callback('error'); } else { return callback('ok'); }
	    });
	}
    }


    function procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, index, callback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantosp = elfeed.length;
	if (more > cuantosp) {
	    return callback('getautomu ok');
	}
	else {
	    setImmediate(function(){
		if (typeof elfeed[index] !== 'undefined' && typeof elfeed[index].id !== 'undefined') {
		    postDeFeed(elfeed[index], nameSystem, pageid, alta_cta, function(elpost) {
			if (elpost === 'error') {
			    return procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, more, callback);			    
			}
			else {
			    if (typeof elfeed[index].comments !== 'undefined'){
				var postid = elfeed[index].id;
				var loscomentarios = _(elfeed[index].comments.data).reverse().value();
				insertandoComments(nameSystem, page_token, pageid, postid, alta_cta, loscomentarios, 0, function(loscomments){
				    if (loscomments === 'insertc_fin_ok') {
					return procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, more, callback);
				    }
				    else {
					return procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, more, callback);
				    }
				});
			    }
			    else {
				return procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, more, callback);
			    }
			}
		    });		
		}
		else {
		    return procesaFeed(nameSystem, page_token, pageid, alta_cta, elfeed, more, callback);
		}
	    });
	}
    }

    function obtieneFeeds(accounts, accountTokens, index, callback) {
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
		    var fecha_alta_cta = acc_elements[2];
		    var cta_access_tokens = accountTokens[indice];
		    var access_token = cta_access_tokens[Math.floor(Math.random()*cta_access_tokens.length)];
		    var derpath = globales.fbapiversion+page_id+globales.path_feed_limit+'&access_token='+access_token;
		    var derpathwol = globales.fbapiversion+page_id+globales.path_feed_nolimit+'&access_token='+access_token;
		    requestGraph(derpath, function(thefeed){
			if (thefeed === 'error' || typeof thefeed.data === 'undefined' || thefeed.data.length < 1) {
			    console.log('solicitudes/getautomu/obtieneFeeds - Error al conseguir feed con limite para: '+nombreSistema);
			    requestGraph(derpathwol, function(thefeedwol) {
				if (thefeedwol === 'error' || typeof thefeedwol.data === 'undefined' || thefeedwol.data.length < 1) {
				    console.log('solicitudes/getautomu/obtieneFeeds - Error al conseguir feed sin limite para: '+nombreSistema);
				    return obtieneFeeds(accounts, accountTokens, more, callback);				    
				}
				else {
				    procesaFeed(nombreSistema, access_token, page_id, fecha_alta_cta, _(thefeedwol.data).reverse().value(), 0, function(procesafeed){
					console.log(nombreSistema+' '+procesafeed);
					return obtieneFeeds(accounts, accountTokens, more, callback);
				    });
				}
			    });
			}
			else {
			    procesaFeed(nombreSistema, access_token, page_id, fecha_alta_cta, _(thefeed.data).reverse().value(), 0, function(procfeed){
				console.log(nombreSistema+' '+procfeed);
				return obtieneFeeds(accounts, accountTokens, more, callback);
			    });
			}
		    });
		}
		else {
		    return obtieneFeeds(accounts, accountTokens, more, callback);
		}
	    });
	}
    }

    var ctascriterio = {$and: [{datosPage:{$exists: true}}, {datosPage: {$ne: ''}}, {'datosPage.id':{$exists: true}}]};
    classdb.buscarToArray('accounts', ctascriterio, {nombreSistema: 1}, 'solicitudes/getautomu.main', function(cuentas){
	console.log('**************** solicitudes/getautomu/GET - getFeeds de todas las cuentas conectadas a facebook *****************');
	if (cuentas === 'error' || cuentas.length < 1) {
	    res.jsonp('error');
	}
	else {
	    obtieneUsuariosDeCuentas(cuentas, 0, [], {}, function(ctas, ctasusers){
		checaAccessTokens(ctas, ctasusers, 0, [], {},  function(accts, acctks) {
		    obtieneFeeds(accts, acctks, 0, function(resultado) {
			console.log('getautomu ok');
		    });
		    var texti = 'se pedirán feeds para: '+accts.join();
		    res.jsonp(texti);			
		});
	    });
	}
    });
});

module.exports = router;
