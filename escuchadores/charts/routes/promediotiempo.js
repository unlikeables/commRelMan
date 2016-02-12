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

/* GET promediotiempo page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/promediotiempo?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
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
    var criterio = {};
    var coleccion = nombreSistema+'_consolidada';
    var fields = {'respuestas' : '', 'created_time': ''};
    var sort = {};

    if(tipoEntrada!=='general'){
      criterio={
	$and:[
	  {'respuestas':{$exists:true}},
	  {'obj':tipoEntrada},
	  {'created_time':{$gte: fechainicial}},
	  {'created_time':{$lte: fechafinal}},
	  {'from.id':{$ne : idCuenta}}
	]
      };
    }else{
      criterio={
        $and:[
          {'respuestas':{$exists:true}},
          {'created_time':{$gte: fechainicial}},
          {'created_time':{$lte: fechafinal}},
          {'from.id':{$ne : idCuenta}}
        ]
      };
    }

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
    var more = index+1;
    var objeto = {};
    if (more > cuantos) {
      return callback(arregloRespuestas);
    }
    else {
      setImmediate(function(){
        objeto.tiempoLlegada = respuestas[index].created_time;
	for(var i=0;i<respuestas[index].respuestas.length;i++){
	  objeto.tiempoLlegada = respuestas[index].created_time;
	  objeto.tiempoRespuesta = respuestas[index].respuestas[i].timestamp;
	  //console.log(respuestas[index].respuestas[i]);
	  //arregloRespuestas.push(respuestas[index].respuestas[i].timestamp);
	  arregloRespuestas.push(objeto);				
	}
	desglosaRespuestas(respuestas,nombreSistema,more,arregloRespuestas,callback);
      });
    }
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    var nombreSistema=req.query.nombreSistema;
    var tipoEntrada=req.query.tipo;
    var fecha_inicial = new Date(req.query.fecha_inicial);
    var fecha_final = new Date(req.query.fecha_final);

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
      obtieneRespuestas(nombreSistema, idCuenta, fecha_inicial, fecha_final, function(respuestas){
	var respuestasDesglosadas=[];
	if(respuestas==='error'){
	  res.jsonp('error'); 
	}else{
	  if(respuestas.length>0){
	    //res.jsonp(respuestas.length);
	    desglosaRespuestas(respuestas,nombreSistema,0,respuestasDesglosadas,function(resDesglose){
	      var objetoTiempos={
		'promedio':0
	      };
	      //var more = index+1;
	      //var cuantos=timestamps.length;
	      var horasLlegada = 0;
	      var minutosLlegada = 0;
	      var segundosLlegada = 0;
              
	      var horasRespuesta = 0;
	      var minutosRespuesta = 0;
	      var segundosRespuesta = 0;
              
	      var horasConvertidasLlegada = 0;
	      var minutosConvertidosLlegada = 0;
              
	      var horasConvertidasRespuesta = 0;
	      var minutosConvertidosRespuesta = 0;
              
	      var fechaLlegada ='';
	      var fechaRespuesta = '';
	      var totalSegundosLlegada = 0;
	      var totalSegundosRespuesta = 0;
              
	      var totalSegundos = 0;
	      var restanteSegundos = 0;
	      for(var index = 0; index < resDesglose.length;index++) {
		fechaLlegada = new Date(resDesglose[index].tiempoLlegada);
		fechaRespuesta = new Date (resDesglose[index].tiempoRespuesta);
                
		horasLlegada = fechaLlegada.getHours();
		minutosLlegada = fechaLlegada.getMinutes();
		segundosLlegada = fechaLlegada.getSeconds();
                
		horasRespuesta = fechaRespuesta.getHours();
		minutosRespuesta = fechaRespuesta.getMinutes();
		segundosRespuesta = fechaRespuesta.getSeconds();
                
		horasConvertidasLlegada = horasLlegada*3600;
		minutosConvertidosLlegada = minutosLlegada*60;
		totalSegundosLlegada = horasConvertidasLlegada+minutosConvertidosLlegada+segundosLlegada;					
                
		horasConvertidasRespuesta = horasRespuesta*3600;
		minutosConvertidosRespuesta = minutosRespuesta*60;
		totalSegundosRespuesta = horasConvertidasRespuesta+minutosConvertidosRespuesta+segundosRespuesta;

		restanteSegundos = totalSegundosRespuesta - totalSegundosLlegada;
		if(restanteSegundos<0){
		  restanteSegundos =restanteSegundos * -1;
		}
		totalSegundos =totalSegundos + restanteSegundos;
	      }

	      var promedio = totalSegundos / resDesglose.length;
	      promedio = Math.round(promedio);
	      var horas = 0;
	      var minutos = 0;
	      var segundos = 0;
	      var horasMenos = 0;
	      //Validaciones para convertir los segundos a horas, minutos o segundos
	      if(promedio>=3600){
		horas = Math.floor(promedio/3600);
		if(horas < 10){
		  horas = '0'+horas;
		}
		promedio = promedio - (horas * 3600);
	      }
	      if(promedio>=60){
		minutos = Math.floor(promedio/60);
		promedio = promedio - (minutos * 60);
		if(minutos<10){
		  minutos = '0'+minutos;
		}
	      }
	      if(promedio<60){
		segundos = promedio;
		if(segundos <10){
		  segundos = '0'+segundos;
		}
	      }
              
	      if(horas !== 0){
		//objetoTiempos.promedio=horas+':'+minutos+':'+segundos;
		objetoTiempos.promedio=horas+':'+minutos;
		objetoTiempos.tipo='hrs';
		res.jsonp(objetoTiempos);
	      }else{
		if(minutos !== 0){
		  objetoTiempos.promedio=minutos+':'+segundos;
		  objetoTiempos.tipo='min';
		  res.jsonp(objetoTiempos);
		}else{
		  objetoTiempos.promedio=segundos;
		  objetoTiempos.tipo='seg';
		  res.jsonp(objetoTiempos);
		}
	      }
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
