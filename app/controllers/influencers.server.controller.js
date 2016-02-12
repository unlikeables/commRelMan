'use strict';

//Dependencias
var under = require('underscore');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var cmd = require('cmd-exec').init();

var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');

/*
             _   _____        __ _                                
            | | |_   _|      / _| |                               
   __ _  ___| |_  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _` |/ _ \ __| | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 | (_| |  __/ |_ _| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \__, |\___|\__|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
   __/ |                                                          
  |___/                                                           
*/
//Método que sirve para obtener la lista de influencers
exports.getInfluencer=function(req,res){
    var cuenta=req.body.cuenta;
    var colec = 'influencers_'+cuenta;
    classdb.buscarToArray(colec, {}, {}, 'influencers/getInfluencer.main', function(respuesta){
        var byName = respuesta.slice(0);
		byName.sort(function(a,b) {
    	    var x = a.nombre.toLowerCase();
    	    var y = b.nombre.toLowerCase();
    	    return x < y ? -1 : x > y ? 1 : 0;
		});
        //console.log(respuesta);
        res.jsonp(byName);	
    });
};
/*
                _              _   _____        __ _                                
                | |            | | |_   _|      / _| |                               
   ___ _ __   __| |   __ _  ___| |_  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _ \ '_ \ / _` |  / _` |/ _ \ __| | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 |  __/ | | | (_| | | (_| |  __/ |_ _| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \___|_| |_|\__,_|  \__, |\___|\__|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
                      __/ |                                                          
                     |___/                                                           
                  _       _       _____        __ _                                
                 | |     | |     |_   _|      / _| |                               
  _   _ _ __   __| | __ _| |_ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
 | | | | '_ \ / _` |/ _` | __/ _ \ | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 | |_| | |_) | (_| | (_| | ||  __/_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \__,_| .__/ \__,_|\__,_|\__\___|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
       | |                                                                         
       |_|                                                                         
*/
//Método que sirve para actualizar la información del influencer
exports.updateInfluencer=function(req,res){
    var cuenta=req.body.cuenta;
    var idInfluencer=parseInt(req.body.idInfluencer);
    var colec = 'influencers_'+cuenta;
    var criter = {idUser: idInfluencer};
    var elset = {
		'nombre' : req.body.nombre, 
		'apellidos' : req.body.apellido, 
		'descripcion' : req.body.descripcion, 
		'categoria' : req.body.categoria, 
		'username' : req.body.username
    };
    classdb.actualiza(colec, criter, elset, 'influencers/updateInfluencer', function(updated){
		if (updated === 'error') {
	    	console.log('Error al updatear influencer');
	    	res.jsonp(updated);
		}else {
	    	classdb.buscarToArray(colec, {}, {}, 'influencers/updateInfluencer', function(respu){
				if (respu === 'error') {
		    		//console.log('No obtuvimos influencers después de actualizar');
		    		res.jsonp(respu);
				}else {
					var byName = respu.slice(0);
					byName.sort(function(a,b) {
    	    			var x = a.nombre.toLowerCase();
    	    			var y = b.nombre.toLowerCase();
    	    			return x < y ? -1 : x > y ? 1 : 0;
					});
		    		res.jsonp(byName);
				}
	    	});
		}
    });
};
/*
                 _                   _       _       _____        __ _                                
                | |                 | |     | |     |_   _|      / _| |                               
   ___ _ __   __| |  _   _ _ __   __| | __ _| |_ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _ \ '_ \ / _` | | | | | '_ \ / _` |/ _` | __/ _ \ | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 |  __/ | | | (_| | | |_| | |_) | (_| | (_| | ||  __/_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \___|_| |_|\__,_|  \__,_| .__/ \__,_|\__,_|\__\___|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
                          | |                                                                         
                          |_|                                                                         
      _      _      _       _____        __ _                                
     | |    | |    | |     |_   _|      / _| |                               
   __| | ___| | ___| |_ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _` |/ _ \ |/ _ \ __/ _ \ | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 | (_| |  __/ |  __/ ||  __/_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \__,_|\___|_|\___|\__\___|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
                                                                             
*/
//Método que sirve para eliminar a un influencer
exports.deleteInfluencer=function(req,res){
    var cuenta=req.body.cuenta;
    var idInfluencer=parseInt(req.body.idInfluencer);
    var colec = 'influencers_'+cuenta;
    var criter = {idUser : idInfluencer};

    classdb.remove(colec, criter, 'influencers/deleteInfluencer', function(resulta){
		if (resulta === 'error') {
	    	console.log('Error: no pudimos borrar influencer');
	    	res.jsonp(resulta);
		}else {
	    	console.log(resulta);
	    	classdb.buscarToArray(colec, {}, {}, 'influencers/deleteInfluencer', function(items){
				if (items === 'error') {
		    		console.log('No obtuvimos influencers después de actualizar');
		    		res.jsonp(items);
				}else {
					var byName = items.slice(0);
					byName.sort(function(a,b) {
    	    			var x = a.nombre.toLowerCase();
    	    			var y = b.nombre.toLowerCase();
    	    			return x < y ? -1 : x > y ? 1 : 0;
					});
		    		res.jsonp(byName);
				}
	    	});
		}
    });
};
/*
                 _       _      _      _       _____        __ _                                
                | |     | |    | |    | |     |_   _|      / _| |                               
   ___ _ __   __| |   __| | ___| | ___| |_ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _ \ '_ \ / _` |  / _` |/ _ \ |/ _ \ __/ _ \ | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 |  __/ | | | (_| | | (_| |  __/ |  __/ ||  __/_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \___|_| |_|\__,_|  \__,_|\___|_|\___|\__\___|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
            _     _ _____        __ _                                
           | |   | |_   _|      / _| |                               
   __ _  __| | __| | | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _` |/ _` |/ _` | | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 | (_| | (_| | (_| |_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \__,_|\__,_|\__,_|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   

*/
//Método que sirve para agregar a un influencer
exports.addInfluencer=function(req,res){
    var cuenta=req.body.cuenta;
    var criter = {nombreSistema: cuenta};
    classdb.buscarToArray('accounts', criter, {}, 'influencers/addInfluencer.ctas', function(items){
		if (items === 'error') {
	    	res.jsonp(items);
		}else {
	    	var Twit   = require('twit');
	    	var llaves = {};
	    	if (items[0].datosTwitter && items[0].datosTwitter.twitter_consumer_key) {
				llaves.consumer_key = items[0].datosTwitter.twitter_consumer_key;
				llaves.consumer_secret = items[0].datosTwitter.twitter_consumer_secret;
				llaves.access_token = items[0].datosTwitter.twitter_access_token;
				llaves.access_token_secret = items[0].datosTwitter.twitter_access_token_secret;
	    	}else {
				llaves.consumer_key = 'lutOodQP4NsPbVSPCn6udwXZi';
				llaves.consumer_secret = 'dtMAXgMFUJZLdyg4UHxDOIe7uE3DAFrxnKHh2YtU24MHfDCwol';
				llaves.access_token = '231684217-C2Au3LKtQSIEdxnQQhGtCEwHTVg1xGFLHOJlPIzD';
				llaves.access_token_secret = 'xKSN3zJK0nkDBedifna0cTu0yqYwDAE5srcpKPhKe6Wua';
	    	}
	    	var T = new Twit(llaves);
	    	T.get('users/show', {'screen_name':req.body.username}, function(err, data) {
				if (err) {
		    		console.log(err);
		    		console.log('El usuario de twitter no existe o es privado');
		    		res.jsonp(1);
				}else {
		    		var idUser = data.id;
		    		var colecc = 'influencers_'+cuenta;
		    		var criterium = {idUser: idUser};
		    		classdb.buscarToArray(colecc, criterium, {}, 'influencers/addInfluencer.influencers_'+cuenta, function(influencer){
						if (influencer === 'error') {
			    			console.log('Error al obtener influencer');
			    			res.jsonp(2);
						}else {
			    			if (influencer.length !== 0) {
        						res.jsonp(5);
        						console.log('Ese influencer ya existe');
			    			}else {
								var imagenInfluencer = data.profile_image_url_https.replace('_normal', '');
								var insertData = {
				    				'idUser':data.id,
				    				'nombre':req.body.nombre,
				    				'apellidos':req.body.apellido,
				    				'descripcion':req.body.descripcion,
				    				'categoria':req.body.categoria,
				    				'username':req.body.username,
				    				'imagen_influencer':imagenInfluencer
								};
								classdb.inserta(colecc, insertData, 'influencers/addInfluencer.influencers_'+cuenta, function(insercion){
				    				if (insercion === 'error') {
										console.log('Error al insertar influencer');
										res.jsonp(3);
				    				}else {
										classdb.buscarToArray(colecc, {}, {}, 'influencers/addInfluencer.influencers', function(lista_inf) {
					    					if (lista_inf === 'error') {
												console.log('Error al obtener influencers');
												res.jsonp(2);
					    					}else {
					   	    					var byName = lista_inf.slice(0);
												byName.sort(function(a,b) {
    	    										var x = a.nombre.toLowerCase();
    	    										var y = b.nombre.toLowerCase();
    	    										return x < y ? -1 : x > y ? 1 : 0;
												});
												res.jsonp(byName);
					    					}
										});
				    				}
								});
			    			}
						}
		    		});
				}
	    	});
		}
    });
};
/*
                 _             _     _ _____        __ _                                
                | |           | |   | |_   _|      / _| |                               
   ___ _ __   __| |   __ _  __| | __| | | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _ \ '_ \ / _` |  / _` |/ _` |/ _` | | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 |  __/ | | | (_| | | (_| | (_| | (_| |_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \___|_| |_|\__,_|  \__,_|\__,_|\__,_|_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
  _     _____        __ _                                
 (_)   |_   _|      / _| |                               
  _ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
 | / __| | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 | \__ \_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
 |_|___/_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
                                                                                                                                              
*/
//Método que sirve para saber si el usuario es influencer o no
exports.isInfluencer = function(req,res) {
	//console.log('Is influencer!!!!!!!!!!!!!!!!!!!!!!!');
	//console.log(req.body);
	var screen_name = req.body.screen_name;
	var coleccion = req.body.coleccion;
	var criterio = {username:screen_name};
	classdb.existefind(coleccion, criterio,'ClassDb/getFollows',function(existe){
		//console.log('LLamando a isFollow SErvers');
		//console.log(existe);
		if(existe === 'error'){
			res.jsonp('false');
		}else{
			if(existe === 'noexiste'){
				res.jsonp('false');
			}else{
				res.jsonp('true');
			}
		}
	});
};
/*
                 _   _     _____        __ _                                
                | | (_)   |_   _|      / _| |                               
   ___ _ __   __| |  _ ___  | |  _ __ | |_| |_   _  ___ _ __   ___ ___ _ __ 
  / _ \ '_ \ / _` | | / __| | | | '_ \|  _| | | | |/ _ \ '_ \ / __/ _ \ '__|
 |  __/ | | | (_| | | \__ \_| |_| | | | | | | |_| |  __/ | | | (_|  __/ |   
  \___|_| |_|\__,_| |_|___/_____|_| |_|_| |_|\__,_|\___|_| |_|\___\___|_|   
                                                                            
*/
exports.actualizaRangoInfluencers = function(req, res){
  function obtieneCuenta(nombreSistema, callback) {
    var criterio = {'nombreSistema': nombreSistema};
    classdb.buscarToArray('accounts', criterio, {}, 'influencers/actualizaRangoInfluencers/obtieneCuenta', function(datos){
      return callback(datos);
    });
  }

  function actualizaCuenta(nombreSistema, total, callback){
    var criterio = {'nombreSistema': nombreSistema};
    var elset = {
      'rango_influencers' : total  
    };
    classdb.actualiza('accounts', criterio, elset, 'influencers/actualizaRangoInfluencers/actualizaCuenta', function(updated){
      return callback(updated);
    });
  }

  var nombreSistema = req.body.nombreSistema;
  var total = req.body.total;
  obtieneCuenta(nombreSistema, function(datosCuenta){
    if(datosCuenta){
      actualizaCuenta(nombreSistema, total, function(actualizacion){
        if (actualizacion === 'error') {
   	  res.jsonp(actualizacion);
        }
        else {
          cmd.exec('pm2 restart escuchador_cuentas', function(error_restart, respu_restart) {
            if (error_restart) {
              console.log(error_restart);
              res.jsonp('error');
            } else {
              console.log(respu_restart);
              res.jsonp(actualizacion);
            }
          });          
        }
      });
    }else{
      res.jsonp(datosCuenta);
    }
  });
};

exports.obtieneCuenta = function(req, res){
	var criterio = {'nombreSistema': req.body.nombreSistema};
	classdb.buscarToArray('accounts', criterio, {}, 'influencers/actualizaRangoInfluencers/obtieneCuenta', function(datos){
		res.jsonp(datos[0]);
	});
};
