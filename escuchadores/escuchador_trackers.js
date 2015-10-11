var bst = require('better-stack-traces').install();
var https = require('https');
var querystring = require('querystring');
var _ = require('lodash');
var classdb = require('./classdb.js');
var globales = require('./globals.js');
var llaves = 
    {
      "consumer_key":"ez0J2odrPveKxdsQ5VK0ketDI",
      "consumer_secret":"SigQvfTMASiMmG3hEP5UGLaHbK0lx4YWRiXGG4NnAz2fGgiVNr",
      "access_token":"1694381664-sNrazyZOYSzTcXBvvgSj6IWG3oIfd2dViZ1AgXV",
      "access_token_secret":"0cD8ngoRorVKtNUvRyaj4uxgl6lgxjjcHvF4ZC7QTHVu4"
    };
var Twit = require('twit');
var T = new Twit(llaves);

function getAccountsConTrackers(callback) {
  var criterium = {
    $and: [
      {'trackers' : {$exists: true}}, 
      {'trackers.trackers' : { $exists: true }}
    ]
  };

  var accountfields = {
    '_id' : '', 
    'nombreSistema' : '', 
    'datosTwitter': '',
    'created_time' : '',
    'trackers': ''
  };

  classdb.buscarToArrayFields ('accounts', criterium, accountfields, {}, 'escuchadores/escuchador_trackers/getAccountsConTrackers', function(diecuenten) {
      if (diecuenten.length > 0) {
	  return callback(diecuenten);
      }
      else {
	  return callback('error');
      }
  });
};

function procesaElementos(trackers, index, track, tracklc, callback) {
  var more = index+1;
  var cuantos = trackers.length;
  if (more > cuantos) {
    return callback(track, tracklc);
  }
  else {
    setImmediate(function(){
      if (typeof trackers[index] !== 'undefined') {
        var lostrackers = trackers[index];
	track.push(lostrackers);
        tracklc.push(lostrackers.toLowerCase());
        return procesaElementos(trackers, more, track, tracklc, callback);
      }
      else {
        return procesaElementos(trackers, more, track, tracklc, callback);
      }
    });
  }
};

function getFirstArrays(accounts, index, cuentas, cctid, track, tracklc, datosctas, callback) {
  var more = index+1;
  var cuantas = accounts.length;
  if (more > cuantas) {
    track.sort(function(a, b){ return b.length - a.length; /*ASC -> a - b; DESC -> b - a*/ });
    tracklc.sort(function(a, b){ return b.length - a.length; });
    datosctas.cuentas = cuentas;
    datosctas.cuentascontid = cctid;
    datosctas.tracklc = _.uniq(tracklc);
    datosctas.track = _.uniq(track);
    return callback(datosctas);	
  }
  else {
    setImmediate(function(){
      if (typeof accounts[index] !== 'undefined') {
        var ctanombre = accounts[index].nombreSistema;
        cuentas.push(ctanombre);
        cctid[ctanombre] = accounts[index].datosTwitter.twitter_id_principal;
	if (accounts[index].trackers.trackers.length > 0) {
          var lostrackers = accounts[index].trackers.trackers;
          procesaElementos(lostrackers, 0, [], [], function(tracker, trackerlc){
            track = track.concat(tracker);
            tracklc = tracklc.concat(trackerlc);
            return getFirstArrays(accounts, more, cuentas, cctid, track, tracklc, datosctas, callback);
          });
	}
      }
      else {
        return getFirstArrays(accounts, more, cuentas, cctid, track, tracklc, datosctas, callback);
      }
    }); 
  }
};

