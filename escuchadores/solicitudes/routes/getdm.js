/* solicitudes/getdm/GET - Get Direct Messages */
'use strict';
var express = require('express');

var http=require('http');
var https=require('https');
var Twit = require('twit');
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET Direct Messages. */
router.get('/', function(req, res, next) {
    //Función que sirve para obtener todas las cuentas
    function getCuentas(callback) {
	var criterio = {$and:[ 
	    {'datosTwitter' : {$exists : true}},
	    {'datosTwitter.twitter_consumer_secret' : {$ne : null}},
	    {'datosTwitter.twitter_consumer_secret' : {$ne : ''}},
	    {'datosTwitter.twitter_consumer_key' : {$ne : null}},
	    {'datosTwitter.twitter_consumer_key' : {$ne : ''}},
	    {'datosTwitter.twitter_access_token' : {$ne : null}},
	    {'datosTwitter.twitter_access_token' : {$ne : ''}},
	    {'datosTwitter.twitter_access_token_secret' : {$ne : null}},
	    {'datosTwitter.twitter_access_token_secret' : {$ne : ''}}
	]};
	classdb.buscarToStream('accounts', criterio, {}, 'solicitudes/getdm/getCuentas', function(cuentas){
	    return callback(cuentas);
	});
    }

    function nueMens(fecha, tipo, cuenta) {
	var dadate = fecha.toString();
	var nm_data = querystring.stringify(
	    {
		obj: 'twitter',
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

    //Función para guardar los DMs en mongo
    function guardaDM(nombreSistema, created_time, cuenta_id, datos, callback) {
	var collection = nombreSistema+'_consolidada';
	datos.created_time = new Date(datos.created_at);
	datos.from_user_id = ''+datos.sender_id;
	datos.from_user_name = datos.sender_screen_name;
	datos.foto = datos.sender.profile_image_url;
	datos.obj = 'twitter';
	datos.coleccion_orig = nombreSistema+'_DM';
	datos.coleccion = collection;
	datos.tipo = 'direct_message';
	if( Date.parse(datos.created_time) > Date.parse(created_time) ){
	    classdb.inserta(collection, datos, 'solicitudes/getdm/guardaDM', function(respuesta){
		if (datos.from_user_id !== cuenta_id) {
		    nueMens(datos.created_time, 'direct_message', nombreSistema);
		}
		return callback(respuesta);
	    });
	}else{
	    // console.log('La fecha no es valida para DM, es anterior a la creación de la cuenta');
	    return callback('outdated');
	}
    }

    //Función que revisa si DM ya existe en Base de datos
    function revisaDM(nombreSistema, datos, callback) {
	var collection = nombreSistema+'_consolidada';
	var criterio = {id : datos.id};
	classdb.existecount(collection, criterio, 'solicitudes/getdm/revisaDM', function(respuesta){
	    return callback(respuesta);
	});
    }

    //Función que pasa uno por uno los DMs a revisión y luego los guarda
    function desglosaDMs(nombreSistema, datos, acc_id, created_time, index, callback) {
	var cuantos = datos.length;
	var more = index+1;
	if (more > cuantos) {
	    return callback('ok');
	}
	else {
	    setImmediate(function(){
		revisaDM(nombreSistema, datos[index], function(answer){
		    if (answer === 'error' || answer === 'existe' ) {
			// console.log('solicitudes/getdm/desglosaDMs - '+answer);
			desglosaDMs(nombreSistema, datos, acc_id, created_time, more, callback);
		    }
		    else {
		    	guardaDM(nombreSistema, created_time, acc_id, datos[index], function(respuesta){
			    if (respuesta === 'error') {
				console.log('solicitudes/getdm/desglosaDMs - error al guardar DM');
				desglosaDMs(nombreSistema, datos, acc_id, created_time,more, callback);
			    }
			    else {
				desglosaDMs(nombreSistema, datos, acc_id, created_time, more, callback);
			    }
		    	});
		    }
		});	    
	    });
	}
    }

    //Función que pide los DMs de cada cuenta a twitter
    function obtieneDMs(datosCuenta, callback) {
	var T = new Twit({
    	    consumer_key: datosCuenta.datosTwitter.twitter_consumer_key,
  	    consumer_secret: datosCuenta.datosTwitter.twitter_consumer_secret,
  	    access_token: datosCuenta.datosTwitter.twitter_access_token,
  	    access_token_secret: datosCuenta.datosTwitter.twitter_access_token_secret
	});
	var tokenelements = datosCuenta.datosTwitter.twitter_access_token.split('-');
	var cta_id = tokenelements[0];
	T.get('direct_messages', { count: 30, full_text: true }, function(err, data, response) {
	    if(err){
		console.log('solicitudes/getdm/obtieneDMs - Error en solicitud a twitter para '+datosCuenta.nombreSistema+': '+err);
		return callback('error');
	    }
	    else{
		desglosaDMs(datosCuenta.nombreSistema, data, cta_id, datosCuenta.created_time, 0, function(respuesta){
		    if (respuesta === 'ok') {
			return callback('ok');
		    }
		    else {
			return callback('error');
		    }
		});
	    }
	});
    }
    
    // Función que separa cuenta por cuenta y para cada cuenta pide la función de obtieneDMs
    function desgloseCuentas(cuentas, index, callback) {
	var cuantasc = cuentas.length;
	var more = index+1;
	if (more > cuantasc) {
	    return callback('dc_ok');
	}
	else {
	    setImmediate(function(){
		obtieneDMs(cuentas[index], function(respuesta) {
		    if (respuesta === 'error') {
			console.log('solicitudes/getdm/desgloseCuentas - algo pasó mientras obteníamos/desglosabámos/insertábamos los DMs');
			return desgloseCuentas(cuentas, more, callback);
		    }
		    else {
			return desgloseCuentas(cuentas, more, callback);
		    }
		}); 
	    });
	}
    }

    console.log('************** solicitudes/getdm/GET - GET Direct Messages **************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error' || cuentas.length < 1) {
	    console.log('solicitudes/getdm.main - Error al buscar las cuentas, o estaban vacías');
	    res.jsonp('error');	    
	}
	else {
	    desgloseCuentas(cuentas, 0, function(respuesta) {
		res.jsonp('getdm ok');
	    });
	}
    });
});

module.exports = router;
