/* solicitudes/getof/GET - Obtiene Fans */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var perm_at = 'access_token=CAAEdYZBfZAiQQBAMBUfQRMGz7JZA9mYGl2CHTGkYiuiksY5pUopVA5ziakb81qHxpDbZAsouC44ZC848ANlZAfeu7mQg1en9NiopJBqt6OxSMzs41pVxJUxnroyUaujJjXfHPFUmgcl4Xm381KWDp0G53rQnZAbTggjt2Au3CLQQByMOjHfDbfPXOoe0Q0kh24ZCzZAjHOSB6hTYFa8PvmKI7';
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET obtieneFans. */
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
		    console.log('solicitudes/getom/requestAT - error en access_token: '+access_token);
		    return callbback('error');
		}
		else {
		    return callback(access_token);
		}
	    });
	});
	solicitud.end();
	solicitud.on('error', function(err){
	    console.log('solicitudes/getof/requestAT - error en el request: '+err);
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
	    var pathcontoken = path+'?'+token;
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getof/requestGraph - hubo un error en solicitud al graph: '+ pathcontoken);
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
	    /*
	    solicitud.setTimeout(10000, function(to){
		console.log('timeouteó...');
		console.log(to);
	    });
	     */
	    solicitud.end();
	    solicitud.on('error', function(e){
		console.log('solicitudes/getof/requestGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getof/requestGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    function requestGraphConPAT (path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var pathcontoken = path+'?'+perm_at;
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getof/requestGraphConPAT - hubo un error en solicitud al graph: '+ pathcontoken);
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
		console.log('solicitudes/getof/requestGraphConPAT - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getof/requestGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
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
 	classdb.buscarToStream('accounts', criterio, elsort, 'solicitudes/getof/getCuentas', function(cuentas){
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
	    setImmediate(function() {
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
		classdb.buscarToArrayLimit(coleccion, {}, {}, 1, 'solicitudes/getof/procesaCuentas', function(items) {
		    if (items === 'error') {
			console.log('solicitudes/getof/procesaCuentas - error en el find');
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
			    classdb.inserta(coleccion, objeto, 'solicitudes/getof/procesaCuentas', function(inserte) {
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
		if (crecimientos[index1].round_fans > crecimientos[index2].round_fans) {
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
	var round = crecimiento.round_fans+1;
	var elset = {round_fans : round };
	classdb.actualiza(colec, criterium, elset, 'solicitudes/getof/aumentacrecimiento', function(respu) {
	    if (respu === 'error') {
		console.log('solicitudes/getof/aumentacrecimiento - error al actualizar el round');
		return callback('error');
	    }
	    else {
		return callback('ok');
	    }
	});
    }

    function guardaFans(crecimiento, losfans, callback) {
	var lahora = new Date();
	var lacuenta = crecimiento.cuenta;
	var page_id = crecimiento.page_id;
	var lacolec = lacuenta+'_fans_ahora';
	var elcriterio = {cuenta: lacuenta, page_id: page_id};
	var objetoinsert = {cuenta: lacuenta, page_id: page_id, hora: lahora, fans: losfans};
	var objetoupdate = {hora: lahora, fans: losfans};
	var round = crecimiento.round_fans+1;
	var colec = lacuenta+'_crecimiento_rounds';
	var criterium = { cuenta : lacuenta };
	var elset = {round_fans : round };
	
	classdb.buscarToArray(lacolec, elcriterio, {}, 'solicitudes/getof/guardaFans', function(items){
	    if (items === 'error') {
		return callback('error');
	    }
	    else {
		if (items.length > 0) {
		    classdb.actualiza(lacolec, elcriterio, objetoupdate, 'solicitudes/getof/guardaFans', function(updati){
			classdb.actualiza(colec, criterium, elset, 'solicitudes/getof/guradaFans', function(respu) {
			    return callback(respu);
			});
		    });
		}
		else {
		    classdb.inserta(lacolec, objetoinsert, 'solicitudes/getof/guardaFans', function(inserte){
			classdb.actualiza(colec, criterium, elset, 'peticiones/obtieneShares/guardaFans', function(respu) {
			    return callback(respu);
			});
		    });
		}
	    }
	});
    }

    console.log('**************** solicitudes/getof/GET - obtieneFans ****************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error') {
	    console.log('solicitudes/getof.main - error al buscar las cuentas');
	    res.jsonp('error');
	}
	else {
	    if (cuentas.length < 1) {
		console.log('solicitudes/getof.main - no había cuentas conectadas a facebook');
		res.jsonp('error');
	    }
	    else {
		getAppAT(function(token){
		    if (token === 'error') {
			console.log('solicitudes/getof.main - sin access_token');
			res.jsonp('error');
		    }
		    else {
			procesaCuentas(cuentas, 0, [], function(crecimientos){
			    if (typeof crecimientos.cuenta !== 'undefined') {
				console.log('solicitudes/getof.main - es un objeto de crecimiento nuevo');
				var crecimiento = crecimientos;
				var elpath = globales.fbapiversion+crecimiento.page_id;
				requestGraph(token, elpath, function(resp_graph){
				    if (resp_graph === 'error') {
					aumentacrecimiento(crecimiento, function(resul){
					    if (resul === 'error') {
						console.log('solicitudes/getof.main/objeto/resp_graph - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					    else {
						console.log('solicitudes/getof.main/objeto/resp_graph - no conseguimos los likesde la fanpage: '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					});
				    }
				    else {
					var diefansen = resp_graph.likes;
					guardaFans(crecimiento, diefansen, function(respuesta){
					    res.jsonp(respuesta);
					});
				    }
				});
			    }
			    else {
				console.log('es un arreglo de objetos de crecimiento');
				if (Object.prototype.toString.call(crecimientos) === '[object Array]' && crecimientos.length > 0) {
				    // es un arreglo de crecimientos
				    siguienteCrecimiento(crecimientos, 0, 1, function(crecimiento){
					if (crecimiento.page_id === '') {
					    var page_id = '';
					    for (var jkl in cuentas) {
						if (cuentas[jkl].nombreSistema === crecimiento.cuenta) {
						    page_id = cuentas[jkl].idPage;
						    var coleccione = crecimiento.cuenta+'_crecimiento_rounds';
						    var criterius = { cuenta : crecimiento.cuenta };
						    var daset = { page_id : page_id };
						    classdb.actualiza(coleccione, criterius, daset, 'solicitudes/getof.main', function(actualiza){
							var derpathen = globales.fbapiversion+page_id;
							requestGraph(token, derpathen, function(resp_graph){
							    if (resp_graph === 'error') {
								aumentacrecimiento(crecimiento, function(resul){
								    if (resul === 'error') {
									console.log('solicitudes/getof.main/array1/resp_graph - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
									res.jsonp('error');
								    }
								    else {
									console.log('solicitudes/getof.main/array1/resp_graph - no conseguimos los likesde la fanpage: '+crecimiento.cuenta);
									res.jsonp('error');
								    }
								});
							    }
							    else {
								var lesfans = resp_graph.likes;
								guardaFans(crecimiento, lesfans, function(respuesta){
								    res.jsonp(coleccione+' getof '+respuesta);
								});
							    }
							});
						    });
						}
					    }
					}
					else {
					    var elpath = globales.fbapiversion+crecimiento.page_id;
					    requestGraph(token, elpath, function(resp_graph){
						if (resp_graph === 'error') {
						    aumentacrecimiento(crecimiento, function(resul){
							if (resul === 'error') {
							    console.log('solicitudes/getof.main/array2/resp_graph - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
							    res.jsonp('error');
							}
							else {
							    console.log('solicitudes/getof.main/array2/resp_graph - no conseguimos los likesde la fanpage: '+crecimiento.cuenta);
							    res.jsonp('error');
							}
						    });
						}
						else {
						    var diefansen = resp_graph.likes;
						    guardaFans(crecimiento, diefansen, function(respuesta){
							res.jsonp(crecimiento.cuenta+' getof '+respuesta);
						    });
						}
					    });
					}
				    });
				}
				else {
				    // es un arreglo vacío o no es un arreglo
				    console.log('solicitudes/getof.main - no es un arreglo o venía vacío');
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
