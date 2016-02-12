'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https'), ObjectID = require('mongodb').ObjectID;
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');
var accesstokens = require('../../accesstokens.js');

var json2csv = require('json2csv');
var fs = require('fs');
var myStream = require('json2csv-stream');
var parser = new myStream();
var router = express.Router();

/* GET sentiment page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/sentiment?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){

  function obtieneCuenta(nombreSistema, callback){
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartDesempenio/obtieneCuenta', function(cuenta){
      return callback(cuenta);
    });		
  }

  function cuentaPositivo(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback){
    var coleccion = nombreSistema+'_consolidada';
    var criterio = {};
    if(tipo === 'general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'sentiment' : 'positivo'}
		   ]
		 };
    }else{
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'obj' : tipo},
		     {'sentiment' : 'positivo'}
		   ]
		 };
    } 
    classdb.count(coleccion, criterio, 'charts/chartSentiment/sentimentPositivo', function(sentimentPositivo){	    	  	
      if(sentimentPositivo === 'error'){
	return callback('error');
      }else{
	return callback(sentimentPositivo);
      }
    });
  }

  function cuentaNeutro(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback){
    var coleccion = nombreSistema+'_consolidada';
    var criterio = {};
    if(tipo === 'general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'sentiment' : 'neutro'}
		   ]
		 };
    }else{
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'obj' : tipo},
		     {'sentiment' : 'neutro'}
		   ]
		 };
    } 
    classdb.count(coleccion, criterio, 'charts/chartSentiment/cuentaNeutro', function(sentimentNeutro){	    	  	
      if(sentimentNeutro === 'error'){
	return callback('error');
      }else{
	return callback(sentimentNeutro);
      }
    });
  }

  function cuentaNegativo(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback){
    var coleccion = nombreSistema+'_consolidada';
    var criterio = {};
    if(tipo === 'general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'sentiment' : 'negativo'}
		   ]
		 };
    }else{
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'obj' : tipo},
		     {'sentiment' : 'negativo'}
		   ]
		 };
    } 
    classdb.count(coleccion, criterio, 'charts/chartSentiment/cuentaNegativo', function(sentimentNegativo){	    	  	
      if(sentimentNegativo === 'error'){
	return callback('error');
      }else{
	return callback(sentimentNegativo);
      }
    });
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema = req.query.nombreSistema;
    var tipo = req.query.tipo;
    var fecha_inicial = new Date(req.query.fecha_inicial);
    var fecha_final = new Date(req.query.fecha_final);
    
    var sentiment = {};
    obtieneCuenta(nombreSistema, function(account){
      if(account.length > 0) {
        var idCuenta = '';
        if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage !== ''){
	  idCuenta = account[0].datosPage.id;
        }else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
	  idCuenta = account[0].datosMonitoreo.id;
        }
        cuentaPositivo(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(sentimentPositivo){
	  if(sentimentPositivo === 'error'){
	    console.log('Error sentimentPositivo');
            res.jsonp({error: {errorname:'queryerror', message:'no pudimos conseguir datos de sentiment positivo, volver a intentar'}});
	  }else{
	    sentiment.positivo = sentimentPositivo;
	    cuentaNeutro(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(sentimentNeutro){
	      sentiment.neutro = sentimentNeutro;
	      if(sentimentNeutro === 'error'){
	        console.log('Error sentimentNeutro');
                res.jsonp({error: {errorname:'queryerror', message:'no pudimos conseguir datos de sentiment neutro, volver a intentar'}});
	      }else{
	        cuentaNegativo(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(sentimentNegativo){
		  if(sentimentNegativo === 'error'){
		    console.log('Error en sentimentNegativo');
                    res.jsonp({error: {errorname:'queryerror', message:'no pudimos conseguir datos de sentiment negativo, volver a intentar'}});
		  }else{
		    sentiment.negativo = sentimentNegativo;
		    // console.log('El objeto que regresa es: ');
		    // console.log(sentiment);
		    res.jsonp(sentiment);
		  }
	        });
	      }
	    }); 
	  }
        });
      }
      else {
        res.jsonp({error:{errorname: 'badAccount', message: 'la cuenta no existe en la base de datos'}});
      }
    });
  }
  else {
    res.jsonp({error:{errorname: 'noParams', message: 'no llegaron los parámetros necesarios'}});
  }
});

module.exports = router;
