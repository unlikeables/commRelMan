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

/* GET ratings page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/ratings?nombreSistema=facespa&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-04T23:38:18.417Z
*/

router.get('/', function(req, res){
	//console.log('LA INFO');
	//console.log(req.body);
	
  function obtieneCuenta(nombreSistema, callback){
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema' : nombreSistema}, sort, 'charts/chartDesempenio/obtieneCuenta', function(cuenta){
      return callback(cuenta);
    });		
  }

  function obtieneTodos(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback){
    var criterio = {};
    if(tipo === 'general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'obj' : 'facebook'},
		     {'tipo' : 'rating'}
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
		     {'obj' : 'facebook'},
		     {'tipo' : 'rating'}
		   ]
		 };
    } 
    //classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/ConsigueDescartado', function(mensajes){	    	
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartRating/obtieneTodos', function(mensajes){		    	
      if(mensajes === 'error'){
	return callback('error');
      }else{
	return callback(mensajes);
      }
    });
  }
  
  function desglosaRating(rating, index, objetoRating, callback){
    var cuantos = rating.length;
    var more = index+1;
    if (more > cuantos) {
      return callback (objetoRating);
    }
    else {
      setImmediate(function(){
        if (typeof rating[index] !== 'undefined') {
          if (rating[index].rating === 0) {
	    objetoRating.ceroEstrellas = objetoRating.ceroEstrellas + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else if(rating[index].rating === 1) {
	    objetoRating.unaEstrella = objetoRating.unaEstrella + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else if(rating[index].rating === 2) {
	    objetoRating.dosEstrellas = objetoRating.dosEstrellas + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else if(rating[index].rating === 3) {
	    objetoRating.tresEstrellas = objetoRating.tresEstrellas + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else if(rating[index].rating === 4) {
	    objetoRating.cuatroEstrellas = objetoRating.cuatroEstrellas + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else if(rating[index].rating === 5) {
	    objetoRating.cincoEstrellas = objetoRating.cincoEstrellas + 1;
            return desglosaRating(rating, more, objetoRating, callback);
          }
          else {
            console.log('ESTRELLAS NO VALIDAS');
            return desglosaRating(rating, more, objetoRating, callback);
          }
        }
        else {
          return desglosaRating(rating, more, objetoRating, callback);
        }
      });
    }
  }
    
  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema = req.query.nombreSistema;
    var tipoEntrada = req.query.tipo;
    var fechainicial = new Date(req.query.fecha_inicial);
    var fechafinal = new Date(req.query.fecha_final);

    obtieneCuenta(nombreSistema, function(account){
      var idCuenta = '';
      if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage !== ''){
        idCuenta = account[0].datosPage.id;
      }
      else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
        idCuenta = account[0].datosMonitoreo.id;
      }
    
      obtieneTodos(tipoEntrada, nombreSistema, fechainicial, fechafinal, idCuenta, function(mensajesRating){
        if(mensajesRating === 'error'){
          res.jsonp({error: {errorname:'queryerror', message:'no pudimos conseguir datos de ratings, volver a intentar'}});
        }else{
	  if(mensajesRating.length > 0){
	    var objetoRating = {}; objetoRating.cincoEstrellas = 0; objetoRating.cuatroEstrellas = 0; objetoRating.tresEstrellas = 0;
	    objetoRating.dosEstrellas = 0; objetoRating.unaEstrella = 0; objetoRating.ceroEstrellas = 0;
            
            desglosaRating(mensajesRating, 0, objetoRating, function(resRating){
	      res.jsonp(resRating);
	    });
	  }else{
	    res.jsonp(0);
	  }
        }
      });
    });
  }
  else {
    res.jsonp({error:{errorname: 'noParams', message: 'no llegaron los parámetros necesarios'}});
  }
});

module.exports = router;
