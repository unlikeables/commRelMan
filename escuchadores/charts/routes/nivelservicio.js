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

/* GET nivelservicio page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/nivelservicio?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
*/

router.get('/', function(req, res){

  function obtieneCuenta(nombreSistema,callback){
    var arregloUsuarios=[];
    var coleccion = 'accounts';
    var sort = {};
    classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartPromedioCasos/obtieneCuenta', function(cuenta){		    	
      if(cuenta === 'error'){
	return callback('error');
      }else{
	return callback(cuenta);
      }
    });		
  }

  function obtieneRespuestas(nombreSistema, idCuenta, fechainicial, fechafinal, callback){
    var coleccion = nombreSistema+'_consolidada'
    var criterio = {};
    var fields = {'respuestas' : '', 'created_time' : ''};
    var sort = {};

    if(tipoEntrada!=='general'){
      criterio={$and:[
        {'respuestas':{$exists:true}},
        {'obj':tipoEntrada},
        {'created_time':{$gte:fechainicial}},
        {'created_time':{$lte:fechafinal}},
        {'from.id':{$ne : idCuenta}},
        {'eliminado':{$exists: false}}
      ]};
    }else{
      criterio={$and:[
        {'respuestas':{$exists:true}},
        {'created_time':{$gte:fechainicial}},
        {'created_time':{$lte:fechafinal}},
        {'from.id':{$ne : idCuenta}},
        {'eliminado':{$exists: false}}
      ]};
    }
    //var coleccion = db.collection(nombreSistema+'_consolidada');
    classdb.buscarToArrayFields(coleccion, criterio, fields, sort, 'charts/chartPromedioTiempo/obtieneRespuestas', function(respuestas){		    	
      if(respuestas === 'error'){
	return callback('error');
      }else{
	return callback(respuestas);
      }
    });
  }

  function desglosaRespuestas(respuestas,nombreSistema,index,arregloRespuestas,callback){
    var cuantos = respuestas.length;
    var obj={};
    var more = index+1;
    if (more <= cuantos) {
      setImmediate(function(){
	for(var i=0;i<respuestas[index].respuestas.length;i++){
	  obj.created_time=respuestas[index].created_time;
	  obj.tiempo_respuesta=respuestas[index].respuestas[i].timestamp;
	  arregloRespuestas.push(obj);
	}
	desglosaRespuestas(respuestas,nombreSistema,more,arregloRespuestas,callback);
      });
    }else{
      return callback(arregloRespuestas);
    }
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var fecha1 = new Date(req.query.fecha_inicial);
    var fecha2 = new Date(req.query.fecha_final);
    var nombreSistema = req.query.nombreSistema;
    var tipoEntrada = req.query.tipo;

    obtieneCuenta(nombreSistema, function(account){
      var idCuenta='';
      if(account[0] && account[0].datosPage){
        //console.log('TIENE FACEBOOk');
        idCuenta = account[0].datosPage.id;
      }
      else if(account[0] && account[0].datosMonitoreo){
        //console.log('TIENE MONITOREO');
        idCuenta = account[0].datosMonitoreo.id;
      }
      obtieneRespuestas(nombreSistema,idCuenta, fecha1, fecha2, function(respuestas){
        var respuestasDesglosadas=[];
        if(respuestas==='error'){
	  res.jsonp('error');
        }else{
	  if(respuestas.length>0){
	    desglosaRespuestas(respuestas,nombreSistema,0,respuestasDesglosadas,function(resDesglose){
	      var objetoTiempos={};
	      if(!objetoTiempos.menosHora){
	        objetoTiempos.menosHora=0;
	      }
	      if(!objetoTiempos.unaOcho){
	        objetoTiempos.unaOcho=0;
	      }	
	      if(!objetoTiempos.ochoVeinticuatro){
	        objetoTiempos.ochoVeinticuatro=0;
	      }
	      if(!objetoTiempos.masVeinticuatro){
	        objetoTiempos.masVeinticuatro=0;
	      }
	      var horas=0;
	      var minutos=0;
	      var segundos=0;
	      var horasConvertidas=0;
	      var minutosConvertidos=0;
	      var horasCreated=0;
	      var minutosCreated=0;
	      var segundosCreated=0;
	      var horasCreatedConvertidas=0;
	      var minutosCreatedConvertidos=0;
	      var fecha = '';
	      var fechaCreated = '';
	      var totalSegundos=0;
	      var totalSegundosCreated=0;
	      var totalSegundosRespuesta=0;
	      var menosHora=0;
	      var unaOcho=0;
	      var ochoVeinticuatro=0;
	      var masVeinticuatro=0;
	      for(var index = 0; index<=resDesglose.length;index++){
	        if(typeof resDesglose[index]!=='undefined'){
		  fecha=new Date(resDesglose[index].tiempo_respuesta);
		  fechaCreated=new Date(resDesglose[index].created_time);
		  horas=fecha.getHours();
		  minutos=fecha.getMinutes();
		  segundos=fecha.getSeconds();
		  horasCreated=fechaCreated.getHours();
		  minutosCreated=fechaCreated.getMinutes();
		  segundosCreated=fechaCreated.getSeconds();
		  horasConvertidas=horas*3600;
		  minutosConvertidos=minutos*60;
		  totalSegundosRespuesta=horasConvertidas+minutosConvertidos+segundos;
		
		  horasCreatedConvertidas=horasCreated*3600;
		  minutosCreatedConvertidos=minutosCreated*60;
		  totalSegundosCreated=horasCreatedConvertidas+minutosCreatedConvertidos+segundosCreated;
		  totalSegundos=totalSegundosCreated-totalSegundosRespuesta;
                
		  if(totalSegundos<=3600){
		    objetoTiempos.menosHora=objetoTiempos.menosHora+1;
		    //console.log('Menos de una hora');
		  }
		  else if(totalSegundos>=3600 && totalSegundos<=28800){
		    //console.log('Una a Ocho horas');
		    objetoTiempos.unaOcho=objetoTiempos.unaOcho+1;
		  }
		  else if(totalSegundos>=28800 && totalSegundos<=86400){
		    objetoTiempos.ochoVeinticuatro=objetoTiempos.ochoVeinticuatro+1;
		    //console.log('De ocho a Veinticuatro horas');
		  }
		  else if(totalSegundos>86400){
		    objetoTiempos.masVeinticuatro=objetoTiempos.masVeinticuatro+1;
		    //console.log('Mas de Veinticuatro');
		  }
	        }
	      }
	      res.jsonp(objetoTiempos);
	    });
	  }else{
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
