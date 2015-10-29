'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');

var Twit = require('twit');

exports.getStringTagCloud = function(req,res) {
    var coleccion = req.query.cuenta;
    var fecha1 = new Date(req.query.fecha1);
    var fecha2 = new Date(req.query.fecha2);
    var id_facebook = req.query.id_facebook;
    var palabras = [];
    var palabrasTemp = [];	
    var abjeto = {};

    function encadenafrases(contenidos, callback) {
		var palabras = [];
		var cuantos = contenidos.length-1;
		// var palabrasTemp = [];
		for (var pal in contenidos) {
	    	var frase = '';
	    	if (typeof contenidos[pal].message !== 'undefined' && contenidos[pal].message !== '') {
				frase = contenidos[pal].message;
	    	}
	    	else {
				if (typeof contenidos[pal].text !== 'undefined' && contenidos[pal].message !== '') {
		    		frase = contenidos[pal].text;
				}
	    	}
	    	if(frase !== ''){
				//palabrasTemp = frase.split(' ');
				palabras = palabras.concat(frase.split(' '));
	    	}
	    	if (Number(pal) === cuantos) {
	    		return callback(palabras);
	    	}
		}	
    }

    function clasificapalabras(palabras, callback) {
		var cuantas = palabras.length;
		var numeroCaracteresMinimos = 10;
		var palabrasExcluidas = ['a','que','de','y','te','la','los','el','hola','en','por','nos','mi','sin','Hola','las','con','un','son','si','se','tu','su',
				 'lo','res','?','??','me','...','y','Y','ya','mas','más','sí','es','Si','Te','ok','para','pero','Por','No','1','2','3','4','5',
				 '6','7','8','9','0','o','mar','tus','Son','son','tal','1era','mi','estas?','Buenos','una','Les','les','De','de','como','.|.',
				 ':D',':)','','\n','mucho','script','undefined'];
		var objetoPalabrasTerminos = [];
		var objetoPalabrasHashtag = [];
		var objetoPalabrasMencion = [];
		var objetoPalabras = [];
		var palabraActual = null;
		var contadorPalabras = 0;
		for (var i = 0; i < palabras.length; i++) {
            if (palabras[i] !== palabraActual) {
				if (contadorPalabras > 0) {
                	if((palabrasExcluidas.indexOf(palabraActual) < 0) && (palabraActual.length > numeroCaracteresMinimos)) {
						var palabraProcesada = palabraActual;
						palabraProcesada = palabraProcesada.replace('\n','');
						palabraProcesada = palabraProcesada.replace(':','');
						palabraProcesada = palabraProcesada.replace(',','');
						palabraProcesada = palabraProcesada.replace('!','');
						palabraProcesada= palabraProcesada.replace('-','');
						palabraProcesada= palabraProcesada.replace('?','');
						palabraProcesada = palabraProcesada.replace('<script>','');
						palabraProcesada = palabraProcesada.replace('</script>','');
						if(palabraActual.search('@') === 0){
			    			objetoPalabrasMencion.push({'text':palabraProcesada,'weight':contadorPalabras});	
						}else if(palabraActual.search('#') === 0){
			    			objetoPalabrasHashtag.push({'text':palabraProcesada,'weight':contadorPalabras});	
						}else{
			    			objetoPalabrasTerminos.push({'text':palabraProcesada,'weight':contadorPalabras});	
						}
                    }
				}
				palabraActual = palabras[i];
				contadorPalabras = 1;
            } else {
				contadorPalabras++;
            }
	    	if (i === cuantas-1) {
				return callback(objetoPalabrasMencion, objetoPalabrasHashtag, objetoPalabrasTerminos);
	    	}
		}	
    }

	var criteriopage = { from_user_id : { $exists : true }};
	
	if (typeof id_facebook !== 'undefined') {
    	    criteriopage  = {from_user_id : {$ne : id_facebook}};
    	    //console.log(criteriopage);
	}
	
    var criterius = { $and : [criteriopage,{created_time : {$lte: fecha2}}, {created_time: {$gte: fecha1}},{descartado:{$exists:false}}]};
    var elsort = {created_time: -1};
    var campos = {message : 1, text : 1};
    classdb.buscarToArrayFieldsLimit(coleccion, criterius, campos, elsort, 2000, 'charts/getStringTagCloud.main', function(items) {
		if (items === 'error') {
	    	res.jsonp(abjeto);
		}
		else {
	    	encadenafrases(items, function(palabras){
				palabras.sort();
				clasificapalabras(palabras, function(mentions, hashtags, terms){
		    		var objetoPalabras = [];
		    		terms.sort(function(a, b){
						return  b.weight - a.weight;
		    		});
		    		hashtags.sort(function(a, b){
						return  b.weight - a.weight;
		    		});
		    		mentions.sort(function(a, b){
						return  b.weight - a.weight;
		    		});
 		    		objetoPalabras.push({'terminos':terms});
 		    		objetoPalabras.push({'hashtags':hashtags});
 		    		objetoPalabras.push({'menciones':mentions});
		    		res.jsonp(objetoPalabras);	
				});
	    	});
		}
    });
};


