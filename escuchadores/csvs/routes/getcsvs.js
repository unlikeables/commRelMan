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

/* GET home page. */
/* 
http://crm-csvs.likeable.mx/getcsvs?nombreSistema=airizar&fecha_inicial=2016-01-16T06:00:00.417Z&fecha_final=2016-01-21T23:38:18.417Z 
*/
router.get('/process', function(req, res) {
  console.log('RAIZ !!!!!');
  var csv_url = globales.options_likeable_csvs;
  res.render('index.html',{url:csv_url});
});


router.get('/download', function(req, res){
	var base_dir = __base;
  var fileName = req.query.filename;
  var file = base_dir+'temp_files/'+ fileName;


  res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
  res.setHeader('Content-type', 'application/CSV');

  if(fs.existsSync(file)){
  	console.log('El archivo SI EXISTE');
  	var filestream = fs.createReadStream(file);
  	filestream.pipe(res);
	filestream.on('end',function(){
	   fs.unlink(base_dir+'temp_files/'+fileName, function() {
	  		console.log('SE BORRO EL ARCHIVO ');
	    });
	});
  }else{
  	console.log('El archivo NO EXISTE');
  	res.jsonp('Lo sentimos pero el csv caducó genera otro.');
  }
  
});






router.get('/node',function(req,res){
	res.connection.setTimeout(0);
	var base_dir = __base;
  var socketio = req.app.get('socketio'); // take out socket instance from the app container
	var parametros = req.query;
  var nombreSistema = parametros.nombreSistema;
  var col = parametros.nombreSistema+'_consolidada';
  var fecha_inicial = new Date(parametros.fecha_inicial);
  var fecha_final = new Date(parametros.fecha_final);
  console.log(parametros);
  var socketid = parametros.socket;

  function getdatoscuenta(nombreSistema, cback) {
    var criterio = {'nombreSistema': nombreSistema};
    classdb.buscarToStream('accounts', criterio, {}, 'getcsvs/getdatoscuenta', function(datos){
      if(datos.length > 0){
		if(datos[0].datosPage){
		  return cback(datos[0].datosPage.id);
		}else if(datos[0].datosMonitoreo){
		  return cback(datos[0].datosMonitoreo.id);
		}else{
			console.log('No tiene facebook ni page_id');
			return cback('error');
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

function capitaliseFirstLetter(string){
      if(typeof(string) !== 'undefined' && string !== null){
          return string.charAt(0).toUpperCase() + string.slice(1);
      }
    }

    function modificaAcentos(string){
      if(typeof(string) !== 'undefined' && string !== null){
          return string.replace(/Ã³/g,'ó').replace(/Ã©/g,'é').replace(/Ã¡/g,'á').replace(/Ã/g,'í').replace(/Â¡/g,'¡').replace(/Â¿/,'¿').replace('||' , '');
        //return string.substring(0,string.length - 2);
      }
    }
function asyncCsv(query){
	var MongoClient = require('mongodb').MongoClient;
    var mongobase = 'mongodb://localhost/likeable-crm-dev';
    var resultados = [];
		MongoClient.connect(mongobase, function(error,db){
			console.log('Conexion con mongo exitosa');
      		var colect = db.collection(col);
      		var cursor = colect.find(query);
         	var projection = {
            'respuestas':1,
            'atendido':1,
            'sentiment':1,
            'descartado':1,
            'obj':1,
            'tipo':1,
            'clasificacion':1,
            'created_time':1,
            'from_user_id':1,
            'from':1,
            'parent_post':1,
            'id':1,
            'sender':1,
            'user':1,
            'url':1,
            'text':1,
            'message':1
          };
          cursor.project(projection);
      	  var count = 0;
          var cuenta = 0;
          cursor.count(function(err,data_cuenta){
            console.log('Totales: '+data_cuenta);
            cuenta = data_cuenta;
            cursor.forEach(function(doc){
	            socketio.sockets.emit('update', ( (count++ * 100) / cuenta));
	            resultados.push(procesaCsv(doc));
	         },function(err,end){
	         	if(err)
	         		console.log('Hubo un error en forEach '+err);
	         	db.close();
	            var fecha_string_inicial = new Date(fecha_inicial).toDateString().replace(/ /g,'');
	            var fecha_string_final = new Date(fecha_final).toDateString().replace(/ /g,'');
	            var fields = [
	              'Fecha de Entrada',
	              'Fecha de Atención',
	              'Tiempo de Respuesta',
	              'Status',
	              'Razón de Descartado',
	              'Nombre de Usuario',
	              'Fuente',
	              'Clase',
	              'Link',
	              'Mensaje',
	              'Tema',
	              'Subtema',
	              'Sentimiento',
	              'Respuesta',
	              'Atendido Por'
	            ]; 
	            var fields_names = [
	              'fecha_llegada',
	              'fecha_respuesta',
	              'tiempo_respuesta',
	              'status',
	              'razon_descartado',
	              'nombre_post',
	              'obj',
	              'tipo',
	              'url',
	              'mensaje',
	              'tema',
	              'subtema',
	              'sentiment',
	              'respuesta',
	              'atendidoPor'
	            ];
	            console.log('Elementos agregados');
	            console.log(resultados.length);           
	            json2csv({ data: resultados, fields: fields_names, fieldNames: fields}, function(err, csv) {
	              if (err) console.log(err);
	              var filename = parametros.nombreSistema+'_'+fecha_string_inicial+'_to_'+fecha_string_final+'.csv';
	              fs.writeFile(base_dir+'temp_files/'+filename, csv, function(err) {
	                if (err) throw err;
	                console.log('file saved');
	                // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin','http://'+globales.options_likeable_csvs.hostname);

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	                res.jsonp({filename:filename});
	              });
	              console.log('Listo se DESCARGO el csv');
	            });
	        });
	    });   		
    });
}
function procesaCsv(item,cback, closed){
				var obj = {
		    		tipo: item.tipo,
		    		obj: item.obj,
		    		fecha_llegada: new Date(item.created_time),
		    		respuesta: ''
				};
				var resta = '';
				var respuesta = '';
				/* Obteniendo respuesta o respuestas */
				if(item.respuestas){
		    		for(var i in item.respuestas){
						obj.respuesta += quitaEspeciales(item.respuestas[i].texto)+'||';
		    		}
		    		obj.status = 'Respondido';
		    		obj.fecha_respuesta = new Date(item.respuestas[0].timestamp);
		    		resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo; 
				}
				/*Obteniendo el status */
				if(item.clasificacion && item.sentiment){
		    		obj.tema = item.clasificacion.tema;
		    		obj.subtema = item.clasificacion.subtema;
		    		obj.sentiment = item.sentiment;
		    		obj.status = 'Clasificado';
				}
				if(item.clasificacion && item.sentiment && item.respuestas){
		    		obj.status = 'Respondido y Clasificado';
				}
				if(item.descartado){
		    		obj.razon_descartado = traduceDescartados(item.descartado.motivo);
		    		obj.status = 'Descartado';
				}
				if(item.atendido){
		    		obj.status = 'atendido';
				}
				/*Obteniendo datos de usuario por tipo de mensaje*/
				if(item.obj === 'facebook'){
					if(item.from){
			    		obj.nombre_post = item.from.name;
			    		obj.mensaje = quitaEspeciales(item.message);
					}
					if(item.tipo === 'facebook_inbox'){
						obj.url = 'https://www.facebook.com/'+item.from.id;
					}else if(item.tipo === 'comment'){
						var post = item.parent_post.split('_');
						var id = item.id.split('_');
						obj.url = 'https://www.facebook.com/'+post[0]+'/posts/'+post[1]+'?comment_id='+id[1];
					}else if(item.tipo === 'post'){
						var idSeparado = item.id.split('_');
						obj.url = 'https://www.facebook.com/'+idSeparado[0]+'/post/'+idSeparado[1];
					}
				}
				if(item.obj === 'twitter'){
		    		if(item.tipo === 'direct_message'){
						obj.nombre_post = item.sender.name;
						obj.url = 'https://twitter.com/' + item.sender.screen_name;
		    		}else{
						obj.nombre_post = item.user.name;
						obj.url = 'https://twitter.com/' + item.user.screen_name;
		    		}
		    		obj.mensaje = quitaEspeciales(item.text);
				}
		
				if(!obj.status){
		    		obj.status = 'Sin atender';
				}


				var fechaRespuestaCorregida = corrigeFormatoFecha(obj.fecha_respuesta);
				obj.fecha_respuesta = fechaRespuestaCorregida;

				if(obj.fecha_respuesta.length === 0 && item.atendido && !item.descartado){
					obj.fecha_respuesta = new Date(item.atendido.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo; 
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
					//console.log('No hay fecha de respuesta pero hay clasificacion');
				}else if(obj.fecha_respuesta.length === 0 && !item.atendido && item.descartado){
					obj.fecha_respuesta = new Date(item.descartado.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo;
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
				}else if(obj.fecha_respuesta.length === 0 && item.atendido && item.descartado){
					obj.fecha_respuesta = new Date(item.atendido.fecha);
					resta = obj.fecha_respuesta.getTime() - obj.fecha_llegada.getTime();
		    		obj.tiempo_respuesta = ( resta * 0.001 );
		    		respuesta = obtieneTiempo(parseInt(obj.tiempo_respuesta));
		    		obj.tiempo_respuesta = respuesta.promedio+' '+respuesta.tipo;
					obj.fecha_respuesta = corrigeFormatoFecha(obj.fecha_respuesta);
				}

				var fechaLlegadaCorregida = corrigeFormatoFecha(obj.fecha_llegada);
				obj.fecha_llegada = fechaLlegadaCorregida;
				if(item.atendido){
					if(item.atendido.usuario_nombre){
						obj.atendidoPor = item.atendido.usuario_nombre;
					}else{
						if(item.clasificacion.user_name){
							obj.atendidoPor = item.clasificacion.user_name;
						}
					}
				}else if(item.descartado){
					obj.atendidoPor  = item.descartado.usuario;
				}

        obj.status = capitaliseFirstLetter(obj.status);
        obj.obj = capitaliseFirstLetter(obj.obj);
        obj.tipo = capitaliseFirstLetter(obj.tipo.replace('facebook_',''));
        obj.sentiment = capitaliseFirstLetter(obj.sentiment);
        obj.atendidoPor = capitaliseFirstLetter(obj.atendidoPor);
        obj.mensaje = modificaAcentos(obj.mensaje);
        obj.respuesta = modificaAcentos(obj.respuesta);
				//resultado.push(obj);
				return obj;

    }


  if (parametros.nombreSistema && parametros.fecha_inicial && parametros.fecha_final) {
    var criterio = {};
    console.log('Pidiendo a getdatoscuenta');
    console.log(nombreSistema);
    getdatoscuenta(nombreSistema, function(page_id){
    	console.log('Regresando de page_id');
    	console.log(page_id);
      if(page_id === 'error'){
      	console.log('Pedimos datos a base por que la página SI es de monitoreo');
		var query = {
			  $and:[
			    {'created_time' : {$gte : fecha_inicial}},
			    {'created_time' : {$lte : fecha_final}},
			    {'tipo':{$exists:true}},
		 	]
		};
		asyncCsv(query);
		/*classdb.buscarToArray(col, criterio, {}, 'generaCSV/buscar', function(items){
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
		});*/
      }else{
      	console.log('Pedimos datos a base por que la página NO es de monitoreo');
      	var query = {
			  $and:[
			    {'created_time' : {$gte : fecha_inicial}},
			    {'created_time' : {$lte : fecha_final}},
			    {'tipo':{$exists:true}},
			    {'from_user_id' : {$ne : page_id}},
			  ]
		};
		asyncCsv(query);
      }
    });
  }
  else {
    res.render('getcsvs', {
      error: {
        'name': 'getcsvsnoparam',
        'message': 'El request venía sin los parámetros necesarios',
        'filename':'getcsvs.js'
      }
    });
  }



});










module.exports = router;
