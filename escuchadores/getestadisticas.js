var CronJob = require('cron').CronJob;
var bst = require('better-stack-traces').install();
var https = require('https');
var classdb = require('./classdb.js');
var globales = require('./globals.js');

function peticion_automatica() {
  var solicitude = '/getestadisticas';
    var larespuesta = '';
    var fechahora = new Date();
    globales.options_likeable_servs.method = 'GET';
    globales.options_likeable_servs.path = solicitude;
    var solicitud_likeable = https.request(globales.options_likeable_servs, function(respu) {
	respu.setEncoding('utf8');
	respu.on('data', function(dati) {
	    larespuesta += dati;
	});
	respu.on('end', function(){
	    console.log('[ '+fechahora+' ] ' + solicitude +' - '+larespuesta);
	});
    });
    solicitud_likeable.end();
    solicitud_likeable.on('error', function(err){
	console.log('gvc'+solicitude+' - https_request -  error en el request: ' +err);
	// console.log('Error: ' + hostNames[i] + "\n" +err.message);
	console.log(err.stack);
    });    
}

var cronOptions = {
    cronTime: '00 00 07 * * *',
    onTick: peticion_automatica,
    // onComplete: function(){console.log('esto pasa justo después de lo otro');},
    start : false,
    timeZone: 'America/Mexico_City'
};

var dajob = new CronJob(cronOptions);
dajob.start();