/*
      _                _  ______                             _ _       _____                     
     | |              | | | ___ \                           | (_)     /  __ \                    
  ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | /  \/ __ _ ___  ___  ___ 
 / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| |    / _` / __|/ _ \/ __|
| (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | \__/\ (_| \__ \ (_) \__ \
 \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/ \____/\__,_|___/\___/|___/
                                                                                                                                                                                                                                                                               
*/
exports.chartPromedioCasos = function(req, res){
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
					{'retweeted_status': {$exists: false}},
			    	{'created_time' : {$gte : debut }},
			    	{'created_time' : {$lte : finale }},
				    {'from_user_id' : {$ne: idFb}},
					{'descartado':{$exists: false}}, 
					{'eliminado':{$exists: false}}, 
					//{$or: [
						//{'sentiment' : { $exists : true }}, 
						{'atendido':{$exists: true}}
					//	{'clasificacion' : { $exists : true }},
					//	{'respuestas' : { $exists: true }},	
					//]}
				]
		    };
		}
		else{

			criterioA={ $and: 
				[
					{'retweeted_status': {$exists: false}},
			    	{'created_time' : {$gte : debut }},
			        {'obj' : tipent},
			    	{'created_time' : {$lte : finale }},
				    {'from_user_id' : {$ne: idFb}},
					{'descartado':{$exists: false}}, 
					{'eliminado':{$exists: false}}, 
					//{$or: [
					//	{'sentiment' : { $exists : true }}, 
						{'atendido':{$exists: true}}, 
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
			    	{'descartado' : {$exists : true}},
					{'created_time' : {$gte : debut}},
					{'created_time' : {$lte : finale}},
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
		console.log('FECHAS EN ppromedio GRAFICA');
    	console.log(debut);
    	console.log(finale);
    	console.log(idFb);
		console.log(tipent);
		var criterioN ={};
		if(tipoEntrada==='general'){
			criterioN = { $and: 
				[
					{'created_time' : {$gte : debut}},
					{'created_time' : {$lte : finale}},
			    	{'from_user_id' : {$ne: idFb}},
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
			    {'respuestas.user_id':{$eq : 'direct-facebook'}},			
			    {'eliminado':{$exists: false}}
			 ]
		};	
		classdb.count(coleccion, criterio, 'charts/chartPromedioCasos/obtieneTodos', function(totalFacebook){
	    	return callback(totalFacebook);
		});
	}

    var nombreSistema=req.body.nombreSistema;
    var tipoEntrada=req.body.tipo;
    var inicia = new Date(req.body.fecha_inicial);
    var termina = new Date(req.body.fecha_final);
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
												obj.facebook = facebook;
												console.log('Finalizo chartPromedioCasos');
												console.log(obj);
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
};
/*
                _        _                _  ______                             _ _       _____                     
               | |      | |              | | | ___ \                           | (_)     /  __ \                    
  ___ _ __   __| |   ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | /  \/ __ _ ___  ___  ___ 
 / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| |    / _` / __|/ _ \/ __|
|  __/ | | | (_| | | (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | \__/\ (_| \__ \ (_) \__ \
 \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/ \____/\__,_|___/\___/|___/
                                                                                                                    
      _                _  ______                         _            _           
     | |              | | |  _  \                       | |          | |          
  ___| |__   __ _ _ __| |_| | | |___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
 / __| '_ \ / _` | '__| __| | | / _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
| (__| | | | (_| | |  | |_| |/ /  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
 \___|_| |_|\__,_|_|   \__|___/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/
*/
exports.chartDescartados = function(req, res){
    var nombreSistema=req.body.nombreSistema;
    var tipoEntrada=req.body.tipo;

    //funciòn opara obtener la cuenta
    function obtieneCuenta(nombreSistema,callback){
		var coleccion = 'accounts';
		var sort = {};
		classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartDescartados/obtieneCuenta', function(cuenta){		    	
	    	if(cuenta === 'error'){
				return callback('error');
	    	}else{
				return callback(cuenta);
	    	}
		});		
    }

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
	
		var criterio = {};
		if(tipoEntrada==='general'){
	    	criterio = {$and:
				[ 
			    	{'descartado':{$exists:true}},
			    	{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
			    	{'created_time':{$lte:new Date(req.body.fecha_final)}},
			    	{'descartado':{$ne:''}},
			    	{'from.id':{$ne : idCuenta}},
			    	{'eliminado':{$exists: false}}
				]
		    };
		}else{
	    	criterio = {$and:
				[
			    	{'descartado':{$exists:true}},
			    	{'obj':tipoEntrada},
			    	{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
			    	{'created_time':{$lte:new Date(req.body.fecha_final)}},
			    	{'descartado':{$ne:''}},
			    	{'from.id':{$ne : idCuenta}},
			    	{'eliminado':{$exists: false}}
				]
		    };
		}
		classdb.buscarToArrayFields(nombreSistema+'_consolidada',criterio,{'descartado' : ''},{},'chartDescartados',function(data){
	    	if(data === 'error'){
				//console.log(data);
				res.jsonp('error');
	    	}else{
				if(data.length > 0){
		    		var count = {};
		    		var answered=0 , spam=0 , insult=0 , troll=0 , related=0 , otro=0 , campaign=0 , mediatico=0;
		    		for(var i = 0; i < data.length; i++){
						switch(data[i].descartado.motivo){
							case 'answered': answered++; break;
							case 'spam': spam++; break;
							case 'insult': insult++; break;
							case 'troll': troll++; break;
							case 'not-related': related++; break;
							case 'otro': otro++; break;
							case 'campaign': campaign++;break;
							case 'other_comments':mediatico++;break; 
							default: console.log('Opcion invalida');
						}
		    		}
		    		var objeto={};
		    		objeto.total=data.length;
		    		objeto.respondidas=answered;
		    		objeto.spam=spam;
		    		objeto.insulto=insult;
		    		objeto.troll=troll;
		    		objeto.irrelevante=related;
		    		objeto.otro=otro;
		    		//if(nombreSistema === 'dish'){
			    		objeto.campaña=campaign;
			    		objeto.mediático = mediatico;
			    	//}
		    		console.log('Finalizo chartDescartados');
		    		res.jsonp(objeto);
				}else{
		    		//console.log('No hay resultados');
		    		res.jsonp('No hubo resultados');
				}
	    	}
		});
    });
};
/*              _        _                _  ______                         _            _           
               | |      | |              | | |  _  \                       | |          | |          
  ___ _ __   __| |   ___| |__   __ _ _ __| |_| | | |___  ___  ___ __ _ _ __| |_ __ _  __| | ___  ___ 
 / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| | | / _ \/ __|/ __/ _` | '__| __/ _` |/ _` |/ _ \/ __|
|  __/ | | | (_| | | (__| | | | (_| | |  | |_| |/ /  __/\__ \ (_| (_| | |  | || (_| | (_| | (_) \__ \
 \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|___/ \___||___/\___\__,_|_|   \__\__,_|\__,_|\___/|___/
*/

