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

/* GET termscloud page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/termscloud?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){
    function obtieneCuenta(nombreSistema, callback){
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartDesempenio/obtieneCuenta', function(cuenta){
      return callback(cuenta);
    });		
  }


  function encadenafrases(contenidos, callback) {
    var palabras = [];
    var cuantos = contenidos.length-1;
    // var palabrasTemp = [];
    for (var pal in contenidos) {
      var frase = '';
      if (typeof contenidos[pal].message !== 'undefined' && contenidos[pal].message !== '') {
	frase = contenidos[pal].message;
      }
      else {
	if (typeof contenidos[pal].text !== 'undefined' && contenidos[pal].message !== '') {
	  frase = contenidos[pal].text;
	}
      }
      if(frase !== ''){
	//palabrasTemp = frase.split(' ');
	palabras = palabras.concat(frase.split(' '));
      }
      if (Number(pal) === cuantos) {
	return callback(palabras);
      }
    }	
  };

  function clasificapalabras(palabras, callback) {
    var cuantas = palabras.length;
    var numeroCaracteresMinimos = 10;
    var palabrasExcluidas = ['a','que','de','y','te','la','los','el','hola','en','por','nos','mi','sin','Hola','las','con','un','son','si','se','tu','su',
			     'lo','res','?','??','me','...','y','Y','ya','mas','más','sí','es','Si','Te','ok','para','pero','Por','No','1','2','3','4','5',
			     '6','7','8','9','0','o','mar','tus','Son','son','tal','1era','mi','estas?','Buenos','una','Les','les','De','de','como','.|.',
			     ':D',':)','','\n','mucho','script','undefined'];
    var objetoPalabrasTerminos = [];
    var objetoPalabrasHashtag = [];
    var objetoPalabrasMencion = [];
    var objetoPalabras = [];
    var palabraActual = null;
    var contadorPalabras = 0;
    for (var i = 0; i < palabras.length; i++) {
      if (palabras[i] !== palabraActual) {
	if (contadorPalabras > 0) {
          if((palabrasExcluidas.indexOf(palabraActual) < 0) && (palabraActual.length > numeroCaracteresMinimos)) {
	    var palabraProcesada = palabraActual;
	    palabraProcesada = palabraProcesada.replace('\n','');
	    palabraProcesada = palabraProcesada.replace(':','');
	    palabraProcesada = palabraProcesada.replace(',','');
	    palabraProcesada = palabraProcesada.replace('!','');
	    palabraProcesada= palabraProcesada.replace('-','');
	    palabraProcesada= palabraProcesada.replace('?','');
	    palabraProcesada = palabraProcesada.replace('<script>','');
	    palabraProcesada = palabraProcesada.replace('</script>','');
	    if(palabraActual.search('@') === 0){
	      objetoPalabrasMencion.push({'text':palabraProcesada,'weight':contadorPalabras});	
	    }else if(palabraActual.search('#') === 0){
	      objetoPalabrasHashtag.push({'text':palabraProcesada,'weight':contadorPalabras});	
	    }else{
	      objetoPalabrasTerminos.push({'text':palabraProcesada,'weight':contadorPalabras});	
	    }
          }
	}
	palabraActual = palabras[i];
	contadorPalabras = 1;
      } else {
	contadorPalabras++;
      }
      if (i === cuantas-1) {
	return callback(objetoPalabrasMencion, objetoPalabrasHashtag, objetoPalabrasTerminos);
      }
    }	
  };


  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema = req.query.nombreSistema;
    var fecha1 = new Date(req.query.fecha_inicial);
    var fecha2 = new Date(req.query.fecha_final);
    var tipo = req.query.tipo;
    var coleccion = nombreSistema+'_consolidada';
    obtieneCuenta(nombreSistema, function(account){
      if(account.length > 0) {
        var idCuenta = '';
        if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage !== ''){
	  idCuenta = account[0].datosPage.id;
        }else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
	  idCuenta = account[0].datosMonitoreo.id;
        }
        var palabras = [];
        var palabrasTemp = [];	
        var criteriopage = { from_user_id : { $exists : true }};
        if (idCuenta !== '') {
          if (tipo === 'twitter' || tipo === 'facebook') {
            criteriopage  = {$and: [{from_user_id : {$ne : idCuenta}}, {obj: tipo}]};                        
          }
          else {
            criteriopage  = {from_user_id : {$ne : idCuenta}};
          }
        }
        else {
          if (tipo === 'twitter' || tipo === 'facebook') {
            criteriopage = {$and: [{from_user_id : { $exists : true }}, {obj: tipo}]};
          }
        }

        var criterius = { $and : [criteriopage, {created_time : {$lte: fecha2}}, {created_time: {$gte: fecha1}}, {descartado:{$exists:false}}]};
        var elsort = {created_time: -1};
        var campos = {message : 1, text : 1};
        classdb.buscarToArrayFieldsLimit(coleccion, criterius, campos, elsort, 2000, 'charts/getStringTagCloud.main', function(items) {
          if (items === 'error') {
            res.jsonp({error:{errorname: 'queryerror', message: 'no pudimos conseguir datos con ese criterio, volver a intentar'}});
          }
          else {
            encadenafrases(items, function(palabras){
	      palabras.sort();
	      clasificapalabras(palabras, function(mentions, hashtags, terms){
	        var objetoPalabras = [];
	        terms.sort(function(a, b){
	          return  b.weight - a.weight;
	        });
	        hashtags.sort(function(a, b){
	          return  b.weight - a.weight;
	        });
	        mentions.sort(function(a, b){
	          return  b.weight - a.weight;
	        });
 	        objetoPalabras.push({'terminos':terms});
 	        objetoPalabras.push({'hashtags':hashtags});
 	        objetoPalabras.push({'menciones':mentions});
	        res.jsonp(objetoPalabras);	
	      });
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
