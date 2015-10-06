'use strict';

//Dependencias que utilizaremos
var _ = require('lodash');
var under = require('underscore');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var mongobase = 'mongodb://localhost:27017/likeable-crm-dev';

var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');

/*     _               _______ _                              
      | |             |__   __| |                             
   ___| | ___  _ __   ___| |  | |__   ___ _ __ ___   ___  ___ 
  / __| |/ _ \| '_ \ / _ \ |  | '_ \ / _ \ '_ ` _ \ / _ \/ __|
 | (__| | (_) | | | |  __/ |  | | | |  __/ | | | | |  __/\__ \
  \___|_|\___/|_| |_|\___|_|  |_| |_|\___|_| |_| |_|\___||___/
*/
exports.cloneThemes = function(req,res){
    console.log('ENTRO A CLONE THEMES');
    var coleccionOrigen = req.query.colOrigen;
    var coleccionDestino = req.query.colDestino;
    
    function getTemas(coleccion,callback){
		classdb.buscarToArray(coleccion, {}, {}, 'themes/cloneThemes/getTemas', function(items){
	    	return callback(items);
		});
    }

    function desglosaTemas(tema,coleccionDestino,index,callback){
		var more = index+1;
		if (more <= tema.length) {
			setImmediate(function(){
		    	insertaTema(tema[index],coleccionDestino,function(respInsercionTema){
					console.log(respInsercionTema);
		    	});		
		    	return desglosaTemas(tema,coleccionDestino,more,callback);
			});
		}else {
	    	return callback('TerminoTemas');
		}
    }

    function insertaTema(tema,coleccion,callback){
		var objeto = {'tema':tema.tema};
		classdb.insertacresult(coleccion, objeto, 'themes/cloneThemes/insertaTema', function(inserted){
	    	if (inserted === 'error') {
				return callback(inserted);
	    	}else {
				if(inserted[0]._id){
		    		desglosaSubtemas(tema.subtemas,coleccion,inserted[0]._id,0,function(respuestaSubtemas){
						console.log(respuestaSubtemas);
		    		});
		    		desglosaRespuestasTema(tema.respuestas,coleccion,0,inserted[0]._id,function(respuestaTema){
						console.log(respuestaTema);
		    		});
				}
				return callback('ok');
	    	}
		});
    }

    function desglosaSubtemas(subtemas,coleccion,idTema,index,callback){
		if(typeof subtemas==='undefined'){
	    	console.log('No tiene Subtemas');
		}else{
	    	var more = index+1;
	    	if (more <= subtemas.length) {
	    		setImmediate(function(){
					insertaSubtema(subtemas[index],coleccion,idTema,function(respInsercionSubtema){
			    		console.log(respInsercionSubtema);
					});		
					return desglosaSubtemas(subtemas,coleccion,idTema,more,callback);
				});
	    	}else {
	    		return callback('TerminoSubtemas');
	    	}
		}
    }

    function insertaSubtema(subtema,coleccion,idPrincipal,callback){
		var id = new ObjectID(idPrincipal);
		var objectId = new ObjectID();
		var criterio = {'_id' : id};
		var eladdtoset = { 'subtemas': { 'idSubtema' : objectId, 'subtema' : subtema.subtema }};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/cloneThemes/insertaSubtema', function(updated){
	    	desglosaResSub(subtema.respuestas,coleccion,idPrincipal,objectId,0,function(respuestaDesg){
				console.log(respuestaDesg);
	    	});
	    	return callback(updated);
		});
    }

    function desglosaResSub(respuestas,coleccion,idTema,idSubtema,index,callback){
		if(typeof respuestas==='undefined'){
	    	console.log('No tiene respuestas de subtema');
		}else{
	    	var more = index+1;
	    	if (more <= respuestas.length) {
	    		setImmediate(function(){
					insertaRespuestaSubtema(respuestas[index],coleccion,idTema,idSubtema,function(respInsercionResSubtema){
			    		console.log(respInsercionResSubtema);
					});		
					return desglosaResSub(respuestas,coleccion,idTema,idSubtema,more,callback);
				});
	    	}else {
	    		return callback('TerminoResSubtemas');
	    	}
		}	
    }
    
    function insertaRespuestaSubtema(respuesta,coleccion,idTema,idSubtema,callback){
		var idTheme = new ObjectID(idTema);
		var idSubtheme = new ObjectID(idSubtema);
		var objectId = new ObjectID();
		var criterio = { '_id':idTheme, subtemas : {$elemMatch:{'idSubtema':idSubtheme}}};
		var eladdtoset = {'subtemas.$.respuestas':{'idRespuesta': objectId,'respuesta':respuesta.respuesta}};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/cloneThemes/insertaRespuestaSubtema', function(updated){
	    	return callback(updated);
		});
    }

    function desglosaRespuestasTema(respuestasTema,coleccion,index,idTema,callback){
		if(typeof respuestasTema==='undefined'){
	    	console.log('No tiene Respuestas de tema');
		}else{
	    	var more = index+1;
	    	if (more <= respuestasTema.length) {
	    		setImmediate(function(){
					insertaRespuestaTema(respuestasTema[index],coleccion,idTema,function(respInsercionResTemas){
			    		console.log(respInsercionResTemas);
					});		
					return desglosaRespuestasTema(respuestasTema,coleccion,idTema,more,callback);
				});
	    	}else {
	    		return callback('TerminoRespuestasTema');
	    	}
		}
    }

    function insertaRespuestaTema(respuestaTema,coleccion,idTema,callback){
		var id = new ObjectID(idTema);
		var objectId = new ObjectID();
		var criterio = {'_id':id};
		var eladdtoset = { 'respuestas' : { 'idRespuesta' : objectId, 'respuesta' : respuestaTema.respuesta }};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/cloneThemes/insertaRespuestaTema', function(updated){
	    	return callback(updated);
		});
    }
    
    if (coleccionOrigen === '' || coleccionDestino === '') { 
		res.jsonp('ERROR: Alguna coleccion no existe');
    }else{
		getTemas(coleccionOrigen,function(tema){
	    	if(tema !== 'error' && tema.length > 0){
				desglosaTemas(tema,coleccionDestino,0,function(respDesgloseTemas){
		    		console.log(respDesgloseTemas);
				});
	    	}else{
				console.log('No tiene tema');
	    	}
	    	//console.log(tema);
		});
		res.jsonp('Ok');
    }
};
/*               _        _               _______ _                              
                | |      | |             |__   __| |                             
   ___ _ __   __| |   ___| | ___  _ __   ___| |  | |__   ___ _ __ ___   ___  ___ 
  / _ \ '_ \ / _` |  / __| |/ _ \| '_ \ / _ \ |  | '_ \ / _ \ '_ ` _ \ / _ \/ __|
 |  __/ | | | (_| | | (__| | (_) | | | |  __/ |  | | | |  __/ | | | | |  __/\__ \
  \___|_| |_|\__,_|  \___|_|\___/|_| |_|\___|_|  |_| |_|\___|_| |_| |_|\___||___/
*/

