'use strict';

//Dependencias que se van a utilizar
var _ = require('lodash'),
    errorHandler = require('../errors'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User');

var http=require('http');
var https=require('https');
var ObjectId=require('mongodb').ObjectID;

var bst = require('better-stack-traces').install();
var globales = require('../../../config/globals.js');
var classdb = require('../../../config/classdb.js');


exports.listAccounts=function(req,res){
    classdb.buscarToArray('accounts', {}, {}, 'users/listAccounts', function(items){
		if (items === 'error') {
	    	res.jsonp(0);
		}
		else {
	    	res.jsonp(items);
		}
    });
};
/*
  _ _     _            _       ______            _             
 | (_)   | |          | |     |  ____|          (_)            
 | |_ ___| |_ __ _  __| | ___ | |__   __ _ _   _ _ _ __   ___  
 | | / __| __/ _` |/ _` |/ _ \|  __| / _` | | | | | '_ \ / _ \ 
 | | \__ \ || (_| | (_| | (_) | |___| (_| | |_| | | |_) | (_) |
 |_|_|___/\__\__,_|\__,_|\___/|______\__, |\__,_|_| .__/ \___/ 
                                        | |       | |          
                                        |_|       |_|          
*/
//función que muestra el listado de los usuarios en la pestaña EQUIPO
exports.listadoEquipo=function(req,res){
    var cuenta=req.body.cuenta;
    var idCuenta=req.body.idCuenta;
    var criterius = {'cuenta._id':req.body.idCuenta};
    classdb.buscarToArray('users', criterius, {}, 'users/listadoEquipo', function(items){
		if (items === 'error') {
	    	res.jsonp(items);
		}
		else {
			var equipo = [];
	    	for(var i = 0; i < items.length; i++){
				equipo[i] = items[i];
	    	}
	    	var byName = equipo.slice(0);
	    	byName.sort(function(a,b) {
    			var x = a.displayName.toLowerCase();
    			var y = b.displayName.toLowerCase();
    			return x < y ? -1 : x > y ? 1 : 0;
	    	});
	    	res.jsonp(byName);
		}
    });
};
/*
                 _   _ _     _            _       ______            _             
                | | | (_)   | |          | |     |  ____|          (_)            
   ___ _ __   __| | | |_ ___| |_ __ _  __| | ___ | |__   __ _ _   _ _ _ __   ___  
  / _ \ '_ \ / _` | | | / __| __/ _` |/ _` |/ _ \|  __| / _` | | | | | '_ \ / _ \ 
 |  __/ | | | (_| | | | \__ \ || (_| | (_| | (_) | |___| (_| | |_| | | |_) | (_) |
  \___|_| |_|\__,_| |_|_|___/\__\__,_|\__,_|\___/|______\__, |\__,_|_| .__/ \___/ 
                                                           | |       | |          
                                                           |_|       |_|          
*/

exports.listadoUsuarios=function(req,res){
    classdb.buscarToArray('users', {}, {}, 'users/listadoUsuarios', function(items){
		res.jsonp(items);
    });
};

/*
       _ _           _             ______            _             
      | (_)         (_)           |  ____|          (_)            
   ___| |_ _ __ ___  _ _ __   __ _| |__   __ _ _   _ _ _ __   ___  
  / _ \ | | '_ ` _ \| | '_ \ / _` |  __| / _` | | | | | '_ \ / _ \ 
 |  __/ | | | | | | | | | | | (_| | |___| (_| | |_| | | |_) | (_) |
  \___|_|_|_| |_| |_|_|_| |_|\__,_|______\__, |\__,_|_| .__/ \___/ 
                                            | |       | |          
                                            |_|       |_|          
*/
//Función que elimina a un usuario de la cuenta en la pestaña EQUIPO
exports.eliminaEquipo=function(req,res){
    var cuenta = req.body.cuenta;
    var id = new ObjectId(req.body.idUsuario);
    var criterius = {_id : id};
    classdb.remove('users', criterius, 'users/eliminaEquipo', function(elimina){
		if (elimina === 'error') {
	    	res.jsonp(0);
		}
		else {
	    	res.jsonp(1);
		}
    });
};
/*
                 _        _ _           _             ______            _             
                | |      | (_)         (_)           |  ____|          (_)            
   ___ _ __   __| |   ___| |_ _ __ ___  _ _ __   __ _| |__   __ _ _   _ _ _ __   ___  
  / _ \ '_ \ / _` |  / _ \ | | '_ ` _ \| | '_ \ / _` |  __| / _` | | | | | '_ \ / _ \ 
 |  __/ | | | (_| | |  __/ | | | | | | | | | | | (_| | |___| (_| | |_| | | |_) | (_) |
  \___|_| |_|\__,_|  \___|_|_|_| |_| |_|_|_| |_|\__,_|______\__, |\__,_|_| .__/ \___/ 
                                                               | |       | |          
                                                               |_|       |_|          
             _               _ _          _____           __ _ _ 
            | |             | (_)        |  __ \         / _(_) |
   __ _  ___| |_ _   _  __ _| |_ ______ _| |__) |__ _ __| |_ _| |
  / _` |/ __| __| | | |/ _` | | |_  / _` |  ___/ _ \ '__|  _| | |
 | (_| | (__| |_| |_| | (_| | | |/ / (_| | |  |  __/ |  | | | | |
  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_|   \___|_|  |_| |_|_|
                                                                 
*/
//Método que sirve para actualizar la información del usuario ubicado en la pestaña de Perfil
exports.actualizaPerfil = function(req,res){
	//console.log('ActualizandoaNDO');
	//console.log(req.body);
    var id = new ObjectId(req.body.idUsuario);
    var criterius = {_id : id};
    var elset = {
		'displayName' : req.body.nombre+' '+req.body.apellido,
		'username' : req.body.nickname,
		'email' : req.body.correo,
		'lastName' : req.body.apellido,
		'firstName' : req.body.nombre,
		'roles':[req.body.rol],
		'notificaciones': req.body.notificaciones,
		'dailyreport' : req.body.dailyreport
    };
    //console.log(req.body);
    classdb.actualizacresult('users', criterius, elset, 'users/actualizaPerfil', function(actual){
		if (actual === 'error') {
	    	res.jsonp(0);
		}
		else {
	    	classdb.buscarToArray('users', criterius, {}, 'users/actualizaPerfil', function(items){
				if (items === 'error') {
		    		res.jsonp(1);
				}
				else {
		    		res.jsonp(items);
				}
	    	});
		}
    });
};
/*
                 _              _               _ _          _____           __ _ _ 
                | |            | |             | (_)        |  __ \         / _(_) |
   ___ _ __   __| |   __ _  ___| |_ _   _  __ _| |_ ______ _| |__) |__ _ __| |_ _| |
  / _ \ '_ \ / _` |  / _` |/ __| __| | | |/ _` | | |_  / _` |  ___/ _ \ '__|  _| | |
 |  __/ | | | (_| | | (_| | (__| |_| |_| | (_| | | |/ / (_| | |  |  __/ |  | | | | |
  \___|_| |_|\__,_|  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_|   \___|_|  |_| |_|_|

             _               _ _          ______    _        
            | |             | (_)        |  ____|  | |       
   __ _  ___| |_ _   _  __ _| |_ ______ _| |__ ___ | |_ ___  
  / _` |/ __| __| | | |/ _` | | |_  / _` |  __/ _ \| __/ _ \ 
 | (_| | (__| |_| |_| | (_| | | |/ / (_| | | | (_) | || (_) |
  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_|  \___/ \__\___/ 
                                                             
*/
//Actualiza la foto de perfil del usuario
exports.actualizaFoto = function(req, res){
    var multiparty = require('multiparty');
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files){
	//console.log(fields.idUsuario[0]);
	var fs = require('fs');
	if (typeof files.file !== 'undefined') {
	    var img = files.file[0];
	    console.log('ID DE USUARIOS');
	    console.log(fields.idUsuario[0]);
	    console.log('TODO EL OBJETO');
	    console.log(fields.idUsuario);
	    console.log(fields);
	    console.log('TIPO');
	    console.log(typeof fields.idUsuario[0]);
	    console.log('QUERY RARO ');
	    console.log(Object.prototype.toString.call(fields.idUsuario[0]));
	    var id;
	    if(fields.idUsuario[0]){
	    	if(Object.prototype.toString.call(fields.idUsuario[0]) === '[object String]'){
		    console.log(fields.idUsuario[0]);
		    if (fields.idUsuario[0] !== 'undefined') {
	    		id = new ObjectId(fields.idUsuario[0]);
		    }
		    else {
			res.jsonp(2);
			return;
		    }
	    	}else if(Object.prototype.toString.call(fields.idUsuario[0]) === '[object Object]'){
	    	    id = fields.idUsuario[0];
	    	}
	    }else{
	    	res.jsonp(2);
		return;
	    }
	    
	    fs.readFile(img.path,function(err,data){
		var path = './public/images/profile/'+img.originalFilename;
		var src_imagen = 'images/profile/'+img.originalFilename;
		fs.writeFile(path,data,function(err){
		    if(err){
			console.log(err);
			res.jsonp(1);
			return;
		    }else{
			var criterius = {_id : id};
			var elset = {imagen_path : path, imagen_src : src_imagen};
			classdb.actualiza('users', criterius, elset, 'users/actualizaFoto', function(actuale){
			    if (actuale === 'error') {
				res.jsonp(2);
				return;
			    }
			    else {
				classdb.buscarToArray('users', criterius, {}, 'users/actualizaFoto', function(usuario){
				    if (usuario === 'error') {
					res.jsonp(2);
					return;
				    }
				    else {
					res.jsonp(usuario);
					return;
				    }
				});
			    }
			});
		    }
		});
	    });
	}
	else {
	    res.jsonp('error subiendo imagen');
	    return;
	}
    });
};
/*
                 _              _               _ _          ______    _        
                | |            | |             | (_)        |  ____|  | |       
   ___ _ __   __| |   __ _  ___| |_ _   _  __ _| |_ ______ _| |__ ___ | |_ ___  
  / _ \ '_ \ / _` |  / _` |/ __| __| | | |/ _` | | |_  / _` |  __/ _ \| __/ _ \ 
 |  __/ | | | (_| | | (_| | (__| |_| |_| | (_| | | |/ / (_| | | | (_) | || (_) |
  \___|_| |_|\__,_|  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|_|  \___/ \__\___/ 
             _               _ _          ______            _             
            | |             | (_)        |  ____|          (_)            
   __ _  ___| |_ _   _  __ _| |_ ______ _| |__   __ _ _   _ _ _ __   ___  
  / _` |/ __| __| | | |/ _` | | |_  / _` |  __| / _` | | | | | '_ \ / _ \ 
 | (_| | (__| |_| |_| | (_| | | |/ / (_| | |___| (_| | |_| | | |_) | (_) |
  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|______\__, |\__,_|_| .__/ \___/ 
                                                   | |       | |          
                                                   |_|       |_|                                                                                        
*/
//función que actualiza la información de cada usuario de la cuenta en la parte de EQUIPO
exports.actualizaEquipo=function(req,res){
    var rol = req.body.rol;
    var id = new ObjectId(req.body.idUsuario);
    var nombre = req.body.nombre;
    var apellido = req.body.apellido;
    var correo = req.body.correo;
    var criterius = {_id : id};
    var nombreCompleto = nombre+' '+apellido;
    var elset = {'firstName' : nombre, 'lastName' : apellido, 'email' : correo, 'displayName' : nombreCompleto, roles: [req.body.rol]};
    classdb.actualiza('users', criterius, elset, 'users/actualizaEquipo', function(actual){
		if (actual === 'error') {
	    	res.jsonp(0);
		}
		else {
	    	res.jsonp(1);
		}
    });
};
/*
                 _              _               _ _          ______            _             
                | |            | |             | (_)        |  ____|          (_)            
   ___ _ __   __| |   __ _  ___| |_ _   _  __ _| |_ ______ _| |__   __ _ _   _ _ _ __   ___  
  / _ \ '_ \ / _` |  / _` |/ __| __| | | |/ _` | | |_  / _` |  __| / _` | | | | | '_ \ / _ \ 
 |  __/ | | | (_| | | (_| | (__| |_| |_| | (_| | | |/ / (_| | |___| (_| | |_| | | |_) | (_) |
  \___|_| |_|\__,_|  \__,_|\___|\__|\__,_|\__,_|_|_/___\__,_|______\__, |\__,_|_| .__/ \___/ 
                                                                      | |       | |          
                                                                      |_|       |_|          
*/
/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;
    
    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;

    // Then save the user 
    user.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    // Remove sensitive data before login
	    user.password = undefined;
	    user.salt = undefined;

	    req.login(user, function(err) {
		if (err) {
		    res.status(400).send(err);
		} else {
		    res.jsonp(user);
		}
	    });
	}
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
	    	res.jsonp(info);
	    	//res.status(400).send(info);
		} else {
	    	// Remove sensitive data before login
	    	user.password = undefined;
	    	user.salt = undefined;
	    	req.login(user, function(err) {
				if (err) {
		    		res.status(400).send(err);
				} else {
		    		res.jsonp(user);
				}
	    	});
		}
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};
	/**
 * List of Accounts
 */
