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

/* GET home page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/gettermcloud?cuenta=compuycomal_consolidada&fecha1=2016-01-16T06:00:00.417Z&fecha2=2016-01-21T23:38:18.417Z
*/

router.get('/', function(req, res){
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

  var coleccion = req.query.cuenta;
  var fecha1 = new Date(req.query.fecha1);
  var fecha2 = new Date(req.query.fecha2);
  var id_facebook = req.query.id_facebook;
  var palabras = [];
  var palabrasTemp = [];	
  var abjeto = {};
  if (coleccion && fecha1 && fecha2) {
    var criteriopage = { from_user_id : { $exists : true }};
    if (typeof id_facebook !== 'undefined') {
      criteriopage  = {from_user_id : {$ne : id_facebook}};
      //console.log(criteriopage);
    }
    var criterius = { $and : [criteriopage, {created_time : {$lte: fecha2}}, {created_time: {$gte: fecha1}},{descartado:{$exists:false}}]};
    var elsort = {created_time: -1};
    var campos = {message : 1, text : 1};
    classdb.buscarToArrayFieldsLimit(coleccion, criterius, campos, elsort, 2000, 'charts/getStringTagCloud.main', function(items) {
      if (items === 'error') {
        res.jsonp(abjeto);
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
    res.jsonp({error:{errorname: 'noParams', message: 'no llegaron los parámetros necesarios'}});
  }
});

module.exports = router;