/*           _ _______                   _____            _        _ _       
            | |__   __|                 |  __ \          | |      | | |      
   __ _  ___| |_ | | ___ _ __ ___   __ _| |__) |_ _ _ __ | |_ __ _| | | __ _ 
  / _` |/ _ \ __|| |/ _ \ '_ ` _ \ / _` |  ___/ _` | '_ \| __/ _` | | |/ _` |
 | (_| |  __/ |_ | |  __/ | | | | | (_| | |  | (_| | | | | || (_| | | | (_| |
  \__, |\___|\__||_|\___|_| |_| |_|\__,_|_|   \__,_|_| |_|\__\__,_|_|_|\__,_|
   __/ |                                                                     
  |___/                                                                      
*/
exports.getTemasPantalla = function(req,res){
    var cuenta=req.body.cuenta;
    classdb.buscarToArray('temas_'+cuenta, {}, {'tema':1}, 'themes/getTemasPantalla/', function(items){
	    if(items==='error'){
	    	console.log('error');
	    }
	    else{
	        var temas = [];
		    for(var i = 0; i < items.length; i++){
		    	temas[i] = items[i];
		    }
		    var byName = temas.slice(0);
			byName.sort(function(a,b) {
    			var x = a.tema.toLowerCase();
    			var y = b.tema.toLowerCase();
    			return x < y ? -1 : x > y ? 1 : 0;
			});
		    res.jsonp(byName);
		}
    });
};
/*               _              _ _______                   _____            _        _ _       
                | |            | |__   __|                 |  __ \          | |      | | |      
   ___ _ __   __| |   __ _  ___| |_ | | ___ _ __ ___   __ _| |__) |_ _ _ __ | |_ __ _| | | __ _ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __|| |/ _ \ '_ ` _ \ / _` |  ___/ _` | '_ \| __/ _` | | |/ _` |
 |  __/ | | | (_| | | (_| |  __/ |_ | |  __/ | | | | | (_| | |  | (_| | | | | || (_| | | | (_| |
  \___|_| |_|\__,_|  \__, |\___|\__||_|\___|_| |_| |_|\__,_|_|   \__,_|_| |_|\__\__,_|_|_|\__,_|
                      __/ |                                                                     
                     |___/                                                                      
             _    _____       _     _                       _____            _        _ _       
            | |  / ____|     | |   | |                     |  __ \          | |      | | |      
   __ _  ___| |_| (___  _   _| |__ | |_ ___ _ __ ___   __ _| |__) |_ _ _ __ | |_ __ _| | | __ _ 
  / _` |/ _ \ __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |  ___/ _` | '_ \| __/ _` | | |/ _` |
 | (_| |  __/ |_ ____) | |_| | |_) | ||  __/ | | | | | (_| | |  | (_| | | | | || (_| | | | (_| |
  \__, |\___|\__|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|_|   \__,_|_| |_|\__\__,_|_|_|\__,_|
   __/ |                                                                                        
  |___/                                                                                         
*/
exports.getSubtemasPantalla = function(req,res){
    var cuenta=req.body.cuenta;
    var tema=req.body.tema;
	classdb.buscarToArray('temas_'+cuenta, {'tema':tema}, {}, 'themes/getSubtemasPantalla/', function(themes){
	    if(themes==='error'){
	    	console.log('error');
	    }
	    else{
		   if(typeof themes[0].subtemas==='undefined'){
		   		themes[0].subtemas=[];
		   }
			var byName = themes[0].subtemas.slice(0);
			byName.sort(function(a,b) {
    			var x = a.subtema.toLowerCase();
    			var y = b.subtema.toLowerCase();
    			return x < y ? -1 : x > y ? 1 : 0;
			});    
		    res.jsonp(byName);
		}
    });
};
/*               _              _    _____       _     _                       _____            _        _ _       
                | |            | |  / ____|     | |   | |                     |  __ \          | |      | | |      
   ___ _ __   __| |   __ _  ___| |_| (___  _   _| |__ | |_ ___ _ __ ___   __ _| |__) |_ _ _ __ | |_ __ _| | | __ _ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |  ___/ _` | '_ \| __/ _` | | |/ _` |
 |  __/ | | | (_| | | (_| |  __/ |_ ____) | |_| | |_) | ||  __/ | | | | | (_| | |  | (_| | | | | || (_| | | | (_| |
  \___|_| |_|\__,_|  \__, |\___|\__|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|_|   \__,_|_| |_|\__\__,_|_|_|\__,_|
                      __/ |                                                                                        
                     |___/                                                                                         
            _ _      _ _        _____                                 _         _______                   
           | (_)    (_) |      |  __ \                               | |       |__   __|                  
  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| | ___ _ __ ___   __ _ 
 / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __| |/ _ \ '_ ` _ \ / _` |
 \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \ |  __/ | | | | | (_| |
 |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_|\___|_| |_| |_|\__,_|
                                               | |                                                        
                                               |_|                                                        
*/
exports.solicitaRespuestasTema = function(req,res){
    var tema=req.body.temaActual;
    var cuenta = req.body.cuenta; 
	classdb.buscarToArray('temas_'+cuenta, {'tema':tema}, {}, 'themes/getSubtemasPantalla/', function(items){
	    if(items==='error'){
	    	console.log('error');
	    }else{	
		    var tieneRespuestas=items[0].hasOwnProperty('respuestas');
		    if(tieneRespuestas===false){
		    	var arregloVacio=[];
		    	res.jsonp(arregloVacio);
		    }else{
		    	res.jsonp(items[0].respuestas);
		    }
	    }
	});
};
/*               _             _ _      _ _        _____                                 _         _______                   
                | |           | (_)    (_) |      |  __ \                               | |       |__   __|                  
   ___ _ __   __| |  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` | / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __| |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \ |  __/ | | | | | (_| |
  \___|_| |_|\__,_| |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_|\___|_| |_| |_|\__,_|
                                                                  | |                                                        
                                                                  |_|                                                        
*/

