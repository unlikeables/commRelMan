/* solicitudes/getos/GET - Obtiene Shares */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var perm_at = 'access_token=CAAEdYZBfZAiQQBAMBUfQRMGz7JZA9mYGl2CHTGkYiuiksY5pUopVA5ziakb81qHxpDbZAsouC44ZC848ANlZAfeu7mQg1en9NiopJBqt6OxSMzs41pVxJUxnroyUaujJjXfHPFUmgcl4Xm381KWDp0G53rQnZAbTggjt2Au3CLQQByMOjHfDbfPXOoe0Q0kh24ZCzZAjHOSB6hTYFa8PvmKI7';
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    // Graph - solicitamos accessToken a facebook
    function requestAT(callback) {
	var access_token;	
	globales.options_graph.method = 'GET';
	globales.options_graph.path = globales.fbapiversion+globales.path_app_at;
	var solicitud = https.request(globales.options_graph, function(respi) {
	    respi.setEncoding('utf8');
	    respi.on('data', function(dati) {
		access_token += dati;
	    });
	    respi.on('end', function() {
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
	solicitud.on('error', function(err){
	    console.log('solicitudes/getos/requestAT - error en el request: '+err);
	    return callback('error');
	});
    }

    function getAppAT(callback) {
	classdb.buscarToArray('verifica_at', {}, {}, 'solicitudes/getom/getAppAT', function(items){
	    if (items === 'error') {
		return callback(items);
	    }
	    else {
		if (items.length < 1) {
		    // no existe access_token en bd, lo pedimos a fb
		    requestAT(function(at) {
			if (at === 'error' || typeof at === 'undefined' || typeof at.access_token === 'undefined') {
			    // hubo un error, no access token, gosh
			    console.log('solicitudes/getom/getAppAT - error en solicitud de access_token a facebook');
			    return callback('error');
			}
			else {
			    var objeto = {};
			    objeto = { at: 'access_token='+at.access_token, ts: new Date() };
			    classdb.inserta('verifica_at', objeto, 'solicitudes/index/getAppAT', function(respuesta){
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
				console.log('solicitudes/getom/getAppAT - error en solicitud de access_token a facebook para updatear');
				return callback('error');
			    }
			    else {
				// hubo respuesta por parte de facebook
				var criterio_actualizacion = {_id:items[0]._id};
				var objeto = {};
				objeto = { at: 'access_token='+at.access_token, ts: new Date() };
				classdb.actualiza('verifica_at', criterio_actualizacion, objeto, 'solicitudes/getol/getAppAT', function(respuestau) {
				    if(respuestau === 'error') {
					return callback('error');
				    }
				    else {
					return callback('access_token='+at.access_token);
				    }
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

    function requestGraph(token, path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var pathcontoken = path+'&'+token;
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getos/requestGraph - hubo un error en solicitud al graph: '+ pathcontoken);
			console.log(JSON.stringify(contenido.error));
			requestGraphConPAT(path, function(respuestaPAT){
			    if (respuestaPAT === 'error') {
				return callback('error');
			    }
			    else {
				return callback(respuestaPAT);
			    }
			});

		    }
		    else {
			return callback(contenido);
		    }
		});
	    });
	    solicitud.end();
	    solicitud.on('error', function(e){
		console.log('solicitudes/getos/requestGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getos/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    function requestGraphConPAT (path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var pathcontoken = path+'&'+perm_at;
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getos/requestGraphConPAT - hubo un error en solicitud al graph: '+ pathcontoken);
			console.log(JSON.stringify(contenido.error));
			return callback('error');
		    }
		    else {
			return callback(contenido);
		    }
		});
	    });
	    solicitud.end();
	    solicitud.on('error', function(e){
		console.log('solicitudes/getos/requestGraphConPAT - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getos/requestGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    //Funcion que obtiene las cuentas
    function getCuentas(callback) {
	var criterio = {$or: [
   	    {$and: [
	   	{'datosMonitoreo' : {$exists : true}},
   		{'datosMonitoreo' : {$ne : ''}},
   		{'datosMonitoreo.id' : {$ne : ''}}
   	    ]},
   	    {$and: [
   		{'datosPage' : {$exists : true}},
		{'datosPage': {$ne : ''}},
		{'datosPage.id' : {$ne : ''}}
   	    ]}
   	]};
	var elsort = { nombreSistema : 1 };
 	classdb.buscarToStream('accounts', criterio, elsort, 'solicitudes/getos/getCuentas', function(cuentas){
	    if (cuentas === 'error') {
		return callback(cuentas);
	    }
	    else {
		refinaCuentas(cuentas, 0, [], function(refinadas){
		    return callback(refinadas);
		});
	    }
	});
    }

    function refinaCuentas(cuentas, index, ctasrefinadas, callback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantasc = cuentas.length;
	if (more > cuantasc) {
	    return callback(ctasrefinadas);
	}
	else {
	    setImmediate(function(){
		var datosSistema = {};
		var tieneMonitoreo = cuentas[index].hasOwnProperty('datosMonitoreo');
   		if(tieneMonitoreo === true) {
   		    datosSistema = {
			nombreSistema : cuentas[index].nombreSistema,
			idPage : cuentas[index].datosMonitoreo.id
   		    };
		    ctasrefinadas.push(datosSistema);
		    return refinaCuentas(cuentas, more, ctasrefinadas, callback);
   		} else {
		    if (typeof cuentas[index].datosPage !== 'undefined' && typeof cuentas[index].datosPage.id !== 'undefined') {
   			datosSistema = {
			    nombreSistema : cuentas[index].nombreSistema,
			    idPage : cuentas[index].datosPage.id
   			};
			ctasrefinadas.push(datosSistema);
			return refinaCuentas(cuentas, more, ctasrefinadas, callback);
		    }
		    else {
			return refinaCuentas(cuentas, more, ctasrefinadas, callback);
		    }
		}
	    });
	}
    }

    function procesaCuentas(cuentas, index, arrayctas, callback){
		if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var more = index+1;
	var cuantasc = cuentas.length;
	if (more > cuantasc) {
	    return callback(arrayctas);
	}
	else {
	    setImmediate(function(){
		var coleccion = cuentas[index].nombreSistema+'_crecimiento_rounds';
		classdb.buscarToArrayLimit(coleccion, {}, {}, 1, 'solicitudes/getos/procesaCuentas', function(items) {
		    if (items === 'error') {
			console.log('solicitudes/getos/procesaCuentas - error en el find');
			return procesaCuentas(cuentas, more, arrayctas, callback);
		    }
		    else {
			if (items.length < 1) {
			    var objeto = {
				cuenta : cuentas[index].nombreSistema,
				page_id: cuentas[index].idPage,
				round_fans: 0,
				round_likes: 0,
				last_likes: 0,
				round_comments: 0, 
				last_comments: 0,
				round_shares: 0,
				last_shares: 0,
				round_tweets: 0,
				round_propios: 0, // tweets: retweet_count, favorited
				last_propios: 0
			    };
			    classdb.inserta(coleccion, objeto, 'solicitudes/getos/procesaCuentas', function(inserte) {
				return callback(objeto);  
			    });
			}
			else {
			    arrayctas.push(items[0]);
			    return procesaCuentas(cuentas, more, arrayctas, callback);
			}
			
		    }
		});
	    });
	}
    }

    function siguienteCrecimiento(crecimientos, index1, index2, callback) {
	var mas = index1+1;
	var mehr = index2+1;
	var cuantosc = crecimientos.length;
	if (mehr > cuantosc) {
	    return callback(crecimientos[0]);
	}
	else {
	    setImmediate(function() {
		if (crecimientos[index1].round_shares > crecimientos[index2].round_shares) {
		    // el de index2 es el bueno
		    return callback(crecimientos[index2]);
		}
		else {
		    return siguienteCrecimiento(crecimientos, mas, mehr, callback);
		}
	    });
	}
    }

    function aumentacrecimiento(crecimiento, callback) {
	var lacuenta = crecimiento.cuenta;
	var colec = lacuenta+'_crecimiento_rounds';
	var criterium = { cuenta : lacuenta };
	var last = crecimiento.last_shares;
	var round = crecimiento.round_shares+1;
	var elset = {last_shares : last, round_shares : round };
	classdb.actualiza(colec, criterium, elset, 'solicitudes/getos/aumentacrecimiento', function(respu) {
	    if (respu === 'error') {
		console.log('solicitudes/getos/aumentacrecimiento - error al actualizar el round');
		return callback('error');
	    }
	    else {
		return callback('ok');
	    }
	});
    }

    function getShares(token, crecimiento, totalp, posts, index, callback) {
	var mais = index+1;
	var lacuenta = crecimiento.cuenta;
	var lacoleccion = lacuenta+'_fb_publicaciones';
	var maximo = 20;
	if (crecimiento.last_shares+20 > totalp) { maximo = totalp; } else { maximo = crecimiento.last_shares+20; }
	if (mais > maximo) {
	    var last = maximo;
	    if (maximo === totalp) {
		last = 0;
	    }
	    var round = crecimiento.round_shares+1;
	    var colec = lacuenta+'_crecimiento_rounds';
	    var criterium = { cuenta : lacuenta };
	    var elset = {last_shares : last, round_shares : round };
	    classdb.actualiza(colec, criterium, elset, 'solicitudes/getos/getShares', function(respu) {
		if (respu === 'error') {
		    console.log('solicitudes/getos/getShares - error al actualizar el round');
		    return callback('getShares-done');
		}
		else {
		    return callback('getShares-done');
		}
	    });
	}
	else {
	    setImmediate(function() {
		var elpath = globales.fbapiversion+posts[index].id+'?fields=shares';
		requestGraph(token, elpath, function(resp_graph) {
		    if (resp_graph === 'error') {
			console.log('solicitudes/getos/getShares - no conseguimos los shares con el app_access_token para el post: '+posts[index].id);
			return getShares(token, crecimiento, totalp, posts, mais, callback);
		    }
		    else {
			if (typeof resp_graph.shares === 'undefined') {
			    console.log('solicitudes/getos/getShares - el summary del post: '+posts[index].id+', venía vacío');
			    return getShares(token, crecimiento, totalp, posts, mais, callback);
			}
			else {
			    var cuentashares = resp_graph.shares.count;
			    var criterio = { id : posts[index].id };
			    var elset = { shares : { count : cuentashares }};
			    classdb.actualiza(lacoleccion, criterio, elset, 'solicitudes/getos/getShares', function(respuesta){
				if (respuesta === 'error') {
				    console.log('solicitudes/getos/getShares - error al actualizar el post '+posts[index].id);
				    return getShares(token, crecimiento, totalp, posts, mais, callback);
				}
				else {
				    return getShares(token, crecimiento, totalp, posts, mais, callback);
				}
			    });
			}
		    }
		});
	    });
	}
    }
    
    console.log('****************** solicitudes/getos/GET obtieneShares ********************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error') {
	    console.log('solicitudes/getos.main - error al buscar las cuentas');
	    res.jsonp('error');
	}
	else {
	    if (cuentas.length < 1) {
		console.log('solicitudes/getos.main - no había cuentas conectadas a facebook');
		res.jsonp('error');
	    }
	    else {
		getAppAT(function(token){
		    if (token === 'error') {
			console.log('solicitudes/getos.main - sin access_token');
			res.jsonp('error');
		    }
		    else {
			procesaCuentas(cuentas, 0, [], function(crecimientos){
			    if (typeof crecimientos.cuenta !== 'undefined') {
				console.log('solicitudes/getos.main - es un objeto de crecimiento nuevo');
				var crecimiento = crecimientos;
				classdb.count(crecimiento.cuenta+'_fb_publicaciones', {}, 'peticiones/obtieneComments.main', function(howmany){
				    if (howmany === 'error') {
					aumentacrecimiento(crecimiento, function(resul){
					    if (resul === 'error') {
						console.log('solicitudes/getos.main/objeto/howmany - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					    else {
						console.log('solicitudes/getos.main/objeto/howmany - error en el count de las publicaciones para '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					});
				    }
				    else {
					classdb.buscarToArray(crecimiento.cuenta+'_fb_publicaciones', {}, { created_time: 1 }, 'peticiones/obtieneComments.main', function(posts){
					    if (posts === 'error') {
						aumentacrecimiento(crecimiento, function(resul){
						    if (resul === 'error') {
							console.log('solicitudes/getos.main/objeto/posts - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
							res.jsonp('error');
						    }
						    else {
							console.log('solicitudes/getos.main/objeto/posts - error al conseguir publicaciones para '+crecimiento.cuenta);
							res.jsonp('error');
						    }
						});
					    }
					    else {
						if (posts.length > 0) {
						    getShares(token, crecimiento, howmany, posts, crecimiento.last_shares, function(resultado){
							res.jsonp(crecimiento.cuenta+' getos ok');
						    });
						}
						else {
						    console.log('solicitudes/getos.main - no hay publicaciones externas que procesar para '+crecimiento.cuenta);
						    var round = crecimiento.round_shares+1;
						    var colec = crecimiento.cuenta+'_crecimiento_rounds';
						    var criterium = { cuenta : crecimiento.cuenta };
						    var elset = {last_shares : 0, round_shares : round };
						    classdb.actualiza(colec, criterium, elset, 'peticiones/obtieneLikes/getLikes', function(respu) {
							if (respu === 'error') {
							    console.log('peticiones/obtieneLikes/getLikes - error al actualizar el round');
							    res.jsonp('error');
							}
							else {
							    res.jsonp(crecimiento.cuenta+' getos ok');
							}
						    });
						}
					    }
					});				
				    }
				});
			    }
			    else {
				console.log('es un arreglo de objetos de crecimiento');
				if (Object.prototype.toString.call(crecimientos) === '[object Array]' && crecimientos.length > 0) {
				    // es un arreglo de crecimientos
				    siguienteCrecimiento(crecimientos, 0, 1, function(crecimiento){
					classdb.count(crecimiento.cuenta+'_fb_publicaciones', {}, 'solicitudes/getos.main', function(howmany){
					    if (howmany === 'error') {
						aumentacrecimiento(crecimiento, function(resul){
						    if (resul === 'error') {
							console.log('solicitudes/getos.main/array/howmany - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
							res.jsonp('error');
						    }
						    else {
							console.log('solicitudes/getos.main/array/howmany - error en el count de las publicaciones para '+crecimiento.cuenta);
							res.jsonp('error');
						    }
						});
					    }
					    else {
						classdb.buscarToArray(crecimiento.cuenta+'_fb_publicaciones', {}, { created_time: 1 }, 'solicitudes/getos.main', function(posts){
						    if (posts === 'error') {
							aumentacrecimiento(crecimiento, function(resul){
							    if (resul === 'error') {
								console.log('solicitudes/getos.main/array/posts - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
								res.jsonp('error');
							    }
							    else {
								console.log('solicitudes/getos.main/array/posts - error al conseguir publicaciones para '+crecimiento.cuenta);
								res.jsonp('error');
							    }
							});
						    }
						    else {
							if (posts.length > 0) {
							    getShares(token, crecimiento, howmany, posts, crecimiento.last_shares, function(resultado){
								res.jsonp(crecimiento.cuenta+' getos ok');
							    });
							}
							else {
							    console.log('solicitudes/getos.main - no hay publicaciones externas que procesar para '+crecimiento.cuenta);
							    var round = crecimiento.round_shares+1;
							    var colec = crecimiento.cuenta+'_crecimiento_rounds';
							    var criterium = { cuenta : crecimiento.cuenta };
							    var elset = {last_shares : 0, round_shares : round };
							    classdb.actualiza(colec, criterium, elset, 'peticiones/obtieneLikes/getLikes', function(respu) {
								if (respu === 'error') {
								    console.log('peticiones/obtieneLikes/getLikes - error al actualizar el round');
								    res.jsonp('error');
								}
								else {
								    res.jsonp(crecimiento.cuenta+' getos ok');
								}
							    });
							}
						    }
						});				
					    }
					});
				    });
				}
				else {
				    // es un arreglo vacío o no es un arreglo
				    console.log('solicitudes/getos.main - no es un arreglo o venía vacío');
				    console.log(crecimientos);
				    res.json('error');
				}
			    }
			});
		    }
		});
	    }
	}
    });
});

module.exports = router;
