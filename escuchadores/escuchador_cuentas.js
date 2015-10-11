var bst = require('better-stack-traces').install();

var https = require('https');
var querystring = require('querystring');
var _ = require('lodash');
var Twit = require('twit');

var llaves = 
    {
      "consumer_key":"J6s0rQHWLsD2wJ5LT7ScTerL9",
      "consumer_secret":"IEVhbW9qfHGU7nbVS4kNfZFVwkkvGnUZQUOjYjwI8ybNjQjuwi",
      "access_token":"1694381664-qUYMFtqtJET7ky0Nnw7etwAYBNIjQFsl7VTfpLj",
      "access_token_secret":"nPYv16f64w54YTerqk2fGlbGKcefGz2TIBgnNqjLYVfWa"
    };
     T = new Twit(llaves), losdatos = {};
var classdb = require('./classdb.js');
var globales = require('./globals.js');

function getAccountsConDatosTwitter(callback) {
  var criterium = {
    $and: [
      {'datosTwitter' : {$exists: true}}, 
      {'datosTwitter.twitter_screenname_principal' : { $exists: true }},
      {'datosTwitter.twitter_screenname_principal' : { $ne: ''}},
      {'datosTwitter.twitter_id_principal' : {$exists: true}},
      {'datosTwitter.twitter_id_principal' : {$ne: ''}}
    ]
  };

  var accountfields = {
    '_id' : '', 
    'nombreSistema' : '', 
    'datosTwitter': '',
    'created_time' : ''
  };

  classdb.buscarToArrayFields ('accounts', criterium, accountfields, {}, 'escuchadores/escuchador_trackers/getAccountsConTrackers', function(diecuenten) {
    return callback(diecuenten);
  });
};

function generaArregloCtas(datae, index, arregloCtas, callback) {
  var more = index+1;
  var cuantas = datae.length;
  if (more > cuantas) {
    return callback(arregloCtas);
  }
  else {
    setImmediate(function(){
      if (typeof datae[index] !== 'undefined') {
        var snprin = datae[index].datosTwitter.twitter_screenname_principal;
        var idprin = datae[index].datosTwitter.twitter_id_principal;
        var objeto = {};
        if (snprin !== null && snprin !== '-1') {
          objeto.nombre = datae[index].nombreSistema;
          objeto.track = [];
          objeto.track.push(snprin);
          objeto.follow = [];
          objeto.follow.push(idprin);
          var snresp = datae[index].datosTwitter.twitter_screenname_respuesta;
          var idresp = datae[index].datosTwitter.twitter_id_respuesta;
          if (snresp !== null && snresp !== '' && snresp !== '-1'){
            objeto.track.push(datae[index].datosTwitter.twitter_screenname_respuesta);
            objeto.follow.push(datae[index].datosTwitter.twitter_id_respuesta);
            arregloCtas.push(objeto);
            return generaArregloCtas(datae, more, arregloCtas, callback);
          }
          else {
            arregloCtas.push(objeto);
            return generaArregloCtas(datae, more, arregloCtas, callback);
          }
        }
        else {
          return generaArregloCtas(datae, more, arregloCtas, callback);
        }
      }
      else {
        return generaArregloCtas(datae, more, arregloCtas, callback);
      }
    });
  }
};

function getFirstArrays(accounts, callback) {
    var datosctas = { cuentas : [], follow : [], track : [] , trackuc : [], trackat : []};
    var cuentas = [], follow = [], track = [], trackuc = [], trackat = []; 
    var num = 0;
    for (var k in accounts) {
	num++;
	cuentas[k] = accounts[k].nombre;
	if (accounts[k].follow.length > 0 && accounts[k].follow[0] !== null) {
	    for (var l in accounts[k].follow) {
		follow.push(accounts[k].follow[l]);
	    }
	}
	if (accounts[k].track.length > 0 && accounts[k].track[0] !== null) {
	    for (var n in accounts[k].track) {
		track.push(accounts[k].track[n].toLowerCase());
		trackat.push('@'+accounts[k].track[n].toLowerCase());
		trackuc.push(accounts[k].track[n]);
	    }
	}
	if (num === accounts.length) {
	    track.sort(function(a, b){
		return b.length - a.length; // ASC -> a - b; DESC -> b - a
	    });
    
	    trackat.sort(function(a, b){
		return b.length - a.length; // ASC -> a - b; DESC -> b - a
	    });
    
	    trackuc.sort(function(a, b){
		return b.length - a.length; // ASC -> a - b; DESC -> b - a
	    });

	    datosctas.cuentas = cuentas;
	    datosctas.follow = _.uniq(follow);
	    datosctas.track = _.uniq(track);
	    datosctas.trackat = _.uniq(trackat);
	    datosctas.trackuc = _.uniq(trackuc);
	    return callback(datosctas);
	}
    }    
};