/*          _ _      _ _        _____                                 _             _____       _     _                       
           | (_)    (_) |      |  __ \                               | |           / ____|     | |   | |                      
  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
 / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \____) | |_| | |_) | ||  __/ | | | | | (_| |
 |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                                               | |                                                                            
                                               |_|                                                                            
*/
exports.solicitaRespuestasSubtema = function(req,res){
    var tema=req.body.temaActual;
    var subtema=req.body.subtemaActual;
    var cuenta = req.body.cuenta;
    var coleccion = 'temas_'+cuenta;
    var criterio = { tema: tema };

    classdb.buscarToArray(coleccion, criterio, {}, 'themes/solicitaRespuestaSubtema', function(items) {
		if (items === 'error') {
	    	res.jsonp(items);
		}else {
        	var arregloSubtemas=[];
	    	if (typeof items[0] !== 'undefined' && typeof items[0].subtemas !== 'undefined') {
				for(var i=0;i<items[0].subtemas.length;i++){
		    		if(subtema===items[0].subtemas[i].subtema){
						arregloSubtemas.push(items[0].subtemas[i].respuestas);
		    		}
				}
	    	}
	    	//console.log(arregloSubtemas[0]);
	    	res.jsonp(arregloSubtemas[0]);
		}
    });
};
/*               _             _ _      _ _        _____                                 _             _____       _     _                       
                | |           | (_)    (_) |      |  __ \                               | |           / ____|     | |   | |                      
   ___ _ __   __| |  ___  ___ | |_  ___ _| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` | / __|/ _ \| | |/ __| | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | \__ \ (_) | | | (__| | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_| |___/\___/|_|_|\___|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                                                                  | |                                                                            
                                                                  |_|                                                                            
*/

