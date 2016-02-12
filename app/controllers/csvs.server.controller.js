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
    var criterio  = {};
    
    function getdatoscuenta(nombreSistema,cback) {
		var criterio = {'nombreSistema': nombreSistema};
		classdb.buscarToStream('accounts', criterio, {}, 'feeds/getMailboxDescartados/querySecundario', function(datos){
	    	console.log('LOS DATOS DE LA CUENTA');
	    	console.log(datos);
	    	if(datos.length > 0){
				if(datos[0].datosPage){
		    		return cback(datos[0].datosPage.id);
				}else if(datos[0].datosMonitoreo){
					return cback(datos[0].datosMonitoreo.id);
				}
	    	}else{
				return cback('error');
	    	}
		});
    }

    function quitaEspeciales(string){
		if (string) {
    	    return string.replace(/,/g,'-').replace(/"/g,'&34').replace(/\n/g,' ').replace(/(\r\n|\n|\r)/gm, ' ');
		} 
    }

    function obtieneTiempo(promedio){
    	var objetoTiempos = {};
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
			return objetoTiempos;
		}else{
			if(minutos !== 0){
				objetoTiempos.promedio=minutos+':'+segundos;
				objetoTiempos.tipo='min';
				return objetoTiempos;
			}else{
				objetoTiempos.promedio=segundos;
				objetoTiempos.tipo='seg';
				return objetoTiempos;
			}
		}    	
    }
    
	function traduceDescartados(razon){

		switch(razon){
			case 'answered':
				razon = 'Respondido';
				//return 'Respondido';
			break;

			case  'spam':
				razon = 'Spam';
				//(return 'Spam';
			break;

			case 'insult':
				razon = 'Insulto';
				//return 'Insulto';
			break;

			case 'otro':
				razon = 'Otro';
				//return 'Otro';
			break;

			case 'troll':
				razon = 'Troll';
				//return 'Troll';
			break ;

			case 'not-related':
				razon = 'No Relacionado';
				//return 'No Relacionado';
			break;

			case 'campaign':
				razon = 'Campaña';
				//return 'Campaña';
			break;

			case 'other_comments':
				razon = 'Mediático'; 
				//return 'Mediático';
			break;
			default:
				//return razon;
		}
		return razon;

	} 

	function corrigeFormatoFecha(fecha){
		if(typeof(fecha) === 'undefined' || fecha === null || fecha === ''){
			return '';
		}else{
			var fechaDate = new Date(fecha);
			var meses = [];
			meses[0] = 'Enero';
			meses[1] = 'Febrero';
			meses[2] = 'Marzo';
			meses[3] = 'Abril';
			meses[4] = 'Mayo';
			meses[5] = 'Junio';
			meses[6] = 'Julio';
			meses[7] = 'Agosto';
			meses[8] = 'Septiembre';
			meses[9] = 'Octubre';
			meses[10] = 'Noviembre';
			meses[11] = 'Diciembre';

			var obtieneMes = '';
			var obtieneDia = '';
			var obtieneAnio = '';
			var obtieneHora = '';
			var obtieneMinutos = '';
			var obtieneSegundos = '';
			obtieneDia = fechaDate.getDate();
			obtieneMes = fechaDate.getMonth();
			obtieneAnio = fechaDate.getFullYear();
			obtieneHora = fechaDate.getHours();
			obtieneMinutos = fechaDate.getMinutes();
			obtieneSegundos = fechaDate.getSeconds();
			var mes = meses[obtieneMes];
			if(obtieneDia < 10){
				obtieneDia = '0'+obtieneDia;
			}

			if(mes < 10){
				mes = '0'+mes;
			}
			
			if(obtieneHora < 10){
				obtieneHora = '0'+obtieneHora;
			}

			if(obtieneMinutos < 10){
				obtieneMinutos = '0'+obtieneMinutos;
			}

			if(obtieneSegundos < 10){
				obtieneSegundos = '0'+obtieneSegundos;
			}

			return obtieneDia+'/'+meses[obtieneMes]+'/'+obtieneAnio+' - '+obtieneHora+':'+obtieneMinutos+':'+obtieneSegundos;
		}
	}

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
				var resta = '';
				var respuesta = '';
				/* Obteniendo respuesta o respuestas */
				if(items[index].respuestas){
		    		for(var i in items[index].respuestas){
						obj.respuesta += quitaEspeciales(items[index].respuestas[i].texto)+'||';
		    		}
		    		obj.status = 'Respondido';
		    		obj.fecha_respuesta = new Date(items[index].respuestas[0].timestamp);
		    		resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo; 
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
		    		obj.razon_descartado = traduceDescartados(items[index].descartado.motivo);
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
					if(items[index].tipo === 'facebook_inbox'){
						obj.url = 'https://www.facebook.com/'+items[index].from.id;
					}else if(items[index].tipo === 'comment'){
						var post = items[index].parent_post.split('_');
						var id = items[index].id.split('_');
						obj.url = 'https://www.facebook.com/'+post[0]+'/posts/'+post[1]+'?comment_id='+id[1];
					}else if(items[index].tipo === 'post'){
						var idSeparado = items[index].id.split('_');
						obj.url = 'https://www.facebook.com/'+idSeparado[0]+'/post/'+idSeparado[1];
					}
				}
				if(items[index].obj === 'twitter'){
		    		if(items[index].tipo === 'direct_message'){
						obj.nombre_post = items[index].sender.name;
						obj.url = 'https://twitter.com/' + items[index].sender.screen_name;
		    		}else{
						obj.nombre_post = items[index].user.name;
						obj.url = 'https://twitter.com/' + items[index].user.screen_name;
		    		}
		    		obj.mensaje = quitaEspeciales(items[index].text);
				}
		
				if(!obj.status){
		    		obj.status = 'Sin atender';
				}


				var fechaRespuestaCorregida = corrigeFormatoFecha(obj.fecha_respuesta);
				obj.fecha_respuesta = fechaRespuestaCorregida;

				if(obj.fecha_respuesta.length === 0 && items[index].atendido && !items[index].descartado){
					obj.fecha_respuesta = new Date(items[index].atendido.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo; 
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
					//console.log('No hay fecha de respuesta pero hay clasificacion');
				}else if(obj.fecha_respuesta.length === 0 && !items[index].atendido && items[index].descartado){
					obj.fecha_respuesta = new Date(items[index].descartado.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo;
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
				}else if(obj.fecha_respuesta.length === 0 && items[index].atendido && items[index].descartado){
					obj.fecha_respuesta = new Date(items[index].atendido.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo;
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
				}

				var fechaLlegadaCorregida = corrigeFormatoFecha(obj.fecha_llegada);
				obj.fecha_llegada = fechaLlegadaCorregida;
				//console.log('EL OBJETO QUE SE ESTA PASANDO');
				//console.log(obj);
				//console.log('\n\n\n');

				//console.log(obj.fecha_respuesta);
				//Validación para saber quien atendio
				if(items[index].atendido){
					if(items[index].atendido.usuario_nombre){
						obj.atendidoPor = items[index].atendido.usuario_nombre;
					}else{
						if(items[index].clasificacion.user_name){
							obj.atendidoPor = items[index].clasificacion.user_name;
						}
					}
				}else if(items[index].descartado){
					obj.atendidoPor  = items[index].descartado.usuario;
				}

				resultado.push(obj);
				return procesaItemCsv(items,more,resultado,cback);
	    	});
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
	      //var negativo=0;
	      //var neutro=0; 
	      //var positivo=0;
		    
	      for(var i in data){
		/*if(data[i].sentiment) {
		  if(data[i].sentiment==='negativo'){
		    negativo++;
		  }
		  else if(data[i].sentiment==='neutro'){
		    neutro++;
		  }
		  else if(data[i].sentiment==='positivo'){
		    positivo++;
		  }*/
		   	    /* var sentiment = 'sentiment_'+data[i].sentiment;
		    	     if (count.hasOwnProperty(sentiment)) {
			     count[sentiment]++;
		    	     } else {
			     count[sentiment] = 1;
		    	     }*/
		//}
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
	      //count.sentiment_negativo=negativo;
	      //count.sentiment_neutro=neutro;
	    //  count.sentiment_positivo=positivo;
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
