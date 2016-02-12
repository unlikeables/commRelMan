/* solicitudes/getpb/GET - Publicaciones */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');
var accesstokens = require('../../accesstokens.js');

var router = express.Router();

/* GET getPublicaciones */
router.get('/', function(req, res, next) {
  // request al graph con algún token de usuario
  function reqGraphConPAT(path, callback) {
    if (typeof path !== 'undefined' || path !== null || path !== '') {
      accesstokens.obtieneUsrsATAmongAllUsrs('yes', function(elatdeusuario) {
	var pathcontoken = path+'&'+elatdeusuario;
	globales.options_graph.method = 'GET';
	globales.options_graph.path = pathcontoken;
	var solicitud = https.request(globales.options_graph, function(resp) {
		          var chunks = [];
		          resp.on('data', function(chunk) {
		            chunks.push(chunk);
		          }).on('end', function() {
		            var contenido = JSON.parse(Buffer.concat(chunks));
		            if (typeof contenido.error !== 'undefined') {
			      console.log('solicitudes/getpb/reqGraphConPAT - hubo un error en solicitud al graph: '+ pathcontoken);
			      console.log(JSON.stringify(contenido.error));
			      return callback('error');
		            }
		            else {
			      return callback(contenido);
		            }
		          });
	                });
	solicitud.end();
	solicitud.on('error', function(e){
	  console.log('solicitudes/getpb/reqGraphConPAT - hubo un error en la conexión al graph: '+e);
	  return callback('error');
	});
      });
    }
    else {
      console.log('solicitudes/getoc/reqGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }

  // request al graph con app-token
  function reqGraph(token, path, callback) {
    if (typeof path !== 'undefined' || path !== null || path !== '') {
      var pathcontoken = '';
      if ( token === 'not' ) { pathcontoken = path; }
      else { pathcontoken = path+'&'+token; }
      globales.options_graph.method = 'GET';
      globales.options_graph.path = pathcontoken;
      var solicitud = https.request(globales.options_graph, function(resp) {
		        var chunks = [];
		        resp.on('data', function(chunk) {
		          chunks.push(chunk);
		        }).on('end', function() {
		          var contenido = JSON.parse(Buffer.concat(chunks));
		          if (typeof contenido.error !== 'undefined') {
			    console.log('solicitudes/getpb/reqGraph - hubo un error en solicitud al graph: '+ pathcontoken);
			    console.log(JSON.stringify(contenido.error));
			    reqGraphConPAT(path, function(respconPAT){
			      if (respconPAT === 'error') {
				return callback('error');
			      }
			      else {
				return callback(respconPAT);
			      }
			    });
		          }
		          else {
			    return callback(contenido);
		          }
		        });
	              });
      solicitud.end();
      solicitud.on('error', function(e){
	console.log('solicitudes/getpb/reqGraph - hubo un error en la conexión al graph: '+e);
	return callback('error');
      });
    }
    else {
      console.log('solicitudes/getpb/reqGraph - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }

  // Reduce los objetos de las cuentas a solamente nombreSistema y idPage
  function refinaCuentas(cuentas, index, ctasrefinadas, callback) {
    if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
      index = 0;
    }
    var more = index+1;
    var cuantasc = cuentas.length;
    if (more > cuantasc) {
      return callback(ctasrefinadas);
    }
    else {
      setImmediate(function(){
	var datosSistema = {};
	var tieneMonitoreo = cuentas[index].hasOwnProperty('datosMonitoreo');
   	if(tieneMonitoreo === true) {
   	  datosSistema = {
	    nombreSistema : cuentas[index].nombreSistema,
	    idPage : cuentas[index].datosMonitoreo.id
   	  };
	  ctasrefinadas.push(datosSistema);
	  return refinaCuentas(cuentas, more, ctasrefinadas, callback);
   	} else {
	  if (typeof cuentas[index].datosPage !== 'undefined' && typeof cuentas[index].datosPage.id !== 'undefined') {
   	    datosSistema = {
	      nombreSistema : cuentas[index].nombreSistema,
	      idPage : cuentas[index].datosPage.id
   	    };
	    ctasrefinadas.push(datosSistema);
	    return refinaCuentas(cuentas, more, ctasrefinadas, callback);
	  }
	  else {
	    return refinaCuentas(cuentas, more, ctasrefinadas, callback);
	  }
	}
      });
    }
  }
  
  //Funcion que obtiene las cuentas
  function getCuentas(callback) {
    var criterio = {$or: [
      {$and: [
	{'datosMonitoreo' : {$exists : true}},
   	{'datosMonitoreo' : {$ne : ''}},
   	{'datosMonitoreo.id' : {$ne : ''}}
      ]},
      {$and: [
   	{'datosPage' : {$exists : true}},
	{'datosPage': {$ne : ''}},
	{'datosPage.id' : {$ne : ''}}
      ]}
    ]};
    classdb.buscarToStream('accounts', criterio, {}, 'solicitudes/getpb/getCuentas', function(cuentas){
      if (cuentas === 'error') {
	return callback(cuentas);
      }
      else {
	refinaCuentas(cuentas, 0, [], function(refinadas){
	  return callback(refinadas);
	});
      }
    });
  }

  //Función que verifica la existencia del post
  function verificaExistenciaPost(nombreSistema, post, callback) {
    var criterio = {'id': post.id};
    classdb.existecount(nombreSistema+'_fb_publicaciones', criterio, 'solicitudes/getpb/verificaExistenciaPost', function(respuesta){
      return callback(respuesta);
    });
  }

  //Función que realiza la inserción a la base de datos
  function insertaPublicacion(nombreSistema, post, callback){
    var c_time = post.created_time;
    var tstamp = c_time.replace('+','.');
    post.created_time = new Date(tstamp);	
    classdb.inserta(nombreSistema+'_fb_publicaciones', post, 'solicitudes/getpb/insertaPublicacion', function(inserta){
      return callback(inserta);
    });
  }
  
  // para cada post de esta cuenta, verificamos si ya existe, luego pedimos sus attachments, y finalmente lo insertamos.
  function desglosaPosts(token, nombreSistema, posts, index, callback){
    var cuantosp=posts.length;
    var more = index+1;
    if (more > cuantosp) {
      return callback('posts de '+nombreSistema+' ok');
    }
    else {
      setImmediate(function(){
	if (typeof posts[index].comments !== 'undefined') { delete posts[index].comments; }
	if (typeof posts[index].likes !== 'undefined'){ delete posts[index].likes; }
	verificaExistenciaPost(nombreSistema, posts[index], function(existe) {
	  if (existe === 'error' || existe === 'existe') {
	    return desglosaPosts(token, nombreSistema, posts, more, callback);		    
	  }
	  else {
	    posts[index].tipo = 'post';
	    posts[index].subtipo = posts[index].type;
            
	    if (typeof posts[index].attachments !== 'undefined' &&
		typeof posts[index].attachments.data !== 'undefined' &&
		posts[index].attachments.data[0].length > 0 &&
		typeof posts[index].attachments.data[0].media !== 'undefined' &&
		typeof posts[index].attachments.data[0].media.image !== 'undefined' &&
		typeof posts[index].attachments.data[0].media.image.src !== 'undefined') {
	      posts[index].image_attachment = posts[index].attachments.data[0].media.image.src;
	    }
	    if (typeof posts[index].attachments !== 'undefined' &&
		typeof posts[index].attachments.data !== 'undefined' &&
		posts[index].attachments.data[0].length > 0 &&
		typeof posts[index].attachments.data[0].target !== 'undefined' &&
		typeof posts[index].attachments.data[0].target.url !== 'undefined') {
	      posts[index].link_attachment = posts[index].attachments.data[0].target.url;
	    }
            
	    insertaPublicacion(nombreSistema, posts[index], function(respuesta){
	      if (respuesta === 'error') {
		console.log('solicitudes/getpb/desglosaPosts - error al insertar publicación: '+nombreSistema);
		return desglosaPosts(token, nombreSistema, posts, more, callback);
	      }
	      else {
		return desglosaPosts(token, nombreSistema, posts, more, callback);
	      }
	    });
	  }
	});
      });
    }
  }

  // para cada cuenta, mandamos los posts a desglosaPosts
  function desglosaCtasPosts(token, arregloctas, objetoposts, index, callback) {
    var cuantasctas = arregloctas.length;
    var cuantosobjs = Object.keys(objetoposts).length;
    var more = index+1;
    if (more > cuantasctas) {
      return callback ('getpb ok');
    }
    else {
      setImmediate(function(){
	var lacuenta = arregloctas[index];
	desglosaPosts(token, lacuenta, objetoposts[lacuenta], 0, function(respuesta){
	  // console.log(respuesta);
	  return desglosaCtasPosts(token, arregloctas, objetoposts, more, callback);
	}); 
      });
    }
  }

  // obtenemos últimos 3 posts de esta cuenta
  function getPostsFB(access_token, datosCuenta, callback){
    var derpath = globales.fbapiversion+datosCuenta.idPage+globales.path_posts_query_limit;
    reqGraph(access_token, derpath, function(respue){
      if (respue === 'error') {
	return callback('error');
      }
      else {
	return callback(respue.data);
      }
    });
  }

  // para cada cuenta, obtenemos últimos posts y los relacionamos con la cuenta 
  function desgloseCuentas(token, cuentas, index, arregloCuentas, objetoPosts, callback) {
    var cuantasc = cuentas.length;
    var more = index+1;
    if (more > cuantasc) {
      return callback(arregloCuentas, objetoPosts); 
    }
    else {
      setImmediate(function(){
	if (typeof cuentas[index] !== 'undefined') {
	  getPostsFB(token, cuentas[index], function(respuesta) {
	    if (respuesta === 'error') {
	      console.log('solicitudes/getpb/desgloseCuentas - error al solicitar posts a facebook para la cuenta: '+cuentas[index].nombreSistema);
	      desgloseCuentas(token, cuentas, more, arregloCuentas, objetoPosts, callback);
	    }
	    else {
	      arregloCuentas.push(cuentas[index].nombreSistema);
	      objetoPosts[cuentas[index].nombreSistema] = respuesta;
	      desgloseCuentas(token, cuentas, more, arregloCuentas, objetoPosts, callback);
	    }
	  });
	}		    
      });
    }
  }
    
  console.log('*************** solicitudes/getpb/GET - getPublicaciones ***************');
  getCuentas(function(cuentas) {
    if (cuentas === 'error' || cuentas.length < 1) {
      console.log('solicitudes/getpb.main - error al buscar las cuentas');
      res.jsonp('error');
    }
    else {
      accesstokens.obtieneAppAT('yes', function(eltoken){
        if (eltoken === 'error') {
	  console.log('solicitudes/getpb.main - sin access_token');
	  res.jsonp('error');
        }
        else {
	  desgloseCuentas(eltoken, cuentas, 0, [], {}, function(arregloCuentas, objetoPosts){
	    desglosaCtasPosts(eltoken, arregloCuentas, objetoPosts, 0, function(respuesta){
	      res.jsonp(respuesta);
	    });
	  });
        }
      });
    }
  });
});

module.exports = router;