/*_                     _        _____                                 _        
 (_)                   | |      |  __ \                               | |       
  _ _ __  ___  ___ _ __| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
 | | '_ \/ __|/ _ \ '__| __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 | | | | \__ \  __/ |  | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
 |_|_| |_|___/\___|_|   \__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                | |                             
                                                |_|                             
*/
exports.insertaRespuesta = function(req,res){
    var temaDefault='Null';
    var subtemaDefault='Null';
    var temaActual=req.body.tema;
    var subtemaActual=req.body.subtema;
    var respuesta=req.body.respuesta;
    var cuenta = req.body.cuenta;
    var collection = 'temas_'+cuenta;
    var objectId = new ObjectID();
    
    function encuentraTema(coleccion, tema, callback) {
		var criterio = {tema: tema};
		classdb.buscarToArray(coleccion, criterio, {}, 'themes/insertaRespuesta/encuentraTema', function(items){
	    	return callback(items);
		});
    }

    function updateRespuestaTema(coleccion, tema, idRespuesta, respuesta, callback) {
		var criterio = {tema: tema};
		var eladdtoset = {'respuestas':{'idRespuesta': idRespuesta,'respuesta':respuesta}};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/insertaRespuesta/updateRespuestaTema', function(respuesta){
	    	callback(respuesta);
		});
    }

    function updateRespuestaTemaSubtema(coleccion, tema, subtema, idRespuesta, respuesta, callback) {
		var criterio = {'tema':tema, subtemas:{$elemMatch:{'subtema':subtema}}};
		var eladdtoset = {'subtemas.$.respuestas':{'idRespuesta': idRespuesta,'respuesta':respuesta}};
		classdb.actualizaAddToSet(coleccion, criterio, eladdtoset, 'themes/insertaRespuesta/updateREspuestaTemaSubtema', function(antwort){
	    	callback(antwort);
		});
    }

    if (temaActual !== temaDefault && subtemaActual === subtemaDefault) {
		// insertamos respuesta solo para el tema
		encuentraTema(collection, temaActual, function(tema) {
	    	if (tema === 'error') {
				res.jsonp(4);
	    	}else {
				if (typeof tema[0].respuestas === 'undefined') {
		    		// tema no tiene respuestas???
		    		updateRespuestaTema(collection, temaActual, objectId, respuesta, function(updated) {
						if (updated === 'error') {
			    			// error al updatear
			    			res.jsonp(3);
						}else {
			    			// respuesta insertada
			    			encuentraTema(collection, temaActual, function(theme){
								if (theme === 'error') {
				    				// se insertó pero luego no pudimos obtener el objeto actualizado
				    				res.jsonp(0);
								}else {
				    				// objeto actualizado
				    				res.jsonp(theme);
								}
			    			}); 
						}
		    		});		    
				}else {
		    		// tema sí tiene respuestas
		    		var indexRespuesta = _.findIndex(tema[0].respuestas, function(chr) {
						return chr.respuesta === respuesta;
		    		});
		    		if (indexRespuesta === -1) {
						// no existia respuesta, insertamos
						updateRespuestaTema(collection, temaActual, objectId, respuesta, function(updated) {
			    			if (updated === 'error') {
								// error al updatear
								res.jsonp(3);
			    			}else {
								// respuesta insertada
								encuentraTema(collection, temaActual, function(theme){
				    				if (theme === 'error') {
										// se insertó pero luego no pudimos obtener el objeto actualizado
										res.jsonp(0);
				    				}else {
										// objeto actualizado
										res.jsonp(theme);
				    				}
								}); 
			    			}
						});
		    		}else {
						// respuesta ya existe
						res.jsonp(1);
		    		}
				}
	    	}
		});
    }else if (temaActual !== temaDefault && subtemaActual !== subtemaDefault) {
		// insertamos respuesta en subtema
		encuentraTema(collection, temaActual, function(tema){
	    	if (tema === 'error') {
				console.log('Error, no pudimos obtener el tema en mongo');
				res.jsonp(4);
	    	}else {
				if (tema[0].subtemas === 'undefined') {
		    		// este tema no tiene subtemas ???
		    		res.jsonp(5);
				}else {
		    		// si hay subtemas
		    		var indexSubtema = _.findIndex(tema[0].subtemas, function(chr) {
						return chr.subtema === subtemaActual;
		    		});		    	
		    		if (indexSubtema === -1) {
						// este subtema no existe ???
						res.jsonp(5);
		    		}else {
						// el subtema existe y tenemos subíndice
						if (typeof tema[0].subtemas[indexSubtema].respuestas === 'undefined') {
			    			// el subtema no tiene respuestas
			    			updateRespuestaTemaSubtema(collection, temaActual, subtemaActual, objectId, respuesta, function(updateds){
								if (updateds === 'error') {
				    				// error al updatear
				    				res.jsonp(3);
								}else {
				    				// respuesta insertada
				    				encuentraTema(collection, temaActual, function(theme){
										if (theme === 'error') {
					    					// se insertó pero luego no pudimos obtener el objeto actualizado
					    					res.jsonp(0);
										}else {
					    					// objeto actualizado
					    					res.jsonp(theme);
										}
				    				}); 
								}
			    			}); 
						}else {
			    			// el subtema tiene respuestas
			    			var indexRespuestaSubtema = _.findIndex(tema[0].subtemas[indexSubtema].respuestas, function(chr) {
								return chr.respuesta === respuesta;
			    			});
			    			if (indexRespuestaSubtema === -1) {
								// no existia respuesta, insertamos
								updateRespuestaTemaSubtema(collection, temaActual, subtemaActual, objectId, respuesta, function(updateds){
				    				if (updateds === 'error') {
										// error al updatear
										res.jsonp(3);
				    				}else {
										// respuesta insertada
										encuentraTema(collection, temaActual, function(theme){
					    					if (theme === 'error') {
												// se insertó pero luego no pudimos obtener el objeto actualizado
												res.jsonp(0);
					    					}else {
												// objeto actualizado
												res.jsonp(theme);
					    					}
										}); 
				    				}
								}); 				
			    			}else {
								// respuesta ya existe
								res.jsonp(1);
			    			}
						}
		    		}
				}
	    	}	    
		});
    }else {
		// no hay tema, no hacemos nada
		res.jsonp(2);
    }
};
/*               _   _                     _        _____                                 _        
                | | (_)                   | |      |  __ \                               | |       
   ___ _ __   __| |  _ _ __  ___  ___ _ __| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / _ \ '_ \ / _` | | | '_ \/ __|/ _ \ '__| __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 |  __/ | | | (_| | | | | | \__ \  __/ |  | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|_| |_|\__,_| |_|_| |_|___/\___|_|   \__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                                   | |                             
                                                                   |_|                             
*/

