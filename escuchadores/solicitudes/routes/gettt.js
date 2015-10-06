/* solicitudes/gettt/GET - Twitter ElemenTs */
'use strict';
var express = require('express');

var http=require('http');
var https=require('https');
var Twit = require('twit');

// default twitter
var tck_def = 'J6s0rQHWLsD2wJ5LT7ScTerL9';
var tcs_def = 'IEVhbW9qfHGU7nbVS4kNfZFVwkkvGnUZQUOjYjwI8ybNjQjuwi';
var tat_def = '1694381664-qUYMFtqtJET7ky0Nnw7etwAYBNIjQFsl7VTfpLj';
var tats_def = 'nPYv16f64w54YTerqk2fGlbGKcefGz2TIBgnNqjLYVfWa';

var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();

/* GET Direct Messages. */
router.get('/', function(req, res, next) {
    //Función que sirve para obtener todas las cuentas
    function getCuentas(callback) {
	var criterio = { $and: [
	    {'datosTwitter' : {$exists : true}},
	    {'datosTwitter.twitter_id_principal':{$exists: true}}, 
	    {'datosTwitter.twitter_id_principal':{$ne: 'null'}},
	    {'datosTwitter.twitter_screenname_principal':{$exists: true}}, 
	    {'datosTwitter.twitter_screenname_principal':{$ne: 'null'}}
	]};
	classdb.buscarToStream('accounts', criterio, {nombreSistema:1}, 'solicitudes/gettt/getCuentas', function(cuentas){
	    return callback(cuentas);
	});
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
	    setImmediate(function() {
		var coleccion = cuentas[index].nombreSistema+'_crecimiento_rounds';
		var tid = cuentas[index].datosTwitter.twitter_id_principal, 
		    tsn = cuentas[index].datosTwitter.twitter_screenname_principal, 
		    tck = '', tcs = '', tat = '', tats = '';
		if (cuentas[index].datosTwitter.twitter_consumer_key !== '') { tck = cuentas[index].datosTwitter.twitter_consumer_key; } else {tck = tck_def;}
		if (cuentas[index].datosTwitter.twitter_consumer_secret !== '') { tcs = cuentas[index].datosTwitter.twitter_consumer_secret; } else {tcs = tcs_def;}
		if (cuentas[index].datosTwitter.twitter_access_token !== '') { tat = cuentas[index].datosTwitter.twitter_access_token; } else {tat = tat_def;}
		if (cuentas[index].datosTwitter.twitter_access_token_secret !== '') {tats = cuentas[index].datosTwitter.twitter_access_token_secret;} else {tats = tats_def;}
		classdb.buscarToArrayLimit(coleccion, {}, {}, 1, 'solicitudes/gettt/procesaCuentas', function(items) {
		    if (items === 'error') {
			console.log('solicitudes/gettt/procesaCuentas - error en el find');
			return procesaCuentas(cuentas, more, arrayctas, callback);
		    }
		    else {
			if (items.length < 1) {
			    var objeto = {
				cuenta : cuentas[index].nombreSistema,
				page_id: '',
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
			    classdb.inserta(coleccion, objeto, 'solicitudes/gettt/procesaCuentas', function(inserte) {
				objeto.t_id = tid;
				objeto.t_sn = tsn;
				objeto.t_ck = tck;
				objeto.t_cs = tcs;
				objeto.t_at = tat;
				objeto.t_ats = tats;
				return callback(objeto);  
			    });
			}
			else {
			    items[0].t_id = tid;
			    items[0].t_sn = tsn;
			    items[0].t_ck = tck;
			    items[0].t_cs = tcs;
			    items[0].t_at = tat;
			    items[0].t_ats = tats;
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
		if (crecimientos[index1].round_tweets > crecimientos[index2].round_tweets) {
		    // el de index2 es el bueno
		    return callback(crecimientos[index2]);
		}
		else {
		    return siguienteCrecimiento(crecimientos, mas, mehr, callback);
		}
	    });
	}
    }

    function obtieneDatos(cuenta, callback) {
	var T = new Twit({consumer_key: cuenta.t_ck, consumer_secret: cuenta.t_cs, access_token: cuenta.t_at, access_token_secret: cuenta.t_ats});
	T.get('users/show', {screen_name : cuenta.t_sn}, function(err, data, response){
	    if (err) {
		console.log('solicitudes/gettt/obtieneDatos - Error en solicitud a twitter: '+err);
		return callback('error');
	    }
	    else {
		return callback(data);
	    }
	});
    }

    function aumentacrecimiento(crecimiento, callback) {
	var lacuenta = crecimiento.cuenta;
	var colec = lacuenta+'_crecimiento_rounds';
	var criterium = { cuenta : lacuenta };
	var round = crecimiento.round_tweets+1;
	var elset = {round_tweets : round };
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

    function guardaDatos(crecimiento, eltwitero, callback) {
	var lahora = new Date();
	var lacuenta = crecimiento.cuenta;
	var lacolec = lacuenta+'_twitter_data_ahora';
	var elcriterio = {cuenta: lacuenta};
	var objetoinsert = {cuenta: lacuenta, hora: lahora, followers: eltwitero.followers_count, tweets: eltwitero.statuses_count, favorites: eltwitero.favourites_count};
	var objetoupdate = {hora: lahora, followers: eltwitero.followers_count, tweets: eltwitero.statuses_count, favorites: eltwitero.favourites_count};
	var round = crecimiento.round_tweets+1;
	var colec = lacuenta+'_crecimiento_rounds';
	var criterium = { cuenta : lacuenta };
	var elset = {round_tweets : round };
	
	classdb.buscarToArray(lacolec, elcriterio, {}, 'solicitudes/gettt/guardaFans', function(items){
	    if (items === 'error') {
		return callback('error');
	    }
	    else {
		if (items.length > 0) {
		    classdb.actualiza(lacolec, elcriterio, objetoupdate, 'solicitudes/gettt/guardaFans', function(updati){
			classdb.actualiza(colec, criterium, elset, 'solicitudes/gettt/guradaFans', function(respu) {
			    return callback(respu);
			});
		    });
		}
		else {
		    classdb.inserta(lacolec, objetoinsert, 'solicitudes/gettt/guardaFans', function(inserte){
			classdb.actualiza(colec, criterium, elset, 'peticiones/obtieneShares/guardaFans', function(respu) {
			    return callback(respu);
			});
		    });
		}
	    }
	});
    }

    console.log('************** solicitudes/gettt/GET -  getTwitterElements **************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error') {
	    console.log('solicitudes/gettt.main - Error: al buscar las cuentas en bd');
	    res.jsonp('error');	    
	}
	else {
	    if (cuentas.length < 1) {
		console.log('solicitudes/gettt.main - Error: no había cuentas conectadas a twitter');
		res.jsonp('error');	    
	    }
	    else {
		procesaCuentas(cuentas, 0, [], function(crecimientos){
		    if (typeof crecimientos.cuenta !== 'undefined') {
			console.log('solicitudes/gettt.main - es un objeto de crecimiento nuevo');
			var crecimiento = crecimientos;
			console.log(crecimiento);
			obtieneDatos(crecimiento, function(twitero){
			    guardaDatos(crecimiento, twitero, function(respo){
				console.log(crecimiento.cuenta+' gettt '+respo);
				res.jsonp(crecimiento.cuenta+' gettt '+respo);
			    });
			});
		    }
		    else {
			// console.log(Object.prototype.toString.call(crecimientos));
			if (Object.prototype.toString.call(crecimientos) === '[object Array]' && crecimientos.length > 0) {
			    console.log('solicitudes/gettt.main - es un arreglo de objetos de crecimiento');
			    // es un arreglo de crecimientos
			    siguienteCrecimiento(crecimientos, 0, 1, function(crecimiento){
				// console.log(crecimiento);
				obtieneDatos(crecimiento, function(twitero){
				    guardaDatos(crecimiento, twitero, function(respo){
					console.log(crecimiento.cuenta+' gettt '+respo);
					res.jsonp(crecimiento.cuenta+' gettt '+respo);
				    });
				});
			    });
			}
			else {
			    // es un arreglo vacío o no es un arreglo
			    console.log('solicitudes/gettt.main - no es un arreglo o venía vacío');
			    console.log(crecimientos);
			    res.jsonp('error');
			}
		    }

		});
	    }
	}
    });
});

module.exports = router;