function iteraLasCtas(ctas, tracker, tracks_accounts, index, callback) {
  var more = index+1;
  var cuantaos = ctas.length;
  if (more > cuantaos) {
    return callback(tracks_accounts);
  }
  else {
    setImmediate(function(){
      if (typeof ctas[index] !== 'undefined') {
        var arraytrackers = ctas[index].trackers.trackers;
        var nombreCta = ctas[index].nombreSistema;
        if (arraytrackers.indexOf(tracker) >= 0) {
          if (typeof tracks_accounts[tracker] !== 'undefined') {
            tracks_accounts[tracker].push(ctas[index].nombreSistema);
          }
          else {
            tracks_accounts[tracker] = [];
            tracks_accounts[tracker].push(ctas[index].nombreSistema);
          }
          return iteraLasCtas(ctas, tracker, tracks_accounts, more, callback);
        }
        else {
          return iteraLasCtas(ctas, tracker, tracks_accounts, more, callback);
        }
      }
      else {
        return iteraLasCtas(ctas, tracker, tracks_accounts, more, callback);
      }
    });
  }
};

function get_trackAccounts_array(accts, thedata, trackers, index, callback) {
  var more = index+1;
  var cuantos = trackers.length;
  if (more > cuantos){
    return callback(thedata);
  }
  else {
    setImmediate(function(){
      if (typeof trackers[index] !== 'undefined') {
        var eltrack = trackers[index];
        iteraLasCtas(accts, eltrack, {}, 0, function(tracks_accounts){
          thedata.tracks_accounts[eltrack] = tracks_accounts[eltrack];
          return get_trackAccounts_array(accts, thedata, trackers, more, callback);
        });
      }
      else {
        return get_trackAccounts_array(accts, thedata, trackers, more, callback);
      }
    });
  }
};

function obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, index, matching_arr, callback) {
  var more = index+1;
  var cuantos = daterms.length;
  if (more > cuantos) {
    return callback(matching_arr);
  }
  else {
    setImmediate(function(){
      if (typeof daterms[index] !== 'undefined') {
        var terminodeturno = daterms[index];
        if (daretweet !== '') {
          if (daretweet.indexOf(terminodeturno) >= 0) {
            matching_arr.push('retweeted_status:'+terminodeturno);
            return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
          }
          else {
            if (daquote !== '') {
              if (daquote.indexOf(terminodeturno) >= 0) {
                matching_arr.push('quoted_status:'+terminodeturno);
                return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
              }
              else {
                return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
              }
            }
            else {
              return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
            }
          }
        }
        else {
          if (datwit.indexOf(terminodeturno) >= 0) {
            matching_arr.push(terminodeturno);
            return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
          }
          else {
            if (daquote !== '') {
              if (daquote.indexOf(terminodeturno) >= 0) {
                matching_arr.push('quoted_status:'+terminodeturno);
                return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
              }
              else {
                return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
              }
            }
            else {
              return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
            }
          }
        }
      }
      else {
        return obtieneTerminosDelTwit(daterms, datwit, daquote, daretweet, more, matching_arr, callback);
      }
    });
  }
};

function obtienecuentasportermino(lascuentas, eltuwit, ctastw, index, callback) {
  console.log('las cuentas: '+lascuentas);
  var more = index+1;
  var cuantos = lascuentas.length;
  if (more > cuantos) {
    return callback(eltuwit);
  }
  else {
    setImmediate(function(){
      if (lascuentas[index] !== 'undefined') {
        var lacuentita = lascuentas[index];
        var twitid = ctastw[lacuentita];
        if (eltuwit.user.id === twitid) { /*eltweet es nuestro*/ eltuwit.colecciones_conve.push(lacuentita); }
        else { /*eltweet no es nuestro*/ eltuwit.colecciones_track.push(lacuentita); }
        return obtienecuentasportermino(lascuentas, eltuwit, ctastw, more, callback);
      }
      else {
        return obtienecuentasportermino(lascuentas, eltuwit, ctastw, more, callback);
      }
    });
  }
};

