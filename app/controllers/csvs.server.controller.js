'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Csv = mongoose.model('Csv'),
    _ = require('lodash');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');

/**
 * Create a Csv
 */

exports.create = function(req, res) {
	var csv = new Csv(req.body);
	csv.user = req.user;

	csv.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(csv);
		}
	});
};

/**
 * Show the current Csv
 */
exports.read = function(req, res) {
	res.jsonp(req.csv);
};

/**
 * Update a Csv
 */
exports.update = function(req, res) {
	var csv = req.csv ;

	csv = _.extend(csv , req.body);

	csv.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(csv);
		}
	});
};

/**
 * Delete an Csv
 */
exports.delete = function(req, res) {
	var csv = req.csv ;

	csv.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(csv);
		}
	});
};

/**
 * List of Csvs
 */
exports.list = function(req, res) { Csv.find().sort('-created').populate('user', 'displayName').exec(function(err, csvs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(csvs);
		}
	});
};

/**
 * Csv middleware
 */
exports.csvByID = function(req, res, next, id) { Csv.findById(id).populate('user', 'displayName').exec(function(err, csv) {
		if (err) return next(err);
		if (! csv) return next(new Error('Failed to load Csv ' + id));
		req.csv = csv ;
		next();
	});
};
exports.generaCsv = function(req, res){
    var col = req.body.nombreSistema+'_consolidada';
    var fecha_inicial = new Date(req.body.fecha_inicial);
    var fecha_final = new Date(req.body.fecha_final);
    var criterio;
    
    function getdatoscuenta(nombreSistema,cback) {
	var criterio = {'nombreSistema': nombreSistema};
	classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailboxDescartados/querySecundario', function(datos){
	    if(datos.length > 0){
		if(datos[0].datosPage){
		    return cback(datos[0].datosPage.id);
		}
	    }else{
		return cback('error');
	    }
	});
    }

    function quitaEspeciales(string){
	if (string) {
    	    return string.replace(/,/g,'-').replace(/"/g,'&34').replace(/\n/g,' ');
	} 
    }
    getdatoscuenta(req.body.nombreSistema, function(page_id){
	
	if(page_id === 'error'){
	    criterio = {
		$and:[
		    {'created_time' : {$gte : fecha_inicial}},
		    {'created_time' : {$lte : fecha_final}},
		    {'tipo':{$exists:true}}
		]
	    };
	    classdb.buscarToArray(col, criterio, {}, 'generaCSV/buscar', function(items){
		if(items === 'error'){
		    res.jsonp('error');
		}else{
		    if(items.length > 0){
			var index = 0;
			procesaItemCsv(items, index, [], function(data){
			    res.jsonp(data);
			});
		    }else{
			res.jsonp('error');
		    }
		}
	    });
	}else{
	    criterio = {
		$and:[
		    {'created_time' : {$gte : fecha_inicial}},
		    {'created_time' : {$lte : fecha_final}},
		    {'tipo':{$exists:true}},
		    {'from_user_id' : {$ne : page_id}}
		]
	    };
	    classdb.buscarToArray(col,criterio,{},'generaCSV/buscar', function(items){
		if(items === 'error'){
		    res.jsonp('error');
		}else{
		    if(items.length > 0){
			var index = 0;
			procesaItemCsv(items, index, [], function(data){
			    res.jsonp(data);
			});
		    }else{
			res.jsonp('error');
		    }
		}
	    });
	}
    });
	
    function procesaItemCsv(items,index,resultado,cback){
	var more = index +1;
	var n = items.length;
	console.log('Cargando '+index+' de '+n);
	if(more > n){
	    return cback(resultado);
	}else{
	    setImmediate(function(){
		var obj = {
		    tipo: items[index].tipo,
		    obj: items[index].obj,
		    fecha_llegada: new Date(items[index].created_time),
		    respuesta: ''
		};
		/* Obteniendo respuesta o respuestas */
		if(items[index].respuestas){
		    for(var i in items[index].respuestas){
			obj.respuesta += quitaEspeciales(items[index].respuestas[i].texto)+'||';
		    }
		    obj.status = 'Respondido';
		    obj.fecha_respuesta = new Date(items[index].respuestas[0].timestamp);
		    var resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    obj.tiempo_respuesta = ( resta * 0.001 );
		}
		/*Obteniendo el status */
		if(items[index].clasificacion && items[index].sentiment){
		    obj.tema = items[index].clasificacion.tema;
		    obj.subtema = items[index].clasificacion.subtema;
		    obj.sentiment = items[index].sentiment;
		    obj.status = 'Clasificado';
		}
		if(items[index].clasificacion && items[index].sentiment && items[index].respuestas){
		    obj.status = 'Respondido y Clasificado';
		}
		if(items[index].descartado){
		    obj.razon_descartado = items[index].descartado.motivo;
		    obj.status = 'Descartado';
		}
		if(items[index].atendido){
		    obj.status = 'atendido';
		}
		/*Obteniendo datos de usuario por tipo de mensaje*/
		if(items[index].obj === 'facebook'){
			if(items[index].from){
			    obj.nombre_post = items[index].from.name;
			    obj.mensaje = quitaEspeciales(items[index].message);
			}
		}
		if(items[index].obj === 'twitter'){
		    if(items[index].tipo === 'direct_message'){
				obj.nombre_post = items[index].sender.name;
		    }else{
				obj.nombre_post = items[index].user.name;
		    }
		    obj.mensaje = quitaEspeciales(items[index].text);
		}
		
		if(!obj.status){
		    obj.status = 'Sin atender';
		}
		resultado.push(obj);
		return procesaItemCsv(items,more,resultado,cback);
	    });
	}
    }
};

