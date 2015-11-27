'use strict';

var bst = require('better-stack-traces').install();
var CronJob = require('cron').CronJob;
var https = require('https');
var classdb = require('./classdb.js');
var globales = require('./globals.js');

var options_get = {
    hostname : globales.options_likeable.hostname,
    port: 443,
    method: 'GET'
};

function condensaLCSs(LCSs, index, suma, callback){
  var mais = index+1;
  var cuantoslcs = LCSs.length;
  if (mais > cuantoslcs) {
    callback(suma);
  }
  else {
    setImmediate(function(){
      if (typeof LCSs[index].comments !== 'undefined' && typeof LCSs[index].comments.count !== 'undefined' && LCSs[index].comments.count !== 0) {
	suma.comments += LCSs[index].comments.count;
	if (typeof LCSs[index].likes !== 'undefined' && typeof LCSs[index].likes.count !== 'undefined' && LCSs[index].likes.count !== 0) {
	  suma.likes += LCSs[index].likes.count;
	  if (typeof LCSs[index].shares !== 'undefined' && typeof LCSs[index].shares.count !== 'undefined' && LCSs[index].shares.count !== 0) {
	    suma.shares += LCSs[index].shares.count;
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	  else {
	    // no hacemos nada
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	}
	else {
	  if (typeof LCSs[index].shares !== 'undefined' && typeof LCSs[index].shares.count !== 'undefined' && LCSs[index].shares.count !== 0) {
	    suma.shares += LCSs[index].shares.count;
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	  else {
	    // no hacemos nada
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	}
      }
      else {
	if (typeof LCSs[index].likes !== 'undefined' && typeof LCSs[index].likes.count !== 'undefined' && LCSs[index].likes.count !== 0) {
	  suma.likes += LCSs[index].likes.count;
	  if (typeof LCSs[index].shares !== 'undefined' && typeof LCSs[index].shares.count !== 'undefined' && LCSs[index].shares.count !== 0) {
	    suma.shares += LCSs[index].shares.count;
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	  else {
	    // no hacemos nada
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	}
	else {
	  if (typeof LCSs[index].shares !== 'undefined' && typeof LCSs[index].shares.count !== 'undefined' && LCSs[index].shares.count !== 0) {
	    suma.shares += LCSs[index].shares.count;
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	  else {
	    // no hacemos nada
	    return condensaLCSs(LCSs, mais, suma, callback);
	  }
	}
      }
    });
  }
};

function condensaRcFcs(RcFcs, index, suma, callback) {
  var mais = index+1;
  var cuantosrcfcs = RcFcs.length;
  if (mais > cuantosrcfcs) {
    callback(suma);
  }
  else {
    setImmediate(function(){
      if (typeof RcFcs[index].retweet_count !== 'undefined' && RcFcs[index].retweet_count !== 0) {
	suma.rt_count += RcFcs[index].retweet_count;
	if (typeof RcFcs[index].favorite_count !== 'undefined' && RcFcs[index].favorite_count !== 0) {
	  suma.fv_count += RcFcs[index].favorite_count;
	  return condensaRcFcs(RcFcs, mais, suma, callback);
	}
	else {
	  // no hacemos nada
	  return condensaRcFcs(RcFcs, mais, suma, callback);
	}
      }
      else {
	// no tiene retweet_count
	if (typeof RcFcs[index].favorite_count !== 'undefined' && RcFcs[index].favorite_count !== 0) {
	  suma.fv_count += RcFcs[index].favorite_count;
	  return condensaRcFcs(RcFcs, mais, suma, callback);
	}
	else {
	  // no hacemos nada
	  return condensaRcFcs(RcFcs, mais, suma, callback);
	}
      }
    });
  }
};


function guardaLCSs(suma, fans, callback) {
    var collectio = suma.cuenta+'_crecimiento';
    var col_acum = suma.cuenta+'_acumulado';
    var unafecha = new Date();
    var elanio = unafecha.getFullYear();
    var dermes = unafecha.getMonth(); var elmes = dermes + 1; if (elmes < 10) { elmes = '0'+elmes; }
    var eldia = unafecha.getDate(); if (eldia < 10) { eldia = '0'+eldia; }
    var created_time = new Date(elanio+'-'+elmes+'-'+eldia+' 23:59:59 GMT-0500');
    var fechaymd = parseInt(elanio+elmes+eldia);
   
    var criterius = { fecha : fechaymd, created_time: created_time};
    var elset = {comments: suma.comments, likes: suma.likes, shares: suma.shares, fans: fans};
    var objeto = {comments: suma.comments, likes: suma.likes, shares: suma.shares, fans: fans, fecha: fechaymd, created_time: created_time};

    classdb.existecount(collectio, criterius, 'escuchadores/cron_crecimiento/guardaLCSs', function(existe){
	if (existe === 'error') {
	    return callback(existe);
	}
	else if (existe === 'existe') {
	    classdb.buscarToArray(collectio, criterius, {fecha: -1}, 'escuchadores/cron_crecimiento/guardaLCSs', function(elemento){
		if (elemento === 'error') {
		   return callback(elemento);
		}
		else {
		    classdb.actualiza(collectio, criterius, elset, 'escuchadores/cron_crecimiento/guardaLCSs', function(actualizad) {
			return callback(actualizad);
		    });
		}
	    });
	}
	else {
	    classdb.inserta(collectio, objeto, 'escuchadores/cron_crecimiento/guardaLCSs', function(insercion){
		return callback(insercion);
	    });
	}
    });
};

function guardaRcFcs(suma, followers, tweets, favs, callback) {
    var collectio = suma.cuenta+'_crecimiento';
    var unafecha = new Date();
    var elanio = unafecha.getFullYear();
    var dermes = unafecha.getMonth(); var elmes = dermes + 1; if (elmes < 10) { elmes = '0'+elmes; }
    var eldia = unafecha.getDate(); if (eldia < 10) { eldia = '0'+eldia; }
    var created_time = new Date(elanio+'-'+elmes+'-'+eldia+' 23:59:59 GMT-0500');
    var fechaymd = parseInt(elanio+elmes+eldia);
   
    var criterius = { fecha : fechaymd, created_time: created_time};
    var elset = {retweet_count: suma.rt_count, favorite_count: suma.fv_count, followers: followers, tweets:tweets, favorites : favs };
    var objeto = { retweet_count : suma.rt_count, favorite_count : suma.fv_count, followers : followers, tweets : tweets, favorites : favs, fecha : fechaymd, created_time : created_time };

    classdb.existecount(collectio, criterius, 'escuchadores/cron_crecimiento/guardaRcFcs', function(existe){
	if (existe === 'error') {
	    return callback(existe);
	}
	else if (existe === 'existe') {
	    classdb.buscarToArray(collectio, criterius, {fecha: -1}, 'escuchadores/cron_crecimiento/guardaRcFcs', function(elemento){
		if (elemento === 'error') {
		   return callback(elemento);
		}
		else {
		    classdb.actualiza(collectio, criterius, elset, 'escuchadores/cron_crecimiento/guardaLCSs', function(actualizad) {
			return callback(actualizad);
		    });
		}
	    });
	}
	else {
	    classdb.inserta(collectio, objeto, 'escuchadores/cron_crecimiento/guardaLCSs', function(insercion){
		return callback(insercion);
	    });
	}
    });
}

function obtenLCS(cuenta, fans, callback) {
    var fields = {'shares.count':'','likes.count': '', 'comments.count': ''};
    classdb.buscarToArrayFields(cuenta+'_fb_publicaciones', {}, fields, {}, 'escuchadores/cron_crecimiento/obtenLCS', function(items){
	var suma = {cuenta: cuenta, comments:0, likes:0, shares:0};
	condensaLCSs(items, 0, suma, function(thesum) {
	    guardaLCSs(thesum, fans, function(actualizo){
		return callback(actualizo);
	    });
	});
    });
};

function obtenRcFcs(cuenta, followers, tweets, favs, callback) {
    var fields = { retweet_count: '', favorite_count: '' };
    classdb.buscarToArrayFields(cuenta+'_propio', {}, fields, {}, 'escuchadores/cron_crecimiento/obtenRcFc', function(items) {
	var suma = {cuenta: cuenta, rt_count: 0, fv_count: 0 };
	condensaRcFcs(items, 0, suma, function(lasuma) {
	    guardaRcFcs(lasuma, followers, tweets, favs, function(guarda){
		return callback(guarda);
	    });
	});
    });
};

function iteraCuentas(cuentas, index, callback) {
  var more = index+1;
  var cuantasc = cuentas.length;
  if (more > cuantasc) {
    return callback('ok');
  }
  else {
    setImmediate(function(){
      // console.log(cuentas[index].nombreSistema);
      if (typeof cuentas[index].datosPage !== 'undefined') {
	// console.log('tieneDatosPage');
	classdb.buscarToArray(cuentas[index].nombreSistema+'_fans_ahora', {}, {}, 'escuchadores/cron_crecimiento/iteraCuentas', function(items) {
	  var fans = 0;
	  if (items !== 'error' && typeof items[0] !== 'undefined') {
	    fans = items[0].fans;
	  }
	  obtenLCS(cuentas[index].nombreSistema, fans, function(yup){
	    if (typeof cuentas[index].datosTwitter !== 'undefined') {
	      // console.log('tieneTwitter');
	      classdb.buscarToArray(cuentas[index].nombreSistema+'_twitter_data_ahora', {}, {}, 'escuchadores/cron_crecimiento/iteraCuentas', function(td){
		var followers = 0, tweets = 0, favorites = 0;
		if (td !== 'error') {
		  followers = td[0].followers; tweets = td[0].tweets; favorites = td[0].favorites;
		}
		obtenRcFcs(cuentas[index].nombreSistema, followers, tweets, favorites, function(yep){
		  return iteraCuentas(cuentas, more, callback);				
		});
	      });
	    }
	    else {
	      return iteraCuentas(cuentas, more, callback);
	    }
	  });
	});
      }
      else {
	if (typeof cuentas[index].datosMonitoreo !== 'undefined') {
	  // console.log('tieneMonitoreo');
	  classdb.buscarToArray(cuentas[index].nombreSistema+'_fans_ahora', {}, {}, 'escuchadores/cron_crecimiento/iteraCuentas', function(items) {
	    var fans = 0;
	    if (items !== 'error' && typeof items[0] !== 'undefined') {
	      fans = items[0].fans;
	    }
	    obtenLCS(cuentas[index].nombreSistema, fans, function(yup){
	      if (typeof cuentas[index].datosTwitter !== 'undefined') {
		// console.log('tieneTwitter');
		classdb.buscarToArray(cuentas[index].nombreSistema+'_twitter_data_ahora', {}, {}, 'escuchadores/cron_crecimiento/iteraCuentas', function(td){
		  var followers = 0, tweets = 0, favorites = 0;
		  if (td !== 'error') {
		    if (typeof td[0] !== 'undefined') {
		      if (typeof td[0].followers !== 'undefined') {
			followers = td[0].followers; 
		      }
		      if (typeof td[0].tweets !== 'undefined') {
			tweets = td[0].tweets; 
		      }
		      if (typeof td[0].favorites !== 'undefined') {
			favorites = td[0].favorites;
		      }
		    }
		  }
		  obtenRcFcs(cuentas[index].nombreSistema, followers, tweets, favorites, function(yep){
		    return iteraCuentas(cuentas, more, callback);				
		  });				
		});
	      }
	      else {
		return iteraCuentas(cuentas, more, callback);				
	      }
	    });
	  });
	}	 
	else {
	  if (typeof cuentas[index].datosTwitter !== 'undefined') {
	    // console.log('tieneTwitter');
	    classdb.buscarToArray(cuentas[index].nombreSistema+'_twitter_data_ahora', {}, {}, 'escuchadores/cron_crecimiento/iteraCuentas', function(td){
	      var followers = 0, tweets = 0, favorites = 0;
	      if (td !== 'error') {
		followers = td[0].followers; tweets = td[0].tweets; favorites = td[0].favorites;
	      }
	      obtenRcFcs(cuentas[index].nombreSistema, followers, tweets, favorites, function(yep){
		return iteraCuentas(cuentas, more, callback);				
	      });				
	    });
	  }
	  else {
	    return iteraCuentas(cuentas, more, callback);				
	  }
	}
      }
    });
  }
};

function obtieneCrecimientos() {
    var criterio = { $or : [
   	{ $and : [
	    {'datosMonitoreo' : {$exists : true}},
   	    {'datosMonitoreo' : {$ne : ''}},
	    {'datosMonitoreo.id' : {$exists : true}},
   	    {'datosMonitoreo.id' : {$ne : ''}}
   	]},
   	{ $and : [
   	    {'datosPage' : {$exists : true}},
	    {'datosPage': {$ne : ''}},
	    {'datosPage.id' : {$exists : true}},
	    {'datosPage.id' : {$ne : ''}}
   	]},
	{ $and : [
	    {'datosTwitter' : {$exists: true}},
	    {'datosTwitter' : {$ne: ''}},
	    {'datosTwitter.twitter_id_principal': {$exists: true}},
	    {'datosTwitter.twitter_id_principal': {$ne: ''}}
	]}
    ]};
    var fields = {nombreSistema: '', 'datosPage.id':'', 'datosMonitoreo.id': '', 'datosTwitter.twitter_id_principal':''};
    var desort = {nombreSistema: 1};
    classdb.buscarToArrayFields('accounts', criterio, fields, desort, 'escuchadores/cron_crecimiento/obtieneCrecimientos', function(items){
	iteraCuentas(items, 0, function(respuesta){
	    console.log(respuesta);
	});
	console.log('esto debería de verse cada minuto, creo, son las: '+new Date());
    });
};

var cronOptions = {
    cronTime: '00 54 23 * * *',
    onTick: obtieneCrecimientos,
    // onComplete: function(){console.log('esto pasa justo después de lo otro');},
    start : false,
    timeZone: 'America/Mexico_City'
};

var dajob = new CronJob(cronOptions);
dajob.start();

// setTimeout(function(){dajob.stop();}, 360000);
