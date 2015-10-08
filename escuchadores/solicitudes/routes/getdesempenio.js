/* solicitudes/deldup/GET - borra duplicadas en base de datos */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();


/* GET Facebook Inbox. */
router.get('/', function(req, res, next) {

	function obtieneCuentas(callback){
		var arregloCuentas = [];
		var objetoCuentas = {};
	    classdb.buscarToArray('accounts', {}, {nombreSistema: 1}, 'solicitudes/getdesempenio/obtieneCuentas', function(cuentas){
			if (cuentas === 'error' || cuentas.length < 1) {
		    	return callback('error');
			}
			else {
				for(var i = 0; i<cuentas.length;i++){
					objetoCuentas = {};
					objetoCuentas.id = cuentas[i]._id;
					objetoCuentas.nombreSistema = cuentas[i].nombreSistema;
					//Validación de ids
					if(typeof cuentas[i] !== 'undefined' && typeof cuentas[i].datosPage !== 'undefined'){
				    	objetoCuentas.idCuenta = cuentas[i].datosPage.id;
				    	if (typeof cuentas[i].datosTwitter !== 'undefined' && cuentas[i].datosTwitter.twitter_id_principal) {
							objetoCuentas.idTwitter = cuentas[i].datosTwitter.twitter_id_principal;
				    	}
					}
					else if(typeof cuentas[i] !== 'undefined' && typeof cuentas[i].datosMonitoreo !== 'undefined'){
				    	objetoCuentas.idCuenta = cuentas[i].datosMonitoreo.id;
				    	if (typeof cuentas[i].datosTwitter !== 'undefined' && cuentas[i].datosTwitter.twitter_id_principal) {
							objetoCuentas.idTwitter = cuentas[i].datosTwitter.twitter_id_principal;
				    	}
					}
					else {
				    	if (typeof cuentas[i] !== 'undefined' && typeof cuentas[i].datosTwitter !== 'undefined' && cuentas[i].datosTwitter.twitter_id_principal) {
							objetoCuentas.idTwitter = cuentas[i].datosTwitter.twitter_id_principal;
				    	}
					}

					arregloCuentas.push(objetoCuentas);
				}
				return callback(arregloCuentas);
			}	
		});
	}


    function obtieneUsuarios(nombreSistema, idCuenta, callback){
		var arregloUsuarios=[];
		var coleccion = 'users';
		var sort = {};
		classdb.buscarToArray(coleccion, {'cuenta.marca':nombreSistema}, sort, 'charts/chartDesempenio/obtieneUsuarios', function(usuarios){		    	
	    	if(usuarios === 'error'){
				return callback('error', nombreSistema, idCuenta);
	    	}else{
				armaArregloUsuarios(usuarios, 0, [], function(arregloUsuarios){
		    		return callback(arregloUsuarios, nombreSistema, idCuenta); 
				});
	    	}
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
		    	objetoUsuario.idUsuario = usuarios[index]._id;
		    	objetoUsuario.nombre = usuarios[index].displayName;
		    	objetoUsuario.imagen = usuarios[index].imagen_src;
		    	arrusuarios.push(objetoUsuario);
		    	return armaArregloUsuarios(usuarios, more, arrusuarios, callback);
		    });
		}
    }
	function cuentaProceso(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, index, objetoProceso, callback){
		var cuantos = tipoEntrada.length;
		var more = index+1;
		if (more > cuantos) {
	    	return callback(objetoProceso, nombreSistema);
		}
		else {
			if(tipoEntrada[index] !== 'general'){ 
	    		criterio = {$and: [ 
					{'created_time' : {$gte : fecha_inicial}},
					{'created_time' : {$lte : fecha_final}},
					{'descartado' : {$exists : false}},
					{'atendido' : {$exists : false}},
					{'retweeted_status' : {$exists:false}},
					{'eliminado' : {$exists : false}},
					{'obj':tipoEntrada[index]},
			    	{'from_user_id' : {$ne: idCuenta}},
					{$or : [
						{$and:[
		    				{'sentiment' : {$exists : true}},
							{'sentiment_user_id' : user_id.toString()}
						]},
						{$and : [
		    				{'clasificacion' : {$exists:true}},
		    				{'clasificacion.user_id' : user_id.toString()}
		    			]},
		    			{$and:[
		    				{'respuestas' : {$exists:true}},
							{'respuestas':{$elemMatch: { 'user_id':{$ne: "direct-facebook"}}}},
							{'respuestas':{$elemMatch: { 'user_id': user_id.toString()}}}
						]}
		    		]}
	    		]};
			}else{
		    	criterio = {$and: [ 
					{'created_time' : {$gte : fecha_inicial}},
					{'created_time' : {$lte : fecha_final}},
					{'descartado' : {$exists : false}},
					{'atendido' : {$exists : false}},
					{'retweeted_status' : {$exists:false}},
					{'eliminado' : {$exists : false}},
				    {'from_user_id' : {$ne: idCuenta}},
					{$or : [
						{$and:[
			    			{'sentiment' : {$exists : true}},
							{'sentiment_user_id' : user_id.toString()}
						]},
						{$and : [
			    			{'clasificacion' : {$exists:true}},
			    			{'clasificacion.user_id' : user_id.toString()}
			    		]},
			    		{$and:[
			    			{'respuestas' : {$exists:true}},
							{'respuestas':{$elemMatch: { 'user_id':{$ne: "direct-facebook"}}}},
							{'respuestas':{$elemMatch: { 'user_id': user_id.toString()}}}
						]}
			    	]}
		    	]};
			}
			classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/consigueEnProceso', function(data){
				setImmediate(function(){
		    		objetoProceso[tipoEntrada[index]] = data;
		    		return cuentaProceso(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, more, objetoProceso, callback);
		    	});
			});	
		}	
	}

   function consigueEnProceso(tipoEntrada, fecha_inicial, fecha_final, usuario, nombreSistema, idCuenta, callback){
    	var objetoProceso = {};
    	if(!idCuenta){
    		idCuenta = '';
    	}
		var criterio = {};
		var user_id = usuario.idUsuario.toString();
		cuentaProceso(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, 0, {} ,function(proceso, nombre){
			return callback(proceso);
		});
    }

	function cuentaAtendido(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, index, objetoAtendido, callback){
		var cuantos = tipoEntrada.length;
		var more = index+1;
		if (more > cuantos) {
	    	return callback(objetoAtendido, nombreSistema);
		}
		else {
			if(tipoEntrada[index] !== 'general'){
		    	criterio = { $and:
					[
				    	{'created_time':{$gte: fecha_inicial}},
				    	{'created_time':{$lte: fecha_final}},
				    	{'atendido' : {$exists : true}},
					    {'from_user_id' : {$ne: idCuenta}},
						{'obj':tipoEntrada[index]},
				    	{'atendido.usuario_id':user_id},
				    	{'eliminado' : {$exists : false}},
						{'retweeted_status': {$exists : false}}
				 	]
			    };
			}else{
		    	criterio = { $and:
					[
				    	{'created_time':{$gte: fecha_inicial}},
				    	{'created_time':{$lte: fecha_final}},
				    	{'atendido' : {$exists : true}},
					    {'from_user_id' : {$ne: idCuenta}},
				    	{'atendido.usuario_id':user_id},
				    	{'eliminado' : {$exists : false}},
						{'retweeted_status': {$exists : false}}
				 	]
			    };
			} 
			classdb.count(nombreSistema+'_consolidada', criterio, 'charts/chartDesempenio/consigueEnProceso', function(data){
				setImmediate(function(){
		    		objetoAtendido[tipoEntrada[index]] = data;
		    		return cuentaAtendido(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, more, objetoAtendido, callback);
		    	});
			});	
		}
	}
   function consigueAtendido(tipoEntrada, fecha_inicial, fecha_final, usuario, nombreSistema, idCuenta, callback){
    	var objetoAtendido = {};
    	if(!idCuenta){
    		idCuenta = '';
    	}
		var criterio = {};
		var user_id = usuario.idUsuario.toString();
		cuentaAtendido(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, 0, {} ,function(atendido, nombre){
			return callback(atendido);
		});
    }

	function cuentaDescartado(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, index, objetoDescartado, callback){
		var cuantos = tipoEntrada.length;
		var more = index+1;
		if (more > cuantos) {
	    	return callback(objetoDescartado, nombreSistema);
		}
		else {
			if(tipoEntrada[index] !== 'general'){
				criterio = { 
					$and:[
			    		{'created_time' : {$gte: fecha_inicial}},
			    		{'created_time' : {$lte: fecha_final}},
				    	{'from_user_id' : {$ne: idCuenta}},
			    		{'obj':tipoEntrada[index]},
			    		{'descartado' : {$exists : true}},
			    		{'eliminado' : {$exists : false}},
			    		{'descartado.idUsuario' : user_id},
			     		{'retweeted_status': {$exists : false}}
					]
		    	};
			}else{
	    		criterio = {
	    			$and:[
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
			classdb.count(nombreSistema+'_consolidada', criterio, 'getdesempenio/chartDesempenio/consigueDescartado', function(data){
				setImmediate(function(){
		    		objetoDescartado[tipoEntrada[index]] = data;
		    		return cuentaDescartado(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, more, objetoDescartado, callback);
		    	});
			});	
		}
	}

   function consigueDescartado(tipoEntrada, fecha_inicial, fecha_final, usuario, nombreSistema, idCuenta, callback){
    	var objetoDescartado = {};
    	if(!idCuenta){
    		idCuenta = '';
    	}
		var criterio = {};
		var user_id = usuario.idUsuario.toString();
		cuentaDescartado(fecha_inicial, fecha_final, idCuenta, user_id, nombreSistema, criterio, tipoEntrada, 0, {} ,function(descartado, nombre){
			return callback(descartado);
		});
    }    

    function desglosaUsuarios(fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, index, callback){
		var tipent = ['general','facebook','twitter'];
		var cuantos = usuarios.length;
		var more = index+1;
		if (more > cuantos) {
	    	return callback (usuarios, nombreSistema, idCuenta);
		}
		else {
			setImmediate(function(){
		    	//console.log(usuarios[index].idUsuario);
		    	consigueEnProceso(tipent, fecha_inicial, fecha_final, usuarios[index], nombreSistema, idCuenta, function(totalProceso){
					if(totalProceso==='error'){
			    		desglosaUsuarios(fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
					}else{
			    		usuarios[index].proceso=totalProceso;
			    		consigueAtendido(tipent, fecha_inicial, fecha_final, usuarios[index], nombreSistema, idCuenta, function(totalAtendidos){
							if(totalAtendidos==='error'){
				    			desglosaUsuarios(tipent, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
							}else{
				    			usuarios[index].atendidos=totalAtendidos;
				    			consigueDescartado(tipent, fecha_inicial, fecha_final, usuarios[index], nombreSistema, idCuenta, function(totalDescartado){
									if(totalDescartado==='error'){
					    				desglosaUsuarios(tipent, fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
									}else{
					    				usuarios[index].descartado=totalDescartado;
					    				usuarios[index].total = totalAtendidos.general + totalDescartado.general + totalProceso.general;
					    				desglosaUsuarios(fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, more, callback);
									}
				    			});
							}
			    		});
					}
		    	});
			});
		}
    }

    function obtieneDirectFacebook(fecha_inicial, fecha_final, nombreSistema, idCuenta, usuarios, callback){
		var objetoDF = {};
		var criterio = { 
			$and: [
				{created_time : {$gte : fecha_inicial}},
				{created_time : {$lte : fecha_final}},
			    {from_user_id : {$ne : idCuenta}},
				{respuestas:{$elemMatch: { user_id: 'direct-facebook'}}},
				{descartado : {$exists : false}},
				//{atendido : {$exists : false}},
				{retweeted_status : {$exists:false}},
				{eliminado : {$exists : false}}
	    	]};
		classdb.count(nombreSistema+'_consolidada', criterio, 'getdesempenio/chartDesempenio/consigueDirectFacebook', function(data){
			if(data === 'error'){
				return callback('error');
			}else{
				objetoDF.idUsuario = 'direct-facebook';
				objetoDF.nombre = 'Facebook';
				objetoDF.imagen = 'images/profile/direct_facebook.jpg';
				objetoDF.proceso = {
					general : 0,
					facebook : 0,
					twitter : 0
				};
				objetoDF.atendidos = {
					general : data,
					facebook : data,
					twitter : 0
				};
				objetoDF.descartado = {
					general : 0,
					facebook : 0,
					twitter : 0
				};
				objetoDF.total = data;
				usuarios.push(objetoDF);
				return callback(usuarios, nombreSistema);
 			}
		});	    
    } 
	
	obtieneCuentas(function(cuentas){
		for(var i = 0; i<cuentas.length;i++){
			var idCuenta = '';
			
			if(cuentas[i].idCuenta){
				idCuenta = cuentas[i].idCuenta;
			}
			
			obtieneUsuarios(cuentas[i].nombreSistema, idCuenta, function(usuarios, nombreSistema, idCuenta){
				var fecha_inicial = new Date();
				var fecha_final = new Date();
			    fecha_inicial.setHours(0);
			    fecha_inicial.setMinutes(0);
			    fecha_inicial.setSeconds(0);

			    fecha_final.setHours(23);
			    fecha_final.setMinutes(59);
			    fecha_final.setSeconds(59);
				if(usuarios.length>0){
		    		desglosaUsuarios(fecha_inicial, fecha_final, usuarios, nombreSistema, idCuenta, 0, function(usuariosActualizados, nombreSistema, idCuenta){
						if(usuariosActualizados){
							obtieneDirectFacebook(fecha_inicial, fecha_final, nombreSistema, idCuenta, usuariosActualizados, function(directFacebook, nombreSistema){
								var criterio = {};
								criterio.fecha = new Date(fecha_inicial);
								criterio.usuarios = directFacebook;
								classdb.inserta(nombreSistema+'_desempenio', criterio, 'insertaDesempenio', function(resp){
						    		if (resp === 'error') {
										console.log(resp);
						    		}else {
										console.log('Inserta: ');
										console.log(resp);
										console.log(nombreSistema);
										console.log('\n\n');
						    		}
								});
							});
						}
					});
		    	}
			});				
		}res.jsonp('Finalizo'); 
	});
});

module.exports = router;