/*                 _______                   
                  |__   __|                  
   ___ _ __ ___  __ _| | ___ _ __ ___   __ _ 
  / __| '__/ _ \/ _` | |/ _ \ '_ ` _ \ / _` |
 | (__| | |  __/ (_| | |  __/ | | | | | (_| |
  \___|_|  \___|\__,_|_|\___|_| |_| |_|\__,_|
*/
exports.creaTema = function(req, res){	
    var cuenta = req.body.cuenta;
    var eltema = req.body.tema;
    var collection = 'temas_'+cuenta;
    var criteriof = {tema: eltema};
    
    classdb.buscarToArray(collection, criteriof, {}, 'themes/creaTema', function(items){
		if (items === 'error') {
	    	res.jsonp(2);
		}else {
	    	if (items.length !== 0) {
				res.jsonp(3);
	    	}else {
				classdb.inserta(collection, criteriof, 'themes/creaTema', function(resp){
		    		if (resp === 'error') {
						res.jsonp(4);
		    		}else {
						classdb.buscarToArray(collection, {}, {}, 'themes/creaTema', function(data) {
			    			res.jsonp(data);
						});
		    		}
				});
	    	}
		}
    });
};
/*               _                    _______                   
                | |                  |__   __|                  
   ___ _ __   __| |   ___ _ __ ___  __ _| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / __| '__/ _ \/ _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | | (__| | |  __/ (_| | |  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|_|  \___|\__,_|_|\___|_| |_| |_|\__,_|
*/

/*                                  _____       _     _                       
                                   / ____|     | |   | |                      
   __ _  __ _ _ __ ___  __ _  __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _` |/ _` | '__/ _ \/ _` |/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 | (_| | (_| | | |  __/ (_| | (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \__,_|\__, |_|  \___|\__, |\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
         __/ |          __/ |                                                 
        |___/          |___/                                                  
*/
exports.agregaSubtema = function(req,res){
    var cuenta = req.body.cuenta;
    var tema=req.body.tema;
    var subtema=req.body.subtema_nuevo;
    var objectId = new ObjectID();
    var collection = 'temas_'+cuenta;
    var criteriof = {'tema': tema};
    var sortf = {tema: 1};
    classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(items){
		if (items === 'error') {
	    	res.jsonp(3);
		}else {
	    	var arregloSubtemas=[];
            var existeSubtema=0;
            var tieneSubtemas=items[0].hasOwnProperty('subtemas');
            if(tieneSubtemas===true) {
				for(var i=0;i<items[0].subtemas.length;i++){
		    		arregloSubtemas.push(items[0].subtemas[i]);
		    		if(items[0].subtemas[i].subtema===subtema){
						existeSubtema++;
		    		}
				}
				if(existeSubtema !== 0){
		    		console.log('El subtema ya existe, escriba otro');
		    		res.jsonp(2);
				}else{
		    		var eladdtoset = {'subtemas':{'idSubtema': objectId,subtema:subtema}};
		    		classdb.actualizaAddToSet(collection, criteriof, eladdtoset, 'themes/agregaSubtema', function(updated){
						if (updated === 'error') {
			    			res.jsonp(3);
						}else {
			    			classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(themes) {
								if (themes === 'error') {
				    				res.jsonp(3);
								}else {
				    				res.jsonp(themes[0].subtemas);
								}
			    			});
						}
		    		});
				}
	    	}else {
				var deraddtoset = {'subtemas' : {'idSubtema' : objectId, subtema : subtema}};
				classdb.actualizaAddToSet(collection, criteriof, deraddtoset, 'themes/agreagaSubtema', function(actualizao){
		    		if (actualizao === 'error') {
						res.jsonp(3);
		    		}else {
						classdb.buscarToArray(collection, criteriof, sortf, 'themes/agregaSubtema', function(themes){
			    			if (themes === 'error') {
								res.jsonp(3);
			    			}else {
								res.jsonp(themes[0].subtemas);
			    			}
						});
		    		}
				});
	    	}
		}
    });
};
/*               _                                     _____       _     _                       
                | |                                   / ____|     | |   | |                      
   ___ _ __   __| |   __ _  __ _ _ __ ___  __ _  __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / _` |/ _` | '__/ _ \/ _` |/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | | (_| | (_| | | |  __/ (_| | (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \__,_|\__, |_|  \___|\__, |\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                            __/ |          __/ |                                                 
                           |___/          |___/                                                  
*/