function get_followAccounts_array(thedata, configCuentas, callback) {
    var thefollows = thedata.follow;
    var follows_accounts = {};
    var fo_acc_wp = {};
    var followsc = 0;
    for (var i in thefollows) {
	followsc++;
	var elfollow = thefollows[i];
	follows_accounts[elfollow] = [];
	fo_acc_wp[elfollow] = [];
	var cta = 0;
	for (var j in configCuentas) {
	    cta++;
	    var ctafollow = configCuentas[j].follow;
	    if (ctafollow.indexOf(elfollow) >= 0) {
		follows_accounts[elfollow].push(configCuentas[j].nombre);
		fo_acc_wp[elfollow].push(configCuentas[j].nombre+'_propio');
	    }
	    if (followsc === thefollows.length && cta == configCuentas.length){
		var ctaf = 0;
		for (var k in configCuentas[j].follow) {
		    ctaf++;
		    if (ctaf === configCuentas[j].follow.length) {
			thedata.follows_accounts = follows_accounts;
			thedata.fo_acc_wp = fo_acc_wp;
			return callback(thedata);
		    }
		}
	    }
	}
    }
};

function get_trackAccounts_array(thedata, configCuentas, callback) {
    var thetracks = thedata.trackuc;
    var dietraken = thedata.track;
    var tracks_accounts = {};
    var tr_acc_wp_at = {};
    var tr_acc_wp_conv = {};
    var tracksc = 0;
    for (var i in thetracks) {
	tracksc++;
	var eltrack = thetracks[i];
	tracks_accounts[dietraken[i]] = [];
	tr_acc_wp_at[dietraken[i]] = [];
	tr_acc_wp_conv[dietraken[i]] = [];
	var ctas = 0;

	for (var j in configCuentas) {
	    ctas++;
	    var arraytracks = configCuentas[j].track;
	    if (arraytracks.indexOf(eltrack) >=0) {
		tracks_accounts[dietraken[i]].push(configCuentas[j].nombre);
		tr_acc_wp_at[dietraken[i]].push(configCuentas[j].nombre+'_AT'+dietraken[i]);
		tr_acc_wp_conv[dietraken[i]].push(configCuentas[j].nombre+'_CO'+dietraken[i]);
	    }
	    if (tracksc === thetracks.length && ctas === configCuentas.length) {
		var ctaf = 0;
		for (var k in configCuentas[j].track) {
		    ctaf++;
		    if (ctaf === configCuentas[j].track.length) {
			thedata.tracks_accounts = tracks_accounts;
			thedata.tr_acc_wp_at = tr_acc_wp_at;
			thedata.tr_acc_wp_conv = tr_acc_wp_conv;
			return callback(thedata);
		    }
		}
	    }
	}
    }
};

function clasifica(untweet, losdatos, callback){
	// console.log('Imprimiendo los datos');
	// console.log(losdatos);
    var follow = losdatos.follow, 
	track = losdatos.track,
	trackat = losdatos.trackat,
	follow_acc = losdatos.fo_acc_wp,
	track_acc = losdatos.tr_acc_wp_at,
	track_acc_co = losdatos.tr_acc_wp_conv,
	eltwitlc = untweet.text.toLowerCase();
    // console.log(eltwitlc);
    if (follow.indexOf(untweet.user.id) >= 0){
	console.log('es de nosotros \n');
	untweet.colecciones_pr = [];
	for (var b in follow_acc[untweet.user.id]){
	    untweet.colecciones_pr.push(follow_acc[untweet.user.id][b]);
	} 
	return callback(untweet);
    }
    else {
	console.log('No es de nosotros');
	// console.log('Probando ');
	untweet.colecciones_at = [];
	untweet.colecciones_conv = [];
	var colecciones_at = [], colecciones_conv = [];
	var num = 0;
	for (var i in track) {
	    num++;
	    if(eltwitlc.indexOf(trackat[i]) >= 0) {
		// insertamos en bd AT
		console.log(i+' es índice AT');
		eltwitlc = eltwitlc.replace(trackat[i], '');
		colecciones_at = colecciones_at.concat(track_acc[track[i]]);
	    }
	    else {
		// vemos si coincide de manera más genérica
		if (eltwitlc.indexOf(track[i]) >= 0) {
		    // si sí insertamos en db CONV
		    console.log(i+' es índice CONV');
		    eltwitlc = eltwitlc.replace(track[i], '');
		    colecciones_conv = colecciones_conv.concat(track_acc_co[track[i]]);
		}
		else {
		    var urls = untweet.entities.urls;
		    for (var u in urls) {
			if (urls[u].display_url.indexOf(track[i]) >= 0) {
			    console.log(i+' url es índice CONV');
			    delete untweet.entities.urls[u];
			    colecciones_conv = colecciones_conv.concat(track_acc_co[track[i]]);
			}
		    }
		}
	    }
	    if (num === track.length) {
		if (colecciones_at.length > 0) {
		    untweet.colecciones_at = _.uniq(colecciones_at);
		}
		else {
		    delete untweet.colecciones_at;
		}
		if (colecciones_conv.length > 0) {
		    untweet.colecciones_conv = _.uniq(colecciones_conv);
		}
		else {
		    delete untweet.colecciones_conv;
		}
		return callback(untweet);
	    }
	}
    }
};