function obtieneCtasVariosTerminos(termsdetwit, eltuit, termsaccounts, cuentastw, index, callback) {
  var more = index+1;
  var cuantos = termsdetwit.length;
  if (more > cuantos) {
    return callback(eltuit);
  }
  else {
    setImmediate(function(){
      if (typeof termsdetwit[index] !== 'undefined') {
        var elterminito = termsdetwit[index];
        if (termsdetwit[index].indexOf('retweeted_status:') >= 0) {
          elterminito = termsdetwit[index].replace('retweeted_status:', '');
        }
        if (termsdetwit[index].indexOf('quoted_status:') >= 0) {
          elterminito = termsdetwit[index].replace('quoted_status:', '');
        }
        var lascuentitas = termsaccounts[elterminito];
        eltuit.trackers.push(elterminito);
        obtienecuentasportermino(lascuentitas, eltuit, cuentastw, 0, function(dertuit){
          eltuit.colecciones_track = eltuit.colecciones_track.concat(dertuit.colecciones_track);
          eltuit.colecciones_conve = eltuit.colecciones_conve.concat(dertuit.colecciones_conve);
          return obtieneCtasVariosTerminos(termsdetwit, eltuit, termsaccounts, cuentastw, more, callback);
        });
      }
      else {
        return obtieneCtasVariosTerminos(termsdetwit, eltuit, termsaccounts, cuentastw, more, callback);
      }
    });
  }
};

function clasifica(untweet, losdatos, callback){
  // console.log(untweet);
  untweet.colecciones_track = [];
  untweet.colecciones_conve = [];
  untweet.trackers = [];
  var track = losdatos.track;
  var tracklc = losdatos.tracklc;
  var eltwitlc = untweet.text.toLowerCase();
  var elquoted = '';
  if (typeof untweet.quoted_status !== 'undefined') {
    elquoted = untweet.quoted_status.text.toLowerCase();
  }
  var elretweeted = '';
  if (typeof untweet.retweeted_status !== 'undefined') {
    elretweeted = untweet.retweeted_status.text.toLowerCase();
    if (typeof untweet.retweeted_status.quoted_status !== 'undefined') {
      elquoted = untweet.retweeted_status.quoted_status.text;
    }
  }
  
  obtieneTerminosDelTwit(tracklc, eltwitlc, elquoted, elretweeted, 0, [], function(terms_del_twit){
    if (Object.prototype.toString.call(terms_del_twit) !== '[object Array]') {
      console.log('escuchador_tracker/clasifica/obtieneTerminosDelTwit - ERROR: respuesta no fue array');
      return callback('error');
    }
    else {
      if (terms_del_twit.length < 1) {
        console.log('escuchador_tracker/clasifica/obtieneTerminosDelTwit - ERROR: arreglo llegó vacio');
        console.log(untweet);
        return callback('error');
      }
      else {
        var termsentwit = terms_del_twit;
        var tracks_accounts = losdatos.tracks_accounts;
        var ctascontid = losdatos.cuentascontid;
        obtieneCtasVariosTerminos(termsentwit, untweet, tracks_accounts, ctascontid, 0, function(thetweet){
          untweet.colecciones_track = _.uniq(thetweet.colecciones_track);
          untweet.colecciones_conve = _.uniq(thetweet.colecciones_conve);
          untweet.trackers = _.uniq(thetweet.trackers);
          return callback(untweet);
        }); 
      }
    }
  });
};

function esinfluencer(coleccion, user_id, callback) {
  var criterio = {idUser : user_id};
  classdb.buscarToArray('influencers_'+coleccion, criterio, {}, 'escuchador/escuchador.js/esinfluencer', function(influencer){
    return callback(influencer);
  });
}

function existetweet(coleccion, tweet, callback) {
  var criterio = {id_str : tweet.id_str};
  classdb.existecount(coleccion, criterio, 'escuchador/escuchador.js/existetweet', function(existe){
    return callback(existe);
  });
};

