'use strict';

var http=require('http');
var https=require('https');
var nodemailer=require('nodemailer');
var config = require('../../config/config');
var ObjectID = require('mongodb').ObjectID;
var mongobase = 'mongodb://localhost:27017/likeable-crm-dev';
var bst = require('better-stack-traces').install();
var globales = require('../../config/globals.js');
var classdb = require('../../config/classdb.js');
/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		globals : globales.url
	});
};

exports.notification = function(req, res){
    console.log('//////////////****  LLamando a notificacion del socket *****///////////');
    console.log(req.body);
    var critus = {'cuenta.marca': req.body.cuenta};
    var campos = {_id : 1,email:1,notificaciones:1};
    
    classdb.buscarToArrayFields('users', critus, campos, {}, 'core/notificacion.main', function(items) {
	if (items === 'error') {
	    console.log('NO hay usuarios a los que notificar');
	    res.jsonp(items);
	}
	else {
		var users = [];
		for(var i in items){
			users.push({_id:items[i]._id});
		}
	    var notificacion = {
		mongo_id: req.body.mongo_id,
		coleccion: req.body.coleccion,
		user_id: req.body.user_id,
		cuenta:req.body.cuenta,
		text: req.body.text,
		followers: req.body.followers,
		post_id:req.body.tweet_id,
		razon: req.body.razon,
		created_time: new Date(req.body.fecha),
		screen_name:req.body.screen_name,
		usuarios:users,
		profile_image: req.body.profile_image		
	    };
	    console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ Notificacion INSETADA +-+-+-+-+-+-+-+-+--+-++-+');
	    console.log(notificacion);
	    classdb.insertacresult('notificaciones', notificacion, 'core/notificacion.main', function(data){
		if (data === 'error') {
		    console.log('Error al insertar notificacion');
		    res.jsonp(data);
		}
		else {
		    console.log('Notificacion insertada correctamente');
		    console.log(items);
		    var socketio = req.app.get('socketio'); // take out socket instance from the app container
		    socketio.sockets.emit('notify', data[0]); // emit an event for all connected client
		    console.log('Realizando el envio de email +++++++++++++++++++++++++++++');
		    var mails ='';
		  for(var i in items){
		    if(items[i].email){
		      if(items[i].notificaciones && items[i].notificaciones !== 'false'){
                        console.log('Un email:');
                        console.log(items[i].email);
                        console.log('Un email end...')
		    	mails += items[i].email+',';
		      }
		    }
		    }
                  console.log('losmails...');
                  console.log(mails);
                  console.log('losmails... end');
		    	console.log('Realizando el envio de email +++++++++++++++++++++++++++++');
		    	console.log(mails);
			    res.render('templates/notify-email', {
					user_screen_name: notificacion.screen_name,
					user_image: notificacion.profile_image,
					created_time: req.body.fecha,
					cuenta : notificacion.cuenta,
					text : notificacion.text,
					industria : notificacion.razon,
					appName: config.app.title,
					url: 'https://'+req.headers.host+'/#!/feeds/getMailBox?colec='+notificacion.coleccion+'&mo_id='+notificacion.mongo_id+'&not_id='+data[0]._id
				}, function(err, emailHTML) {
					var smtpTransport = nodemailer.createTransport(config.mailer.options);
				    var mailOptions = {
						to: mails,
						//from: config.mailer.from,
						from: 'Likeable CRM <crm@likeable.mx>',				
						//subject: 'Password Reset',
						subject: 'Influencer '+notificacion.screen_name,				
						html: emailHTML
					};
					smtpTransport.sendMail(mailOptions, function(err) {
					    if (!err) {
						console.log('email enviado correctamente !');
						res.jsonp('ok');
					    }
					    else {
						res.jsonp('error');
					    }
					// res.jsonp('ok');
					});
				});	    
		}
	    });
	}

    });
	//console.log(req.socket);
	//req.socket.emit('notify', 'Hola notify');
};
exports.nuevoMensaje= function(req, res){
	console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- Obteniendo Mensajes Diarios +-+-+-+-+-+-+-+-+-+-+-+-+-');
	console.log(req.body);
	var obj = req.body.obj;
	var tipo = req.body.tipo;
	var created = req.body.created_time;
	var cuenta = req.body.cuenta;
	if(obj && tipo && created && cuenta){
		var data = {
			obj:obj,
			tipo:tipo,
			created_time:created,
			cuenta: cuenta
		};
		var socketio = req.app.get('socketio'); // take out socket instance from the app container
		socketio.sockets.in(cuenta).emit('mensajeNuevo', data); // emit an event for all connected client
	}

	res.jsonp({code:200,message:"Post recibido"});
}
exports.obtieneDesempenioDiario = function(req, res){
	var coleccion = req.body.cuenta+'_consolidada';
	var idUsuario = req.body.idUsuario;
	var hoy = new Date().getDate();
	var timestamp = new Date().setDate(hoy);
	var start_date = new Date(timestamp); start_date.setHours(0); start_date.setMinutes(0); start_date.setSeconds(0);
	var fechaActual = new Date(timestamp); fechaActual.getHours(); fechaActual.getMinutes(); fechaActual.getSeconds();
	var criterio = {$or: [ 
		{$and: [
				{'atendido':{$exists:true}},
				{'atendido.usuario_id' : idUsuario},
				{'atendido.fecha' : {$gte : start_date}},
				{'atendido.fecha': {$lte : fechaActual}}
			]},
			{$and : [
		    		{'descartado.idUsuario' : idUsuario},
		  			{'descartado.fecha' : {$gte : start_date}},
		    		{'descartado.fecha' : {$lte : fechaActual}}
			]}
		]
	};	
	classdb.count(coleccion, criterio, 'core/obtieneDesempenioDiario', function(total){
	    res.jsonp(total);
	});
};
