/* solicitudes/getpb/GET - Publicaciones */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var perm_ats = ['CAAEdYZBfZAiQQBAIuHZBQb7LLSmW4ZCz6zC2ZBTnXTaPURhODVN6wuJ9qbygbypHyOPIETjoh3ZBOdlGjj4T34vfwBFH5rNHSmWUmZBXi3ryTAmenVriG97N68TetxZC8cVJKBrLBW5ZAynArKC8mXVibIVsd9OuZCu7nneygXSl6NWLvDwDdNFfWHANKen3CZCAAunogMXZAgmAz6LFRdRslPNr','CAAEdYZBfZAiQQBADZBSFYxcHLG1sDgXvwzN4L0nKz6TZBJlA7ohRQeqO7hrfDswJ3BE8stmbswkWpkxWqYWOtf2Yrza0xx4HqLleoO0njypvwYtnqbzMQxDrXUXjjScb7hfFnKPefrouA8b7McELohHf6RQjBGcROPVARY6lWRR3nfBPQMRG9RURTnO1jeYGiZAZCPTtLd4DVQI70YgqiC','CAAEdYZBfZAiQQBAIaOefmFpdefZC6iyUK9Pc0z51rGCn4m4HpqlCSPy8tUN43dN419BfQswZCwUDXFyXJIZA8Cm4IWHQF3rQzvLoBM2J4fFcw23dDqg8BPGz1deav4QSw3TMhcttsuXIXAOSiKfYrJVBLig708nMGHIoSf130whWZBHX8LHBSof25OU4ZBWzZAJ4Ml79569ZAVuNBRBHbEEWt','CAAEdYZBfZAiQQBAEPC6hzXH59OqrmZA4Hfnk879LGlL2fWQpacgEWiQhahLfWayFaBlumNFVF7CwTrCLErYV5OSj6MQP9TZC59DsAd3MWgr2TisZCDATErNIVwwLDPToJUcTIZB55uyNXiHdY8Gug2BqUAuLxSGYZCg5k5C0sMy4K4Uxdd0tOStp0CznnVWcd35OfIesZCxgyZCg1LrTS3dsF','CAAEdYZBfZAiQQBAItGs2NiOata5MnTCb8TXrXBjehoTLB2EwZC5RpB7LuCoBHnCRhzpcBZAIa5UsgR3zg8VU78fwSjpZBZAT8hnwREUqLWY2HalVfuRllE5j4zi35SMS2YU62s11NWRn9sLPi7uHXAC1D102Q5qjWGoAp9UAxXBiQMx0JAseZB1ikZCilNeI348m0MnT11rrEU5FTvUnkshv','CAAEdYZBfZAiQQBAPfxCHw8LLnedtc9BUPcArUm7GCoeZCiJmhwbK2XTQFqOFDH4bXMB668mUZBuePJGmkZCvgZAt6xZC0KfAHdhykLt7LmvfZAyUU2L1ZBvxT7ch8LPuPptCkf37NKQxRHBYLVhVl0qXlDwUMnf8uxvUxYCWMq49R7EtMCJveP5Vy76LkcmZAqKpmU4IarifDBfuAYrLSfOkc9','CAAEdYZBfZAiQQBAHuXudnr8pLWT6S5dfcZAQoB8hBzvd6ezHZC8vdXOrOcZBMMSccXyzv9UGciKET39lwhIAgIzkWywLaWgpOMQc9jhqNxdpPM5ecGZC92KRAGsdt0OM0k6aogMZCL5ejZAGCwZC6AIfZCvzvvdZClWcQIUXvJDGY23q14BPB9wavtb2XbWirGxhZAKalZBSh4e8oZC5HSr1v24r7K','CAAEdYZBfZAiQQBAHRm8NAV3JcAA0UR1SKl2xIZBeOSlPkAI046mGqbauQSpYabP5SwRfxMkUbybivWPhEnV7Y7KMqLHRiy0ZCDk62mn5zmXdIj6oYts3JMavFOsLPakteBrXwMDsjxBLQRXFrpZBraQ0KForDU55Msc362x5MWZB7zxGdbuJR1elMQkOXwAuDgHfcMZCZBxRxOzIkLdk1eKP'];
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET getPublicaciones */
router.get('/', function(req, res, next) {
    // request al graph con algún token de usuario
    function reqGraphConPAT(path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var at_elegido = perm_ats[Math.floor(Math.random()*perm_ats.length)];
	    var pathcontoken = path+'&access_token='+at_elegido;
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getpb/reqGraphConPAT - hubo un error en solicitud al graph: '+ pathcontoken);
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
		console.log('solicitudes/getpb/reqGraphConPAT - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getoc/reqGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    // request al graph con app-token
    function reqGraph(token, path, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var pathcontoken = '';
	    if ( token === 'not' ) { pathcontoken = path; }
	    else { pathcontoken = path+'&'+token; }
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			console.log('solicitudes/getpb/reqGraph - hubo un error en solicitud al graph: '+ pathcontoken);
			console.log(JSON.stringify(contenido.error));
			reqGraphConPAT(path, function(respconPAT){
			    if (respconPAT === 'error') {
				return callback('error');
			    }
			    else {
				return callback(respconPAT);
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
		console.log('solicitudes/getpb/reqGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getpb/reqGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    // Reduce los objetos de las cuentas a solamente nombreSistema y idPage
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
 	classdb.buscarToStream('accounts', criterio, {}, 'solicitudes/getpb/getCuentas', function(cuentas){
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

    // obtiene access-token de app conectándose a facebook
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
	    console.log('solicitudes/getpb/requestAT - error en el request: '+err);
	    return callback('error');
	});
    }

    // revisa si existe el access-token y qué tanto tiempo tiene que lo guardamos, si es más de una hora, volvemos a pedirlo.
    function getAppAT(callback) {
	classdb.buscarToArray('verifica_at', {}, {}, 'solicitudes/getpb/getAppAT', function(items){
	    if (items === 'error') {
		return callback(items);
	    }
	    else {
		if (items.length < 1) {
		    // no existe access_token en bd, lo pedimos a fb
		    requestAT(function(at) {
			if (at === 'error') {
			    // hubo un error, no access token, gosh
			    console.log('solicitudes/getpb/getAppAT - error en solicitud de access_token a facebook');
			    return callback('error');
			}
			else {
			    if (typeof at === 'undefined' || typeof at.access_token === 'undefined') {
				// access_token llegó vacío, damn y wtf?
				console.log('solicitudes/getpb/getAppAT - facebook no mandó access token');
				return callback('error');
			    }
			    else {
				var objeto = {};
				objeto = { at: 'access_token='+at.access_token, ts: new Date() };
				classdb.inserta('verifica_at', objeto, 'solicitudes/index/getAppAT', function(respuesta){
				    return callback('access_token='+at.access_token);
				});
			    }
			}
		    });		    
		}
		else {
		    var ts = items[0].ts.getTime();
		    var tsm1 = (ts) + 3600000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			requestAT(function(at) {
			    if (at === 'error') {
				// no hubo respuesta por parte de facebook o hubo un error, no access token
				console.log('solicitudes/getpb/getAppAT - error en solicitud de access_token a facebook para updatear');
				return callback('error');
			    }
			    else {
				if (typeof at === 'undefined' || typeof at.access_token === 'undefined') {
				    // access_token venía vacío, damn
				    console.log('solicitudes/getpb/getAppAT - facebook no mandó access token para updatear');
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

    //Función que verifica la existencia del post
    function verificaExistenciaPost(nombreSistema, post, callback) {
	var criterio = {'id': post.id};
	classdb.existecount(nombreSistema+'_fb_publicaciones', criterio, 'solicitudes/getpb/verificaExistenciaPost', function(respuesta){
	    return callback(respuesta);
	});
    }

    //Función que realiza la inserción a la base de datos
    function insertaPublicacion(nombreSistema, post, callback){
	var c_time = post.created_time;
	var tstamp = c_time.replace('+','.');
	post.created_time = new Date(tstamp);	
	classdb.inserta(nombreSistema+'_fb_publicaciones', post, 'solicitudes/getpb/insertaPublicacion', function(inserta){
	    return callback(inserta);
	});
    }

    // para cada post de esta cuenta, verificamos si ya existe, luego pedimos sus attachments, y finalmente lo insertamos.
    function desglosaPosts(token, nombreSistema, posts, index, callback){
    	var cuantosp=posts.length;
    	var more = index+1;
	if (more > cuantosp) {
	    return callback('posts de '+nombreSistema+' ok');
	}
	else {
	    setImmediate(function(){
		if (typeof posts[index].comments !== 'undefined') { delete posts[index].comments; }
		if (typeof posts[index].likes !== 'undefined'){ delete posts[index].likes; }
		verificaExistenciaPost(nombreSistema, posts[index], function(existe) {
		    if (existe === 'error' || existe === 'existe') {
			return desglosaPosts(token, nombreSistema, posts, more, callback);		    
		    }
		    else {
			posts[index].tipo = 'post';
			posts[index].subtipo = posts[index].type;

			if (typeof posts[index].attachments !== 'undefined' &&
			    typeof posts[index].attachments.data !== 'undefined' &&
			    posts[index].attachments.data[0].length > 0 &&
			    typeof posts[index].attachments.data[0].media !== 'undefined' &&
			    typeof posts[index].attachments.data[0].media.image !== 'undefined' &&
			    typeof posts[index].attachments.data[0].media.image.src !== 'undefined') {
			    posts[index].image_attachment = posts[index].attachments.data[0].media.image.src;
			}
			if (typeof posts[index].attachments !== 'undefined' &&
			    typeof posts[index].attachments.data !== 'undefined' &&
			    posts[index].attachments.data[0].length > 0 &&
			    typeof posts[index].attachments.data[0].target !== 'undefined' &&
			    typeof posts[index].attachments.data[0].target.url !== 'undefined') {
			    posts[index].link_attachment = posts[index].attachments.data[0].target.url;
			}

			insertaPublicacion(nombreSistema, posts[index], function(respuesta){
			    if (respuesta === 'error') {
				console.log('solicitudes/getpb/desglosaPosts - error al insertar publicación: '+nombreSistema);
				return desglosaPosts(token, nombreSistema, posts, more, callback);
			    }
			    else {
				return desglosaPosts(token, nombreSistema, posts, more, callback);
			    }
			});
		    }
		});
	    });
	}
    }

    // para cada cuenta, mandamos los posts a desglosaPosts
    function desglosaCtasPosts(token, arregloctas, objetoposts, index, callback) {
	var cuantasctas = arregloctas.length;
	var cuantosobjs = Object.keys(objetoposts).length;
	var more = index+1;
	if (more > cuantasctas) {
	    return callback ('getpb ok');
	}
	else {
	    setImmediate(function(){
		var lacuenta = arregloctas[index];
		desglosaPosts(token, lacuenta, objetoposts[lacuenta], 0, function(respuesta){
		    // console.log(respuesta);
		    return desglosaCtasPosts(token, arregloctas, objetoposts, more, callback);
		}); 
	    });
	}
    }

    // obtenemos últimos 3 posts de esta cuenta
    function getPostsFB(access_token, datosCuenta, callback){
	var derpath = globales.fbapiversion+datosCuenta.idPage+globales.path_posts_query_limit;
	reqGraph(access_token, derpath, function(respue){
	    if (respue === 'error') {
		return callback('error');
	    }
	    else {
		return callback(respue.data);
	    }
	});
    }
    // para cada cuenta, obtenemos últimos posts y los relacionamos con la cuenta 
    function desgloseCuentas(token, cuentas, index, arregloCuentas, objetoPosts, callback) {
	var cuantasc = cuentas.length;
	var more = index+1;
	if (more > cuantasc) {
	    return callback(arregloCuentas, objetoPosts); 
	}
	else {
	    setImmediate(function(){
		if (typeof cuentas[index] !== 'undefined') {
		    getPostsFB(token, cuentas[index], function(respuesta) {
			if (respuesta === 'error') {
			    console.log('solicitudes/getpb/desgloseCuentas - error al solicitar posts a facebook para la cuenta: '+cuentas[index].nombreSistema);
			    desgloseCuentas(token, cuentas, more, arregloCuentas, objetoPosts, callback);
			}
			else {
			    arregloCuentas.push(cuentas[index].nombreSistema);
			    objetoPosts[cuentas[index].nombreSistema] = respuesta;
			    desgloseCuentas(token, cuentas, more, arregloCuentas, objetoPosts, callback);
			}
		    });
		}		    
	    });
	}
    }
    
    console.log('*************** solicitudes/getpb/GET - getPublicaciones ***************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error' || cuentas.length < 1) {
	    console.log('solicitudes/getpb.main - error al buscar las cuentas');
	    res.jsonp('error');
	}
	else {
	    getAppAT(function(token) {
		if (token === 'error') {
		    console.log('solicitudes/getpb.main - sin access_token');
		    res.jsonp('error');
		}
		else {
		    desgloseCuentas(token, cuentas, 0, [], {}, function(arregloCuentas, objetoPosts){
			desglosaCtasPosts(token, arregloCuentas, objetoPosts, 0, function(respuesta){
			    res.jsonp(respuesta);
			});
		    });
		}
	    });
	}
    });
});

module.exports = router;