/*    _                _  ______                                          _       
     | |              | | |  _  \                                        (_)      
  ___| |__   __ _ _ __| |_| | | |___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___  
 / __| '_ \ / _` | '__| __| | | / _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \ 
| (__| | | | (_| | |  | |_| |/ /  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) |
 \___|_| |_|\__,_|_|   \__|___/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/ 
                                                        | |                       
                                                        |_|
*/
exports.chartDesempenio = function(req, res){
    //función opara obtener la cuenta
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
		    	objetoUsuario.idUsuario = usuarios[index]._id;
				objetoUsuario.username = usuarios[index].username;
		    	objetoUsuario.nombre = usuarios[index].displayName;
		    	objetoUsuario.imagen = usuarios[index].imagen_src;
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

    var nombreSistema=req.body.nombreSistema;
    var fecha_inicial = new Date(req.body.fecha_inicial);
    var fecha_final = new Date(req.body.fecha_final);
    var tipoEntrada=req.body.tipo;

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
								console.log('Finalizo chartDesempenio');
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
};
/*
                _        _                _  ______                                          _       
               | |      | |              | | |  _  \                                        (_)      
  ___ _ __   __| |   ___| |__   __ _ _ __| |_| | | |___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___  
 / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| | | / _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \ 
|  __/ | | | (_| | | (__| | | | (_| | |  | |_| |/ /  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) |
 \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|___/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/ 
                                                                           | |                       
                                                                           |_|                                                                                                                                                                \__|                                        
      _                _  ______                             _ _      ______                                _        
     | |              | | | ___ \                           | (_)     | ___ \                              | |       
  ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | |_/ /___  ___ _ __  _   _  ___  ___| |_ __ _ 
 / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \|    // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
| (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | |\ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
 \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/\_| \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                                     | |                             
                                                                                     |_|                            
*/
exports.chartPromedioRespuesta = function(req, res){
	//var nombreSistema='arabela';
	var nombreSistema=req.body.nombreSistema;
	var tipoEntrada=req.body.tipo;
	
	//función opara obtener la cuenta
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

	function obtieneRespuestas(nombreSistema,idCuenta,callback){
		var criterio = {};
		var sort = {};
		if(tipoEntrada!=='general'){
		   	criterio={$and:[
		   		{'respuestas':{$exists:true}},
		   		{'obj':tipoEntrada},
		   		{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
		   		{'created_time':{$lte:new Date(req.body.fecha_final)}},
		   		{'from_user_id':{$ne : idCuenta}}
		   	]};
		}else{
		    criterio={$and:[
		    	{'respuestas':{$exists:true}},	    	
		    	{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
		    	{'created_time':{$lte:new Date(req.body.fecha_final)}},
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
		obtieneRespuestas(nombreSistema,idCuenta,function(respuestas){
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
						console.log('Finalizo chartPromedioRespuesta');
						res.jsonp(objetoTiempos);
					});
				}else{
					res.jsonp('No hubo resultados');
				}
			}
		});
	});
};
/*
                _        _                _  ______                             _ _      ______                                _        
               | |      | |              | | | ___ \                           | (_)     | ___ \                              | |       
  ___ _ __   __| |   ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | |_/ /___  ___ _ __  _   _  ___  ___| |_ __ _ 
 / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \|    // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
|  __/ | | | (_| | | (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | |\ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
 \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/\_| \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                                                        | |                             
                                                                                                        |_|       
      _                _  ______                             _ _     _____ _                            
     | |              | | | ___ \                           | (_)   |_   _(_)                           
  ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | |  _  ___ _ __ ___  _ __   ___  
 / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| | | |/ _ \ '_ ` _ \| '_ \ / _ \ 
| (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | | | |  __/ | | | | | |_) | (_) |
 \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/\_/ |_|\___|_| |_| |_| .__/ \___/ 
                                                                                           | |          
                                                                                           |_|                                                                                                                                    
*/
exports.chartPromedioTiempo = function(req,res){ 
	//var nombreSistema='arabela';
	var nombreSistema=req.body.nombreSistema;
	var tipoEntrada=req.body.tipo;
	var fecha_inicial = req.body.fecha_inicial;
	var fecha_final = req.body.fecha_final;

	//función opara obtener la cuenta
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

	function obtieneRespuestas(nombreSistema,idCuenta,callback){
		var criterio = {};
		var sort = {};
		if(tipoEntrada!=='general'){
			criterio={
				$and:[
					{'respuestas':{$exists:true}},
					{'obj':tipoEntrada},
					{'created_time':{$gte:new Date(fecha_inicial)}},
					{'created_time':{$lte:new Date(fecha_final)}},
					{'from.id':{$ne : idCuenta}}
				]
			};
		}else{
			criterio={$and:[{'respuestas':{$exists:true}},{'created_time':{$gte:new Date(fecha_inicial)}},{'created_time':{$lte:new Date(fecha_final)}},{'from.id':{$ne : idCuenta}}]};
		}
		//var coleccion = db.collection(nombreSistema+'_consolidada');
		classdb.buscarToArrayFields(nombreSistema+'_consolidada', criterio, {'respuestas' : '', 'created_time': ''} , sort, 'charts/chartPromedioTiempo/obtieneRespuestas', function(respuestas){		    	
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
		if (more <= cuantos) {
			objeto.tiempoLlegada = respuestas[index].created_time;
			setImmediate(function(){
				for(var i=0;i<respuestas[index].respuestas.length;i++){
					objeto.tiempoLlegada = respuestas[index].created_time;
					objeto.tiempoRespuesta = respuestas[index].respuestas[i].timestamp;
					//console.log(respuestas[index].respuestas[i]);
					//arregloRespuestas.push(respuestas[index].respuestas[i].timestamp);
					arregloRespuestas.push(objeto);				
				}
				desglosaRespuestas(respuestas,nombreSistema,more,arregloRespuestas,callback);
			});
		}else{
			return callback(arregloRespuestas);
			//console.log('Termino');
		}
	}

	//Obtenemos la cuenta
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
		obtieneRespuestas(nombreSistema,idCuenta,function(respuestas){
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
					console.log('Finalizo chartPromedioTiempo');
					});
				}else{
					res.jsonp('No hubo resultados');
				}
			}
		});
	});
};
/*
                _        _                _  ______                             _ _     _____ _                            
               | |      | |              | | | ___ \                           | (_)   |_   _(_)                           
  ___ _ __   __| |   ___| |__   __ _ _ __| |_| |_/ / __ ___  _ __ ___   ___  __| |_  ___ | |  _  ___ _ __ ___  _ __   ___  
 / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __|  __/ '__/ _ \| '_ ` _ \ / _ \/ _` | |/ _ \| | | |/ _ \ '_ ` _ \| '_ \ / _ \ 
|  __/ | | | (_| | | (__| | | | (_| | |  | |_| |  | | | (_) | | | | | |  __/ (_| | | (_) | | | |  __/ | | | | | |_) | (_) |
 \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__\_|  |_|  \___/|_| |_| |_|\___|\__,_|_|\___/\_/ |_|\___|_| |_| |_| .__/ \___/ 
                                                                                                              | |          
                                                                                                              |_|          
       _                _   _   _ _           _  _____                 _      _       
      | |              | | | \ | (_)         | |/ ____|               (_)    (_)      
   ___| |__   __ _ _ __| |_|  \| |___   _____| | (___   ___ _ ____   ___  ___ _  ___  
  / __| '_ \ / _` | '__| __| . ` | \ \ / / _ \ |\___ \ / _ \ '__\ \ / / |/ __| |/ _ \ 
 | (__| | | | (_| | |  | |_| |\  | |\ V /  __/ |____) |  __/ |   \ V /| | (__| | (_) |
  \___|_| |_|\__,_|_|   \__|_| \_|_| \_/ \___|_|_____/ \___|_|    \_/ |_|\___|_|\___/ 
                                                                                                                                                                                                                 
*/