/*         _ _ _     _______                   
          | (_) |   |__   __|                  
   ___  __| |_| |_ __ _| | ___ _ __ ___   __ _ 
  / _ \/ _` | | __/ _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ (_| | | || (_| | |  __/ | | | | | (_| |
  \___|\__,_|_|\__\__,_|_|\___|_| |_| |_|\__,_|
*/
exports.editaTema = function(req, res) {
    var tema=req.body.tema;
    var actualizacion=req.body.edicion;
    var cuenta = req.body.cuenta;
    var collection = 'temas_'+cuenta;
    var sortf = {tema: 1};
    classdb.buscarToArray(collection, {}, sortf, 'themes/editaTema', function(items){
		if (items === 'error') {
	    	res.jsonp(1);
		}else {
	    	var arregloTemas=[];
            var existeTema=0;
            //Ciclo para llenar el arreglo de temas
	    	for(var i=0;i<items.length;i++){
				arregloTemas.push(items[i].tema);
				if(items[i].tema===actualizacion){
		    		existeTema++;
				}
	    	}
	    	if(existeTema!==0){
				res.jsonp(2);
	    	}else {
				var criterio = {'tema':tema};
				var elset = {'tema':actualizacion};
				classdb.actualiza(collection, criterio, elset, 'themes/editaTema', function(updated){
		    		if (updated === 'error') {
						res.jsonp(3);
		    		}else{
						classdb.buscarToArray(collection, {}, sortf, '', function(themes){
			    			if (themes === 'error'){
								res.jsonp(3);
			    			}else {
								res.jsonp(themes);
			    			}
						});
		    		}
				});
	    	}
		}
    });
};
/*               _            _ _ _     _______                   
                | |          | (_) |   |__   __|                  
   ___ _ __   __| |   ___  __| |_| |_ __ _| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / _ \/ _` | | __/ _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | |  __/ (_| | | || (_| | |  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|\__,_|_|\__\__,_|_|\___|_| |_| |_|\__,_|

           _ _ _         _____       _     _                       
          | (_) |       / ____|     | |   | |                      
   ___  __| |_| |_ __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \/ _` | | __/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ (_| | | || (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|\__,_|_|\__\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
                                                                   
*/
exports.editaSubtema = function(req, res) {
    var tema=req.body.tema;
    var actualizacion=req.body.edicion;
    var cuenta = req.body.cuenta;
    var identificadorTema=req.body.idTema;
    var identificadorSubtema=req.body.idSubtema;
    var collection = 'temas_'+cuenta;
    var sortf = {tema: 1};
    classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaSubtema', function(items){
    	if(items==='error'){
    		res.jsonp(3);
    	}else{
        	var arregloSubtemas=[];
        	var existeSubtema=0;
        	//Ciclo para llenar el arreglo de temas
			for(var i=0;i<items[0].subtemas.length;i++){
		    	arregloSubtemas.push(items[0].subtemas[i]);
		    	if(items[0].subtemas[i].subtema===actualizacion){
					existeSubtema++;
		    	}
			}
			if(existeSubtema!==0){
		    	var caso=2;
		    	console.log('El subtema ya existe, escriba otro');
		    	res.jsonp(caso);
			}
			else{
				var criterio = {'tema':tema,'subtemas':{$elemMatch:{'idSubtema': new ObjectID(identificadorSubtema)}}};
				var elset = {'subtemas.$.subtema':actualizacion};
				classdb.actualiza(collection, criterio, elset, 'themes/editaSubtema/', function(updated){
					if(updated==='error'){
						res.jsonp(3);
					}
					else{
    					classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaSubtema', function(themes){
    						if(themes==='error'){
    							res.jsonp(3);
    						}
    						else{
								res.jsonp(themes[0].subtemas);
							}
			    		});
					}
		    	});
			}
		}				
    });
};
/*
                 _            _ _ _         _____       _     _                       
                | |          | (_) |       / ____|     | |   | |                      
   ___ _ __   __| |   ___  __| |_| |_ __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / _ \/ _` | | __/ _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | |  __/ (_| | | || (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|\__,_|_|\__\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|

           _ _ _        _____                                 _        
          | (_) |      |  __ \                               | |       
   ___  __| |_| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / _ \/ _` | | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 |  __/ (_| | | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|\__,_|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                       | |                             
                                       |_|                                                                                                                   
*/

exports.editaRespuesta = function(req, res) {
    var tema=req.body.tema;
    var subtema=req.body.subtema;
    var actualizacion=req.body.edicion;
    var cuenta = req.body.cuenta;
    var idRespuesta=req.body.idRespuesta;
    var identificadorSubtema=req.body.idSubtema;
   	var collection = 'temas_'+cuenta;
   	var sortf = {tema: 1};
    if(tema.length!==0 && subtema.length===0){
    	classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaRespuesta', function(items){
    		if(items==='error'){
    			res.jsonp(3);
    		}else{
           		var arregloRespuestas=[];
            	var existeRespuesta=0;
            	//Ciclo para llenar el arreglo de temas
		    	for(var i=0;i<items[0].respuestas.length;i++){
					console.log(items[0].respuestas[i]);
					arregloRespuestas.push(items[0].respuestas[i]);
					if(items[0].respuestas[i].respuesta===actualizacion){
			    		existeRespuesta++;
					}
		    	}
		    	if(existeRespuesta!==0){
					var caso=2;
					console.log('La respuesta ya existe, escriba otra');
					res.jsonp(caso);
		    	}
		    	else{
					var criterio = {'tema':tema,'respuestas':{$elemMatch:{'idRespuesta': new ObjectID(idRespuesta)}}};
					var elset = {'respuestas.$.respuesta':actualizacion};
					classdb.actualiza(collection, criterio, elset, 'themes/editaRespuesta/', function(updated){
						if(updated==='error'){
							res.jsonp(3);
						}else{
    						classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaSubtema', function(themes){
    							if(themes==='error'){
    								res.jsonp(3);
    							}
    							else{
									res.jsonp(themes[0].respuestas);
								}
			    			});
			    		}
					});
		    	}	
		    }		
		});
    }else if(tema.length!==0 && subtema.length!==0){
    	classdb.buscarToArray(collection, {'tema':tema,'subtemas.subtema':subtema}, sortf, 'themes/editaRespuesta', function(items){
        	if(items==='error'){
        		res.jsonp(3);
        	}else{
           	    var cajon='';
           	    var arregloRespuestas=[];
            	var existeRespuesta=0;
            	var tieneSubRes='';
            	console.log(items);
            	for(var r=0;r<items[0].subtemas.length;r++){
		    		if(items[0].subtemas[r].subtema===subtema){
						tieneSubRes=items[0].subtemas[r].hasOwnProperty('respuestas');
		    		}
            	}
            	if(tieneSubRes===true){
            	    //Ciclo para llenar el arreglo de temas
		    		for(var i=0;i<items[0].subtemas.length;i++){
						if(items[0].subtemas[i].subtema===subtema){
			    			for(var j=0;j<items[0].subtemas[i].respuestas.length;j++){
								if(items[0].subtemas[i].respuestas[j].idRespuesta.toString()===idRespuesta.toString()){
				    				cajon=j;
								}
								arregloRespuestas.push(items[0].subtemas[i].respuestas[j].idRespuesta);
								if(items[0].subtemas[i].respuestas[j].respuesta===actualizacion){
				    				existeRespuesta++;
								}
			    			}
						}
		    		}
		    		if(existeRespuesta!==0){
						var caso=2;
						console.log('La respuesta ya existe, escriba otra');
						res.jsonp(caso);
		    		}else{				
						var larespuesta = 'subtemas.$.respuestas.'+cajon+'.respuesta';
						var objetowhere = {};
						objetowhere[larespuesta] = actualizacion;
						var criterio = {'tema':tema, 'subtemas':{$elemMatch:{'subtema':subtema}}};
						var elset = objetowhere;
						classdb.actualiza(collection, criterio, elset, 'themes/editaRespuesta/', function(updated){
			    			if(updated==='error'){
								res.jsonp(3);
			    			}else{
								classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaRespuesta', function(themes){
    				    			if(themes==='error'){
    									res.jsonp(3);
    				    			}else{
										var arregloSubtemas=[];
										for(var i=0;i<themes[0].subtemas.length;i++){
					    					if(subtema===themes[0].subtemas[i].subtema){
												arregloSubtemas.push(themes[0].subtemas[i].respuestas);
					    					}
										}
										res.jsonp(arregloSubtemas[0]);									
				    				}
			    				});
			    			}
						});
		    		}
				}else{
					console.log('Se ha seleccionado una excepcion');
					for(var c=0;c<items[0].respuestas.length;c++){
			    		console.log(items[0].respuestas[c]);
			    		arregloRespuestas.push(items[0].respuestas[c]);
			    		if(items[0].respuestas[c].respuesta===actualizacion){
							existeRespuesta++;
			    		}
					}
					if(existeRespuesta!==0){
			    		var cas=2;
			    		console.log('La respuesta ya existe, escriba otra');
			    		res.jsonp(cas);
					}else{
						var criterioRes = {'tema':tema,'respuestas':{$elemMatch:{'idRespuesta': new ObjectID(idRespuesta)}}};
						var elsetRes = {'respuestas.$.respuesta':actualizacion};
						classdb.actualiza(collection, criterioRes, elsetRes, 'themes/editaRespuesta/', function(actualizacion){
							if(actualizacion==='error'){
								res.jsonp(3);
							}else{
				    			classdb.buscarToArray(collection, {'tema':tema}, sortf, 'themes/editaRespuesta', function(themesRes){
									if(themesRes==='error'){
										res.jsonp(3);
									}else{
										res.jsonp(themesRes[0].respuestas);
									}
				    			});
							}	
			    		});
					}	
		    	}				
			}
		});
    }
};
/*
                 _            _ _ _        _____                                 _        
                | |          | (_) |      |  __ \                               | |       
   ___ _ __   __| |   ___  __| |_| |_ __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ 
  / _ \ '_ \ / _` |  / _ \/ _` | | __/ _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` |
 |  __/ | | | (_| | |  __/ (_| | | || (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| |
  \___|_| |_|\__,_|  \___|\__,_|_|\__\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|
                                                          | |                             
                                                          |_|                             
*/

