'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')({
	session: session
    }),
    flash = require('connect-flash'),
    config = require('./config'),
    consolidate = require('consolidate'),
    path = require('path');
var classdb = require('./classdb.js');
var ObjectID = require('mongodb').ObjectID;
	module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));	

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Enable jsonp
	app.enable('jsonp callback');

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});
	var server = http.createServer(app);
	var io = socketio.listen(server);
	app.set('socketio', io);
	app.set('server', server);
	console.log('Conceccion del socket en server');
	var elements = [];
	var caducar = setInterval(function(){
		console.log(elements);
	    var ahora = new Date().getTime();
	    var borrar = new Array();
	    var fecha_actual = new Date();
	    for(var i in elements) {

	    	console.log(elements[i]);

	 		for(var j in elements[i].ocupados){
	 			console.log(j);
	 			console.log(elements[i].ocupados[j]);
	 			if( (fecha_actual.getMinutes() - elements[i].ocupados[j].origin_minute) < 0 ){
			  	    if( ((60+fecha_actual.getMinutes()) - elements[i].ocupados[j].origin_minute) >= 5 ){
				//libera notificacion
						console.log('liberando la notificacion');
						console.log(elements);
						for(var m = 0; m < elements.length; m++){
				   			if(elements[m]._id === elements[i]._id){
				   				borrar.push({ cuenta: elements[i].cuenta, _id:elements[i].ocupados[j]._id});
								//io.sockets.emit('libera',elements[i]._id);
								//elements.splice(m,1);
							}
						}
			    	}
				}else{
			    	if( (fecha_actual.getMinutes() - elements[i].ocupados[j].origin_minute) >= 5){
				//libera notificacion
						console.log('liberando la notificacion 60');
						console.log(elements);
						for(var m = 0; m < elements.length; m++){
				   			if(elements[m]._id === elements[i]._id){
				   				borrar.push({ cuenta: elements[i].cuenta, _id:elements[i].ocupados[j]._id});
								//io.sockets.emit('libera',elements[i]._id);
								//elements.splice(m,1);
							}
						}
					}
				}
	 		}

	 		console.log('BOrraR!');
	 		console.log(borrar);








			/*if( (fecha_actual.getMinutes() - elements[i].origin_minute) < 0 ){

		  	    if( ((60+fecha_actual.getMinutes()) - elements[i].origin_minute) >= 1 ){
			//libera notificacion
					console.log('liberando la notificacion');
					for(var l = 0; l < elements.length; l++){
				    	if(elements[l]._id === elements[i]._id){
							//io.sockets.emit('libera',elements[i]._id);
							//elements.splice(i,1);
				    	}
					}
		    	}
			}else{
		    	if( (fecha_actual.getMinutes() - elements[i].origin_minute) >= 1){
			//libera notificacion
					console.log('liberando la notificacion');
					for(var m = 0; m < elements.length; m++){
			   			if(elements[m]._id === elements[i]._id){
			   				borrar.push(elements[i]._id);
							//io.sockets.emit('libera',elements[i]._id);
							//elements.splice(m,1);
						}
					}
				}
			}*/
		}




		for(var i in borrar){
			for(var j in elements){
				console.log(borrar[i].cuenta+' === '+elements[j].cuenta);
				if(borrar[i].cuenta === elements[j].cuenta){
					for(var k in elements[j].ocupados){
						if(elements[j].ocupados[k]._id === borrar[i]._id){
							console.log('Eliminando');
							io.sockets.emit('libera',{cuenta: elements[j].cuenta, _id:elements[j].ocupados[k]._id});	
							elements[j].ocupados.splice(k,1);
						}
					}
					//io.sockets.emit('libera',elements[j]._id);	
					//elements.splice(j,1);
				}
			}
	    }
    
		console.log(borrar);
	}, 30000);

	io.on('connection', function (socket) {
		socket.emit('iniciaSocket', elements);
		socket.on('getData', function(){
			socket.emit('iniciaSocket', elements);
		});
		socket.on('socketAsignaServer', function(data){
			io.sockets.emit('socketAsignaFront', data);
		});
	    socket.on('idBloquea', function(data){
	    	console.log(data);
			var id_bloquear = data._id;
			var fecha =  new Date();
			var minutos = fecha.getMinutes();
			var cuenta = data.cuenta;
			var existe_cuenta = false;

			var obj = {
				_id: data._id,
				fecha: new Date(),
				origin_minute: minutos,
				user: data.user,
				user_image: data.user_image
			};


			for(var i in elements){
				if(elements[i].cuenta === data.cuenta){
					elements[i].ocupados.push(obj);
					existe_cuenta = true;
				}
			}

			if(!existe_cuenta){
				elements.push({cuenta:data.cuenta, ocupados: [obj]});
				existe_cuenta = false;
			}

			data.origin_minute = minutos;
			//elements.push(data);
			io.sockets.emit('bloquea',data);
		});
		socket.on('ocupaNotificacion', function(id_notificacion){
			io.sockets.emit('bloqueaNotificacion', id_notificacion);
		});
		socket.on('postFinalizado', function(id_finalizar){
			io.sockets.emit('ocultaPost',id_finalizar);
		});
		socket.on('liberaOcupado', function(data){
			console.log(data);
			console.log(data._id);
			console.log(data.cuenta);
			var id = data._id
			var cuenta = data.cuenta;
			var id_liberar = id;
			for(var l = 0; l < elements.length; l++){
				if(cuenta === elements[l].cuenta){
					for(var i in elements[l].ocupados){
						console.log('eliminando ');
						console.log(elements[l].ocupados[i]+' === '+id_liberar);
						console.log(elements[l].ocupados[i]);
						if(elements[l].ocupados[i]._id === id_liberar){
							console.log('Eliminando');
							console.log(elements[l].ocupados);
							elements[l].ocupados.splice(i,1);
							console.log(elements[l].ocupados);
						}
					}
				}
				
			}
			io.sockets.emit('libera',{cuenta:cuenta ,_id:id_liberar});
			/*var id_liberar = id;
			for(var l = 0; l < elements.length; l++){
				if(elements[l]._id === id_liberar){
					elements.splice(l,1);
				}
			}
			io.sockets.emit('libera',id_liberar);*/
		});
		socket.on('tiempoRealServer', function(obj_actualizar){
			io.sockets.emit('tiempoRealFront',obj_actualizar);
		});
		socket.on('actualizaClasificacion', function(clasificacion){
			var id_liberar = clasificacion._id;
			console.log('Actualizando la clasificacion ');
			console.log(clasificacion);
			for(var l = 0; l < elements.length; l++){
				if(elements[l]._id === id_liberar){
					elements.splice(l,1);
				}
			}
			io.sockets.emit('libera',id_liberar);
			io.sockets.emit('actualizaClasificacionFront',clasificacion);
		});
		socket.on('eliminaNotificacion', function(id_notificacion){
			if(id_notificacion){
			    console.log('Eliminando notificacion en el server !!! ');
			    console.log(id_notificacion);
			    var critere = {$or:[{'_id': new ObjectID(id_notificacion)},{mongo_id:id_notificacion.toString()}]};
			    classdb.remove('notificaciones', critere, 'express/.main', function(removed){
				if (removed === 'error') {
				    console.log('Error al borrar la notificación');
				}
				else {
				    console.log('Notificacion eliminada');
				    io.sockets.emit('quitaNotificacion', id_notificacion);
				}
			    });
			}else{
				console.log('id_notificacion venia vacio');
			}
		});
		socket.on('getNotificaciones',function(id){
		    var criterium = {'usuarios._id': new ObjectID(id)};
		    classdb.buscarToArray('notificaciones', criterium, {}, 'express/.main', function(items) {
			if (items === 'error') {
			    console.log('Error al obtener notificaciones');
			}
			else {
			    if (items.length === 0) {
				console.log('No tiene notificaciones');
			    }
			    else {
				socket.emit('sendNotify', items);
			    }
			}
		    });
		});
	});
	return app;
};