exports.chartNivelServicio = function(req,res){
	var fecha1 = new Date(req.body.fecha_inicial);
	var fecha2 = new Date(req.body.fecha_final);
	var nombreSistema=req.body.nombreSistema;
	var tipoEntrada=req.body.tipo;
//	console.log('Entro al chartNivelServicio');
//	console.log(req.body);
	//función opara obtener la cuenta
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

	function obtieneRespuestas(nombreSistema,idCuenta,callback){
		var criterio = {};
		var sort = {};
		if(tipoEntrada!=='general'){
			//console.log('Entro al criterio que no es general');
			criterio={$and:[{'respuestas':{$exists:true}},{'obj':tipoEntrada},{'created_time':{$gte:fecha1}},{'created_time':{$lte:fecha2}},{'from.id':{$ne : idCuenta}},{'eliminado':{$exists: false}}]};
		}else{
			//console.log('Criterio general');
			criterio={$and:[{'respuestas':{$exists:true}},{'created_time':{$gte:fecha1}},{'created_time':{$lte:fecha2}},{'from.id':{$ne : idCuenta}},{'eliminado':{$exists: false}}]};
		}
		//var coleccion = db.collection(nombreSistema+'_consolidada');
		classdb.buscarToArrayFields(nombreSistema+'_consolidada', criterio,{'respuestas' : '', 'created_time' : ''}, sort, 'charts/chartPromedioTiempo/obtieneRespuestas', function(respuestas){		    	
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

	//Obtenemos la cuenta
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
		obtieneRespuestas(nombreSistema,idCuenta,function(respuestas){
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
						console.log('Finalizo chartNivelServicio');
						res.jsonp(objetoTiempos);
					});
				}else{
					res.jsonp('No hubo resultados');
				}
			}
		});
	});
};

/*
                 _        _                _   _   _ _           _  _____                 _      _       
                | |      | |              | | | \ | (_)         | |/ ____|               (_)    (_)      
   ___ _ __   __| |   ___| |__   __ _ _ __| |_|  \| |___   _____| | (___   ___ _ ____   ___  ___ _  ___  
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| . ` | \ \ / / _ \ |\___ \ / _ \ '__\ \ / / |/ __| |/ _ \ 
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |\  | |\ V /  __/ |____) |  __/ |   \ V /| | (__| | (_) |
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_| \_|_| \_/ \___|_|_____/ \___|_|    \_/ |_|\___|_|\___/ 
                                                                                                         
*/


exports.chartDatosCuenta = function(req,res){
	var nombreSistema='arabela';
/*var T  = new Twit({
	        'consumer_key'        : account.datosTwitter.twitter_consumer_key,
	        'consumer_secret'     : account.datosTwitter.twitter_consumer_secret,
	        'access_token'        : account.datosTwitter.twitter_access_token,
	        'access_token_secret' : account.datosTwitter.twitter_access_token_secret
	    });
	
	T.post('statuses/update', {'status': req.body.resp, 'in_reply_to_status_id':req.body.id, 'wrap_links':'true' }, function(err, reply) {
            if(err) return (res.jsonp(err.allErrors[0].code));
            //guardamos la respuesta en mongo	
	    db.open(function(err, db) {
		var id = req.body.id;
		var subtema_nuevo = req.body.subtema.toString();
		var col = db.collection(coleccion);
		if(err === null){
		    col.update({id_str:id},{$set:{clasificacion:{tema:req.body.tema,subtema:req.body.subtema}}},function(err,updated){
		 	col.update({id_str:id},{$addToSet:{respuestas:{usuario:req.body.user,texto:req.body.resp,timestamp:req.body.tiempo,id_str:reply.id_str}}},function(err,updated){
		 	    console.log(updated+' : Agregado  '+err);
		 	});
		    });
		}else{
		    res.jsonp('Error en la conexión: '+err);
		}
	    });
            return true;
	});*/
	function obtieneDatosCuenta(callback){
	    var critere = {'respuestas':{$exists:true}};
	    var elsort = {};
	    
	    classdb.buscarToArray('accounts', critere, elsort, 'charts/chartDatosCuenta/obtieneDatosCuenta', function(respuestas){
		return callback(respuestas);
	    });
	}

	//var nombreSistema=req.body.nombreSistema;
	function obtieneRespuestas(nombreSistema,callback){
	    var critere = {'respuestas':{$exists:true}};
	    var elsort = {};

	    classdb.buscarToArray(nombreSistema+'_consolidada', critere, elsort, 'charts/chartDatosCuenta/obtieneRespuestas', function(respuestas){
		return callback(respuestas);
	    });
	}	
	res.jsonp('chartDatosCuenta');
};