/*     _ _           _          _______                   
      | (_)         (_)        |__   __|                  
   ___| |_ _ __ ___  _ _ __   __ _| | ___ _ __ ___   __ _ 
  / _ \ | | '_ ` _ \| | '_ \ / _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | | | | | | | | | (_| | |  __/ | | | | | (_| |
  \___|_|_|_| |_| |_|_|_| |_|\__,_|_|\___|_| |_| |_|\__,_|
*/
exports.eliminaTema=function(req,res){
    var tema=req.body.tema;
    var cuenta=req.body.cuenta;
   	var collection = 'temas_'+cuenta;
   	var sort = {tema: 1};
	classdb.remove(collection, {'tema':tema}, 'themes/eliminaTema', function(resultado){    
    	if(resultado==='error'){
        	res.jsonp(3);
        }else{
			classdb.buscarToArray(collection, {}, sort, 'themes/editaRespuesta', function(themes){
				if(themes==='error'){
					res.jsonp(3);
				}else{
			    	res.jsonp(themes);
				}
		    });
        }
	});
};
/*               _        _ _           _          _______                   
                | |      | (_)         (_)        |__   __|                  
   ___ _ __   __| |   ___| |_ _ __ ___  _ _ __   __ _| | ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / _ \ | | '_ ` _ \| | '_ \ / _` | |/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | |  __/ | | | | | | | | | | | (_| | |  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|_|_|_| |_| |_|_|_| |_|\__,_|_|\___|_| |_| |_|\__,_|

       _ _           _              _____       _     _                       
      | (_)         (_)            / ____|     | |   | |                      
   ___| |_ _ __ ___  _ _ __   __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ | | '_ ` _ \| | '_ \ / _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | | | | | | | | | (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_|_|_| |_| |_|_|_| |_|\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
*/
exports.eliminaSubtema=function(req,res){
    var tema=req.body.tema;
    var cuenta=req.body.cuenta;
    var subtema=req.body.subtema;
	var collection = 'temas_'+cuenta;
	var sort={'tema':1};
 	var criterio = {'tema':tema};
	var pull = {'subtemas':{'subtema':subtema}};
	classdb.actualizaPull(collection, criterio, pull, 'themes/eliminaSubtema/', function(themesRes){
		if(themesRes==='error'){
			res.jsonp(3);
		}else{
			classdb.buscarToArray(collection, {'tema':tema}, sort, 'themes/eliminaSubtema', function(themes){
				if(themes==='error'){
					res.jsonp(3);
				}else{
			    	res.jsonp(themes[0].subtemas);
				}
			});		
		}
	});
};
/*               _        _ _           _              _____       _     _                       
                | |      | (_)         (_)            / ____|     | |   | |                      
   ___ _ __   __| |   ___| |_ _ __ ___  _ _ __   __ _| (___  _   _| |__ | |_ ___ _ __ ___   __ _ 
  / _ \ '_ \ / _` |  / _ \ | | '_ ` _ \| | '_ \ / _` |\___ \| | | | '_ \| __/ _ \ '_ ` _ \ / _` |
 |  __/ | | | (_| | |  __/ | | | | | | | | | | | (_| |____) | |_| | |_) | ||  __/ | | | | | (_| |
  \___|_| |_|\__,_|  \___|_|_|_| |_| |_|_|_| |_|\__,_|_____/ \__,_|_.__/ \__\___|_| |_| |_|\__,_|
*/