exports.list = function(req, res) { 
    User.find().sort('-created').populate('user', 'displayName').exec(function(err, accounts) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(accounts);
	}
    });
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
	passport.authenticate(strategy, function(err, user, redirectURL) {
	    redirectURL = '/#!/home';
	  if (err || !user) {
	    console.log('****************** ERROR LOGIN **************************');
	    console.log(req.body);
	    console.log('****************** ERROR LOGIN **************************');
	    return res.redirect('/#!/signin');
	  }
	  req.login(user, function(err) {
	    if (err) {
	      console.log('****************** ERROR LOGIN **************************');
	      console.log(req.body);
	      console.log('****************** ERROR LOGIN **************************');
	      return res.redirect('/#!/signin');
	    }
	    return res.redirect(redirectURL || '/#!/home');
	  });
	})(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
    if (!req.user) {
	// Define a search query fields
	var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
	var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;
	
	// Define main provider search query
	var mainProviderSearchQuery = {};
	mainProviderSearchQuery.provider = providerUserProfile.provider;
	mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

	// Define additional provider search query
	var additionalProviderSearchQuery = {};
	additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

	// Define a search query to find existing user with current provider profile
	var searchQuery = {
	    $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
	};

	User.findOne(searchQuery, function(err, user) {
	    if (err) {
		return done(err);
	    } else {
		if (!user) {
		    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
		    User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
			user = new User({
			    firstName: providerUserProfile.firstName,
			    lastName: providerUserProfile.lastName,
			    username: availableUsername,
			    displayName: providerUserProfile.displayName,
			    email: providerUserProfile.email,
			    provider: providerUserProfile.provider,
			    providerData: providerUserProfile.providerData
			});

			// And save the user
			user.save(function(err) {
			    return done(err, user);
			});
		    });
		} else {
		    return done(err, user);
		}
	    }
	});
    } else {
	// User is already logged in, join the provider data to the existing user
	var user = req.user;
	var globals = globales;
	
	// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
	if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
	    // Add the provider data to the additional provider data field
	    if (!user.additionalProvidersData) user.additionalProvidersData = {};
	    user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;
	    
	    // Then tell mongoose that we've updated the additionalProvidersData field
	    user.markModified('additionalProvidersData');
	    
	    // And save the user
	    user.save(function(err) {
		return done(err, user, '/#!/settings/accounts');
	    });
	} else {
	    return done(new Error('User is already connected using this provider'), user);
	}
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
	// Delete the additional provider
	if (user.additionalProvidersData[provider]) {	    
	    // Then tell mongoose that we've updated the additionalProvidersData field
	    user.markModified('additionalProvidersData');
	}
	
	user.save(function(err) {
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		req.login(user, function(err) {
		    if (err) {
			res.status(400).send(err);
		    } else {
			res.jsonp(user);
		    }
		});
	    }
	});
    }
};
