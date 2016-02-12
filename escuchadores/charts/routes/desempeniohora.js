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

/* GET desempeniohora page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/desempeniohora?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){
  //función opara obtener la cuenta
  function obtieneCuenta(nomSis, callback){
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nomSis}, sort, 'charts/chartDesempenio/obtieneCuenta', function(cuenta){
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
		     {'eliminado' : {$exists : false}}
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
		     {'obj' : tipo}
		   ]
		 };
    } 
    //classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/ConsigueDescartado', function(mensajes){	    	
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartDesempenioHora/obtieneTodos', function(mensajes){		    	
      if(mensajes === 'error'){
	return callback('error');
      }else{
	return callback(mensajes);
      }
    });
  }
    
  function obtieneAtendidos(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback) {
    var criterio ={};
    if(tipo ==='general'){
      criterio = { $and: 
		   [
		     {'retweeted_status': {$exists: false}},
		     {'atendido.fecha' : {$gte : fecha_inicial}},
		     {'atendido.fecha' : {$lte : fecha_final}},
		     {'respuestas.$.user_id':{$ne : 'direct-facebook'}},			
		     //{'created_time' : {$gte : fecha_inicial }},
		     //{'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'descartado':{$exists: false}}, 
		     {'eliminado':{$exists: false}}, 
		     {'atendido':{$exists: true}}
		   ]
		 };
    }
    else{
      criterio = { $and: 
		   [
		     {'retweeted_status': {$exists: false}},
		     {'created_time' : {$gte : fecha_inicial }},
		     {'respuestas.user_id':{$ne : 'direct-facebook'}},			
		     {'obj' : tipo},
		     {'created_time' : {$lte : fecha_final }},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'descartado':{$exists: false}}, 
		     {'eliminado':{$exists: false}}, 
		     {'atendido':{$exists: true}}
		   ]
		 };
    }
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartDesempenioHora/obtieneAtendidos', function(mensajesAtendidos){		    	
      if(mensajesAtendidos === 'error'){
	return callback('error');
      }else{
	return callback(mensajesAtendidos);
      }
    });
  }
    
  function obtieneDescartados(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback) {
    var criterio ={};
    if(tipo === 'general'){
      criterio = { $and: 
		   [
		     {'descartado' : {$exists : true}},
		     {'descartado.fecha' : {$gte : fecha_inicial}},
		     {'descartado.fecha' : {$lte : fecha_final}},					
		     //{'created_time' : {$gte : fecha_inicial}},
		     //{'created_time' : {$lte : fecha_final}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status' : {$exists:false}},
		     {'eliminado' : {$exists : false}}
		   ]
		 };
    }
    else{
      criterio = { $and: 
		   [
		     {'descartado' : {$exists : true}},
		     {'created_time' : {$gte : fecha_inicial}},
		     {'created_time' : {$lte : fecha_final}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'obj' : tipo},
		     {'retweeted_status' : {$exists:false}},
		     {'eliminado' : {$exists : false}}
		   ]
		 };
    }
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartDesempenioHora/obtieneAtendidos', function(mensajesDescartados){		    	
      if(mensajesDescartados === 'error'){
	return callback('error');
      }else{
	return callback(mensajesDescartados);
      }
    });
  }

  function obtieneNuevos(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback) {
    var criterio ={};
    if(tipo === 'general'){
      criterio = { $and: 
		   [
		     {'created_time' : {$gte : fecha_inicial}},
		     {'created_time' : {$lte : fecha_final}},
		     {'from_user_id' : {$ne: idCuenta}},
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
    else{
      criterio = { $and: 
		   [
		     {'created_time' : {$gte : fecha_inicial}},
		     {'created_time' : {$lte : fecha_final}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'obj' : tipo},
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
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartDesempenioHora/obtieneNuevos', function(mensajesNuevos){		    	
      if(mensajesNuevos === 'error'){
	return callback('error');
      }else{
	return callback(mensajesNuevos);
      }
    });
  }

  function obtieneFacebook(tipo, nombreSistema, fecha_inicial, fecha_final, idCuenta, callback) {
    var criterio = { $and: 
		     [
		       {'created_time' : {$gte : fecha_inicial}},
		       {'created_time' : {$lte : fecha_final}},
		       {'from_user_id' : {$ne: idCuenta}},
		       {'retweeted_status' : {$exists:false}},
		       {'respuestas.user_id':{$eq : 'direct-facebook'}},			
		       {'eliminado':{$exists: false}}
		     ]
		   };	
    classdb.buscarToArray(nombreSistema+'_consolidada', criterio, {}, 'charts/chartDesempenioHora/obtieneFacebook', function(mensajesFacebook){		    	
      if(mensajesFacebook === 'error'){
	return callback('error');
      }else{
	return callback(mensajesFacebook);
      }
    });
  }
    
  function desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, index, objTodos, tipoBuzon, callback){
    var cuantos = todos.length;
    var more = index+1;
    if (more > cuantos) {
      return callback (objTodos);
    }
    else {
      setImmediate(function(){
	var fechaCreated = '';
	var horasCreated = '';
	var minutosCreated = '';
	var segundosCreated = '';
	var horasCreatedConvertidas = '';
	var minutosCreatedConvertidos = '';
	var totalSegundosCreated = '';
        
	if(tipoBuzon === 'atendidos'){
	  fechaCreated=new Date(todos[index].atendido.fecha);
	  horasCreated=fechaCreated.getHours();
	  minutosCreated=fechaCreated.getMinutes();
	  segundosCreated=fechaCreated.getSeconds();
          
	  horasCreatedConvertidas=horasCreated*3600;
	  minutosCreatedConvertidos=minutosCreated*60;
	  totalSegundosCreated=horasCreatedConvertidas+minutosCreatedConvertidos+segundosCreated;
				
	}else if(tipoBuzon === 'descartados'){
	  fechaCreated=new Date(todos[index].descartado.fecha);
	  horasCreated=fechaCreated.getHours();
	  minutosCreated=fechaCreated.getMinutes();
	  segundosCreated=fechaCreated.getSeconds();
          
	  horasCreatedConvertidas=horasCreated*3600;
	  minutosCreatedConvertidos=minutosCreated*60;
	  totalSegundosCreated=horasCreatedConvertidas+minutosCreatedConvertidos+segundosCreated;	
				
	}else{
	  fechaCreated=new Date(todos[index].created_time);
	  horasCreated=fechaCreated.getHours();
	  minutosCreated=fechaCreated.getMinutes();
	  segundosCreated=fechaCreated.getSeconds();

	  horasCreatedConvertidas=horasCreated*3600;
	  minutosCreatedConvertidos=minutosCreated*60;
	  totalSegundosCreated=horasCreatedConvertidas+minutosCreatedConvertidos+segundosCreated;
	}
	if(totalSegundosCreated <= 3600){
	  //Las cero horas
	  objTodos.cero = objTodos.cero + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 3600 && totalSegundosCreated <= 7199){
	  //La una de la mañana
	  objTodos.una = objTodos.una + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 7200 && totalSegundosCreated <= 10799){
	  //Las dos de la mañana
	  objTodos.dos = objTodos.dos + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 10800 && totalSegundosCreated <= 14399){
	  //Las tres de la mañana
	  objTodos.tres = objTodos.tres + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 14400 && totalSegundosCreated <= 17999){
	  //Las cuatro de la mañana
	  objTodos.cuatro = objTodos.cuatro + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 18000 && totalSegundosCreated <= 21599){
	  //Las cinco de la mañana
	  objTodos.cinco = objTodos.cinco + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 21600 && totalSegundosCreated <= 25199){
	  //Las seis de la mañana
	  objTodos.seis = objTodos.seis + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 25200 && totalSegundosCreated <= 28799){
	  //Las siete de la mañana
	  objTodos.siete = objTodos.siete + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 28800 && totalSegundosCreated <= 32399){
	  //Las ocho de la mañana
	  objTodos.ocho = objTodos.ocho + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 32400 && totalSegundosCreated <= 35999){
	  //Las nueve de la mañana
	  objTodos.nueve = objTodos.nueve + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 36000 && totalSegundosCreated <= 39599){
	  //Las diez de la mañana
	  objTodos.diez = objTodos.diez + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 39600 && totalSegundosCreated <= 43199){
	  //Las once de la mañana
	  objTodos.once = objTodos.once + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 43200 && totalSegundosCreated <= 46799){
	  //Las doce de la mañana
	  objTodos.doce = objTodos.doce + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 46800 && totalSegundosCreated <= 50399){
	  //La una de la tarde
	  objTodos.trece = objTodos.trece + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 50400 && totalSegundosCreated <= 53999){
	  //Las dos de la tarde
	  objTodos.catorce = objTodos.catorce + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 54000 && totalSegundosCreated <= 57599){
	  //Las tres de la tarde
	  objTodos.quince = objTodos.quince + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 57600 && totalSegundosCreated <= 61199){
	  //Las cuatro de la tarde
	  objTodos.dieciseis = objTodos.dieciseis + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 61200 && totalSegundosCreated <= 64799){
	  //Las cinco de la tarde
	  objTodos.diecisiete = objTodos.diecisiete + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 64800 && totalSegundosCreated <= 68399){
	  //Las seis de la tarde
	  objTodos.dieciocho = objTodos.dieciocho + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 68400 && totalSegundosCreated <= 71999){
	  //Las siete de la noche
	  objTodos.diecinueve = objTodos.diecinueve + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 72000 && totalSegundosCreated <= 75599){
	  //Las ocho de la noche
	  objTodos.veinte = objTodos.veinte + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 75600 && totalSegundosCreated <= 79199){
	  //Las nueve de la noche
	  objTodos.veintiuno = objTodos.veintiuno + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 79200 && totalSegundosCreated <= 82799){
	  //Las diez de la noche
	  objTodos.veintidos = objTodos.veintidos + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}else if(totalSegundosCreated > 82800 && totalSegundosCreated <= 86400){
	  //Las once de la noche
	  objTodos.veintitres = objTodos.veintitres + 1;
	  return desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, tipoBuzon, callback);
	}
      });
    }
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nsis=req.query.nombreSistema;
    var fini = new Date(req.query.fecha_inicial);
    var ffin = new Date(req.query.fecha_final);
    var tipo=req.query.tipo;
    var arreglo = [];
    var objeto = {};
    //Obtenemos la cuenta
    obtieneCuenta(nsis, function(account){
      var idCuenta = '';
      if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage !== ''){
        idCuenta = account[0].datosPage.id;
      }
      else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
        idCuenta = account[0].datosMonitoreo.id;
      }
    
      var objetoTodos = {
        'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0, 'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0, 'ocho' : 0, 'nueve' : 0,
        'diez' : 0, 'once' : 0, 'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0, 'dieciseis' : 0, 'diecisiete' : 0,
        'dieciocho' : 0, 'diecinueve' : 0, 'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
      };

      var objetoAtendidos = {
        'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0, 'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0, 'ocho' : 0, 'nueve' : 0,
        'diez' : 0, 'once' : 0, 'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0, 'dieciseis' : 0, 'diecisiete' : 0,
        'dieciocho' : 0, 'diecinueve' : 0, 'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
      };
		
      var objetoDescartados = {
        'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0, 'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0, 'ocho' : 0, 'nueve' : 0,
        'diez' : 0, 'once' : 0, 'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0, 'dieciseis' : 0, 'diecisiete' : 0,
        'dieciocho' : 0, 'diecinueve' : 0, 'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
      };
		
      var objetoNuevos = {
        'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0, 'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0, 'ocho' : 0, 'nueve' : 0,
        'diez' : 0, 'once' : 0, 'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0, 'dieciseis' : 0, 'diecisiete' : 0,
        'dieciocho' : 0, 'diecinueve' : 0, 'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
      };

      var objetoFacebook = {
        'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0, 'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0, 'ocho' : 0, 'nueve' : 0,
        'diez' : 0, 'once' : 0, 'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0, 'dieciseis' : 0, 'diecisiete' : 0,
        'dieciocho' : 0, 'diecinueve' : 0, 'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
      };

      obtieneTodos(tipo, nsis, fini, ffin, idCuenta, function(mTodos){
        if(mTodos === 'error'){
          res.jsonp({error:{errorname:'queryerror', message:'no pudimos conseguir datos de todos los mensajes, volver a intentar'}});
        }else{
	  objeto.totalTodos = mTodos.length;
	  desglosaMensajes(tipo, fini, ffin, mTodos, nsis, idCuenta, 0, objetoTodos, 'todos', function(tActualizados){
	    objeto.todos = tActualizados;
	    obtieneAtendidos(tipo, nsis, fini, ffin, idCuenta, function(mAtendidos){
	      if(mAtendidos === 'error') {
                res.jsonp({error:{errorname:'queryerror', message:'no pudimos conseguir datos de los mensajes atendidos, volver a intentar'}});
	      }else{
		objeto.totalAtendidos = mAtendidos.length;
		desglosaMensajes(tipo, fini, ffin, mAtendidos, nsis, idCuenta, 0, objetoAtendidos, 'atendidos', function(aActualizados){
		  objeto.atendidos = aActualizados;
		  obtieneDescartados(tipo, nsis, fini, ffin, idCuenta, function(mDescartados){
		    if(mDescartados === 'error'){
                      res.jsonp({error:{errorname:'queryerror', message:'no pudimos conseguir datos de los mensajes descartados, volver a intentar'}});
		    }else{
		      objeto.totalDescartados = mDescartados.length;
		      desglosaMensajes(tipo, fini, ffin, mDescartados, nsis, idCuenta, 0, objetoDescartados, 'descartados', function(dActualizados){
			objeto.descartados = dActualizados;
			obtieneNuevos(tipo, nsis, fini, ffin, idCuenta, function(mNuevos){
			  if(mNuevos === 'error'){
                            res.jsonp({error:{errorname:'queryerror', message:'no pudimos conseguir datos de los mensajes nuevos, volver a intentar'}});
			  }else{
			    objeto.totalNuevos = mNuevos.length;
			    desglosaMensajes(tipo, fini, ffin, mNuevos, nsis, idCuenta, 0, objetoNuevos, 'nuevos', function(nActualizados){
			      objeto.nuevos = nActualizados;
			      obtieneFacebook(tipo, nsis, fini, ffin, idCuenta, function(mFacebook){
				if(mFacebook === 'error'){
                                  res.jsonp({error:{errorname:'queryerror', message:'no pudimos conseguir datos de mensajes de facebook, volver a intentar'}});
				}else{
				  objeto.totalFacebook = mFacebook.length;
				  desglosaMensajes(tipo, fini, ffin, mFacebook, nsis, idCuenta, 0, objetoFacebook, 'facebook', function(fActualizados){
				    objeto.facebook = fActualizados;
				    if(tipo !== 'twitter'){
				      objeto.totalAtendidos = objeto.totalAtendidos + objeto.totalFacebook;
				    }
				    objeto.totalCasos = objeto.totalAtendidos + objeto.totalDescartados + objeto.totalNuevos;
				    res.jsonp(objeto);
				  });
				}
			      });
			    });
			  }
			});
		      });
		    }
		  });
		});	
	      }
	    });
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
