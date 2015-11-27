/*
Variables y su descripción
Twit: Almacena el objeto del paquete Twit
config: Variable que almacena el contenido del archivo config.js
T: Creación de un objeto, el cual recibe como parametro las llaves de acceso
stream: Genera autenticacion de la cuenta principal y la de respuesta
Las demas variables son arreglos que vamos a necesitar
*/
var CronJob = require('cron').CronJob;
var bst = require('better-stack-traces').install();
var https = require('https');
var classdb = require('./classdb.js');
var globales = require('./globals.js');

function revisalast(solicitudes, callback) {
    var solicitud = {};
    var cuantas = (solicitudes.length - 1);
    classdb.buscarToArray('peticiones_automaticas_cp', {}, {created : -1}, 'escuchadores/getautoposts/revisaLast', function(items){
	if (items === 'error') {
	    callback(items);
	}
	else {
	    if (items.length < 1) {
		solicitud.created = new Date();
		solicitud.path = solicitudes[0];
		solicitud.next = solicitudes[1];		
		classdb.inserta('peticiones_automaticas_cp', solicitud, 'escuchadores/getautoposts/revisaLast', function(insercion){
		    if (insercion === 'error'){
			console.log('escuchadores/getautoposts/revisaLast - error al insertar peticion automática');
			callback(solicitud);
		    }
		    else {
			callback(solicitud);
		    }
		});
	    }
	    else {
		var last = items[0];
		var criterio = {_id: last._id};
		var ts = last.created.getTime();
		var tsm1m = (ts) + 59000;
		var ahora = new Date().getTime();
		if (tsm1m < ahora) {
		    var actual = last.next;
		    var indice = solicitudes.indexOf(actual);
		    var indicem1 = indice + 1;
		    if (indice === cuantas) {
			solicitud.created = new Date();
			solicitud.path = solicitudes[indice];
			solicitud.next = solicitudes[0];			    
		    }
		    else {
			solicitud.created = new Date();
			solicitud.path = actual;
			solicitud.next = solicitudes[indicem1];
		    }
		    classdb.actualiza('peticiones_automaticas_cp', criterio, solicitud, 'escuchadores/getautoposts/revisaLast', function(actualizado) {
			if (actualizado === 'error') {
			    console.log('escuchadores/getautoposts/revisaLast - error al actualizar peticion automática');
			    return callback(solicitud);
			}
			else {
			    return callback(solicitud);
			}
		    });
		}
		else {
		    return callback('not-yet');
		}
	    }
	}
    });
}

function peticion_automatica(solicitude, callback) {
    var larespuesta = '';
    var fechahora = new Date();
    globales.options_likeable_servs.method = 'GET';
    globales.options_likeable_servs.path = solicitude.path;
    var solicitud_likeable = https.request(globales.options_likeable_servs, function(respu) {
	respu.setEncoding('utf8');
	respu.on('data', function(dati) {
	    larespuesta += dati;
	});
	respu.on('end', function(){
	    console.log('[ '+fechahora+' ] ' + solicitude.path +' - '+larespuesta);
	    return callback(larespuesta);
	});
    });
    solicitud_likeable.end();
    solicitud_likeable.on('error', function(err){
	console.log('gvc'+solicitude.path +' - https_request -  error en el request: ' +err);
	// console.log('Error: ' + hostNames[i] + "\n" +err.message);
	console.log(err.stack);
	return callback('error');
    });    
}

function procesaVariousContents() {
    /* deldup = deleteDupes, om = obtieneMonitoreo, pb = publicaciones, automu = muro de facebook, autofi = facebook inbox, autocp = comments pending, autopp = posts pending */
    var solicitudes_posibles = ['/deldup', '/getom', '/getpb','/getautomu', '/getautocp', '/getautopp'];
    revisalast(solicitudes_posibles, function(sol) {
	// console.log(sol);
	if (typeof sol.path === 'undefined') {
	    console.log('not-yet');
	}
	else {
	    peticion_automatica(sol, function(respuesta){
		if (respuesta === 'error') {
		    console.log('error');
		}
		else {
		    console.log(respuesta);
		}
	    });
	}
    });
}

var cronOptions = {
    cronTime: '00 */1 * * * *',
    onTick: procesaVariousContents,
    // onComplete: function(){console.log('esto pasa justo después de lo otro');},
    start : false,
    timeZone: 'America/Mexico_City'
};

var dajob = new CronJob(cronOptions);
dajob.start();


