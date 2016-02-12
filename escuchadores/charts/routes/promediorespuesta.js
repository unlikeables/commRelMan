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

/* GET promediorespuesta page. */
/* 
ejemplo:
https://pruebas-charts.likeable.mx/promediorespuesta?nombreSistema=compuycomal&tipo=general&fecha_inicial=2015-01-01T06:00:00.417Z&fecha_final=2016-02-02T23:38:18.417Z
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

  function obtieneRespuestas(nombreSistema, idCuenta, finicial, ffinal, callback){
    var criterio = {};
    var sort = {};
    if(tipoEntrada!=='general'){
      criterio={$and:[
	{'respuestas':{$exists:true}},
	{'obj':tipoEntrada},
	{'created_time':{$gte: finicial}},
	{'created_time':{$lte: ffinal}},
	{'from_user_id':{$ne : idCuenta}}
      ]};
    }else{
      criterio={$and:[
	{'respuestas':{$exists:true}},	    	
	{'created_time':{$gte: finicial}},
	{'created_time':{$lte: ffinal}},
	{'from_user_id':{$ne : idCuenta}}
      ]};
    }
    classdb.buscarToArrayFields(nombreSistema+'_consolidada', criterio,{'respuestas' : ''}, sort, 'charts/chartPromedioRespuesta/obtieneRespuestas', function(respuestas){
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
    if (more <= cuantos) {
      setImmediate(function(){
	for(var i=0;i<respuestas[index].respuestas.length;i++){
	  arregloRespuestas.push(respuestas[index].respuestas[i].timestamp);
	}
	desglosaRespuestas(respuestas,nombreSistema,more,arregloRespuestas,callback);
      });
    }else{
      return callback(arregloRespuestas);
    }
  }

  if (req.query.nombreSistema && req.query.tipo && req.query.fecha_inicial && req.query.fecha_final) {
    //var nombreSistema='arabela';
    var nombreSistema = req.query.nombreSistema;
    var tipoEntrada = req.query.tipo;
    var fechainicial = new Date(req.query.fecha_inicial);
    var fechafinal = new Date(req.query.fecha_final);
  //Obtenemos la cuenta
  obtieneCuenta(nombreSistema, function(account){
    var idCuenta = '', idTwitter = '';
    if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage.id && account[0].datosPage.id !== ''){
      idCuenta = account[0].datosPage.id;
      if (account[0].datosTwitter && account[0].datosTwitter.twitter_id_principal) {
	idTwitter = account[0].datosTwitter.twitter_id_principal;
      }
    }
    else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined' && account[0].datosMonitoreo.id && account[0].datosMonitoreo.id !== ''){
      idCuenta = account[0].datosMonitoreo.id;
      if (account[0].datosTwitter && account[0].datosTwitter.twitter_id_principal) {
	idTwitter = account[0].datosTwitter.twitter_id_principal;
      }
    }
    else {
      if (typeof account[0] !== 'undefined' && typeof account[0].datosTwitter !== 'undefined' && account[0].datosTwitter.twitter_id_principal) {
	idTwitter = account[0].datosTwitter.twitter_id_principal;
      }
    }
    obtieneRespuestas(nombreSistema, idCuenta, fechainicial, fechafinal, function(respuestas){
      var respuestasDesglosadas=[];
      if(respuestas==='error'){
	res.jsonp('error');
      }else{
	if(respuestas.length>0){
	  desglosaRespuestas(respuestas,nombreSistema,0,respuestasDesglosadas,function(resDesglose){
	    var objetoTiempos={
	      '9:00-13:00':0,
	      '13:00-17:00':0,
	      '17:00-21:00':0,
	      '21:00-00:00':0,
	      'otros':0
	    };
	    var horas=0;
	    var minutos=0;
	    var segundos=0;
	    var horasConvertidas=0;
	    var minutosConvertidos=0;
	    var fecha = '';
	    var totalSegundos=0;
	    for(var index=0; index<resDesglose.length;index++){
	      fecha=new Date(resDesglose[index]);
	      horas=fecha.getHours();
	      minutos=fecha.getMinutes();
	      segundos=fecha.getSeconds();
	      horasConvertidas=horas*3600;
	      minutosConvertidos=minutos*60;
	      totalSegundos=horasConvertidas+minutosConvertidos+segundos;
              
	      if(totalSegundos>=32400 && totalSegundos<=46799){
		objetoTiempos['9:00-13:00']=objetoTiempos['9:00-13:00']+1;
	      }
	      else if(totalSegundos>=46800 && totalSegundos<=61199){
		objetoTiempos['13:00-17:00']=objetoTiempos['13:00-17:00']+1;
	      }
	      else if(totalSegundos>=61200 && totalSegundos<=75599){
		objetoTiempos['17:00-21:00']=objetoTiempos['17:00-21:00']+1;
	      }
	      else if((totalSegundos===0 && totalSegundos<=3599) || (totalSegundos>=75600 && totalSegundos<=86400)){
		objetoTiempos['21:00-00:00']=objetoTiempos['21:00-00:00']+1;
	      }
	      else if(totalSegundos>=3600 && totalSegundos<=32399){
		//console.log('otros');
		objetoTiempos.otros=objetoTiempos.otros+1;
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
