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

/* GET desempenio page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/desempenio?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){
  function obtieneCuenta(nomSis, callback){
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nomSis}, sort, 'charts/chartDesempenio/obtieneCuenta', function(cuenta){
      return callback(cuenta);
    });		
  }

  function armaArregloUsuarios(usuarios, index, arrusuarios, callback) {
    var cuantos = usuarios.length;
    var more = index+1;
    if (more > cuantos) {
      return callback(arrusuarios);
    }
    else {
      setImmediate(function(){
	var objetoUsuario = {};
	//console.log(usuarios[index]);
	objetoUsuario.idUsuario = usuarios[index]._id;
	objetoUsuario.username = usuarios[index].username;
	objetoUsuario.nombre = usuarios[index].displayName;
	objetoUsuario.imagen = usuarios[index].imagen_src;
	objetoUsuario.idCuenta = usuarios[index].cuenta._id;
	arrusuarios.push(objetoUsuario);
	return armaArregloUsuarios(usuarios, more, arrusuarios, callback);
      });
    }
  }

  function obtieneUsuarios(nomSis, callback){
    var arregloUsuarios=[];
    var coleccion = 'users';
    var sort = {};
    classdb.buscarToArray(coleccion, {'cuenta.marca':nomSis}, sort, 'charts/chartDesempenio/obtieneUsuarios', function(usuarios){		    	
      if(usuarios === 'error'){
	return callback('error');
      }else{
	armaArregloUsuarios(usuarios, 0, [], function(arregloUsuarios){
	  return callback(arregloUsuarios); 
	});
      }
    });
  }
    
  function consigueAtendido(tipo, fecha_inicial, fecha_final, usuario, nombreSistema, idCuenta, callback){
    var criterio = {};
    var user_id = usuario.idUsuario.toString();
    if(tipo!=='general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     {'descartado':{$exists: false}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'atendido.usuario_id':user_id},
		     {'obj' : tipo}
		   ]
		 };
    }else{
      criterio = { $and:
		   [
		     {'created_time' : {$gte : fecha_inicial }},
		     {'created_time' : {$lte : fecha_final }},
		     //{'atendido.fecha':{$gte: fecha_inicial}},
		     //{'atendido.fecha':{$lte: fecha_final}},
		     {'descartado':{$exists: false}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'retweeted_status': {$exists : false}},
		     {'eliminado' : {$exists : false}},
		     {'atendido.usuario_id':user_id}
		     //{$or: [
		     //{'clasificacion.user_id' : user_id},
		     //{'sentiment_user_id' : user_id},
		     //{'respuestas':{$elemMatch: { 'user_id': user_id}}}
		     //{'atendido':{$exists: true}},
		     //{'sentiment' : { $exists : true }}, 
		     //{'clasificacion' : { $exists : true }},
		     //{'respuestas' : { $exists: true }},
		     //]}
		   ]
		 };
    } 
    
    classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/ConsigueAtendido', function(data){		
      return callback(data);
    });				
  }
    
  function consigueDescartado(tipo, fecha_inicial, fecha_final, usuario, nombreSistema, idCuenta, callback){
    var criterio = {};
    var user_id = usuario.idUsuario.toString();
    if(tipo!=='general'){
      criterio = { $and:
		   [
		     {'created_time' : {$gte: fecha_inicial}},
		     {'created_time' : {$lte: fecha_final}},
		     {'from_user_id' : {$ne: idCuenta}},
		     {'obj':tipo},
		     {'descartado' : {$exists : true}},
		     {'eliminado' : {$exists : false}},
		     {'descartado.idUsuario' : user_id},
		     {'retweeted_status': {$exists : false}}
		   ]
		 };
    }else{
      criterio = {$and:
		  [
		    {'created_time' : {$gte: fecha_inicial}},
		    {'created_time' : {$lte: fecha_final}},
		    {'from_user_id' : {$ne: idCuenta}},
		    {'descartado' : {$exists : true}},
		    {'eliminado' : {$exists : false}},
		    {'descartado.idUsuario':user_id},
		    {'retweeted_status': {$exists : false}}
		  ]
		 };
    }
    classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/ConsigueDescartado', function(data){	    	
      return callback(data);
    });				
  }
    
  function desglosaUsuarios(tipo, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, index, callback){
    var cuantos = usuarios.length;
    var more = index+1;
    if (more > cuantos) {
      return callback (usuarios);
    }
    else {
      setImmediate(function(){
	consigueAtendido(tipo, fecha_inicial, fecha_final, usuarios[index], nombreSistema, idCuenta, function(totalAtendidos){
	  if(totalAtendidos==='error'){
	    desglosaUsuarios(tipo, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
	  }else{
	    usuarios[index].atendidos=totalAtendidos;
	    consigueDescartado(tipo, fecha_inicial, fecha_final, usuarios[index], nombreSistema, idCuenta, function(totalDescartado){
	      if(totalDescartado==='error'){
		desglosaUsuarios(tipo, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
	      }else{ 
		usuarios[index].descartado=totalDescartado;
		usuarios[index].total = totalAtendidos + totalDescartado;
		desglosaUsuarios(tipo, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
	      }
	    });
	  }
	});
      });
    }
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema = req.query.nombreSistema;
    var fecha_inicial = new Date(req.query.fecha_inicial);
    var fecha_final = new Date(req.query.fecha_final);
    var tipoEntrada = req.query.tipo;
  
    //Obtenemos la cuenta
    obtieneCuenta(nombreSistema, function(account){
      var idCuenta = '';
      if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined'){
        idCuenta = account[0].datosPage.id;
      }
      else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
        idCuenta = account[0].datosMonitoreo.id;
      }
    
      obtieneUsuarios(nombreSistema,function(usuarios){
        if(usuarios==='error'){
	  res.jsonp('Error en usuarios');
        }else{
	  if(usuarios.length>0){
	    desglosaUsuarios(tipoEntrada, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, 0, function(usuariosActualizados){
	      if(usuariosActualizados){
	        for(var i=0;i<usuariosActualizados.length;i++){
		  if(usuariosActualizados[i].total === 0){
		    delete usuariosActualizados[i];
		  }
	        }
              
	        if(usuariosActualizados){
		  usuariosActualizados = usuariosActualizados.filter(function(){return true;}); 
		  var byName = usuariosActualizados.slice(0);
		  byName.sort(function(a,b) {
		    var y = a.total;
		    var x = b.total;
		    return x < y ? -1 : x > y ? 1 : 0;
		  });
		  res.jsonp(byName);
	        }
	      }
	    });
	  }else{
	    // No hay usuarios
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
