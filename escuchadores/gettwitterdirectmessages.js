var CronJob = require('cron').CronJob;
var bst = require('better-stack-traces').install();
var https = require('https');
var classdb = require('./classdb.js');
var globales = require('./globals.js');

function obtieneDms() {
  var larespuesta = '';
  var fechahora = new Date();
  globales.options_likeable_servs.method = 'GET';
  globales.options_likeable_servs.path = '/getdm';
  
  var solicitandodms = https.request(globales.options_likeable_servs, function(reponse){
                         reponse.setEncoding('utf8');
                         reponse.on('data', function(dati) {
                           larespuesta += dati;
                         });
                         reponse.on('end', function(){
                           console.log('[ '+fechahora+' ] ' + '/getdm'+' - '+larespuesta);
                           return (larespuesta);
                         });
                       });
  solicitandodms.end();
  solicitandodms.on('error', function(err){
    console.log('gvc'+' /getdm '+' - https_request -  error en el request: ' +err);
    console.log(err.stack);
    return ('error');
  });

}

var cronOptions = {
    cronTime: '00 */2 * * * *',
    onTick: obtieneDms,
    // onComplete: function(){console.log('esto pasa justo después de lo otro');},
    start : false,
    timeZone: 'America/Mexico_City'
};

var dajob = new CronJob(cronOptions);
dajob.start();