/**
 * Chart authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.chart.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.chartTwit = function(req, res){
	var criterio = {_id: new ObjectID(req.body.id_cuenta)};
	classdb.buscarToStream('accounts', criterio, {},{}, function(cuenta){
		if (cuenta === 'error') {res.jsonp('error');}
		else {
			if(!cuenta[0].datosTwitter){
				console.log('No tiene datosTwitter');
				res.jsonp({error:true});
			}else{
				console.log('Tiene datosTwitter');
				var screen_name = cuenta[0].datosTwitter.twitter_screenname_principal;
				var conexion_propia = false;
				var T ={};
				if(compruebaAccesosTwitter(cuenta[0].datosTwitter)){
					conexion_propia = true;
					T  = new Twit({
						'consumer_key'        : cuenta[0].datosTwitter.twitter_consumer_key,
						'consumer_secret'     : cuenta[0].datosTwitter.twitter_consumer_secret,
						'access_token'        : cuenta[0].datosTwitter.twitter_access_token,
						'access_token_secret' : cuenta[0].datosTwitter.twitter_access_token_secret
					});
				}else{
					T  = new Twit({
						'consumer_key'        : 'lutOodQP4NsPbVSPCn6udwXZi',
				        'consumer_secret'     : 'dtMAXgMFUJZLdyg4UHxDOIe7uE3DAFrxnKHh2YtU24MHfDCwol',
				        'access_token'        : '231684217-C2Au3LKtQSIEdxnQQhGtCEwHTVg1xGFLHOJlPIzD',
				        'access_token_secret' : 'xKSN3zJK0nkDBedifna0cTu0yqYwDAE5srcpKPhKe6Wua'
					});
				}
				console.log('Realizando post');
				T.get('statuses/user_timeline', {'screen_name': screen_name, 'count':50}, function(error_twit, reply) {
					if(error_twit){
						if(conexion_propia){
							var T  = new Twit({
								'consumer_key'        : 'lutOodQP4NsPbVSPCn6udwXZi',
						        'consumer_secret'     : 'dtMAXgMFUJZLdyg4UHxDOIe7uE3DAFrxnKHh2YtU24MHfDCwol',
						        'access_token'        : '231684217-C2Au3LKtQSIEdxnQQhGtCEwHTVg1xGFLHOJlPIzD',
						        'access_token_secret' : 'xKSN3zJK0nkDBedifna0cTu0yqYwDAE5srcpKPhKe6Wua'
							});
							T.get('statuses/user_timeline', {'screen_name': screen_name, 'count':50}, function(error2_twit, reply2) {
								if(error2_twit){
									console.log('Error en el segundo intento');
									res.jsonp(error2_twit);
								}else{
									console.log('Hubo respuesta en el segundo intento de twitter');
									res.jsonp(reply2);
								}
							});
						}else{
							console.log('Error de twitter');
							res.jsonp(error_twit);
						}
					}else{
						console.log('Respuesta de Twitter');
						res.jsonp(reply);	
					}
				});
			}
		}
    });
    function compruebaAccesosTwitter(datos){
    	if(datos.twitter_access_token){
    		if(datos.twitter_access_token_secret){
    			if(datos.twitter_consumer_key){
    				if(datos.twitter_consumer_secret){
    					return true;
    				}else{
    					return false;
    				}
    			}else{
    				return false;
    			}
    		}else{
    			return false;
    		}
    	}else{
    		return false;
    	}
    }
};
exports.getStringTagCloudEspecialTwitter = function(req,res){
    var coleccion = req.query.cuenta;
    var fecha1 = new Date(req.query.fecha);
    var fecha2 = new Date(req.query.fecha2);
    var palabras = [];
    var palabrasTemp = [];	
    var abjeto = {};
	
    /*consulta*/

    function encadenafrases(contenidos, callback) {
	var palabras = [];
	var cuantos = contenidos.length-1;
	// var palabrasTemp = [];
	for (var pal in contenidos) {
	    var frase = '';
	    if (typeof contenidos[pal].message !== 'undefined' && contenidos[pal].message !== '') {
		frase = contenidos[pal].message;
	    }
	    else {
		if (typeof contenidos[pal].text !== 'undefined' && contenidos[pal].message !== '') {
		    frase = contenidos[pal].text;
		}
	    }
	    
	    if(frase !== ''){
		//palabrasTemp = frase.split(' ');
		palabras = palabras.concat(frase.split(' '));
	    }
	    if (Number(pal) === cuantos) {
		return callback(palabras);
	    }
	}	
	
    }

    function clasificapalabras(palabras, callback) {
	var cuantas = palabras.length;
	var numeroCaracteresMinimos = 10;
	var palabrasExcluidas = ['a','que','de','y','te','la','los','el','hola','en','por','nos','mi','sin','Hola','las','con','un','son','si','se','tu','su',
				 'lo','res','?','??','me','...','y','Y','ya','mas','más','sí','es','Si','Te','ok','para','pero','Por','No','1','2','3','4','5',
				 '6','7','8','9','0','o','mar','tus','Son','son','tal','1era','mi','estas?','Buenos','una','Les','les','De','de','como','.|.',
				 ':D',':)','','\n','mucho','script','undefined'];
	var objetoPalabrasTerminos = [];
	var objetoPalabrasHashtag = [];
	var objetoPalabrasMencion = [];
	var objetoPalabras = [];
	var palabraActual = null;
	var contadorPalabras = 0;
	for (var i = 0; i < palabras.length; i++) {

            if (palabras[i] !== palabraActual) {

		if (contadorPalabras > 0) {

                    if((palabrasExcluidas.indexOf(palabraActual) < 0) && (palabraActual.length > numeroCaracteresMinimos)) {

			var palabraProcesada = palabraActual;
			palabraProcesada = palabraProcesada.replace('\n','');
			palabraProcesada = palabraProcesada.replace(':','');
			palabraProcesada = palabraProcesada.replace(',','');
			palabraProcesada = palabraProcesada.replace('!','');
			palabraProcesada= palabraProcesada.replace('-','');
			palabraProcesada = palabraProcesada.replace('<script>','');
			palabraProcesada = palabraProcesada.replace('</script>','');
			if(palabraActual.search('@') === 0){
			    objetoPalabrasMencion.push({'text':palabraProcesada,'weight':contadorPalabras});	
			}else if(palabraActual.search('#') === 0){
			    objetoPalabrasHashtag.push({'text':palabraProcesada,'weight':contadorPalabras});	
			}else{
			    objetoPalabrasTerminos.push({'text':palabraProcesada,'weight':contadorPalabras});	
			}
	
                    }

		}
		palabraActual = palabras[i];
		contadorPalabras = 1;

            } else {
		contadorPalabras++;
            }

	    if (i === cuantas-1) {
		return callback(objetoPalabrasMencion, objetoPalabrasHashtag, objetoPalabrasTerminos);
	    }
	}	
    }

    var criterius = { $and : [{created_time : {$gte: new Date('1-05-2015')}}, {obj:'twitter'}]};
    var elsort = {created_time: -1};
    var campos = {message : 1, text : 1};
    classdb.buscarToArrayFieldsLimit(coleccion, criterius, campos, elsort, 2000, 'charts/getStringTagCloud.main', function(items) {
	if (items === 'error') {
	    res.jsonp(abjeto);
	}
	else {
	    encadenafrases(items, function(palabras){
		palabras.sort();
		clasificapalabras(palabras, function(mentions, hashtags, terms){
		    var objetoPalabras = [];
		    terms.sort(function(a, b){
			return  b.weight - a.weight;
		    });
		    hashtags.sort(function(a, b){
			return  b.weight - a.weight;
		    });
		    mentions.sort(function(a, b){
			return  b.weight - a.weight;
		    });

 		    objetoPalabras.push({'terminos':terms});
 		    objetoPalabras.push({'hashtags':hashtags});
 		    objetoPalabras.push({'menciones':mentions});
		    res.jsonp(objetoPalabras);	
		});
	    });
	}
    });
};

