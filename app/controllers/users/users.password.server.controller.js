'use strict';

/**
 * Module dependencies.
 */
var bst = require('better-stack-traces').install();
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	async = require('async'),
	crypto = require('crypto');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function(token, done) {
			if (req.body.username) {
				User.findOne({
					username: req.body.username
				}, '-salt -password', function(err, user) {
					if (!user) {
						return res.status(400).send({
							//message: 'No account with that username has been found'
							message: 'No se ha encontrado ninguna cuenta con ese nombre de usuario'
						});
					} else if (user.provider !== 'local') {
						return res.status(400).send({
							message: 'It seems like you signed up using your ' + user.provider + ' account'
						});
					} else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save(function(err) {
							done(err, token, user);
						});
					}
				});
			} else {
				return res.status(400).send({
					//message: 'Username field must not be blank'
					message: 'El campo de usuario no puede estar vacío'
				});
			}
		},
		function(token, user, done) {
			res.render('templates/reset-password-email', {
				name: user.displayName,
				appName: config.app.title,
				url: 'http://' + req.headers.host + '/auth/reset/' + token
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			console.log(config.mailer.options);
			var smtpTransport = nodemailer.createTransport(config.mailer.options);
			var mailOptions = {
				to: user.email,
				//from: config.mailer.from,
				from: 'Likeable CRM <crm@likeable.mx>',				
				//subject: 'Password Reset',
				subject: 'Recuperación de Contraseña',				
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				if (!err) {
					res.send({
//						message: 'An email has been sent to ' + user.email + ' with further instructions.'
						message: 'Se ha mandado un email a ' + user.email + ' con las instrucciones correspondientes.'
					});
				}

				done(err);
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function(err, user) {
		if (!user) {
			return res.redirect('/#!/password/reset/invalid');
		}

		res.redirect('/#!/password/reset/' + req.params.token);
	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
	// Init Variables
	console.log(req.body);
	var passwordDetails = req.body;
	console.log('UPDETEANDO PASS ');

	async.waterfall([

		function(done) {
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function(err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

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
										// Return authenticated user 
										res.jsonp(user);

										done(err, user);
									}
								});
							}
						});
					} else {
						return res.status(400).send({
							message: 'Las contraseñas no son iguales'
						});
					}
				} else {
					return res.status(400).send({
						message: 'La solicitud de cambio de contraseña ha expirado, por favor vuelva a intentar.'
					});
				}
			});
		},
		function(user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.displayName,
				appName: config.app.title
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var smtpTransport = nodemailer.createTransport(config.mailer.options);
			var mailOptions = {
				to: user.email,
				from: 'Likeable CRM <crm@likeable.mx>',
				//from: config.mailer.from,
				subject: 'Contraseña actualizada',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
	// Init Variables
	var passwordDetails = req.body;
	if (req.user) {
		if (passwordDetails.newPassword) {
			User.findById(req.user.id, function(err, user) {
				if (!err && user) {
					if (user.authenticate(passwordDetails.currentPassword)) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
							user.password = passwordDetails.newPassword;
							user.save(function(err) {
								if (err) {
										//El password es demasiado corto
										var opcion=1;
										res.jsonp(opcion);
									//console.log(err);
									//console.log('Ha entrado al qui');
									//return res.status(400).send({
									//	message: errorHandler.getErrorMessage(err)
									//});
								} else {
									req.login(user, function(err) {
										if (err) {
											console.log('sEGUNDO IF');
											console.log(err);
											//res.status(400).send(err);
										} else {
											var opcion=4;
											res.jsonp(opcion);
											//res.send({
											//	message: 'Password changed successfully'
											//});
										}
									});
								}
							});
						} else {
							//Los passwords no so iguales
							var opcion=3;
							res.jsonp(opcion);
							//res.status(400).send({
							//	message: 'Passwords do not match'
							//});
						}
					} else {
						var op=2;
						//res.status(400).send({
						//	message: 'Current password is incorrect'
						//});
						//El password actual es incorrecto.
						res.jsonp(op);
					}
				} else {
					var opc=5;
					res.jsonp(opc);
					//res.status(400).send({
					//	message: 'User is not found'
					//});
				}
			});
		} else {
			//res.status(400).send({
			//	message: 'Please provide a new password'
			//});
			var opcion=6;
			res.jsonp(opcion);
		}
	} else {
		var option=7;
		res.jsonp(option);
		//res.status(400).send({
		//	message: 'User is not signed in'
		//});
	}
};


exports.changePasswordAdmin = function(req, res) {
    // Init Variables
    var passwordDetails = req.body;
    var opcion = 0;
    if (req.body.idUsuario) {
	if (req.body.passwordDetails.newPassword) {
	    User.findById(req.body.idUsuario, function(err, user) {
		if (!err && user) {
		    //if (user.authenticate(passwordDetails.currentPassword)) {
		    if (req.body.passwordDetails.newPassword === req.body.passwordDetails.verifyPassword) {
			user.password = req.body.passwordDetails.newPassword;
			console.log(user);
			user.save(function(err) {
			    if (err) {
				//El password es demasiado corto
				opcion=1;
				res.jsonp(opcion);
				//console.log(err);
				//console.log('Ha entrado al qui');
				//return res.status(400).send({
				//	message: errorHandler.getErrorMessage(err)
				//});
			    } else {
				//req.login(user, function(err) {
				//	if (err) {
				//		console.log('sEGUNDO IF');
				//		console.log(err);
				//res.status(400).send(err);
				//	} else {
				opcion=4;
				res.jsonp(opcion);
				//res.send({
				//	message: 'Password changed successfully'
				//});
				//	}
				//});
			    }
			});
		    } else {
			//Los passwords no so iguales
			opcion=3;
			res.jsonp(opcion);
			//res.status(400).send({
			//	message: 'Passwords do not match'
			//});
		    }
		    //} else {
		    //	var op=2;
		    //res.status(400).send({
		    //	message: 'Current password is incorrect'
		    //});
		    //El password actual es incorrecto.
		    //	res.jsonp(op);
		    //}
		} else {
		    opcion=5;
		    res.jsonp(opcion);
		    //res.status(400).send({
		    //	message: 'User is not found'
		    //});
		}
	    });
	} else {
	    //res.status(400).send({
	    //	message: 'Please provide a new password'
	    //});
	    opcion=6;
	    res.jsonp(opcion);
	}
    } else {
	opcion=7;
	res.jsonp(opcion);
	//res.status(400).send({
	//	message: 'User is not signed in'
	//});
    }
};