function esinfluencer(coleccion, user_id, callback) {
    var criterio = {idUser : user_id};
    classdb.buscarToArray('influencers_'+coleccion, criterio, {}, 'escuchador/escuchador.js/esinfluencer', function(influencer){
	return callback(influencer);
    });
}

function existetweet(coleccion, tweet, callback) {
    var criterio = {id_str : tweet.id_str};
    var elemcol = coleccion.split("_");
    var basecol = elemcol[0], sectermcol = elemcol[1], firsttwo = sectermcol.substring(0,2);
    if (firsttwo !== 'AT') {
	classdb.existecount(coleccion, criterio, 'escuchador/escuchador.js/existetweet', function(existe){
	    return callback(existe);
	});
    }
    else {
	var colec = basecol+'_consolidada';
	classdb.existecount(colec, criterio, 'escuchador/escuchador.js/existetweet', function(existe){
	    return callback(existe);
	});
    }
};

function insertauntweet(coleccion, tweet, callback) {
    var elemcol = coleccion.split("_");
    var basecol = elemcol[0], sectermcol = elemcol[1], firsttwo = sectermcol.substring(0,2);
    if (firsttwo !== 'AT') {
	classdb.insertacresult(coleccion, tweet, 'escuchador/escuchador.js/insertauntweet', function(insercion){
	    return callback(insercion);
	});
    }
    else {
	var colec = basecol+'_consolidada';
	tweet.coleccion = colec;
	tweet.coleccion_orig = coleccion;
	tweet.obj = 'twitter';
	tweet.tipo = 'twit';
	classdb.insertacresult(colec, tweet, 'escuchador/escuchador.js/insertauntweet', function(inserta){
	    return callback(inserta);
	});
    }
};

function procesatweet(tweet, colecciones, index, callback) {
    if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	index = 0;
    }
    var more = index+1;
    if (more > colecciones.length) {
	return callback(index);	
    }
    else {
	var elemcol = colecciones[index].split("_");
	var basecol = elemcol[0], sectermcol = elemcol[1], firsttwo = sectermcol.substring(0,2);
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
		    if (existe === 'error') {
			console.log('error al comprobar existencia de tweet '+tweet.id_str);
			return procesatweet(tweet, colecciones, more, callback);
		    }
		    else if (existe === 'existe') {
			console.log('tweet '+tweet.id_str+' ya existe, no insertamos');
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
				if (firsttwo !== 'AT') {
				    console.log('no fue mention, no hace falta mandarlo a notificaciones');
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
				    if (!tweet.retweeted_status) {
					var dadate = tweet.created_time.toString();
					var nm_data = querystring.stringify(
					    {
						obj: 'twitter',
						tipo: 'twit',
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
				    }
				    return procesatweet(tweet, colecciones, more, callback);
				}
			    }
			});		    
		    }
		});
	    }
	});
    }
};

getAccountsConDatosTwitter(function(lascuentas){
  generaArregloCtas(lascuentas, 0, [], function(ctasprocesadas) {
    getFirstArrays(ctasprocesadas, function(losdatos){
      get_followAccounts_array(losdatos, ctasprocesadas, function(losfollows){
        get_trackAccounts_array(losfollows, ctasprocesadas, function(lostracks){
          // console.log(lostracks);
	  var follow = lostracks.follow;
	  var track = lostracks.trackuc;
	  var stream = T.stream("statuses/filter", {"follow" : follow, "track" : track});
	  stream.on('tweet', function (tweet) {
            // console.log(tweet);
	    clasifica(tweet, lostracks, function(tuit){
	      var colecciones = [];
	      if (tuit.colecciones_pr) { 
		var numa = 0;
		for (var a in tuit.colecciones_pr) {
		  numa++;
		  colecciones.push(tuit.colecciones_pr[a]);
		  if (numa === tuit.colecciones_pr.length) {
		    delete tuit.colecciones_pr;
		  }
		}
	      }
	      if (tuit.colecciones_at) { 
		var numc = 0;
		for (var c in tuit.colecciones_at) {
		  numc++;
		  colecciones.push(tuit.colecciones_at[c]);
		  if (numc === tuit.colecciones_at.length) {
		    delete tuit.colecciones_at;
		  }
		}
	      }
	      if (tuit.colecciones_conv) { 
		var numd = 0;
		for (var d in tuit.colecciones_conv) {
		  colecciones.push(tuit.colecciones_conv[d]);
		  if (numd === tuit.colecciones_conv.length) {
		    delete tuit.colecciones_conv;
		  }
		}
	      }
	      // console.log(colecciones);
	      procesatweet(tuit, colecciones, 0, function(indx){
		if (indx < 1) {
		  console.log(indx);
		}
		else if (indx == 1) {
		  console.log('1 tweet');
		}
		else {
		  console.log(indx+' tweets');
		}
	      });
	    });
	  });
        });
      });
    });
  });
});
