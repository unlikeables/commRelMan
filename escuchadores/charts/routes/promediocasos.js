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

/* GET promediocasos page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/promediocasos?nombreSistema=compuycomal&tipo=general&fecha_inicial=2016-01-01T06:00:00.417Z&fecha_final=2016-02-01T23:38:18.417Z
*/

router.get('/', function(req, res){
  //funcion opara obtener la cuenta
  function obtieneCuenta(nomeSis, callback){
    var arregloUsuarios=[];
    var coleccion = 'accounts';
    var critcol = {'nombreSistema': nomeSis};
    var sort = {};
    classdb.buscarToArray(coleccion, critcol, sort, 'charts/chartPromedioCasos/obtieneCuenta', function(cuenta){
      return callback(cuenta);
    });		
  }
  
  function obtieneTodos(coleccion, debut, finale, idFb, callback) {
    var criterio = { $and: 
		     [
		       {'created_time' : {$gte : debut}},
		       {'created_time' : {$lte : finale}},
		       {'from_user_id' : {$ne: idFb}},
		       {'retweeted_status' : {$exists:false}},
		       {'eliminado':{$exists: false}}
		     ]
		   };	
    classdb.count(coleccion, criterio, 'charts/chartPromedioCasos/obtieneTodos', function(total){
      return callback(total);
    });
  }

  function obtieneAtendidos(coleccion, debut, finale, idFb, tipent, callback) {
    var criterioA ={};
    if(tipent ==='general'){
      
      criterioA={ $and: 
		  [
		    {'created_time' : {$gte : debut }},
		    {'created_time' : {$lte : finale }},
		    {'from_user_id' : {$ne: idFb}},
		    {'retweeted_status': {$exists: false}},
		    {'eliminado':{$exists: false}}, 
		    {'descartado':{$exists: false}}, 
		    //{'respuestas.$.user_id':{$nin:['direct-facebook']}},
		    {'atendido':{$exists: true}}
		  ]
		};
    }
    else{
      
      criterioA={ $and: 
		  [
		    {'created_time' : {$gte : debut }},
		    {'created_time' : {$lte : finale }},
		    {'retweeted_status': {$exists: false}},
		    {'obj' : tipent},
		    {'from_user_id' : {$ne: idFb}},
		    {'descartado':{$exists: false}}, 
		    {'eliminado':{$exists: false}}, 
		    //{$or: [
		    //	{'sentiment' : { $exists : true }}, 
		    {'atendido':{$exists: true}}
		    //	{'clasificacion' : { $exists : true }},
		    //	{'respuestas' : { $exists: true }},	
		    //]}
		  ]
		};
    }
    
    classdb.count(coleccion, criterioA, 'charts/chartPromedioCasos/obtieneAtendidos', function(atendidos){
      return callback(atendidos);
    });
  }

  function obtieneDescartados(coleccion, debut, finale, idFb, tipent, callback) {
    var criterioD ={};
    if(tipoEntrada==='general'){
      criterioD = { $and: 
		    [
		      {'created_time' : {$gte : debut}},
		      {'created_time' : {$lte : finale}},
		      {'descartado' : {$exists : true}},
		      //{'respuestas.$.user_id':{$nin:['direct-facebook']}},
		      //{'atendido' : {$exists : false}},
		      {'from_user_id' : {$ne: idFb}},
		      {'retweeted_status' : {$exists:false}},
		      {'eliminado' : {$exists : false}}
		    ]
		  };
    }
    else{
      criterioD = { $and: 
		    [
		      {'descartado' : {$exists : true}},
		      {'created_time' : {$gte : debut}},
		      {'created_time' : {$lte : finale}},
		      {'from_user_id' : {$ne: idFb}},
		      {'obj' : tipent},
		      {'retweeted_status' : {$exists:false}},
		      {'eliminado' : {$exists : false}}
		    ]
		  };
    }
    classdb.count(coleccion, criterioD, 'charts/chartPromedioCasos/obtieneDescartados', function(descartados){
      return callback(descartados);
    });
  }

  function obtieneNuevos(coleccion, debut, finale, idFb, tipent, callback) {
    var criterioN ={};
    if(tipoEntrada==='general'){
      criterioN = { $and: 
		    [
		      {'created_time' : {$gte : debut}},
		      {'created_time' : {$lte : finale}},
		      {'from_user_id' : {$ne: idFb}},
		      {'descartado' : {$exists : false}},
		      {'atendido' : {$exists : false}},
		      //	{'respuestas.$.user_id':{$nin:['direct-facebook']}},
		      {'respuestas' : {$exists:false}},
		      {'retweeted_status' : {$exists:false}},
		      {'eliminado' : {$exists : false}}
		    ]
		  };
    }
    else{
      criterioN = { $and: 
		    [
		      {'created_time' : {$gte : debut}},
		      {'created_time' : {$lte : finale}},
		      {'from_user_id' : {$ne: idFb}},
		      {'obj' : tipent},
		      {'descartado' : {$exists : false}},
		      {'atendido' : {$exists : false}},
		      {'sentiment' : {$exists : false}},
		      {'clasificacion' : {$exists:false}},
		      {'respuestas' : {$exists:false}},
		      {'retweeted_status' : {$exists:false}},
		      {'eliminado' : {$exists : false}}
		    ]
		  };
    }
    classdb.count(coleccion, criterioN, 'charts/chartPromedioCasos/obtieneNuevos', function(nuevos){
      return callback(nuevos);
    });
  }

  function obtieneResueltosFacebook(coleccion, debut, finale, idFb, callback) {
    var criterio = { $and: 
		     [
		       {'created_time' : {$gte : debut}},
		       {'created_time' : {$lte : finale}},
		       {'from_user_id' : {$ne: idFb}},
		       {'retweeted_status' : {$exists:false}},
		       {'respuestas.user_id':{$in : ['direct-facebook']}},
		       {'atendido' : {$exists : false}},			
		       {'eliminado':{$exists: false}},
		       
		       {'descartado':{$exists:false}}
		     ]
		   };	
    
    /*
     classdb.buscarToArray(coleccion, criterio, {}, 'charts/chartRating/obtieneTodos', function(mensajes){		    	
     if(mensajes === 'error'){
     // console.log(mensajes);
     // return callback('error');
     }else{
     // console.log('MENSAJES FACEBOOOK');
     // console.log(mensajes);
     }
     });
     */
    classdb.count(coleccion, criterio, 'charts/chartPromedioCasos/obtieneTodos', function(totalFacebook){
      return callback(totalFacebook);
    });
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema=req.query.nombreSistema;
    var tipoEntrada=req.query.tipo;
    var inicia = new Date(req.query.fecha_inicial);
    var termina = new Date(req.query.fecha_final);
    //Obtenemos la cuenta
    obtieneCuenta(nombreSistema, function(account){
      var idCuenta = '', idTwitter = '';
      if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage.id && account[0].datosPage.id !== ''){
        idCuenta = account[0].datosPage.id;
      }
      else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined' && account[0].datosMonitoreo.id && account[0].datosMonitoreo.id !== ''){
        idCuenta = account[0].datosMonitoreo.id;
      }
      var colectio = nombreSistema+'_consolidada';
      obtieneTodos(colectio, inicia, termina, idCuenta, function(todos) {
        if (todos === 'error') {
	  res.jsonp(todos);
        }
        else {
	  obtieneAtendidos(colectio, inicia, termina, idCuenta, tipoEntrada, function(atendidos) {
	    if (atendidos === 'error') {
	      res.jsonp(atendidos);
	    }
	    else {
	      obtieneDescartados(colectio, inicia, termina, idCuenta, tipoEntrada, function(descartados) {
	        if (descartados === 'error') {
		  res.jsonp(descartados);
	        }
	        else {
		  obtieneNuevos(colectio, inicia, termina, idCuenta, tipoEntrada, function(nuevos) {
		    if (nuevos === 'error') {
		      res.jsonp(nuevos);
		    }
		    else {
		      obtieneResueltosFacebook(colectio, inicia, termina, idCuenta, function(facebook){
		        if(facebook === 'error'){
			  res.jsonp(facebook);
		        }else{
			  var obj = {};
			  //obj.Todos = todos;
			  obj.Entrada = nuevos;
			  obj.Completos = atendidos;
			  //obj.Proceso = enproceso;
			  obj.Descartados = descartados;
			  if(tipoEntrada !== 'twitter'){
			    obj.facebook = facebook;
			  }
			  res.jsonp(obj);
		        }
		      });
		    }
		  });
	        }
	      });
	    }
	  });
        }
      });
    });
  }
  else {
    res.jsonp({error:{errorname: 'noParams', message: 'no llegaron los parámetros necesarios'}});
  }
});

module.exports = router;
