/* solicitudes/getom/GET - Obtiene Monitoreo */
'use strict';
var express = require('express');
var url = require('url'),
    qs = require('querystring'),
    _ = require('lodash'),
    http = require('http'),
    https = require('https');
var bst = require('better-stack-traces').install();
var querystring = require('querystring');
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');
var accesstokens = require('../../accesstokens.js');

var router = express.Router();

/* GET obtieneMonitoreo. */
router.get('/', function(req, res, next) {
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
      var datosSistema = {
	nombreSistema : cuentas[index].nombreSistema,
	idMonitoreo : cuentas[index].datosMonitoreo.id
      };
      ctasrefinadas.push(datosSistema);
      refinaCuentas(cuentas, more, ctasrefinadas, callback);
    }
  }

  function getCuentas(callback) {
    var criterio = {$and: [{'datosMonitoreo' : {$exists : true}}, {'datosMonitoreo':{$ne: null}}]};
    classdb.buscarToStream('accounts', criterio, {}, 'solicitudes/getom/getCuentas', function(cuentas){
      refinaCuentas(cuentas, 0, [], function(refinadas){
	return callback(refinadas);
      });
    });
  }

  function reqGraphConPAT(path, nosys, callback) {
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
			      console.log('solicitudes/getom/reqGraphConPAT -'+nosys+'- hubo un error en solicitud al graph: '+ pathcontoken);
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
	  console.log('solicitudes/getom/reqGraphConPAT - hubo un error en la conexión al graph: '+e);
	  return callback('error');
	});
      });
    }
    else {
      console.log('solicitudes/getoc/reqGraphConPAT - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }

  function reqGraph(token, path, nsys, callback) {
    if (typeof path !== 'undefined' || path !== null || path !== '') {
      var pathcontoken = '';
      if ( token === 'not' ) { 
	pathcontoken = path; 
      }
      else { 
	pathcontoken = path+'&'+token; 
      }
      globales.options_graph.method = 'GET';
      globales.options_graph.path = pathcontoken;
      var solicitud = https.request(globales.options_graph, function(resp) {
		        var chunks = [];
		        resp.on('data', function(chunk) {
		          chunks.push(chunk);
		        }).on('end', function() {
		          var contenido = JSON.parse(Buffer.concat(chunks));
		          if (typeof contenido.error !== 'undefined') {
			    // console.log('solicitudes/getom/reqGraph - '+nsys+'  - hubo un error en solicitud al graph: '+ pathcontoken);
			    // console.log(JSON.stringify(contenido.error));
			    reqGraphConPAT(path, nsys, function(respconPAT){
			      return callback(respconPAT);
			    });
		          }
		          else {
			    return callback(contenido);
		          }
		        });
	              });
      solicitud.end();
      solicitud.on('error', function(e){
	console.log('solicitudes/getom/reqGraph - hubo un error en la conexión al graph: '+e);
	return callback('error');
      });
    }
    else {
      console.log('solicitudes/getom/reqGraph - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }
  
  function nueMens(fecha, tipo, cuenta) {
    var dadate = fecha.toString();
    var nm_data = querystring.stringify(
      {
	obj: 'facebook',
	tipo: tipo,
	created_time: dadate,
	cuenta: cuenta
      }
    );
    var nm_options = {
      hostname: globales.options_likeable.hostname,
      port: 443,
      path: '/nuevoMensaje',
      method: 'POST',
      headers: {
	'Content-Type': 'application/x-www-form-urlencoded',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Content-Length': nm_data.length
      }
    };
    var nmpost_req = https.request(nm_options, function(resnm) {
	               resnm.setEncoding('utf8');
	               resnm.on('data', function (nmchunk) {
	               });
	             });
    nmpost_req.write(nm_data);
    nmpost_req.end();
    nmpost_req.on('error', function(e){
      console.log('escuchador/post-nuevoMensaje varios error: '+e);
      console.log("Error: " +e.message); 
      console.log( e.stack );
    });
  }

  //Función para añadir el comment a la base de datos
  function insertCommentMonitoreo(token, cuenta, pid, comment, callback){
    var nombreSistema = cuenta.nombreSistema;
    var page_id = cuenta.idMonitoreo;
    var created_time = comment.created_time;
    created_time = created_time.replace('+','.');
    comment.created_time = new Date(created_time);
    comment.page_id = page_id;
    comment.parent_post = pid;
    comment.parent_comment = pid;
    comment.obj = 'facebook';
    comment.coleccion_orig = nombreSistema+'_fb_comment';
    comment.coleccion = nombreSistema+'_consolidada';
    comment.tipo = 'comment';
    comment.from_user_id = ''+comment.from.id;
    comment.from_user_name = comment.from.name;

    if (typeof comment.attachment !== 'undefined' &&
	typeof comment.attachment.media !== 'undefined' &&
	typeof comment.attachment.media.image !== 'undefined' &&
	typeof comment.attachment.media.image.src !== 'undefined') {
      comment.image_attachment = comment.attachment.media.image.src;
    }
    if (typeof comment.attachment !== 'undefined' &&
	typeof comment.attachment.target !== 'undefined' &&
	typeof comment.attachment.target.url) {
      comment.link_attachment = comment.attachment.target.url;
    }

    var fotopath = globales.fbapiversion+comment.from.id+'/picture?redirect=false';
    reqGraph('not', fotopath, nombreSistema, function(foto){
      if (foto === 'error') {
	comment.foto = '';
	classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getom/insertaCommentMonitoreo', function(insert){
	  if (comment.from && page_id !== comment.from.id) {
	    nueMens(comment.created_time, 'comment', nombreSistema);
	  }
	  return callback(insert);
	});			    
      }
      else {
	comment.foto = foto.data.url;
	classdb.inserta(nombreSistema+'_consolidada', comment, 'solicitudes/getom/insertaCommentMonitoreo', function(insert){
	  if (comment.from && page_id !== comment.from.id) {
	    nueMens(comment.created_time, 'comment', nombreSistema);
	  }
	  return callback(insert);
	});
      }
    });
  }
    
  //Funciòn que sirve para verificar el comment
  function verificaExistenciaComment(cuenta, comment, callback) {
    var colezione = cuenta.nombreSistema+'_consolidada';
    var criterio = {'id': comment.id};
    classdb.existecount(colezione, criterio, 'solicitudes/getom/verificaExistenciaComment', function(existe){
      return callback(existe);
    });
  }

  //Función que desglosa los comments y los ingresa
  function desglosecomments(cuenta, pid, comments, index, procesados, token, callback) {
    var more = index+1, cuentac = comments.length;
    if (more > cuentac) {
      if (procesados > 0) {
        console.log(procesados+' comments procesados');
      }
      return callback('dco');	    
    }
    else {
      setImmediate(function(){
	verificaExistenciaComment(cuenta, comments[index], function(existencia){
	  if (existencia === 'error' || existencia === 'existe') {
	    return desglosecomments(cuenta, pid, comments, more, procesados, token, callback);			
	  }
	  else {
	    insertCommentMonitoreo(token, cuenta, pid, comments[index], function(respincom){
	      if(respincom==='error'){
		return desglosecomments(cuenta, pid, comments, more, procesados, token, callback);			
	      }
	      else {
                procesados++;
		return desglosecomments(cuenta, pid, comments, more, procesados, token, callback);			
	      }
	    });			    
	  }
	});
      });
    }
  }
   
  //Función que realiza la inserción a la base de datos
  function insertaPostMonitoreo(token, cuenta, post, callback){
    var nombreSistema = cuenta.nombreSistema,
	post_created_time = post.created_time,
	page_id = cuenta.idMonitoreo,
	created_time = new Date (post_created_time.replace('+','.'));
    post.created_old = post.created_time;
    post.created_time = created_time;
    post.from_user_id = ''+post.from.id;
    post.from_user_name = post.from.name;
    post.obj = 'facebook';
    post.coleccion_orig = nombreSistema+'_fb_post';
    post.coleccion = nombreSistema+'_consolidada';
    post.tipo = 'post';
    post.subtipo = post.type;
    
    if (typeof post.attachments !== 'undefined' &&
	typeof post.attachments.data !== 'undefined' &&
	post.attachments.data[0].length > 0 &&
	typeof post.attachments.data[0].media !== 'undefined' &&
	typeof post.attachments.data[0].media.image !== 'undefined' &&
	typeof post.attachments.data[0].media.image.src !== 'undefined') {
      post.image_attachment = post.attachments.data[0].media.image.src;
    }
    if (typeof post.attachments !== 'undefined' &&
	typeof post.attachments.data !== 'undefined' &&
	post.attachments.data[0].length > 0 &&
	typeof post.attachments.data[0].target !== 'undefined' &&
	typeof post.attachments.data[0].target.url !== 'undefined') {
      post.link_attachment = post.attachments.data[0].target.url;
    }
    var fotopath = globales.fbapiversion+post.from.id+'/picture?redirect=false';
    reqGraph('not', fotopath, nombreSistema, function(foto){
      if (foto === 'error') {
	post.foto = '';
	classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getom/insertaPostMonitoreo', function(insert){
	  if (post.from && page_id !== post.from.id) {
	    nueMens(post.created_time, 'post', nombreSistema);
	  }
	  return callback(insert);
	});
      }
      else {
	post.foto = foto.data.url;
	classdb.inserta(nombreSistema+'_consolidada', post, 'solicitudes/getom/insertaPostMonitoreo', function(insert){
	  if (post.from && page_id !== post.from.id) {
	    nueMens(post.created_time, 'post', nombreSistema);
	  }
	  return callback(insert);
	});
      }
    });
  }

  //Función que verifica la existencia del post
  function verificaExistenciaPost(cuenta, post, callback) {
    var coleccion = cuenta.nombreSistema+'_consolidada';
    var criterio = {'id': post.id};
    classdb.existecount(coleccion, criterio, 'solicitudes/getom/verificaExistenciaPost', function(existe){
      return callback(existe);
    });
  }	

  function desgloseposts(token, cuenta, feed, index, processed, callback) {
    var more = index+1;
    var cuantosposts = feed.length;
    if (more > cuantosposts) {
      if (processed > 0) {
        console.log(processed+' posts procesados');
      }
      return callback('dp');
    }
    else {
      setImmediate(function(){
	verificaExistenciaPost(cuenta, feed[index], function(existenciaPost) {
	  if (existenciaPost === 'error' || existenciaPost === 'existe') {
            if (typeof feed[index].comments !== 'undefined') {
              desglosecomments(cuenta, feed[index].id, feed[index].comments.data, 0, 0, token, function(respdc){});
            }
	    return desgloseposts(token, cuenta, feed, more, processed, callback);
	  }
	  else {
	    insertaPostMonitoreo(token, cuenta, feed[index], function(insertaPost) {
	      if (typeof feed[index].comments !== 'undefined') {
		desglosecomments(cuenta, feed[index].id, feed[index].comments.data, 0, 0, token, function(respdc){});
	      }
	      if(insertaPost==='error'){
		return desgloseposts(token, cuenta, feed, more, processed, callback);			
	      }
	      else {
                processed++;
		return desgloseposts(token, cuenta, feed, more, processed, callback);			
	      }
	    });
	  }
	});
      });
    }
  }

  function desgloseFeeds(token, cuentas, feeds, index, callback) {
    var cuantasc = feeds.cuantos;
    var more = index+1;
    if (more > cuantasc) {
      return callback('df');
    }
    else {
      setImmediate(function() {
 	console.log('solicitudes/getom/desgloseFeeds CUENTA: '+index+' - '+cuentas[index].nombreSistema);
	var nsys = cuentas[index].nombreSistema;
	desgloseposts(token, cuentas[index], feeds[nsys], 0, 0, function(respdp) {
	  if (respdp === 'dp') {
	    console.log('solicitudes/getom/desgloseFeeds - posts de '+ nsys+' procesados');
	    desgloseFeeds(token, cuentas, feeds, more, callback);
	  }
	  else {
	    desgloseFeeds(token, cuentas, feeds, more, callback);
	  }
	});
      });
    }
  }

  function getMonitoreo(access_token, cuentas, index, feeds, callback) {
    if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
      index = 0;
    }
    var cuantasc = cuentas.length;
    var more=index+1;
    if (more > cuantasc) {
      var cuantos = Object.keys(feeds).length;
      feeds.cuantos = cuantos;
      return callback(feeds);
    }
    else {
      setImmediate(function(){
	var nomsys = cuentas[index].nombreSistema;
	var cuentafb = cuentas[index].idMonitoreo;
	var derpath = globales.fbapiversion+cuentafb+globales.path_feed_nolimit;
        // console.log(nomsys+' - '+derpath);
        // console.log(cuentas[index]);
	reqGraph(access_token, derpath, nomsys, function(respuesta){
	  if (respuesta === 'error' || typeof respuesta === 'undefined' || respuesta.data < 1) {
	    console.log('solicitudes/getom/getMonitoreo - error en solicitud al graph o no recibimos feed o venía vacío para '+nomsys);
	    feeds[nomsys] = [];
	    return getMonitoreo(access_token, cuentas, more, feeds, callback);		    
	  }
	  else {
	    feeds[nomsys] = respuesta.data;
	    return getMonitoreo(access_token, cuentas, more, feeds, callback);
	  }
	});		    
      });
    }
  }
  
  //var objetoFace=req.body;
  console.log('**************** solicitudes/getom/GET - obtieneMonitoreo ****************');
  getCuentas(function(cuentas) {
    if (cuentas === 'error' || cuentas.length < 1) {
      console.log('solicitudes/getom.main - error al buscar cuentas o venían vacías');
      res.jsonp('error');	    
    }
    else {
      accesstokens.obtieneAppAT('yes', function(eltoken){
        if (eltoken === 'error') {
	  console.log('solicitudes/getom.main - sin access_token');
	  res.jsonp('error');
        }
        else {
	  getMonitoreo(eltoken, cuentas, 0, {}, function(feeds) {
	    desgloseFeeds(eltoken, cuentas, feeds, 0, function(confirmacion){
	      if (confirmacion === 'df') {
		console.log('getom ok');
                res.jsonp('getom ok');
	      }
	      else {
		console.log('getom error');
                res.jsonp('getom error');
	      }
	    });
	  });
        }
      });
    }
  });
});

module.exports = router;
