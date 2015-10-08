/* solicitudes/getautofi/GET - obtieneInbox */
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
		console.log('solicitudes/getautofi/requestGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getautofi/requestGraph - no hubo path, así que no se puede pedir nada al graph');
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
		    classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'solicitudes/getautofi/obtieneUsuariosDeCuentas', function(usersarray){
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
		    requestGraph(path, function(validacion){
			if (validacion === 'error') {
			    return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
			}
			else {
			    var patpath = globales.fbapiversion+'me/accounts?access_token='+validacion.access_token;
			    requestGraph(patpath, function(pages) {
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
	classdb.buscarToArray('verifica_auto_pat', critere, lesort, 'solicitudes/getautocp/getCtaATs', function(items){
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

    function revisaMensajesAnteriores(mensajesp, page_id, mensaje, index, mant, callback) {
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

    function verificaRespuestas(nombresys, page_id, message, callback) {
	var colezione = nombresys+'_consolidada';
	if (typeof message.message !== 'undefined' && message.message !== '') {
	    var conv_id = message.conversation_id;
	    var mes_id = message.id;
	    var mtexto = message.message;
	    var criteriom = {$and: [{conversation_id: conv_id}, {id : {$ne: mes_id}}, {created_time: {$lte: message.created_time}}]};
	    var sortm = {created_time: -1};
	    classdb.buscarToArrayLimit(colezione, criteriom, sortm, 5, 'solicitudes/getautofi/verificaRespuestas', function(mensajes_ant){
		if (mensajes_ant === 'error' || mensajes_ant.length < 1) {
		    console.log('solicitudes/getautofi/verificaRespuestas Error en query o no hay mensajes anteriores de esta conversacion');
		    callback('error');
		}
		else {
		    var prev_messages = _(mensajes_ant).reverse().value();
		    revisaMensajesAnteriores(prev_messages, page_id, message, 0, [], function(msresp){
			if (msresp.length > 0) {
			    var respondiendoa = msresp[0];
			    var criterior = { id : respondiendoa.id };
			    var la_reponse = { user_name : 'facebook', user_id : 'direct-facebook', texto : mtexto, timestamp : new Date(), id_str : mes_id };
			    var eladdts = { respuesttas : la_reponse };
			    classdb.actualizaAddToSet(colezione, criterior, eladdts, '/solicitudes/getautofi/verificaRespuesta.inbox', function(repondu){
				callback(repondu);
			    });
			}
			else {
			    console.log('solicitudes/getautofi/verificaRespuestas Error: no hubo mensaje al que responderle... raro');
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

    function guardaBaseMensaje(nombreSistema, mensaje, page_id, accct, cback){
	var criterio = {'id': mensaje.id};
	classdb.existefind(nombreSistema+'_consolidada', criterio, 'solicitudes/getautofi/guardaBaseMensaje', function(existe) {
	    if (existe === 'error' || existe === 'existe') {
		return cback(existe);
	    }
	    else {
	    	//coleccion, criterio, sort, metodo, callback
	    	if( Date.parse(mensaje.created_time) > Date.parse(accct) ){
	    	    // console.log('Lo guardamos por que es mayor a la fecha');
	    	    var fotopath = globales.fbapiversion+mensaje.from.id+'/picture?redirect=false';
		    requestGraph(fotopath, function(foto){
			if (foto === 'error') {
			    mensaje.foto = '';
			    classdb.inserta(nombreSistema+'_consolidada', mensaje, 'solicitudes/getautofi/guardaBaseMensaje', function(inserta) {
				if (mensaje.from.id === page_id) {
				    verificaRespuestas(nombreSistema, page_id, mensaje, function(risposta){
					console.log('verificaRespuestas '+risposta);
				    });
				}
				else {
				    nueMens(mensaje.created_time, 'facebook_inbox', nombreSistema);
				}
				return cback(inserta);
			    });			
			}
			else {
			    mensaje.foto = foto.data.url;
			    classdb.inserta(nombreSistema+'_consolidada', mensaje, 'solicitudes/getautofi/guardaBaseMensaje', function(inserta) {
				if (mensaje.from.id === page_id) {
				    verificaRespuestas(nombreSistema, page_id, mensaje, function(risposta){
					console.log('verificaRespuestas '+risposta);
				    });
				}
				else{
				    nueMens(mensaje.created_time, 'facebook_inbox', nombreSistema);
				}
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

    function insertaMensajes(nombreSistema, messages, page_id, account_cretime, index, cback){
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
			    console.log('solicitudes/getautofi/insertaMensajes - '+resp);
			    return insertaMensajes(nombreSistema, messages, page_id, account_cretime, more, cback);
			}
			else {
			    // console.log('solicitudes/getautofi/insertaMensajes - el mensaje '+messages[index].id+' es nuevo, insertamos');
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

    function procesaMensajes(nombreSistema, updated_time, conv_id, conv_link, mensajes, index, mensajesarray, cback) {
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

    function mensajesDeConversacion(nsys, pag_id, a_ctime, conversacion, cback) {
	var updated_time = new Date(conversacion.updated_time.replace('+','.'));
	var conv_id = conversacion.id;
	var conv_link = 'https://www.facebook.com'+conversacion.link;
	procesaMensajes(nsys, updated_time, conv_id, conv_link, _(conversacion.messages.data).reverse().value(), 0, [], function(mensajesprocesados){
	    insertaMensajes(nsys, mensajesprocesados, pag_id, a_ctime, 0, function(resultados){
		if (resultados === 'insertm_fin_ok') {
		    cback('ok');
		}
	    });		
	});
    }

    function procesaConversaciones(nombreSistema, page_id, actime, conversaciones, index, callback) {
	var more = index+1;
	var cuantasc = conversaciones.length;
	if (more > cuantasc) {
	    return callback('getautofi ok');
	}
	else {
	    setImmediate(function() {
		if (typeof conversaciones[index] !== 'undefined') {
		    mensajesDeConversacion(nombreSistema, page_id, actime, conversaciones[index], function(conv){
			return procesaConversaciones(nombreSistema, page_id, actime, conversaciones, more, callback);
		    });
		}
		else {
		    return procesaConversaciones(nombreSistema, page_id, actime, conversaciones, more, callback);
		}
	    });
	}
    }

    function obtieneInboxes(accounts, accountTokens, index, callback) {
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
		    var cta_access_tokens = accountTokens[indice];
		    var cta_elegida = cta_access_tokens[Math.floor(Math.random()*cta_access_tokens.length)];
		    var access_page = cta_elegida.access_token;
		    var derpath = globales.fbapiversion+globales.path_me_convs_limit+'&access_token='+access_page;
		    requestGraph(derpath, function(theinbox) {
			if (theinbox === 'error' || typeof theinbox.data === 'undefined' || theinbox.data.length < 1) {
			    console.log('solicitudes/getautofi/obtieneInboxes - Error al conseguir inbox para: '+nombreSistema);
			    return obtieneInboxes(accounts, accountTokens, more, callback);
			}
			else {
			    procesaConversaciones(nombreSistema, page_id, cta_created_time, theinbox.data, 0, function(procconv) {
				console.log(nombreSistema +' '+ procconv);
				return obtieneInboxes(accounts, accountTokens, more, callback);				
			    });    			    
			}
		    });
		}
		else {
		    return obtieneInboxes(accounts, accountTokens, more, callback);
		}
	    });
	}
    }

    var ctascriterio = {$and: [{datosPage:{$exists: true}}, {datosPage: {$ne: ''}}, {'datosPage.id':{$exists: true}}]};
    classdb.buscarToArray('accounts', ctascriterio, {nombreSistema: 1}, 'solicitudes/getautomu.main', function(cuentas){
	console.log('**************** solicitudes/getautofi/GET - getFacebooInbox de todas las cuentas conectadas a facebook *****************');
	if (cuentas === 'error' || cuentas.length < 1) {
	    res.jsonp('error');
	}
	else {
	    obtieneUsuariosDeCuentas(cuentas, 0, [], {}, function(ctas, ctasusers){
		checaAccessTokens(ctas, ctasusers, 0, [], {}, function(accts, acctks) {
		    obtieneInboxes(accts, acctks, 0, function(resultado) {
			console.log('getautofi ok');
		    });
		    var texti = 'se pedirán inbox para: '+accts.join();
		    res.jsonp(texti);
		});
	    });
	}
    });
});

module.exports = router;