exports.generaArchivo = function(req,res){
    //console.log('Generando archivo en el server !!');
    //console.log(req.body);
    var fecha_inicial = new Date(req.body.fecha_inicial);
    var fecha_final = new Date(req.body.fecha_final);
    var tabla = req.body.coleccion;
    var tipo = req.body.tipo;
    var nombreSistema = req.body.nombreSistema;
    var criterio = {};
	
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
    
    obtieneCuenta(nombreSistema,function(idCuenta){
	if(idCuenta !== 'error'){
    	    if(tipo === 'general'){
	    		criterio = {
			    	$and:[
						{$or : [
							{'clasificacion' : { $exists : true }},
							{'clasificacion.tema' : { $ne : '' }},
							{'clasificacion.tema' : { $ne : 'Topic' }},
							{'sentiment' : { $exists : true }},
						]},
						{'created_time' : {$gte : fecha_inicial}},
						{'created_time' : {$lte : fecha_final}},
						{'from.id':{$ne : idCuenta}},
			     		{'retweeted_status' : {$exists:false}}
			    	]
				};
    	    }else{
/*    		criterio = {
		    $and:[
			{'clasificacion' : { $exists : true }},
			{'clasificacion.tema' : { $ne : '' }},
			{'clasificacion.tema' : { $ne : 'Topic' }},
			{'obj':tipo},
			{'sentiment' : { $exists : true }},
			{'created_time' : {$gte : fecha_inicial}},
			{'created_time' : {$lte : fecha_final}},
			{'from.id':{$ne : idCuenta}}
		    ]
		};*/
	    		criterio = {
			    	$and:[
						{$or : [
							{'clasificacion' : { $exists : true }},
							{'clasificacion.tema' : { $ne : '' }},
							{'clasificacion.tema' : { $ne : 'Topic' }},
							{'sentiment' : { $exists : true }},
						]},
						{'created_time' : {$gte : fecha_inicial}},
						{'created_time' : {$lte : fecha_final}},
						{'from.id':{$ne : idCuenta}},
						{'obj':tipo},
						{'retweeted_status' : {$exists:false}}

			    	]
				};
    	    }
   
    	  classdb.buscarToArrayFields(tabla, criterio,{'sentiment' : '', 'clasificacion' : ''}, {}, 'csvs/generaArchivo', function(data){
	    if (data !== 'error' && data.length > 0) {
	      var count = {};
	      var objetoSentiment={};
	      var negativo=0;
	      var neutro=0; 
	      var positivo=0;
		    
	      for(var i in data){
		if(data[i].sentiment) {
		  if(data[i].sentiment==='negativo'){
		    negativo++;
		  }
		  else if(data[i].sentiment==='neutro'){
		    neutro++;
		  }
		  else if(data[i].sentiment==='positivo'){
		    positivo++;
		  }
		   	    /* var sentiment = 'sentiment_'+data[i].sentiment;
		    	     if (count.hasOwnProperty(sentiment)) {
			     count[sentiment]++;
		    	     } else {
			     count[sentiment] = 1;
		    	     }*/
		}
		if(data[i].clasificacion){
		  var tema = data[i].clasificacion.tema;
		  var subtema = data[i].clasificacion.subtema;
		  var temsub = tema+'_'+subtema;

		  if(count.hasOwnProperty(tema)){
		    count[tema]++;
		  }else{
		    count[tema] = 1;
		  }
		  if(subtema !== ''){
		    if (count.hasOwnProperty(temsub)) {
		      count[temsub]++;
		    } else {
		      count[temsub] = 1;
		    }
		  }
                }
	      }
	      count.sentiment_negativo=negativo;
	      count.sentiment_neutro=neutro;
	      count.sentiment_positivo=positivo;
	    	    //count[objetoSentiment];
	    	    //sentiment__negativo
	    	    //console.log('Si hay posts resueltos');
	      res.jsonp(count);
	    }
	    else {
	      //console.log('No hay resultados');
	      res.jsonp(0);
	    }
   	  });
	}
    });
};
/*
/**
 * Csv authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.csv.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