function insertauntweet(coleccion, tweet, callback) {
  tweet.coleccion = coleccion;
  tweet.coleccion_orig = coleccion;
  tweet.obj = 'twitter';
  tweet.tipo = 'tracker';
  classdb.insertacresult(coleccion, tweet, 'escuchador/escuchador.js/insertauntweet', function(inserta){
    return callback(inserta);
  });  
};

function procesatweet(tweet, colecciones, index, callback) {
  if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
    index = 0;
  }
  var more = index+1;
  var cuantas = colecciones.length;
  if (more > cuantas) {
    return callback(index);	
  }
  else {
    var elemcol = colecciones[index].split("_"); var basecol = elemcol[0], sectermcol = elemcol[1];
    tweet.tw_url = "https://twitter.com/"+tweet.user.screen_name+"/status/"+tweet.id_str;
    tweet.created_time = new Date();
    tweet.influencers = '';
    tweet.from_user_id = ''+tweet.user.id;
    tweet.from_user_name = tweet.user.name;
    tweet.from_user_screen_name = tweet.user.screen_name;
	
    // revisamos si es influencer
    esinfluencer(basecol, tweet.user.id, function(influ) {
      if (influ === 'error') {
	console.log('error definiendo si es influencer o no');
	return procesatweet(tweet, colecciones, more, callback);
      }
      else {
	if (influ.length < 1) {
	    if (basecol === 'imss'){
		if (tweet.user.followers_count > 5000) {
		    tweet.influencers = tweet.user.followers_count+' followers';
		}
		else {
		    delete tweet.influencers;
		}
	    }
	    else {
		if (tweet.user.followers_count > 5000000 ) {
		    tweet.influencers = tweet.user.followers_count+' followers';
		}
		else {
		    delete tweet.influencers;
		}
	    }
	} else {
	  tweet.influencers = influ[0].categoria;
	}
	// checamos si ya existe tweet
	existetweet(colecciones[index], tweet, function(existe) {
	  if (existe === 'error' || existe === 'existe') {
	    console.log('escuchador_trackers/procesatweet - '+tweet.id_str+' '+existe);
	    return procesatweet(tweet, colecciones, more, callback);
	  }
	  else {
	    // console.log('tweet '+tweet.id_str+' no existe, insertamos');
	    // tweet no existe insertamos el tweet
	    insertauntweet(colecciones[index], tweet, function(insertado) {
	      if (insertado === 'error') {
		console.log('error insertando tweet a mongo');
		return procesatweet(tweet, colecciones, more, callback);
	      }
	      else {
		if (typeof tweet.influencers !== 'undefined') {
                  var cuenta = basecol;
		  var mongo_id = ''+insertado[0]._id;
		  var coleccion_orig = colecciones[index];
		  var coleccion = basecol+'_consolidada';
		  var fecha = tweet.created_time.toString();
		  var post_data = querystring.stringify(
		    {
		      mongo_id : mongo_id,
		      tweet_id : tweet.id,
		      user_id : tweet.user.id,
		      screen_name : tweet.user.screen_name,
		      text : tweet.text,
		      cuenta : cuenta,
		      coleccion : coleccion,
		      col_orig : coleccion_orig,
		      razon : tweet.influencers,
		      tipo : tweet.tipo,
		      fecha : fecha,
		      profile_image : tweet.user.profile_image_url_https,
		      followers: tweet.user.followers_count
		    }
		  );
		  var post_options = {
		    hostname: globales.options_likeable.hostname,
		    port: 443,
		    path: '/notify',
		    method: 'POST',
		    headers: {
		      'Content-Type': 'application/x-www-form-urlencoded',
		      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		      'Content-Length': post_data.length
		    }
		  };
		  var post_req = https.request(post_options, function(res) {
					    res.setEncoding('utf8');
					    res.on('data', function (chunk) {
						// console.log('resp: '+ chunk);
					    });
					});
		  post_req.write(post_data);
		  post_req.end();
		  post_req.on('error', function(e){
					    console.log('escuchador/postinflu varios error: '+e);
					    console.log("Error: " +e.message); 
					    console.log( e.stack );
					});
		}

		  var dadate = tweet.created_time.toString();
		  var nm_data = querystring.stringify(
		      {
			  obj: 'twitter',
			  tipo: 'tracker',
			  created_time: dadate,
			  cuenta: basecol
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

		  return procesatweet(tweet, colecciones, more, callback);
	      }
	    });		    
	  }
	});
      }
    });
  }
};

function armacolecciones(arreglo, sufijo, index, nuevoarreglo, callback) {
  var more = index+1;
  var cuantas = arreglo.length;
  if (more > cuantas) {
    return callback(nuevoarreglo);
  }
  else {
    setImmediate(function(){
      if (typeof arreglo[index] !== 'undefined') {
        nuevoarreglo.push(arreglo[index]+'_'+sufijo);
        return armacolecciones(arreglo, sufijo, more, nuevoarreglo, callback);
      }
      else {
        return armacolecciones(arreglo, sufijo, more, nuevoarreglo, callback);
      }
    });
  }
};

getAccountsConTrackers(function(ctascontrackers){
    if (ctascontrackers === 'error') {
	console.log('no hay trackers, no hacemos nada, IDLE script.......');
    }
    else {
  var dataectas = { cuentas : [], cuentascontid: {}, track : [], tracklc: [], tracks_accounts : {} };

  getFirstArrays(ctascontrackers, 0, [], {}, [], [], dataectas, function(losdatos) {
    var lostrackers = losdatos.track;
    losdatos.tracks_accounts = {};

    get_trackAccounts_array(ctascontrackers, losdatos, lostrackers, 0, function(lostracks){
      var track = lostracks.track;
      var stream = T.stream('statuses/filter', {'track' : track});

      stream.on('tweet', function(tweet){

        clasifica(tweet, lostracks, function(tuit) {
          if (tuit === 'error') {
            console.log('el tweet no corresponde a ningpun termino, tal vez sea la descripcción del twitero');
          }
          else {
            var consolidada = []; var conversatio = []; var colecciones = [];
            if (tuit.colecciones_track.length > 0) {
              consolidada = tuit.colecciones_track;

              armacolecciones(consolidada, 'consolidada', 0, [], function(nuarrei){
	        delete tuit.colecciones_track;
                if(tuit.colecciones_conve.length > 0) {
                  conversatio = tuit.colecciones_conve;

                  armacolecciones(conversatio, 'propio', 0, nuarrei, function(niuarrei){
                    delete tuit.colecciones_conve;

                    procesatweet(tuit, niuarrei, 0, function(indix){
		      if (indix < 1) { console.log(indix); } else if (indix == 1) { console.log('1 tweet'); } else { console.log(indix+' tweets'); }
                    });
                  });
                }
                else {
                  delete tuit.colecciones_conve;

                  procesatweet(tuit, nuarrei, 0, function(indix){
		    if (indix < 1) { console.log(indix); } else if (indix == 1) { console.log('1 tweet'); } else { console.log(indix+' tweets'); }
                  });
                }
              });
            }
            else {
	      delete tuit.colecciones_track;
              if(tuit.colecciones_conve.length > 0) {
                conversatio = tuit.colecciones_conve;

                armacolecciones(conversatio, 'propio', 0, [], function(niwarrei){
                  delete tuit.colecciones_conve;

                  procesatweet(tuit, niwarrei, 0, function(indix){
		    if (indix < 1) { console.log(indix); } else if (indix == 1) { console.log('1 tweet'); } else { console.log(indix+' tweets'); }
                  });
                });
              }
              else {
                delete tuit.colecciones_conve;
                console.log('este tweet no tiene casa, ha de ser de esos que en la descripción venía el término');
              }
            }
          }
        });
      });
    });
  });
    }
});
