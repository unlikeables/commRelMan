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

/* GET descartados page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/descartados?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){
  function obtieneCuenta(nombreSistema,callback){
    var arregloUsuarios=[];
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartDescartados/obtieneCuenta', function(cuenta){		    	
      if(cuenta === 'error'){
	return callback('error');
      }else{
	return callback(cuenta);
      }
    });		
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema = req.query.nombreSistema;
    var tipoEntrada = req.query.tipo;
    var fechainicial = new Date(req.query.fecha_inicial);
    var fechafinal = new Date(req.query.fecha_final);
    obtieneCuenta(nombreSistema, function(account){
      var idCuenta = '', idTwitter = '';
      if(account[0] && account[0].datosPage && account[0].datosPage.id && account[0].datosPage.id !== ''){
        idCuenta = account[0].datosPage.id;
        if (account[0].datosTwitter && account[0].datosTwitter.twitter_id_principal) {
	  idTwitter = account[0].datosTwitter.twitter_id_principal;
        }
      }
      else if(account[0] && account[0].datosMonitoreo && account[0].datosMonitoreo.id && account[0].datosMonitoreo.id !== ''){
        idCuenta = account[0].datosMonitoreo.id;
        if (account[0].datosTwitter && account[0].datosTwitter.twitter_id_principal) {
	  idTwitter = account[0].datosTwitter.twitter_id_principal;
        }
      }
      else {
        if (account[0] && account[0].datosTwitter && account[0].datosTwitter.twitter_id_principal && account[0].datosTwitter.twitter_id_principal !== '') {
	  idTwitter = account[0].datosTwitter.twitter_id_principal;
        }
      }
      var criterio = {};
      if(tipoEntrada==='general'){
        criterio = {$and:
		    [ 
		      {'descartado':{$exists:true}},
		      {'created_time':{$gte: fechainicial}},
		      {'created_time':{$lte: fechafinal}},
		      {'descartado':{$ne:''}},
		      {'from.id':{$ne : idCuenta}},
		      {'eliminado':{$exists: false}}
		    ]
		   };
      }else{
        criterio = {$and:
		    [
		      {'descartado':{$exists:true}},
		      {'obj':tipoEntrada},
		      {'created_time':{$gte: fechainicial}},
		      {'created_time':{$lte: fechafinal}},
		      {'descartado':{$ne:''}},
		      {'from.id':{$ne : idCuenta}},
		      {'eliminado':{$exists: false}}
		    ]
		 };
      }
      classdb.buscarToArrayFields(nombreSistema+'_consolidada',criterio,{'descartado' : ''},{},'chartDescartados',function(data){
        if(data === 'error'){
	  //console.log(data);
	  res.jsonp('error');
        }else{
	  if(data.length > 0){
	    var count = {};
	    var answered=0 , spam=0 , insult=0 , troll=0 , related=0 , otro=0 , campaign=0 , mediatico=0;
	    for(var i = 0; i < data.length; i++){
	      switch(data[i].descartado.motivo){
	        case 'answered': answered++; break;
	        case 'spam': spam++; break;
	        case 'insult': insult++; break;
	        case 'troll': troll++; break;
	        case 'not-related': related++; break;
	        case 'otro': otro++; break;
	        case 'campaign': campaign++;break;
	        case 'other_comments':mediatico++;break; 
	        default: console.log('Opcion invalida');
	      }
	    }
	    var objeto={};
	    objeto.total=data.length;
	    objeto.respondidas=answered;
	    objeto.spam=spam;
	    objeto.insulto=insult;
	    objeto.troll=troll;
	    objeto.irrelevante=related;
	    objeto.otro=otro;
	    //if(nombreSistema === 'dish'){
	    objeto.campaña=campaign;
	    objeto.mediático = mediatico;
	    //}
	    res.jsonp(objeto);
	  }else{
	    //console.log('No hay resultados');
	    res.jsonp('No hubo resultados');
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
