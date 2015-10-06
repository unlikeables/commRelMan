'use strict';

/**
 * Module dependencies.
 */
var bst = require('better-stack-traces').install();
var _ = require('lodash'),
    errorHandler = require('../errors'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Account = mongoose.model('Account'),
    User = mongoose.model('User');

var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;

/**
 * Update user details
 */
exports.marcaByID = function(req, res, next, id){
    Account
	.findById(id,{nombreSistema:1})
	.populate('user', 'displayName')
	.exec(function(err, user) {
	    if (err) return next(err);
	    if (!user) return next(new Error('Failed to load article ' + id));
	    req.user = user;
	    next();
	});
};

exports.accountRead = function(req,res){
    res.jsonp(req.user);
};

exports.update = function(req, res) {
	//console.log('Actualizara el perfil del usuario');
    // Init Variables
    var user = req.user;
    var message = null;
    // For security measurement we remove the roles from the req.body object
    //delete req.body.roles; 
    //delete req.body.password;
    //delete req.body.salt;
    if (user) {
	// Merge existing user
	user = _.extend(user, req.body);
	user.updated = Date.now();
	// user.displayName = user.firstName + ' ' + user.lastName;
	user.save(function(err) {
	    if (err) {
		console.log(err);
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		console.log(user);
		res.jsonp(user);
		//comentado por que al editar creaba la sesion del usuario editado
		// req.login(user, function(err) {
		// if (err) {
		// res.status(400).send(err);
		// } else {
		// res.jsonp(user);
		// }
		// });
	    }
	});
    } else {
	res.status(400).send({
	    message: 'User is not signed in'
	});
    }
};


/**
 * List of Accounts
 */
exports.cuentas = function(req, res) { 
    Account
	.find({},{'nombreSistema':1})
	.sort('-created')
	.populate('user', 'displayName')
	.exec(function(err, accounts) {
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
			res.json(accounts);
	    }
	});
};

/**
 * List of Accounts
 */
exports.list = function(req, res) { 
    var vistas;
    switch(req.user.roles[0]){
    case 'account-manager':
	User
	    .find({ $or: [ {roles: 'account-manager'},{roles: 'community-manager'},{roles:'directivo'},{roles:'user'}] })
	    .sort('-created')
	    .populate('user', 'displayName')
	    .exec(function(err, accounts) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(accounts);
		}
	    });
	break;
    case 'app-manager':
	User
	    .find({ $or: [{roles:'app-manager'},{roles:'account-manager'},{roles:'community-manager'},{roles:'directivo'},{roles:'user'}] })
	    .sort('-created')
	    .populate('user', 'displayName')
	    .exec(function(err, accounts) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(accounts);
		}
	    });
	break;
    }
};

/**
* List of users by account
*/
exports.listbyaccount = function(req, res) {
    var usuarios = {};
    for (var i = 0; i < req.users.length; ++i) {
	usuarios[i] = req.users[i];
    }
    res.json(usuarios);
};

/**
 * Show the current Account
 */
exports.read = function(req, res) {
    res.jsonp(req.user);
};
/**
* Users by account
*/
exports.usersByAccount = function(req, res, next, account) {
    User
	.find({'cuenta._id': account})
	.sort('-created')
	.populate('users', 'displayName')
	.exec(function(err, usuarios) {
	    if (err) {return res.status(400).send({message: errorHandler.getErrorMessage(err)});}
	    else {req.users = usuarios; next();}
	});
};

/**
 * Article middleware
 */
exports.userByID = function(req, res, next, id) {
    User.findById(id).populate('user', 'displayName').exec(function(err, user) {
	if (err) return next(err);
	if (!user) return next(new Error('Failed to load article ' + id));
	req.user = user;
	next();
    });
};

/**
 * Delete an Account
 */
exports.delete = function(req, res) {	
    var user = req.user;
    user
	.remove(function(err) {
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		res.jsonp(user);
	    }
	});
};

/**
 * Account authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    //console.log(req.user.roles[0]);	
    if (req.user.id !== req.user.id) {
	//if(req.user.roles[0] !=='admin'){
	return res.status(403).send('User is not authorized');
    }
    next();
};

/**
 * Create a Account
 */
exports.create = function(req, res) {
    var user = new User(req.body);
    //account.user = req.user;
    user
	.save(function(err) {
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		res.jsonp(user);
	    }
	});
};
/**
 * Toma usuarios por cuenta
 */
exports.getUsuariosByAccount = function(req, res){
	var cuenta = req.query.cuenta;
	var less_user = req.query.user;
	console.log(cuenta);
	console.log(less_user);
	User
	    .find({$and:[{'cuenta.marca':cuenta},{_id:{$ne:less_user}}]})
	    //.find({'cuenta.marca':cuenta})
	    .sort('-created')
	    .populate('user', 'displayName')
	    .exec(function(err, accounts) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
			console.log(accounts);
		    res.jsonp(accounts);
		}
	});
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};
