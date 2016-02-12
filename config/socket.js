var socketio = require('socket.io');
var classdb = require('./classdb.js');
var ObjectID = require('mongodb').ObjectID;
var Expire = require('./expire.js');
var ttl = new Expire(600);

module.exports = {
	startSocketServer: function(server, app){
		var io = socketio.listen(server);
		app.set('socketio', io);
		app.set('server', server);
		ttl.on('inGroupExpired', function(data){
			var element = data.value;
			io.sockets.in(data.group).emit('libera',{cuenta: data.group, _id:element._id});
		});

		io.on('connection', function (socket) {
			var cuenta_room = socket.handshake.query.cuenta;
			if(!cuenta_room){
				return;
			}
			socket.join(cuenta_room);
			socket.on('disconnect', function() {
				delete socket.$events;
				delete socket.nsp.sockets[this.id];
	   			console.log('user disconnected');
			    console.log('Got disconnect!');

		   });
			var elements = (ttl.getForGroupValues(cuenta_room))?ttl.getForGroupValues(cuenta_room):new Array();
			io.sockets.in(cuenta_room).emit('iniciaSocket', elements);
			socket.on('socketAsignaServer', function(data){
				io.sockets.emit('socketAsignaFront', data);
			});
		    socket.on('idBloquea', function(data){
				var id_bloquear = data._id;
				var fecha =  new Date();
				var minutos = fecha.getMinutes();
				var cuenta = data.cuenta;
				var existe_cuenta = false;
				var aux;
				var obj = {
					_id: data._id,
					fecha: new Date(),
					origin_minute: minutos,
					user: data.user,
					user_id: data.user_id,
					user_image: data.user_image
				};

				aux = data.id;
				data.origin_minute = minutos;
				ttl.setByGroup(cuenta,cuenta+'_'+data._id,obj, 300000);
				io.sockets.in(cuenta).emit('bloquea',data);
			});
			socket.on('ocupaNotificacion', function(id_notificacion){
				io.sockets.emit('bloqueaNotificacion', id_notificacion);
			});
			socket.on('postFinalizado', function(id_finalizar){
				io.sockets.emit('ocultaPost',id_finalizar);
			});
			socket.on('liberaOcupado', function(data){
				console.log('Libearando ocupado');
				console.log(socket.id);
				var id = data._id
				var cuenta = data.cuenta;
				var id_liberar = id;
				ttl.delForGroup(cuenta,cuenta+'_'+id,function(err, data){
					if(err){
						console.log(err);
					}else{
						console.log('Borramos el elemento');
						console.log(data);
					}
				});
				io.sockets.in(cuenta).emit('libera',{cuenta:cuenta ,_id:id_liberar});
			});
			socket.on('tiempoRealServer', function(obj_actualizar){
				io.sockets.in(obj_actualizar.cuenta).emit('tiempoRealFront', obj_actualizar);
			});
			/*socket.on('actualizaClasificacion', function(clasificacion){
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
			});*/
			socket.on('eliminaNotificacion', function(id_notificacion){
				if(id_notificacion){
				    var critere = {$or:[{'_id': new ObjectID(id_notificacion)},{mongo_id:id_notificacion.toString()}]};
				    classdb.remove('notificaciones', critere, 'express/.main', function(removed){
					if (removed === 'error') {
					    console.log('Error al borrar la notificación');
					}
					else {
					    io.sockets.emit('quitaNotificacion', id_notificacion);
					}
				    });
				}else{
					console.log('id_notificacion venia vacio');
				}
			});
			socket.on('actualizaTemasServer', function(cuenta){
				io.sockets.in(cuenta).emit('actualizaTemasFront');
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
	}
}