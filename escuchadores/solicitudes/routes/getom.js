/* solicitudes/getom/GET - Obtiene Monitoreo */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var perm_ats = ['CAAEdYZBfZAiQQBAIuHZBQb7LLSmW4ZCz6zC2ZBTnXTaPURhODVN6wuJ9qbygbypHyOPIETjoh3ZBOdlGjj4T34vfwBFH5rNHSmWUmZBXi3ryTAmenVriG97N68TetxZC8cVJKBrLBW5ZAynArKC8mXVibIVsd9OuZCu7nneygXSl6NWLvDwDdNFfWHANKen3CZCAAunogMXZAgmAz6LFRdRslPNr','CAAEdYZBfZAiQQBADZBSFYxcHLG1sDgXvwzN4L0nKz6TZBJlA7ohRQeqO7hrfDswJ3BE8stmbswkWpkxWqYWOtf2Yrza0xx4HqLleoO0njypvwYtnqbzMQxDrXUXjjScb7hfFnKPefrouA8b7McELohHf6RQjBGcROPVARY6lWRR3nfBPQMRG9RURTnO1jeYGiZAZCPTtLd4DVQI70YgqiC','CAAEdYZBfZAiQQBAIaOefmFpdefZC6iyUK9Pc0z51rGCn4m4HpqlCSPy8tUN43dN419BfQswZCwUDXFyXJIZA8Cm4IWHQF3rQzvLoBM2J4fFcw23dDqg8BPGz1deav4QSw3TMhcttsuXIXAOSiKfYrJVBLig708nMGHIoSf130whWZBHX8LHBSof25OU4ZBWzZAJ4Ml79569ZAVuNBRBHbEEWt','CAAEdYZBfZAiQQBAEPC6hzXH59OqrmZA4Hfnk879LGlL2fWQpacgEWiQhahLfWayFaBlumNFVF7CwTrCLErYV5OSj6MQP9TZC59DsAd3MWgr2TisZCDATErNIVwwLDPToJUcTIZB55uyNXiHdY8Gug2BqUAuLxSGYZCg5k5C0sMy4K4Uxdd0tOStp0CznnVWcd35OfIesZCxgyZCg1LrTS3dsF','CAAEdYZBfZAiQQBAItGs2NiOata5MnTCb8TXrXBjehoTLB2EwZC5RpB7LuCoBHnCRhzpcBZAIa5UsgR3zg8VU78fwSjpZBZAT8hnwREUqLWY2HalVfuRllE5j4zi35SMS2YU62s11NWRn9sLPi7uHXAC1D102Q5qjWGoAp9UAxXBiQMx0JAseZB1ikZCilNeI348m0MnT11rrEU5FTvUnkshv','CAAEdYZBfZAiQQBAPfxCHw8LLnedtc9BUPcArUm7GCoeZCiJmhwbK2XTQFqOFDH4bXMB668mUZBuePJGmkZCvgZAt6xZC0KfAHdhykLt7LmvfZAyUU2L1ZBvxT7ch8LPuPptCkf37NKQxRHBYLVhVl0qXlDwUMnf8uxvUxYCWMq49R7EtMCJveP5Vy76LkcmZAqKpmU4IarifDBfuAYrLSfOkc9','CAAEdYZBfZAiQQBAHuXudnr8pLWT6S5dfcZAQoB8hBzvd6ezHZC8vdXOrOcZBMMSccXyzv9UGciKET39lwhIAgIzkWywLaWgpOMQc9jhqNxdpPM5ecGZC92KRAGsdt0OM0k6aogMZCL5ejZAGCwZC6AIfZCvzvvdZClWcQIUXvJDGY23q14BPB9wavtb2XbWirGxhZAKalZBSh4e8oZC5HSr1v24r7K','CAAEdYZBfZAiQQBAHRm8NAV3JcAA0UR1SKl2xIZBeOSlPkAI046mGqbauQSpYabP5SwRfxMkUbybivWPhEnV7Y7KMqLHRiy0ZCDk62mn5zmXdIj6oYts3JMavFOsLPakteBrXwMDsjxBLQRXFrpZBraQ0KForDU55Msc362x5MWZB7zxGdbuJR1elMQkOXwAuDgHfcMZCZBxRxOzIkLdk1eKP'];
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET obtieneMonitoreo. */
router.get('/', function(req, res, next) {
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
   	    var datosSistema = {
		nombreSistema : cuentas[index].nombreSistema,
		idMonitoreo : cuentas[index].datosMonitoreo.id
   	    };
	    ctasrefinadas.push(datosSistema);
	    refinaCuentas(cuentas, more, ctasrefinadas, callback);
	}
    }

    function getCuentas(callback) {
	var criterio = {'datosMonitoreo' : {$exists : true}};
 	classdb.buscarToStream('accounts', criterio, {}, 'solicitudes/getom/getCuentas', function(cuentas){
	    refinaCuentas(cuentas, 0, [], function(refinadas){
		return callback(refinadas);
	    });
	});
    }

    function reqGraphConPAT(path, nosys, callback) {
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
			console.log('solicitudes/getom/reqGraphConPAT -'+nosys+'- hubo un error en solicitud al graph: '+ pathcontoken);
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
		console.log('solicitudes/getom/reqGraphConPAT - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getoc/reqGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

    function reqGraph(token, path, nsys, callback) {
	if (typeof path !== 'undefined' || path !== null || path !== '') {
	    var pathcontoken = '';
	    if ( token === 'not' ) { 
		pathcontoken = path; 
	    }
	    else { 
		pathcontoken = path+'&'+token; 
	    }
	    globales.options_graph.method = 'GET';
	    globales.options_graph.path = pathcontoken;
	    var solicitud = https.request(globales.options_graph, function(resp) {
		var chunks = [];
		resp.on('data', function(chunk) {
		    chunks.push(chunk);
		}).on('end', function() {
		    var contenido = JSON.parse(Buffer.concat(chunks));
		    if (typeof contenido.error !== 'undefined') {
			// console.log('solicitudes/getom/reqGraph - '+nsys+'  - hubo un error en solicitud al graph: '+ pathcontoken);
			// console.log(JSON.stringify(contenido.error));
			reqGraphConPAT(path, nsys, function(respconPAT){
			    return callback(respconPAT);
			});
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
		console.log('solicitudes/getom/reqGraph - hubo un error en la conexión al graph: '+e);
		return callback('error');
	    });
	}
	else {
	    console.log('solicitudes/getom/reqGraph - no hubo path, así que no se puede pedir nada al graph');
	    return callback('error');
	}
    }

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
	    console.log('solicitudes/getom/requestAT - error en el request: '+err);
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
			if (at === 'error') {
			    // hubo un error, no access token, gosh
			    console.log('solicitudes/getom/getAppAT - error en solicitud de access_token a facebook');
			    return callback('error');
			}
			else {
			    if (typeof at === 'undefined' || typeof at.access_token === 'undefined') {
				// access_token llegó vacío, damn y wtf?
				console.log('solicitudes/getom/getAppAT - facebook no mandó access token');
				return callback('error');
			    }
			    else {
				// hubo respuesta por parte de facebook
				var objeto = {};
				objeto = { at: 'access_token='+at.access_token, ts: new Date() };
				classdb.inserta('verifica_at', objeto, 'solicitudes/getom/getAppAT', function(respuesta){
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
				console.log('solicitudes/getom/getAppAT - error en solicitud de access_token a facebook para updatear');
				return callback('error');
			    }
			    else {
				if (typeof at === 'undefined' || typeof at.access_token === 'undefined') {
				    // access_token venía vacío, damn
				    console.log('solicitudes/getom/getAppAT - facebook no mandó access token para updatear');
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

    //Función para añadir el comment a la base de datos
    function insertCommentMonitoreo(token, cuenta, pid, comment, callback){
	var nombreSistema = cuenta.nombreSistema;
	var page_id = cuenta.idMonitoreo;
	var created_time = comment.created_time;
	created_time = created_time.replace('+','.');
	comment.created_time = new Date(created_time);
	comment.page_id = page_id;
	comment.parent_post = pid;
	comment.parent_comment = pid;
	comment.obj = 'facebook';
	comment.coleccion_orig = nombreSistema+'_fb_comment';
	comment.coleccion = nombreSistema+'_consolidada';
	comment.tipo = 'comment';
	comment.from_user_id = ''+comment.from.id;
	comment.from_user_name = comment.from.name;

	if (typeof comment.attachment !== 'undefined' &&
	    typeof comment.attachment.media !== 'undefined' &&
	    typeof comment.attachment.media.image !== 'undefined' &&
	    typeof comment.attachment.media.image.src !== 'undefined') {
	    comment.image_attachment = comment.attachment.media.image.src;
	}
	if (typeof comment.attachment !== 'undefined' &&
	    typeof comment.attachment.target !== 'undefined' &&
	    typeof comment.attachment.target.url) {
	    comment.link_attachment = comment.attachment.target.url;
	}

	var fotopath = globales.fbapiversion+comment.from.id+'/picture?redirect=false';
	reqGraph('not', fotopath, nombreSistema, function(foto){
	    if (foto === 'error') {
		comment.foto = '';
		classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getom/insertaCommentMonitoreo', function(insert){
		    if (comment.from && page_id !== comment.from.id) {
			nueMens(comment.created_time, 'comment', nombreSistema);
		    }
		    return callback(insert);
		});			    
	    }
	    else {
		comment.foto = foto.data.url;
		classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getom/insertaCommentMonitoreo', function(insert){
		    if (comment.from && page_id !== comment.from.id) {
			nueMens(comment.created_time, 'comment', nombreSistema);
		    }
		    return callback(insert);
		});
	    }
	});
    }
    
    //Funciòn que sirve para verificar el comment
    function verificaExistenciaComment(cuenta, comment, callback) {
	var colezione = cuenta.nombreSistema+'_consolidada';
	var criterio = {'id': comment.id};
	classdb.existecount(colezione, criterio, 'solicitudes/getom/verificaExistenciaComment', function(existe){
	    return callback(existe);
	});
    }

    //Función que desglosa los comments y los ingresa
    function desglosecomments(cuenta, pid, comments, index, token, callback) {
	var more = index+1, cuentac = comments.length;
	if (more > cuentac) {
	    return callback('dco');	    
	}
	else {
	    setImmediate(function(){
		verificaExistenciaComment(cuenta, comments[index], function(existencia){
		    if (existencia === 'error' || existencia === 'existe') {
			return desglosecomments(cuenta, pid, comments, more, token, callback);			
		    }
		    else {
			insertCommentMonitoreo(token, cuenta, pid, comments[index], function(respincom){
			    if(respincom==='error'){
				return desglosecomments(cuenta, pid, comments, more, token, callback);			
			    }
			    else {
				return desglosecomments(cuenta, pid, comments, more, token, callback);			
			    }
			});			    
		    }
		});
	    });
	}
    }
   
    //Función que realiza la inserción a la base de datos
    function insertaPostMonitoreo(token, cuenta, post, callback){
	var nombreSistema = cuenta.nombreSistema,
	    post_created_time = post.created_time,
	    page_id = cuenta.idMonitoreo,
	    created_time = new Date (post_created_time.replace('+','.'));
	post.created_old = post.created_time;
	post.created_time = created_time;
	post.from_user_id = ''+post.from.id;
	post.from_user_name = post.from.name;
	post.obj = 'facebook';
	post.coleccion_orig = nombreSistema+'_fb_post';
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
	var fotopath = globales.fbapiversion+post.from.id+'/picture?redirect=false';
	reqGraph('not', fotopath, nombreSistema, function(foto){
	    if (foto === 'error') {
		post.foto = '';
		classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getom/insertaPostMonitoreo', function(insert){
		    if (post.from && page_id !== post.from.id) {
			nueMens(post.created_time, 'post', nombreSistema);
		    }
		    return callback(insert);
		});
	    }
	    else {
		post.foto = foto.data.url;
		classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getom/insertaPostMonitoreo', function(insert){
		    if (post.from && page_id !== post.from.id) {
			nueMens(post.created_time, 'post', nombreSistema);
		    }
		    return callback(insert);
		});
	    }
	});
    }

    //Función que verifica la existencia del post
    function verificaExistenciaPost(cuenta, post, callback) {
	var coleccion = cuenta.nombreSistema+'_consolidada';
	var criterio = {'id': post.id};
	classdb.existecount(coleccion, criterio, 'solicitudes/getom/verificaExistenciaPost', function(existe){
	    return callback(existe);
	});
    }	

    function desgloseposts(token, cuenta, feed, index, callback) {
	var more = index+1;
	var cuantosposts = feed.length;
	if (more > cuantosposts) {
	    return callback('dp');
	}
	else {
	    setImmediate(function(){
		verificaExistenciaPost(cuenta, feed[index], function(existenciaPost) {
		    if (existenciaPost === 'error' || existenciaPost === 'existe') { 
			return desgloseposts(token, cuenta, feed, more, callback);
		    }
		    else {
			insertaPostMonitoreo(token, cuenta, feed[index], function(insertaPost) {
			    if (typeof feed[index].comments !== 'undefined') {
				desglosecomments(cuenta, feed[index].id, feed[index].comments.data, 0, token, function(respdc){});
			    }
			    if(insertaPost==='error'){
				return desgloseposts(token, cuenta, feed, more, callback);			
			    }
			    else {
				return desgloseposts(token, cuenta, feed, more, callback);			
			    }
			});
		    }
		});
	    });
	}
    }

    function desgloseFeeds(token, cuentas, feeds, index, callback) {
	var cuantasc = feeds.cuantos;
	var more = index+1;
	if (more > cuantasc) {
	    return callback('df');
	}
	else {
	    setImmediate(function() {
 		// console.log('solicitudes/getom/desgloseFeeds CUENTA: '+index+' - '+cuentas[index].nombreSistema);
		var nsys = cuentas[index].nombreSistema;
		desgloseposts(token, cuentas[index], feeds[nsys], 0, function(respdp) {
		    if (respdp === 'dp') {
			console.log('solicitudes/getom/desgloseFeeds - posts de '+ nsys+' procesados');
			desgloseFeeds(token, cuentas, feeds, more, callback);
		    }
		    else {
			desgloseFeeds(token, cuentas, feeds, more, callback);
		    }
		});
	    });
	}
    }

    function getMonitoreo(access_token, cuentas, index, feeds, callback) {
	if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	    index = 0;
	}
	var cuantasc = cuentas.length;
	var more=index+1;
	if (more > cuantasc) {
	    var cuantos = Object.keys(feeds).length;
	    feeds.cuantos = cuantos;
	    return callback(feeds);
	}
	else {
	    setImmediate(function(){
		var nomsys = cuentas[index].nombreSistema;
		var cuentafb = cuentas[index].idMonitoreo;
		var derpath = globales.fbapiversion+cuentafb+globales.path_feed_limit;
		reqGraph(access_token, derpath, nomsys, function(respuesta){
		    if (respuesta === 'error' || typeof respuesta === 'undefined' || respuesta.data < 1) {
			console.log('solicitudes/getom/getMonitoreo - error en solicitud al graph o no recibimos feed o venía vacío para '+nomsys);
			feeds[nomsys] = [];
			return getMonitoreo(access_token, cuentas, more, feeds, callback);		    
		    }
		    else {
			feeds[nomsys] = respuesta.data;
			return getMonitoreo(access_token, cuentas, more, feeds, callback);
		    }
		});		    
	    });
	}
    }

    //var objetoFace=req.body;
    console.log('**************** solicitudes/getom/GET - obtieneMonitoreo ****************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error' || cuentas.length < 1) {
	    console.log('solicitudes/getom.main - error al buscar cuentas o venían vacías');
	    res.jsonp('error');	    
	}
	else {
	    getAppAT(function(token) {
		if (token === 'error') {
		    console.log('solicitudes/getom.main - sin access_token');
		    res.jsonp('error');
		}
		else {
		    getMonitoreo(token, cuentas, 0, {}, function(feeds) {
		    	desgloseFeeds(token, cuentas, feeds, 0, function(confirmacion){
			    if (confirmacion === 'df') {
				console.log('getom ok');
			    }
			    else {
				console.log('getom error');
			    }
		    	});
			res.jsonp('getom ok');
		    });
		    
		}
	    });
	}
    });
});

module.exports = router;