exports.chartSentiment = function(req,res){
console.log('LA INFO');
console.log(req.body);
};


exports.getDescartados = function(req, res){
    var nombreSistema=req.body.nombreSistema;
    var tipoEntrada=req.body.tipo;

    //funciòn opara obtener la cuenta
    function obtieneCuenta(nombreSistema,callback){
		var coleccion = 'accounts';
		var sort = {};
		classdb.buscarToArray(coleccion, {'nombreSistema':nombreSistema}, sort, 'charts/chartDescartados/obtieneCuenta', function(cuenta){		    	
	    	if(cuenta === 'error'){
				return callback('error');
	    	}else{
				return callback(cuenta);
	    	}
		});		
    }

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
	
		var criterio = {};
		if(tipoEntrada==='general'){
	    	criterio = {$and:
				[ 
			    	{'descartado':{$exists:true}},
			    	{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
			    	{'created_time':{$lte:new Date(req.body.fecha_final)}},
			    	{'descartado':{$ne:''}},
			    	{'from.id':{$ne : idCuenta}},
			    	{'eliminado':{$exists: false}}
				]
		    };
		}else{
	    	criterio = {$and:
				[
			    	{'descartado':{$exists:true}},
			    	{'obj':tipoEntrada},
			    	{'created_time':{$gte:new Date(req.body.fecha_inicial)}},
			    	{'created_time':{$lte:new Date(req.body.fecha_final)}},
			    	{'descartado':{$ne:''}},
			    	{'from.id':{$ne : idCuenta}},
			    	{'eliminado':{$exists: false}}
				]
		    };
		}
		classdb.buscarToArrayFields(nombreSistema+'_consolidada',criterio,{},{},'chartDescartados',function(data){
	    	if(data === 'error'){
				//console.log(data);
				res.jsonp('error');
	    	}else{
	    		var arreglo = [];
	    		var objetoDecartados = {};
	    		//console.log(data);
	    		for(var i=0; i<data.length;i++){
	    			objetoDecartados = {};
	    			objetoDecartados.mensaje = data[i].message;
	    			objetoDecartados.usuario = data[i].from_user_name;
	    			objetoDecartados.red = data[i].obj;
	    			objetoDecartados.fechaEntrada = data[i].created_time;
	    			objetoDecartados.fechaDescarte = data[i].descartado.fecha;
	    			objetoDecartados.tipo = data[i].tipo;
					switch(data[i].descartado.motivo){
						case 'answered': 	    			
							objetoDecartados.motivoDescarte = 'Respondido';
 						break;
						case 'spam': 	    			
							objetoDecartados.motivoDescarte = data[i].descartado.motivo;
						break;
						case 'insult': 
			    			objetoDecartados.motivoDescarte = 'Insulto';
						break;
						case 'troll': 
							objetoDecartados.motivoDescarte = data[i].descartado.motivo;
						break;
						case 'not-related': 
							objetoDecartados.motivoDescarte = 'No relacionado';
						break;
						case 'otro':
							objetoDecartados.motivoDescarte = data[i].descartado.motivo;
 						break;
						case 'campaign': 
							objetoDecartados.motivoDescarte = 'Campaña';
						break;
						case 'other_comments':
			    			objetoDecartados.motivoDescarte = 'mediatico';
						break; 
						default: 	    
							objetoDecartados.motivoDescarte = data[i].descartado.motivo;
						}
	    			objetoDecartados.usuarioDescarte = data[i].descartado.usuario;
	    			arreglo.push(objetoDecartados);
	    		}
	    		res.jsonp(arreglo);
	    	}
		});
    });
};
/*
       _                _   _____                                            _       _    _                 
      | |              | | |  __ \                                          (_)     | |  | |                
   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___ | |__| | ___  _ __ __ _ 
  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \|  __  |/ _ \| '__/ _` |
 | (__| | | | (_| | |  | |_| |__| |  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) | |  | | (_) | | | (_| |
  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/|_|  |_|\___/|_|  \__,_|
                                                           | |                                              
                                                           |_|                                              
*/
exports.chartDesempenioHora = function(req, res){
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
			    	{'created_time' : {$gte : fecha_inicial }},
			    	{'created_time' : {$lte : fecha_final }},
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
			        {'obj' : tipo},
			    	{'created_time' : {$lte : fecha_final }},
				    {'from_user_id' : {$ne: idCuenta}},
					{'descartado':{$exists: false}}, 
					{'eliminado':{$exists: false}}, 
					{'atendido':{$exists: true}}, 
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
					{'created_time' : {$gte : fecha_inicial}},
					{'created_time' : {$lte : fecha_final}},
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
    
    function desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, index, objTodos, callback){
		var cuantos = todos.length;
		var more = index+1;
		if (more > cuantos) {
	    	return callback (objTodos);
		}
		else {
			setImmediate(function(){
				var fechaCreated=new Date(todos[index].created_time);
				var horasCreated=fechaCreated.getHours();
				var minutosCreated=fechaCreated.getMinutes();
				var segundosCreated=fechaCreated.getSeconds();

				var horasCreatedConvertidas=horasCreated*3600;
				var minutosCreatedConvertidos=minutosCreated*60;
				var totalSegundosCreated=horasCreatedConvertidas+minutosCreatedConvertidos+segundosCreated;
				
				if(totalSegundosCreated <= 3600){
					//Las cero horas
					objTodos.cero = objTodos.cero + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 3600 && totalSegundosCreated <= 7200){
					//La una de la mañana
					objTodos.una = objTodos.una + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 7200 && totalSegundosCreated <= 10800){
					//Las dos de la mañana
					objTodos.dos = objTodos.dos + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 10800 && totalSegundosCreated <= 14400){
					//Las tres de la mañana
					objTodos.tres = objTodos.tres + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 14400 && totalSegundosCreated <= 18000){
					//Las cuatro de la mañana
					objTodos.cuatro = objTodos.cuatro + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 18000 && totalSegundosCreated <= 21600){
					//Las cinco de la mañana
					objTodos.cinco = objTodos.cinco + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 21600 && totalSegundosCreated <= 25200){
					//Las seis de la mañana
					objTodos.seis = objTodos.seis + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 25200 && totalSegundosCreated <= 28800){
					//Las siete de la mañana
					objTodos.siete = objTodos.siete + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 28800 && totalSegundosCreated <= 32400){
					//Las ocho de la mañana
					objTodos.ocho = objTodos.ocho + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 32400 && totalSegundosCreated <= 36000){
					//Las nueve de la mañana
					objTodos.nueve = objTodos.nueve + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 36000 && totalSegundosCreated <= 39600){
					//Las diez de la mañana
					objTodos.diez = objTodos.diez + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 39600 && totalSegundosCreated <= 43200){
					//Las once de la mañana
					objTodos.once = objTodos.once + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 43200 && totalSegundosCreated <= 46800){
					//Las doce de la mañana
					objTodos.doce = objTodos.doce + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback)
				}else if(totalSegundosCreated > 46800 && totalSegundosCreated <= 50400){
					//La una de la tarde
					objTodos.trece = objTodos.trece + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);		
				}else if(totalSegundosCreated > 50400 && totalSegundosCreated <= 54000){
					//Las dos de la tarde
					objTodos.catorce = objTodos.catorce + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 54000 && totalSegundosCreated <= 57600){
					//Las tres de la tarde
					objTodos.quince = objTodos.quince + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 57600 && totalSegundosCreated <= 61200){
					//Las cuatro de la tarde
					objTodos.dieciseis = objTodos.dieciseis + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 61200 && totalSegundosCreated <= 64800){
					//Las cinco de la tarde
					objTodos.diecisiete = objTodos.diecisiete + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 64800 && totalSegundosCreated <= 68400){
					//Las seis de la tarde
					objTodos.dieciocho = objTodos.dieciocho + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 68400 && totalSegundosCreated <= 72000){
					//Las siete de la noche
					objTodos.diecinueve = objTodos.diecinueve + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 72000 && totalSegundosCreated <= 75600){
					//Las ocho de la noche
					objTodos.veinte = objTodos.veinte + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 75600 && totalSegundosCreated <= 79200){
					//Las nueve de la noche
					objTodos.veintiuno = objTodos.veintiuno + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 79200 && totalSegundosCreated <= 82800){
					//Las diez de la noche
					objTodos.veintidos = objTodos.veintidos + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}else if(totalSegundosCreated > 82800 && totalSegundosCreated <= 86400){
					//Las once de la noche
					objTodos.veintitres = objTodos.veintitres + 1;
					desglosaMensajes(tipo, fecha_inicial, fecha_final, todos, nombreSistema, idCuenta, more, objTodos, callback);
				}
			});
		}
    }

    var nombreSistema=req.body.nombreSistema;
    var fecha_inicial = new Date(req.body.fecha_inicial);
    var fecha_final = new Date(req.body.fecha_final);
    var tipoEntrada=req.body.tipo;
    var arreglo = [];
    var objeto = {};
    //Obtenemos la cuenta
    obtieneCuenta(nombreSistema, function(account){
		var idCuenta = '';
		if(typeof account[0] !== 'undefined' && typeof account[0].datosPage !== 'undefined' && account[0].datosPage !== ''){
	    	idCuenta = account[0].datosPage.id;
		}
		else if(typeof account[0] !== 'undefined' && typeof account[0].datosMonitoreo !== 'undefined'){
	    	idCuenta = account[0].datosMonitoreo.id;
		}
		var objetoAtendidos = {
			'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0,
			'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0,
			'ocho' : 0, 'nueve' : 0, 'diez' : 0, 'once' : 0,
			'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0,
			'dieciseis' : 0, 'diecisiete' : 0, 'dieciocho' : 0, 'diecinueve' : 0,
			'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
		};
		
		var objetoDescartados = {
			'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0,
			'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0,
			'ocho' : 0, 'nueve' : 0, 'diez' : 0, 'once' : 0,
			'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0,
			'dieciseis' : 0, 'diecisiete' : 0, 'dieciocho' : 0, 'diecinueve' : 0,
			'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
		};
		
		var objetoNuevos = {
			'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0,
			'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0,
			'ocho' : 0, 'nueve' : 0, 'diez' : 0, 'once' : 0,
			'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0,
			'dieciseis' : 0, 'diecisiete' : 0, 'dieciocho' : 0, 'diecinueve' : 0,
			'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
		};

		var objetoFacebook = {
			'cero' : 0, 'una' : 0, 'dos' : 0, 'tres' : 0,
			'cuatro' : 0, 'cinco' : 0, 'seis' : 0, 'siete' : 0,
			'ocho' : 0, 'nueve' : 0, 'diez' : 0, 'once' : 0,
			'doce' : 0, 'trece' : 0, 'catorce' : 0, 'quince' : 0,
			'dieciseis' : 0, 'diecisiete' : 0, 'dieciocho' : 0, 'diecinueve' : 0,
			'veinte' : 0, 'veintiuno' : 0, 'veintidos' : 0, 'veintitres' : 0
		};
				
		obtieneAtendidos(tipoEntrada, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(mensajesAtendidos){
			if(mensajesAtendidos === 'error'){
				res.jsonp(mensajesAtendidos);
			}else{
				objeto.totalAtendidos = mensajesAtendidos.length;
		    	desglosaMensajes(tipoEntrada, fecha_inicial, fecha_final, mensajesAtendidos, nombreSistema, idCuenta, 0, objetoAtendidos, function(atendidosActualizados){
		    		if(atendidosActualizados === 'error'){
		    			res.jsonp(atendidosActualizados);
		    		}else{
		    			objeto.atendidos = atendidosActualizados;
						obtieneDescartados(tipoEntrada, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(mensajesDescartados){
							if(mensajesDescartados === 'error'){
								res.jsonp(mensajesDescartados);
							}else{
								objeto.totalDescartados = mensajesDescartados.length;
								desglosaMensajes(tipoEntrada, fecha_inicial, fecha_final, mensajesDescartados, nombreSistema, idCuenta, 0, objetoDescartados, function(descartadosActualizados){
		    						if(descartadosActualizados === 'error'){
		    							res.jsonp(descartadosActualizados);
		    						}else{
		    							objeto.descartados = descartadosActualizados;
										obtieneNuevos(tipoEntrada, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(mensajesNuevos){
											if(mensajesNuevos === 'error'){
												res.jsonp(mensajesNuevos);
											}else{
												objeto.totalNuevos = mensajesNuevos.length;
												desglosaMensajes(tipoEntrada, fecha_inicial, fecha_final, mensajesNuevos, nombreSistema, idCuenta, 0, objetoNuevos, function(nuevosActualizados){
						    						if(nuevosActualizados === 'error'){
						    							res.jsonp(nuevosActualizados);
						    						}else{
						 								objeto.nuevos = nuevosActualizados;
														obtieneFacebook(tipoEntrada, nombreSistema, fecha_inicial, fecha_final, idCuenta, function(mensajesFacebook){
															if(mensajesFacebook === 'error'){
																res.jsonp(mensajesFacebook);
															}else{
																objeto.totalFacebook = mensajesFacebook.length;
																desglosaMensajes(tipoEntrada, fecha_inicial, fecha_final, mensajesFacebook, nombreSistema, idCuenta, 0, objetoFacebook, function(facebookActualizados){
										    						if(facebookActualizados === 'error'){
										    							res.jsonp(facebookActualizados);
										    						}else{
										 								objeto.facebook = facebookActualizados;
								    									objeto.totalCasos = objeto.totalAtendidos + objeto.totalDescartados + objeto.totalNuevos + objeto.totalFacebook;
																		res.jsonp(objeto);
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
    });
};
/*
                 _        _                _   _____                                            _       _    _                 
                | |      | |              | | |  __ \                                          (_)     | |  | |                
   ___ _ __   __| |   ___| |__   __ _ _ __| |_| |  | | ___  ___  ___ _ __ ___  _ __   ___ _ __  _  ___ | |__| | ___  _ __ __ _ 
  / _ \ '_ \ / _` |  / __| '_ \ / _` | '__| __| |  | |/ _ \/ __|/ _ \ '_ ` _ \| '_ \ / _ \ '_ \| |/ _ \|  __  |/ _ \| '__/ _` |
 |  __/ | | | (_| | | (__| | | | (_| | |  | |_| |__| |  __/\__ \  __/ | | | | | |_) |  __/ | | | | (_) | |  | | (_) | | | (_| |
  \___|_| |_|\__,_|  \___|_| |_|\__,_|_|   \__|_____/ \___||___/\___|_| |_| |_| .__/ \___|_| |_|_|\___/|_|  |_|\___/|_|  \__,_|
                                                                              | |                                              
                                                                              |_|                                              
*/
