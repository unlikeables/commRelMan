/* solicitudes/gettl/GET - Twit List */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
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

/* GET obtieneComments. */
router.get('/', function(req, res, next) {
    //Funcion que obtiene las cuentas
    function getCuentas(callback) {
	var criterio = { $and: [
	    {'datosTwitter' : {$exists : true}},
	    {'datosTwitter.twitter_id_principal':{$exists: true}}, 
	    {'datosTwitter.twitter_id_principal':{$ne: 'null'}},
	    {'datosTwitter.twitter_screenname_principal':{$exists: true}}, 
	    {'datosTwitter.twitter_screenname_principal':{$ne: 'null'}},
	    {'datosTwitter.twitter_consumer_key':{$exists: true}},
	    {'datosTwitter.twitter_consumer_key':{$ne: ''}},
	    {'datosTwitter.twitter_consumer_secret':{$exists: true}},
	    {'datosTwitter.twitter_consumer_secret':{$ne: ''}},
	    {'datosTwitter.twitter_access_token': {$exists: true}},
	    {'datosTwitter.twitter_access_token': {$ne: ''}},
	    {'datosTwitter.twitter_access_token_secret': {$exists: true}},
	    {'datosTwitter.twitter_access_token_secret': {$ne: ''}}
	]};
	classdb.buscarToStream('accounts', criterio, {nombreSistema:1}, 'solicitudes/gettl/getCuentas', function(cuentas){
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
		    tck = cuentas[index].datosTwitter.twitter_consumer_key, 
		    tcs = cuentas[index].datosTwitter.twitter_consumer_secret, 
		    tat = cuentas[index].datosTwitter.twitter_access_token, 
		    tats = cuentas[index].datosTwitter.twitter_access_token_secret;
		
		classdb.buscarToArrayLimit(coleccion, {}, {}, 1, 'solicitudes/gettl/procesaCuentas', function(items){
		    if (items === 'error') {
			console.log('solicitudes/gettl/procesaCuentas - error en el find');
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
			    classdb.inserta(coleccion, objeto, 'solicitudes/gettl/procesaCuentas', function(inserte) {
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
		if (crecimientos[index1].round_propios > crecimientos[index2].round_propios) {
		    // el de index2 es el bueno
		    return callback(crecimientos[index2]);
		}
		else {
		    return siguienteCrecimiento(crecimientos, mas, mehr, callback);
		}
	    });
	}
    }

    function getTweetsIds(crecimiento, totalt, tweets, callback) {
	var maximo = 99;
	if (crecimiento.last_propios+99 > totalt) { maximo = totalt; } else { maximo = crecimiento.last_propios+99; }
	var tweets_ids = [];
	for (var ijk = crecimiento.last_propios; ijk < maximo; ijk++) {
	    tweets_ids.push(tweets[ijk].id_str);
	}
	return callback(tweets_ids);
    }

    function obtieneTweets(cuenta, tweets_ids, callback) {
	// console.log(cuenta);
	var T = new Twit({consumer_key: cuenta.t_ck, consumer_secret: cuenta.t_cs, access_token: cuenta.t_at, access_token_secret: cuenta.t_ats});
	T.get('statuses/lookup', { id : tweets_ids.toString() }, function(err, data, response){
	    if (err) {
		console.log('solicitudes/gettl/obtieneTweets - Error en solicitud a twitter: '+err);
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
	var last = crecimiento.last_propios;
	var round = crecimiento.round_propios+1;
	var elset = {last_propios : last, round_propios : round };
	classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl/aumentacrecimiento', function(respu) {
	    if (respu === 'error') {
		console.log('solicitudes/gettl/aumentacrecimiento - error al actualizar el round');
		return callback('error');
	    }
	    else {
		return callback('ok');
	    }
	});
    }
    
    function procesaTweets(crecimiento, losids, losids_str, tweets, totalt, index, callback){
	var mais = index+1;
	var lacuenta = crecimiento.cuenta;
	var lacolec = crecimiento.cuenta+'_propio';
	var maximo = crecimiento.last_propios+losids.length;
	var idsLastIndex = losids.length - 1;

	if (mais > losids.length) {
	    var last = maximo;
	    if (maximo === totalt) {
		last = 0;
	    }
	    var ids_str = losids_str.replace(/,(?=[^,]*$)/, '');
	    var round = crecimiento.round_propios+1;
	    var colec = lacuenta+'_crecimiento_rounds';
	    var criterium = { cuenta : lacuenta };
	    var elset = {last_propios : last, round_propios : round };
	    var array_ids = ids_str.split(",");
	    classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl/getComments', function(respu) {
		if (respu === 'error') {
		    console.log('solicitudes/gettl/getComments - error al actualizar el round');
		    if (losids_str === '') {
			return callback('ok');
		    }
		    else {
			return callback(array_ids);
		    }
		}
		else {
		    if (losids_str === '') {
			return callback('ok');
		    }
		    else {
			return callback(array_ids);
		    }		    
		}
	    });
	}
	else {
	    setImmediate(function(){
		var elid = losids[index];
		var dastwit = _.find(tweets, { id_str : elid });
		if (typeof dastwit !== 'undefined') {
		    var criterius = {id_str : losids[index]};	    
		    var eltwset = {retweet_count: dastwit.retweet_count, favorite_count: dastwit.favorite_count};
		    if (index === losids.length - 1) {
			classdb.actualiza(lacolec, criterius, eltwset, 'solicitudes/gettl/procesaTweets', function(actual){
			    var newst = losids_str.replace(elid, '');
			    return procesaTweets(crecimiento, losids, newst, tweets, totalt, mais, callback);		
			});
		    }
		    else {
			classdb.actualiza(lacolec, criterius, eltwset, 'solicitudes/gettl/procesaTweets', function(actual){
			    var newstr = losids_str.replace(elid+',', '');
			    return procesaTweets(crecimiento, losids, newstr, tweets, totalt,  mais, callback);		
			});
		    }
		}
		else {
		    return procesaTweets(crecimiento, losids, losids_str, tweets, totalt, mais, callback);
		}
	    });
	}
    }

    console.log('**************** solicitudes/gettl/GET - obtieneTwittsList ****************');
    getCuentas(function(cuentas) {
	if (cuentas === 'error') {
	    console.log('solicitudes/gettl.main - error al buscar las cuentas');
	    res.jsonp('error');
	}
	else {
	    if (cuentas.length < 1) {
		console.log('solicitudes/gettl.main - no había cuentas conectadas a facebook');
		res.jsonp('error');
	    }
	    else {
		procesaCuentas(cuentas, 0, [], function(crecimientos){
		    if (typeof crecimientos.cuenta !== 'undefined') {
			console.log('solicitudes/gettl.main - es un objeto de crecimiento nuevo');
			var crecimiento = crecimientos;
			classdb.count(crecimiento.cuenta+'_propio', {}, 'solicitudes/gettl.main', function(howmany){
			    if (howmany === 'error') {
				aumentacrecimiento(crecimiento, function(resul){
				    if (resul === 'error') {
					console.log('solicitudes/gettl.main/objeto/howmany - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
					res.jsonp('error');
				    }
				    else {
					console.log('solicitudes/gettl.main/objeto/howmany - error en el count de tweets propios para '+crecimiento.cuenta);
					res.jsonp('error');
				    }
				});
			    }
			    else {
				if (howmany > 0) {
				    classdb.buscarToArray(crecimiento.cuenta+'_propio', {}, { created_time: 1 }, 'solicitudes/gettl.main', function(tweets){
					if (tweets === 'error') {
					    aumentacrecimiento(crecimiento, function(resul){
						if (resul === 'error') {
						    console.log('solicitudes/gettl.main/objeto/tweets - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
						    res.jsonp('error');
						}
						else {
						    console.log('solicitudes/gettl.main/objeto/tweets - error al conseguir los tweets propios para '+crecimiento.cuenta);
						    res.jsonp('error');
						}
					    });
					}
					else {
					    if (tweets.length > 0) {
						getTweetsIds(crecimiento, howmany, tweets, function(losids){
						    obtieneTweets(crecimiento, losids, function(lostweets) {
							if(lostweets === 'error') {
							    aumentacrecimiento(crecimiento, function(resul){
								if (resul === 'error') {
								    console.log('solicitudes/gettl.main/objeto/lostweets - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
								    res.jsonp('error');
								}
								else {
								    console.log('solicitudes/gettl.main/objeto/lostweets - error en tweeter, no conseguimos los datos para '+crecimiento.cuenta);
								    res.jsonp('error');
								}
							    });
							}
							else {
							    procesaTweets(crecimiento, losids, losids.toString(), lostweets, howmany, 0, function(resultado){
								if (resultado === 'ok') {
								    console.log(crecimiento.cuenta+' gettl ok');
								    res.jsonp(crecimiento.cuenta+' gettl ok');
								}
								else {
								    console.log('gettl remanente de '+crecimiento.cuenta+': '+resultado.toString());
								    res.jsonp('gettl remanente de '+crecimiento.cuenta+': '+resultado.toString());
								}
							    });
							}
						    });
						});
					    }
					    else {
						console.log('solicitudes/gettl.main no hay publicaciones externas que procesar para '+crecimiento.cuenta);
						var round = crecimiento.round_propios+1;
						var colec = crecimiento.cuenta+'_crecimiento_rounds';
						var criterium = { cuenta : crecimiento.cuenta };
						var elset = {last_propios : 0, round_propios : round };
						classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl.main', function(respu) {
						    if (respu === 'error') {
							console.log('solicitudes/gettl.main - error al actualizar el round para '+crecimiento.cuenta);
							res.jsonp('error');
						    }
						    else {
							console.log(crecimiento.cuenta+' gettl ok');
							res.jsonp(crecimiento.cuenta+' gettl ok');
						    }
						});
					    }
					}
				    });				
				}
				else {
				    console.log('solicitudes/gettl.main no hay publicaciones externas que procesar para '+crecimiento.cuenta);
				    var round = crecimiento.round_propios+1;
				    var colec = crecimiento.cuenta+'_crecimiento_rounds';
				    var criterium = { cuenta : crecimiento.cuenta };
				    var elset = {last_propios : 0, round_propios : round };
				    classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl.main', function(respu) {
					if (respu === 'error') {
					    console.log('solicitudes/gettl.main - error al actualizar el round para '+crecimiento.cuenta);
					    res.jsonp('error');
					}
					else {
					    console.log(crecimiento.cuenta+' gettl ok');
					    res.jsonp(crecimiento.cuenta+' gettl ok');
					}
				    });
				}
			    }
			});
		    }
		    else {
			console.log('es un arreglo de objetos de crecimiento');
			if (Object.prototype.toString.call(crecimientos) === '[object Array]' && crecimientos.length > 0) {
			    siguienteCrecimiento(crecimientos, 0, 1, function(crecimiento){
				classdb.count(crecimiento.cuenta+'_propio', {}, 'solicitudes/gettl.main', function(howmany){
				    if (howmany === 'error') {
					aumentacrecimiento(crecimiento, function(resul){
					    if (resul === 'error') {
						console.log('solicitudes/gettl.main/arreglo/howmany - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					    else {
						console.log('solicitudes/gettl.main/arreglo/howmany - error en el count de publicaciones para '+crecimiento.cuenta);
						res.jsonp('error');
					    }
					});
				    }
				    else {
					if (howmany > 0) {
					    classdb.buscarToArray(crecimiento.cuenta+'_propio', {}, { created_time: 1 }, 'solicitudes/gettl.main', function(tweets){
						if (tweets === 'error') {
						    aumentacrecimiento(crecimiento, function(resul){
							if (resul === 'error') {
							    console.log('solicitudes/gettl.main/arreglo/tweets - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
							    res.jsonp('error');
							}
							else {
							    console.log('solicitudes/gettl.main/arreglo/tweets - error al conseguir los tweets propios para '+crecimiento.cuenta);
							    res.jsonp('error');
							}
						    });
						}
						else {
						    if (tweets.length > 0) {
							getTweetsIds(crecimiento, howmany, tweets, function(losids){
							    obtieneTweets(crecimiento, losids, function(lostweets) {
								if(lostweets === 'error') {
								    aumentacrecimiento(crecimiento, function(resul){
									if (resul === 'error') {
									    console.log('solicitudes/gettl.main/arreglo/lostweets - no pudimos aumentar el crecimiento para '+crecimiento.cuenta);
									    res.jsonp('error');
									}
									else {
									    console.log('solicitudes/gettl.main/arreglo/lostweets - error en tweeter, no conseguimos los datos para '+crecimiento.cuenta);
									    res.jsonp('error');
									}
								    });
								}
								else {
								    procesaTweets(crecimiento, losids, losids.toString(), lostweets, howmany, 0, function(resultado){
									if (resultado === 'ok') {
									    console.log(crecimiento.cuenta+' gettl ok');
									    res.jsonp(crecimiento.cuenta+' gettl ok');
									}
									else {
									    console.log('gettl remanente de '+crecimiento.cuenta+': '+resultado.toString());
									    res.jsonp('gettl remanente de '+crecimiento.cuenta+': '+resultado.toString());
									}
								    });
								}
							    });
							});
						    }
						    else {
							console.log('solicitudes/gettl.main no hay publicaciones externas que procesar para '+crecimiento.cuenta);
							var round = crecimiento.round_propios+1;
							var colec = crecimiento.cuenta+'_crecimiento_rounds';
							var criterium = { cuenta : crecimiento.cuenta };
							var elset = {last_propios : 0, round_propios : round };
							classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl.main', function(respu) {
							    if (respu === 'error') {
								console.log('solicitudes/gettl.main - error al actualizar el round para '+crecimiento.cuenta);
								res.jsonp('error');
							    }
							    else {
								console.log(crecimiento.cuenta+' gettl ok');
								res.jsonp(crecimiento.cuenta+' gettl ok');
							    }
							});
						    }
						}
					    });				
					}
					else {
					    console.log('solicitudes/gettl.main no hay publicaciones externas que procesar para '+crecimiento.cuenta);
					    var round = crecimiento.round_propios+1;
					    var colec = crecimiento.cuenta+'_crecimiento_rounds';
					    var criterium = { cuenta : crecimiento.cuenta };
					    var elset = {last_propios : 0, round_propios : round };
					    classdb.actualiza(colec, criterium, elset, 'solicitudes/gettl.main', function(respu) {
						if (respu === 'error') {
						    console.log('solicitudes/gettl.main - error al actualizar el round para '+crecimiento.cuenta);
						    res.jsonp('error');
						}
						else {
						    console.log(crecimiento.cuenta+' gettl ok');
						    res.jsonp(crecimiento.cuenta+' gettl ok');
						}
					    });
					}
				    }
				});
			    });
			}
			else {
			    // es un arreglo vacío o no es un arreglo
			    console.log('solicitudes/gettl.main - no es un arreglo o venía vacío');
			    console.log(crecimientos);
			    res.json('error');
			}
		    }
		});
	    }
	}
    });
});

module.exports = router;
