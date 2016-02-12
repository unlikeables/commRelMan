/* solicitudes/deldup/GET - borra duplicadas en base de datos */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');
var nodemailer=require('nodemailer');
var config = {
		mailer: {
			from: 'Likeable CRM',
			options: {
				service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
				auth: {
					user: process.env.MAILER_EMAIL_ID || 'crm@likeable.mx',
					pass: process.env.MAILER_PASSWORD || 'L1k3@bl3MX*!'
				}
			}
		}
	};


var router = express.Router();

/* GET Facebook Inbox. */
router.get('/', function(req, res, next) {

	//Función que busca todas las cuentas que han sido dadas de alta en el sistema
	function obtieneCuentas(callback){
		var arregloCuentas = [];
		var objetoCuentas = {};
	    classdb.buscarToArray('accounts', {}, {nombreSistema: 1}, 'solicitudes/getdesempenio/obtieneCuentas', function(cuentas){
			if (cuentas === 'error' || cuentas.length < 1) {
		    	return callback('error');
			}
			else {
				return callback(cuentas);
			}	
		});
	}

	//Función que obtiene los usuarios de cada cuenta
    function obtieneUsuarios(cuenta, idCuenta, callback){
		var arregloUsuarios=[];
		var coleccion = 'users';
		var sort = {};
		classdb.buscarToArray(coleccion, {'cuenta.marca':cuenta.nombreSistema}, sort, 'charts/chartDesempenio/obtieneUsuarios', function(usuarios){		    	
	    	if(usuarios === 'error'){
				return callback('error', cuenta, idCuenta);
	    	}else{
				return callback(usuarios, cuenta, idCuenta);
	    	}
		});
    }   

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
  
    function obtieneTodos(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
		var criterio = { $and: 
			 [
			    {'created_time' : {$gte : fecha_inicial}},
			    {'created_time' : {$lte : fecha_final}},
			    {'from_user_id' : {$ne: idCuenta}},
			    {'retweeted_status' : {$exists:false}},
				{'eliminado':{$exists: false}}
			 ]
		};	
		classdb.count(cuenta.nombreSistema+'_consolidada', criterio, 'charts/chartPromedioCasos/obtieneTodos', function(total){
	    	return callback(total, cuenta, idCuenta);
		});
    }

    function obtieneAtendidos(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
	    var criterioA={ $and: 
				[
					{'retweeted_status': {$exists: false}},
			    	{'created_time' : {$gte : fecha_inicial }},
			    	{'created_time' : {$lte : fecha_final }},
				    {'from_user_id' : {$ne: idCuenta}},
					{'descartado':{$exists: false}}, 
					{'eliminado':{$exists: false}}, 
					//{$or: [
					//	{'sentiment' : { $exists : true }}, 
						{'atendido':{$exists: true}}
					//	{'clasificacion' : { $exists : true }},
						//{'respuestas' : { $exists: true }}
					//]}
				]
		    };

		classdb.count(cuenta.nombreSistema+'_consolidada', criterioA, 'charts/chartPromedioCasos/obtieneAtendidos', function(atendidos){
	    	return callback(atendidos, cuenta, idCuenta);
		});
    }

    function obtieneAtendidosDestiempo(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
	    var criterioA={ $and: 
				[
					{'retweeted_status': {$exists: false}},
			    	{'atendido.fecha' : {$gte : fecha_inicial }},
			    	{'atendido.fecha' : {$lte : fecha_final }},
				    {'from_user_id' : {$ne: idCuenta}},
					{'descartado':{$exists: false}}, 
					{'eliminado':{$exists: false}}, 
					{'atendido':{$exists: true}}
				]
		    };
		classdb.count(cuenta.nombreSistema+'_consolidada', criterioA, 'charts/chartPromedioCasos/obtieneAtendidos', function(atendidos){
	    	return callback(atendidos, cuenta, idCuenta);
		});
    }

    function obtieneDescartados(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
		var criterioD = { $and: 
				[
			    	{'descartado' : {$exists : true}},
					{'created_time' : {$gte : fecha_inicial}},
					{'created_time' : {$lte : fecha_final}},
			    	{'from_user_id' : {$ne: idCuenta}},
			      	{'retweeted_status' : {$exists:false}},
					{'eliminado' : {$exists : false}}
			  	]
			};

		classdb.count(cuenta.nombreSistema+'_consolidada', criterioD, 'charts/chartPromedioCasos/obtieneDescartados', function(descartados){
	    	return callback(descartados, cuenta, idCuenta);
		});
    }

    function obtieneDescartadosDestiempo(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
	    var criterioA={ $and: 
				[
					{'descartado' : {$exists : true}},
					{'retweeted_status': {$exists: false}},
			    	{'descartado.fecha' : {$gte : fecha_inicial }},
			    	{'descartado.fecha' : {$lte : fecha_final }},
				    {'from_user_id' : {$ne: idCuenta}},
					{'eliminado':{$exists: false}}, 
				]
		    };
		classdb.count(cuenta.nombreSistema+'_consolidada', criterioA, 'charts/chartPromedioCasos/obtieneDescartadosDestiempo', function(descartados){
	    	return callback(descartados, cuenta, idCuenta);
		});
    }

    function obtieneNuevos(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
		var criterioN = { $and: 
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

		classdb.count(cuenta.nombreSistema+'_consolidada', criterioN, 'charts/chartPromedioCasos/obtieneNuevos', function(nuevos){
	    	return callback(nuevos, cuenta, idCuenta);
		});
    }
    
    function obtieneResueltosFacebook(cuenta, fecha_inicial, fecha_final, idCuenta, callback) {
		var criterio = { $and: 
			 [
			    {'created_time' : {$gte : fecha_inicial}},
			    {'created_time' : {$lte : fecha_final}},
			    {'from_user_id' : {$ne : idCuenta}},
			    {'retweeted_status' : {$exists : false}},
			    {'respuestas.user_id':{$eq : 'direct-facebook'}},			
			    {'eliminado':{$exists : false}}
			 ]
		};	
		classdb.count(cuenta.nombreSistema+'_consolidada', criterio, 'charts/chartPromedioCasos/obtieneTodos', function(totalFacebook){
	    	return callback(totalFacebook, cuenta, idCuenta);
		});
	}

	function obtieneNivelServicio(cuenta, fecha_inicial, fecha_final, idCuenta, callback){
		var sort = {};
		var	criterio={
				$and:[
					{'created_time':{$gte:new Date(fecha_inicial)}},
					{'created_time':{$lte:new Date(fecha_final)}},
					{'from.id':{$ne : idCuenta}},
				    {'retweeted_status' : {$exists : false}},
				    {'eliminado':{$exists : false}}
				]
			};
		classdb.buscarToArrayFields(cuenta.nombreSistema+'_consolidada', criterio, {'respuestas' : '', 'created_time': '', 'atendido' : '', 'descartado' : ''} , sort, 'charts/chartPromedioTiempo/obtieneRespuestas', function(respuestas){		    	
			if(respuestas === 'error'){
				return callback('error');
			}else{
				return callback(respuestas, cuenta , idCuenta);
			}
		});
	}

	function desglosaNivelServicio(respuestas, cuenta, index, arregloRespuestas, idCuenta, callback){
		var cuantos = respuestas.length;
		var more = index+1;
		var objeto = {};
			for(var i = 0;i<respuestas.length;i++){
				objeto = {};
				if(respuestas[i].respuestas !== 'undefined' && respuestas[i].atendido && !respuestas[i].descartado){
					//console.log('ATENDIDO');
					//console.log(respuestas[i].atendido);
					objeto.tiempoLlegada = respuestas[i].created_time;	
					objeto.tiempoRespuesta = respuestas[i].atendido.fecha;
					arregloRespuestas.push(objeto);	
				}else if(respuestas[i].respuestas !== 'undefined' && !respuestas[i].atendido && respuestas[i].descartado){
					//console.log('DESCARTADO');
					//console.log(respuestas[i].descartado);
					objeto.tiempoLlegada = respuestas[i].created_time;	
					objeto.tiempoRespuesta = respuestas[i].descartado.fecha;	
					arregloRespuestas.push(objeto);	
				}else if(respuestas[i].respuestas !== 'undefined' && respuestas[i].atendido && respuestas[i].descartado){
					//console.log('ATENDIDO');
					//console.log(respuestas[i].atendido);
					objeto.tiempoLlegada = respuestas[i].created_time;	
					objeto.tiempoRespuesta = respuestas[i].atendido.fecha;
					arregloRespuestas.push(objeto);	
				}else if(respuestas[index].respuestas){
					//console.log('RESPUESTAS');
					//console.log(respuestas[i].respuestas);
				}else{
					//console.log('OPCION INVALIDA EN EL DESGLOSE DE respuestas');
				}	
			}
			return callback(arregloRespuestas, cuenta, idCuenta);
	}


	function obtieneRespuestas(cuenta, fecha_inicial, fecha_final, idCuenta, callback){
		var sort = {};
		var	criterio={
				$and:[
					{'respuestas':{$exists:true}},
					{'created_time':{$gte:new Date(fecha_inicial)}},
					{'created_time':{$lte:new Date(fecha_final)}},
					{'from.id':{$ne : idCuenta}}
				]
			};
		classdb.buscarToArrayFields(cuenta.nombreSistema+'_consolidada', criterio, {'respuestas' : '', 'created_time': ''} , sort, 'charts/chartPromedioTiempo/obtieneRespuestas', function(respuestas){		    	
			if(respuestas === 'error'){
				return callback('error');
			}else{
				return callback(respuestas, cuenta , idCuenta);
			}
		});
	}

	function desglosaRespuestas(respuestas, cuenta, index, arregloRespuestas, idCuenta, callback){
		var cuantos = respuestas.length;
		var more = index+1;
		var objeto = {};
		if (more <= cuantos) {
			objeto.tiempoLlegada = respuestas[index].created_time;
			setImmediate(function(){
				for(var i=0;i<respuestas[index].respuestas.length;i++){
					objeto.tiempoLlegada = respuestas[index].created_time;
					objeto.tiempoRespuesta = respuestas[index].respuestas[i].timestamp;
					arregloRespuestas.push(objeto);				
				}
				desglosaRespuestas(respuestas, cuenta, more, arregloRespuestas, idCuenta, callback);
			});
		}else{
			return callback(arregloRespuestas, cuenta, idCuenta);
		}
	}

	function enviaMail(cuenta, datos, fecha, usuarios){
		setImmediate(function(){
			//var arreglo = ['gabo_ochoa_4@hotmail.com', 'ady@likeable.mx', 'gabriel@likeable.mx', 'alberto@likeable.mx', 'jeronimo@likeable.mx'];
			//var item = arreglo[Math.floor(Math.random()*arreglo.length)];
			var cadenaUsuarios = '';
			for(var i = 0; i<usuarios.length;i++){
				//console.log('usuarios');
				//console.log(usuarios[i]);
				if(usuarios[i].dailyreport === true){
					if(usuarios[i].roles[0] === 'account-manager' || usuarios[i].roles[0] === 'app-manager'){
						cadenaUsuarios+=usuarios[i].email+',';
					}
				}
			}
			cadenaUsuarios = cadenaUsuarios.substring(0, cadenaUsuarios.length - 1);


			if(cadenaUsuarios){
				console.log('LA CADENA DE USUARIOS');
				console.log(cadenaUsuarios);
				console.log(cuenta.nombreSistema);
				//console.log(datos);
				//console.log('\n\n'); 
				res.render('emailEstadisticas', {
					'fecha' : fecha,
					'cuenta' : cuenta,
					'datos' : datos
				}, function(err, emailHTML) {
					var smtpTransport = nodemailer.createTransport(config.mailer.options);
					var mailOptions = {
						to : cadenaUsuarios,
						//to : ['gabriel@likeable.mx','grecia@likeable.mx'],
						//to : 'gabriel@likeable.mx',
						from: 'Likeable CRM <crm@likeable.mx>',				
						subject: 'Desempeño CRM '+cuenta.marca,				
						html: emailHTML
					};
					smtpTransport.sendMail(mailOptions, function(err) {
						if (!err) {
							console.log('email enviado correctamente !');
						}else {
							console.log(cuenta.nombreSistema);
							//console.log(item);
							console.log(err);
						}
					});
				});
			}
		});
	}

	obtieneCuentas(function(cuentas){
		var coleccion  = '';
		for(var i = 0; i<cuentas.length;i++){
			var idCuenta = '';
			if(typeof cuentas[i] !== 'undefined' && typeof cuentas[i].datosPage !== 'undefined' && cuentas[i].datosPage.id && cuentas[i].datosPage.id !== ''){
		    	idCuenta = cuentas[i].datosPage.id;
			}
			else if(typeof cuentas[i] !== 'undefined' && typeof cuentas[i].datosMonitoreo !== 'undefined' && cuentas[i].datosMonitoreo.id && cuentas[i].datosMonitoreo.id !== ''){
		    	idCuenta = cuentas[i].datosMonitoreo.id;
			}
			var fecha_inicial = new Date();
			var fecha_final = new Date();
			fecha_inicial.setDate(fecha_inicial.getDate() - 1);
			fecha_final.setDate(fecha_final.getDate() - 1);
			fecha_inicial.setHours(0);
			fecha_inicial.setMinutes(0);
			fecha_inicial.setSeconds(0);
			fecha_final.setHours(23);
			fecha_final.setMinutes(59);
			fecha_final.setSeconds(59);
			//console.log('Las fechas');
			//console.log(fecha_inicial);
			//console.log(fecha_final);
			obtieneTodos(cuentas[i], fecha_inicial, fecha_final, idCuenta, function(todos, cuenta, idCuenta) {
	    		if (todos === 'error') {
					res.jsonp(todos);
	    		}else {
	    			obtieneAtendidosDestiempo(cuenta, fecha_inicial, fecha_final, idCuenta, function(atendidosDestiempo, cuenta, idCuenta) {
		    			if (atendidosDestiempo === 'error') {
							res.jsonp(atendidosDestiempo);
		    			}else {
							obtieneAtendidos(cuenta, fecha_inicial, fecha_final, idCuenta, function(atendidos, cuenta, idCuenta) {
			    				if (atendidos === 'error') {
									res.jsonp(atendidos);
			    				}else {
									obtieneDescartados(cuenta, fecha_inicial, fecha_final, idCuenta, function(descartados, cuenta, idCuenta) {
					    				if (descartados === 'error') {
											res.jsonp(descartados);
					    				}else {
					    					obtieneDescartadosDestiempo(cuenta, fecha_inicial, fecha_final, idCuenta, function(descartadosDestiempo, cuenta, idCuenta) {
					    						if (descartadosDestiempo === 'error') {
													res.jsonp(descartadosDestiempo);
					    						}else {
													obtieneNuevos(cuenta, fecha_inicial, fecha_final, idCuenta, function(nuevos, cuenta, idCuenta) {
								    					if (nuevos === 'error') {
															res.jsonp(nuevos);
								    					}else {
								    						obtieneResueltosFacebook(cuenta, fecha_inicial, fecha_final, idCuenta,function(facebook, cuenta, idCuenta){
													    		if(facebook === 'error'){
													    			res.jsonp(facebook);
													    		}else{
																	obtieneNivelServicio(cuenta, fecha_inicial, fecha_final, idCuenta, function(nivelServicio, cuenta, idCuenta){
																		var nivelServicioDesglosado=[];
																		if(nivelServicio === 'error'){
																			res.jsonp(nivelServicio); 
																		}else{
																			desglosaNivelServicio(nivelServicio, cuenta, 0, nivelServicioDesglosado, idCuenta, function(resNivelServicio, cuenta, idCuenta){
																			 	var obj = {
																					'promedio' : 0,
																					'promedioNS' : 0
																			 	};

																			 	if(!obj.menosHoraNS){
																					obj.menosHoraNS = 0;
																				}
																				if(!obj.unaOchoNS){
																					obj.unaOchoNS = 0;
																				}	
																				if(!obj.ochoVeinticuatroNS){
																					obj.ochoVeinticuatroNS = 0;
																				}
																				if(!obj.masVeinticuatroNS){
																					obj.masVeinticuatroNS = 0;
																				}
																			    var horasLlegadaNS = 0;
																			    var minutosLlegadaNS = 0;
																			    var segundosLlegadaNS = 0;

																			    var horasRespuestaNS = 0;
																			    var minutosRespuestaNS = 0;
																			    var segundosRespuestaNS = 0;

																			    var horasConvertidasLlegadaNS = 0;
																			    var minutosConvertidosLlegadaNS = 0;

																			    var horasConvertidasRespuestaNS = 0;
																			    var minutosConvertidosRespuestaNS = 0;

																			    var fechaLlegadaNS ='';
																			    var fechaRespuestaNS = '';
																			    var totalSegundosLlegadaNS = 0;
																			    var totalSegundosRespuestaNS = 0;
																			    var totalSegundosNivelNS = 0;
																			    var totalSegundosNS = 0;
																			    var restanteSegundosNS = 0;

																		    	for(var index = 0; index < resNivelServicio.length;index++) {
																					fechaLlegadaNS = new Date(resNivelServicio[index].tiempoLlegada);
																					fechaRespuestaNS = new Date (resNivelServicio[index].tiempoRespuesta);

																					horasLlegadaNS = fechaLlegadaNS.getHours();
																					minutosLlegadaNS = fechaLlegadaNS.getMinutes();
																					segundosLlegadaNS = fechaLlegadaNS.getSeconds();

																					horasRespuestaNS = fechaRespuestaNS.getHours();
																					minutosRespuestaNS = fechaRespuestaNS.getMinutes();
																					segundosRespuestaNS = fechaRespuestaNS.getSeconds();

																					horasConvertidasLlegadaNS = horasLlegadaNS*3600;
																					minutosConvertidosLlegadaNS = minutosLlegadaNS*60;
																					totalSegundosLlegadaNS = horasConvertidasLlegadaNS+minutosConvertidosLlegadaNS+segundosLlegadaNS;					

																					horasConvertidasRespuestaNS = horasRespuestaNS*3600;
																					minutosConvertidosRespuestaNS = minutosRespuestaNS*60;
																					totalSegundosRespuestaNS = horasConvertidasRespuestaNS+minutosConvertidosRespuestaNS+segundosRespuestaNS;

																					restanteSegundosNS = totalSegundosRespuestaNS - totalSegundosLlegadaNS;

																					if(restanteSegundosNS<0){
																						restanteSegundosNS =restanteSegundosNS * -1;
																					}

																					totalSegundosNS =totalSegundosNS + restanteSegundosNS;
																					totalSegundosNivelNS=totalSegundosLlegadaNS-totalSegundosRespuestaNS;
																				
																					if(totalSegundosNivelNS<=3600){
																						obj.menosHoraNS = obj.menosHoraNS + 1;
																					}
																					else if(totalSegundosNivelNS>=3600 && totalSegundosNivelNS<=28800){
																						obj.unaOchoNS = obj.unaOchoNS + 1;
																					}
																					else if(totalSegundosNivelNS>=28800 && totalSegundosNivelNS<=86400){
																						obj.ochoVeinticuatroNS = obj.ochoVeinticuatroNS + 1;
																					}
																					else if(totalSegundosNivelNS>86400){
																						obj.masVeinticuatroNS = obj.masVeinticuatroNS + 1;
																					}
																			    }

																			    var promedioNS = totalSegundosNS / resNivelServicio.length;
																			    promedioNS = Math.round(promedioNS);
																			    var horasNS = 0;
																			    var minutosNS = 0;
																			    var segundosNS = 0;
																			    var horasMenosNS = 0;
																			    //Validaciones para convertir los segundos a horas, minutos o segundos
																			    if(promedioNS>=3600){
																			    	horasNS = Math.floor(promedioNS/3600);
																			    	if(horasNS < 10){
																			    		horasNS = '0'+horasNS;
																			    	}
																			    	promedioNS = promedioNS - (horasNS * 3600);
																			    }
																			    if(promedioNS>=60){
																			    	minutosNS = Math.floor(promedioNS/60);
																			    	promedioNS = promedioNS - (minutosNS * 60);
																			    	if(minutosNS<10){
																			    		minutosNS = '0'+minutosNS;
																			    	}
																			    }
																			    if(promedioNS<60){
																			    	segundosNS = promedioNS;
																			    	if(segundosNS <10){
																			    		segundosNS = '0'+segundosNS;
																			    	}
																			    }

																				if(horasNS !== 0){
																				   	obj.promedioNS=horasNS+':'+minutosNS;
																					obj.tipoNS='hrs';
																				}else{
																				   	if(minutosNS !== 0){
																				   		obj.promedioNS=minutosNS+':'+segundosNS;
																						obj.tipoNS='min';
																				   	}else{
																				   		obj.promedioNS=segundosNS;
																				   		obj.tipoNS='seg';
																				   	}
																				}														
																				obj.tiempoRespuestaNS = obj.promedioNS+' '+obj.tipoNS;
											
																				obtieneRespuestas(cuenta, fecha_inicial, fecha_final, idCuenta, function(respuestas, cuenta, idCuenta){
																					var respuestasDesglosadas=[];
																					if(respuestas === 'error'){
																						res.jsonp(respuestas); 
																					}else{
																						desglosaRespuestas(respuestas,cuenta,0,respuestasDesglosadas, idCuenta, function(resDesglose, cuenta, idCuenta){
																					 	   	if(!obj.menosHora){
																								obj.menosHora = 0;
																							}
																							if(!obj.unaOcho){
																								obj.unaOcho = 0;
																							}	
																							if(!obj.ochoVeinticuatro){
																								obj.ochoVeinticuatro = 0;
																							}
																							if(!obj.masVeinticuatro){
																								obj.masVeinticuatro = 0;
																							}
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
																						    var totalSegundosNivel = 0;
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
																								totalSegundosNivel=totalSegundosLlegada-totalSegundosRespuesta;
																									
																								if(totalSegundosNivel<=3600){
																									obj.menosHora = obj.menosHora + 1;
																								}
																								else if(totalSegundosNivel>=3600 && totalSegundosNivel<=28800){
																									obj.unaOcho = obj.unaOcho + 1;
																								}
																								else if(totalSegundosNivel>=28800 && totalSegundosNivel<=86400){
																									obj.ochoVeinticuatro = obj.ochoVeinticuatro + 1;
																								}
																								else if(totalSegundosNivel>86400){
																									obj.masVeinticuatro = obj.masVeinticuatro + 1;
																								}
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
																							   	obj.promedio=horas+':'+minutos;
																								obj.tipo='hrs';
																						    }else{
																							    if(minutos !== 0){
																							    	obj.promedio=minutos+':'+segundos;
																									obj.tipo='min';
																							    }else{
																							    	obj.promedio=segundos;
																							    	obj.tipo='seg';
																							    }
																							}														
																							obj.Todos = nuevos+facebook+atendidos+descartados;
								//															obj.Todos = todos+facebook;
																							obj.Entrada = nuevos;
																							obj.Completos = resDesglose.length;
																							//obj.Completos = atendidos;
																							obj.Descartados = descartados;
																							obj.DescartadosDestiempo = descartadosDestiempo;
																							obj.Facebook = facebook;
																							obj.AtendidosSinRespuesta = atendidos - resDesglose.length;
																							obj.AtendidosDestiempo = atendidosDestiempo;
																							obj.tiempoRespuesta = obj.promedio+' '+obj.tipo;
																							obj.nombreSistema = cuenta.nombreSistema;
																							obtieneUsuarios(cuenta, idCuenta, function(usuarios, cuenta, idCuenta){
																								if(usuarios.length>0){
																									//console.log('LOS DATOS A ENVIAR');
																									//console.log('\n\n');
																									//console.log('LA CUENTA');
																									//console.log(cuenta);
																									//console.log('EL OBJETO DE LA CUENTA');
																									//console.log(obj);
																									//setImmediate(function(){
																									enviaMail(cuenta, obj, fecha_inicial, usuarios);
																									//});
																								}
																							//	console.log('\n\n');
																							});
																						});
																					}
																				});
																			});
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
				    			}
							});
						}
					});	
	    		}
	    	});
	    }
	});
	res.jsonp('Finalizó'); 
});

module.exports = router;