/*     _ _           _             _____                                 _            
      | (_)         (_)           |  __ \                               | |           
   ___| |_ _ __ ___  _ _ __   __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___ 
  / _ \ | | '_ ` _ \| | '_ \ / _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|
 |  __/ | | | | | | | | | | | (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \
  \___|_|_|_| |_| |_|_|_| |_|\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/
                                                  | |                                 
                                                  |_|                                 
*/
exports.eliminaRespuesta=function(req,res){
    var cuenta=req.body.cuenta;
    var tema=req.body.tema;
    var subtema=req.body.subtema;
    var respuesta=req.body.respuesta;
	var collection = 'temas_'+cuenta;
	var sort={'tema':1};
 	var criterio = {'tema':tema};
	if(tema.length!==0 && subtema.length===0) {
	    var pull = {'respuestas': {'respuesta':respuesta }};
	    classdb.actualizaPull(collection, criterio, pull, 'themes/eliminaRespuesta/', function(updated){
			if(updated==='error'){
		    	res.jsonp(3);
			}else{
		    	classdb.buscarToArray(collection, {'tema':tema}, sort, 'themes/eliminaSubtema', function(themes){
					if(themes==='error'){
			    		res.jsonp(3);
					}else{
			    		res.jsonp(themes[0].respuestas);
					}
		    	});		
			}
	    });
	}else if(tema.length !== 0 && subtema.length !== 0){
	    classdb.buscarToArray(collection, {'tema':tema,'subtemas.subtema':subtema}, sort, 'themes/eliminaRespuesta', function(items){
			if(items==='error'){
		    	res.jsonp(3);
			}else {
		    	var tieneSubRes='';
            	for(var r=0;r<items[0].subtemas.length;r++){
					if(items[0].subtemas[r].subtema===subtema){
			    		tieneSubRes=items[0].subtemas[r].hasOwnProperty('respuestas');
					}
		    	}
		    	if (tieneSubRes === true) {
					if (typeof items[0].subtemas[r] !== 'undefined' && typeof items[0].subtemas[r].respuestas !== 'undefined' && items[0].subtemas[r].respuestas.length === 0) {
			    		var criterioRes = {'tema': tema };
			    		var pullRes = { 'respuestas' : { 'respuesta' : respuesta }};
			    		classdb.actualizaPull(collection, criterioRes, pullRes, 'themes/eliminaRespuesta/', function(updated){
							if(updated==='error'){
				    			res.jsonp(3);
							}else{
				    			classdb.buscarToArray(collection, {'tema':tema}, sort, 'themes/eliminaSubtema', function(themes){
									if(themes==='error'){
					    				res.jsonp(3);
									}else{
			    		    			res.jsonp(themes[0].respuestas);
									}
				    			});		
							}
			    		});
					} else {
			    		var criterioRespuesta = {'tema':tema, 'subtemas':{ $elemMatch: { 'subtema':subtema }}};
			    		var pullRespuesta = {'subtemas.$.respuestas':{'respuesta':respuesta}};
			    		classdb.actualizaPull(collection, criterioRespuesta, pullRespuesta, 'themes/eliminaRespuesta/', function(actualiza){
							if(actualiza==='error'){
				    			res.jsonp(3);
							}else{
				    			classdb.buscarToArray(collection, {'tema':tema}, sort, 'themes/eliminaSubtema', function(temas){
									if(temas==='error'){
					    				res.jsonp(3);
									}else{
			             	    		var arregloRespuestas=[];
					    				for(var i=0;i<items[0].subtemas.length;i++){
											if(subtema===items[0].subtemas[i].subtema){
						    					arregloRespuestas.push(items[0].subtemas[i].respuestas);
											}
					    				}
					    				res.jsonp(arregloRespuestas[0]);	
									}
				    			});		
							}
			    		}); 			    	
					}
		    	}else {
					res.jsonp(3);
		    	}
			}
	    });
	}
};
/*               _        _ _           _             _____                                 _            
                | |      | (_)         (_)           |  __ \                               | |           
   ___ _ __   __| |   ___| |_ _ __ ___  _ _ __   __ _| |__) |___  ___ _ __  _   _  ___  ___| |_ __ _ ___ 
  / _ \ '_ \ / _` |  / _ \ | | '_ ` _ \| | '_ \ / _` |  _  // _ \/ __| '_ \| | | |/ _ \/ __| __/ _` / __|
 |  __/ | | | (_| | |  __/ | | | | | | | | | | | (_| | | \ \  __/\__ \ |_) | |_| |  __/\__ \ || (_| \__ \
  \___|_| |_|\__,_|  \___|_|_|_| |_| |_|_|_| |_|\__,_|_|  \_\___||___/ .__/ \__,_|\___||___/\__\__,_|___/
                                                                     | |                                 
                                                                     |_|                                 
*/
