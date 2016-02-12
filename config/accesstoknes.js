'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var http=require('http');
var https=require('https');
var ObjectID = require('mongodb').ObjectID;
var bst = require('better-stack-traces').install();
var globales = require('./config/globals.js');
var classdb = require('./config/classdb.js');

/**
 * Función para obtener los accessTokens de nuestra app 
 * */
exports.obtieneAppAT = function(prefix, cawlbawck) {
  /**
   * Función para solicitar el access_token a facebook
   * @return {object} regresa un objeto de facebook, ya sea de error o con el access_token
   */
  function requestAT (callback) {
    var bmpString, access_token;
    var opciones = globales.options_graph;
    opciones.path = globales.fbapiversion+globales.path_app_at;
    opciones.method = 'GET';
    var solicitud = https.request(opciones, function(resp) {
	              var chunks = [];
	              resp.on('data', function(dati) {
		        chunks.push(dati);
	              }).on('end', function() {
		        var access_token = JSON.parse(Buffer.concat(chunks));
                        return callback(access_token);
	              });
	            });
    solicitud.end();
    solicitud.on('error', function(erra){
      var objeto = {};
      objeto.error = erra;
      console.log('accesstokens.server.controller/obtieneAppATint/requestAT - error en el request: '+erra);
      return callback(objeto);
    });
  }

  /**
   * Función para verificar si está on no el AT en mongo, y si está o no vigente, y en caso contrario mandar pedirlo
   * @return {string} regresa error o el access_token de la app
   */
  function getAppAT (callback) {
    // Primero pedimos access_token a mongo
    classdb.buscarToArray('verifica_at', {}, {}, 'accesstokens.server.controller/obtieneAppATint/getAppAT', function(items){
      if (items === 'error') {
	return callback(items);
      }
      else {
	if (items.length < 1) {
	  // Si no existe access_token en bd, lo pedimos a fb
	  requestAT(function(at) {
            if (at.error || typeof at === 'undefined' || typeof at.access_token === 'undefined') {
	      console.log('accesstokens.server.controller/obtieneAppATint/getAppAT - access_token error en request o venía vacío: '+at);
	      return callback('error');
	    }
	    else {
	      var objeto = {};
	      objeto = { at: 'access_token='+at.access_token, ts: new Date() };
	      classdb.inserta('verifica_at', objeto, 'accesstokens.server.controller/obtieneAppATint/getAppAT', function(respuesta){
		return callback('access_token='+at.access_token);
	      });
	    }
	  });		    
	}
	else {
          // Si existe access_token en bd, revisamos si sigue siendo válido
	  var ts = items[0].ts.getTime();
	  var tsm1 = (ts) + 3600000;
	  var ahora = new Date().getTime();
	  if (tsm1 < ahora) {
            // Si ya no es válido lo pedimos a facebook
	    requestAT(function(at) {
	      if (at.error || typeof at === 'undefined' || typeof at.access_token === 'undefined') {
		console.log('accesstokens.server.controller/obtieneAppATint/getAppAT - access_token error en request o venía vacío');
		return callback('error');
	      }
	      else {
		var criterio_actualizacion = { _id : items[0]._id };
		var objeto = {};
		objeto = { at: 'access_token='+at.access_token, ts: new Date() };
		classdb.actualiza('verifica_at', criterio_actualizacion, objeto, 'accesstokens.server.controller/obtieneAppATint/getAppAT', function(respuestau) {
		  return callback('access_token='+at.access_token);
		});
	      }
	    });
	  }
	  else {
	    // pero si sigue siendo válido lo regresamos desde la bd
	    return callback(items[0].at);
	  }
	}
      }
    });
  }
  getAppAT(function(token){
    if (token !== 'error') {
      if (prefix === 'no') {
        var sinpref = token.replace('access_token=','');
        return cawlbawck(sinpref);
      }
      else {
        return cawlbawck(token);
      }
    }
    else {
      return cawlbawck(token);
    }
  });
};


/**
 * Función para obtener el access_token de un usuario al azar (de entre todos los usuarios) de una cuenta específica
 **/
exports.obtieneUsrsAT = function(account, prefix, cuwlbuwck) {
  function obtieneUsuariosDeCuenta(cuenta, callback) {
    var userscritere = {
      $and: 
      [
	{'cuenta.marca' : cuenta},
	{'additionalProvidersData' : {$exists : true}},
	{'additionalProvidersData' : {$ne : ''}},
	{'additionalProvidersData.facebook' : {$exists : true}},
	{'additionalProvidersData.facebook.accessToken' : {$exists: true}}
      ]
    };
    var usersfields = {
      '_id' : '', 
      'displayName' : '', 
      'cuenta.marca': '',
      'additionalProvidersData.facebook.accessToken' : '',
      'additionalProvidersData.facebook.name': ''
    };
    var userssort = {created_time : 1};
    classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'accesstokens/obtieneUsrATint/obtieneUsuariosDeCuenta', function(usersarray){
      if (usersarray === 'error' || usersarray.length < 1) {
	return callback('error');
      }
      else {
        return callback(usersarray);
      }
    });
  }

  function requestGraph(path, callback) {
    if (typeof path !== 'undefined' || path !== null || path !== '') {
      var opciones = globales.options_graph;
      opciones.method = 'GET';
      opciones.path = path;
      var solicitud = https.request(opciones, function(resp) {
		        var chunks = [];
		        resp.on('data', function(chunk) {
		          chunks.push(chunk);
		        }).on('end', function() {
		          var contenido = JSON.parse(Buffer.concat(chunks));
		          if (typeof contenido.error !== 'undefined') {
			    // console.log('accesstokens/obtieneUsrATint/requestGraph - hubo un error en solicitud al graph: '+ path);
			    // console.log(JSON.stringify(contenido.error));
			    return callback('error');
		          }
		          else {
			    return callback(contenido);
		          }
		        });
	              });
      solicitud.on('socket', function(socket){
	socket.setTimeout(30000);
	socket.on('timeout', function(){
	  solicitud.abort();
	});
      });
      solicitud.end();
      solicitud.on('error', function(e){
	console.log('accesstokens/obtieneUsrATint/requestGraph - hubo un error en la conexión al graph: '+e);
	return callback('error');
      });
    }
    else {
      console.log('accesstokens/obieneUsrATint/requestGraph - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }

  function tokensDeCuenta(nombreCuenta, usuariosDeCuenta, index, validTokens, callback) {
    var more = index+1;
    var cuantosusuarios = usuariosDeCuenta.length;
    if (more > cuantosusuarios) {
      return callback(validTokens);
    }
    else {
      setImmediate(function(){
	if (typeof usuariosDeCuenta[index] !== 'undefined') {
	  var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+usuariosDeCuenta[index].additionalProvidersData.facebook.accessToken;
	  requestGraph(path, function(validacion){
	    if (validacion === 'error') {
	      return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
	    }
	    else {
	      validTokens.push(validacion.access_token);
	      return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
	    }
	  });
	}
	else {
	  return tokensDeCuenta(nombreCuenta, usuariosDeCuenta, more, validTokens, callback);
	}
      });
    }
  }

  function getCtaATs(nombreCta, usuariosCta, callback) {
    var critere = {'nombre_cta': nombreCta};
    var lesort = {created_time: -1};
    classdb.buscarToArray('verifica_auto_uat', critere, {}, 'accesstokens/obtieneUsrATint/getCtaATs', function(items){
      if (items === 'error') {
	return callback([]);
      }
      else {
	if (items.length < 1) {
	  // no existen access_tokens en bd, los pedimos a fb
	  tokensDeCuenta(nombreCta, usuariosCta, 0, [], function(vtokens){
	    if (vtokens.length < 1) {
	      // no hay tokens para esta cuenta
	      return callback([]);
	    }
	    else {
	      var objeto = {
		nombre_cta: nombreCta,
		created_time: new Date(),
		valid_tokens: vtokens
	      };
	      classdb.inserta('verifica_auto_uat', objeto, 'accesstokens/obtieneUsrATint/getCtaATs', function(insertao){
		return callback(vtokens);
	      });
	    }
	  });
	}
	else {
	  var ts = items[0].created_time.getTime();
	  var tsm1 = (ts) + 3600000;
	  var ahora = new Date().getTime();
	  if (tsm1 < ahora) {
	    tokensDeCuenta(nombreCta, usuariosCta, 0, [], function(vtokens){
	      if (vtokens.length < 1) {
		// no hay tokens para esta cuenta
		return callback([]);
	      }
	      else {
		var criterio_actualizacion = {nombre_cta: items[0].nombre_cta};
		var objeto = {
		  nombre_cta: nombreCta,
		  created_time: new Date(),
		  valid_tokens: vtokens
		};
		classdb.actualiza('verifica_auto_uat', criterio_actualizacion, objeto, 'accesstokens/obtieneUsrATint/getCtaATs', function(actualizao){
		  return callback(vtokens);
		});
	      }
	    });
	  }
	  else {
	    // y sigue vigente
	    return callback(items[0].valid_tokens);
	  }
	}
      }
    });
  }

  obtieneUsuariosDeCuenta(account, function(usuariosdecuenta) {
    if (usuariosdecuenta === 'error') {
      return cuwlbuwck(usuariosdecuenta);
    }
    else {
      getCtaATs(account, usuariosdecuenta, function(tokensdecta){
        if (tokensdecta.length < 1) {
          return cuwlbuwck('error');
        }
        else {
          var el_at_elegido = tokensdecta[Math.floor(Math.random()*tokensdecta.length)];
          if (prefix === 'no') {
            return cuwlbuwck(el_at_elegido);
          }
          else {
            return cuwlbuwck('access_token='+el_at_elegido);
          }
        }
      });
    }
  });
};


/**
 * Función para comprobar el access token de un usuario específico
 */
exports.compruebaUnUsrAT = function(username, prefix, ciwlbiwck) {
  function requestGraph(path, callback) {
    if (typeof path !== 'undefined' || path !== null || path !== '') {
      var opciones = globales.options_graph;
      opciones.method = 'GET';
      opciones.path = path;
      var solicitud = https.request(opciones, function(resp) {
		        var chunks = [];
		        resp.on('data', function(chunk) {
		          chunks.push(chunk);
		        }).on('end', function() {
		          var contenido = JSON.parse(Buffer.concat(chunks));
                          return callback(contenido)
		        });
	              });
      solicitud.on('socket', function(socket){
	socket.setTimeout(30000);
	socket.on('timeout', function(){
	  solicitud.abort();
	});
      });
      solicitud.end();
      solicitud.on('error', function(e){
	console.log('accesstokens/obtieneYCompruebaUnUsrATint/requestGraph - hubo un error en la conexión al graph: '+e);
	return callback('error');
      });
    }
    else {
      console.log('accesstokens/obieneYCompruebaUnUsrATint/requestGraph - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
  }

  function verificaToken(token, callback) {
    var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+token;
    requestGraph(path, function(validacion){
      if (validacion === 'error') {
	return callback('error');
      }
      else {
	if (validacion.error) {
	  console.log(JSON.stringify(validacion));
	  return callback('error');
	}
	else {
	  return callback(validacion);
	}
      }
    });
  }

  function revisaUsrATEnMongo(username, userat, callback) {
    var critere = {'usuario': username};
    var lesort = {created_time: -1};
    classdb.buscarToArray('verifica_auto_user_at', critere, lesort, 'accesstokens/obtieneYCompruebaUsrATint/revisaUsrATEnMongo', function(items){
      if (items === 'error') {
	return callback([]);
      }
      else {
	if (items.length < 1) {
	  // no existe access_tokens en bd, los pedimos a fb
          verificaToken(userat, function(tokenverificado){
            if (tokenverificado === 'error') {
              return callback('error')
            }
            else {
              var objeto = {
		usuario: username,
		created_time: new Date(),
		eltoken: tokenverificado.access_token
	      };
	      classdb.inserta('verifica_auto_user_at', objeto, 'accesstokens/obtieneYCompruebaUsrATint/revisaUsrATEnMongo', function(insertao){
		return callback(tokenverificado.access_token);
	      });
            }
          });
	}
	else {
	  var ts = items[0].created_time.getTime();
	  var tsm1 = (ts) + 3600000;
	  var ahora = new Date().getTime();
	  if (tsm1 < ahora) {
            verificaToken(userat, function(tokenverificado) {
              if (tokenverificado === 'error') {
                return callback('error');
              }
              else {
		var criterio_actualizacion = {usuario: items[0].usuario};
		var objeto = {
		  usuario: username,
		  created_time: new Date(),
		  eltoken: tokenverificado.access_token
		};
		classdb.actualiza('verifica_auto_user_at', criterio_actualizacion, objeto, 'accesstokens/obtieneYCompruebaUsrATint/revisaUsrATEnMongo', function(actualizao){
		  return callback(tokenverificado.access_token);
		});                
              }
	    });
	  }
	  else {
	    // y sigue vigente
	    return callback(items[0].eltoken);
	  }
	}
      }
    });
  }

  var userscritere = {$and: [
    {'username': username},
    {'additionalProvidersData' : {$exists : true}},
    {'additionalProvidersData' : {$ne : ''}},
    {'additionalProvidersData.facebook' : {$exists : true}},
    {'additionalProvidersData.facebook.accessToken' : {$exists: true}}
  ]};
  var usersfields = {
    '_id' : '', 
    'displayName' : '', 
    'cuenta.marca': '',
    'additionalProvidersData.facebook.accessToken' : '',
    'additionalProvidersData.facebook.name': ''
  };
  var userssort = {created_time : 1};
  classdb.buscarToArrayFields('users', userscritere, usersfields, userssort, 'accesstokens/obtieneYCompruebaUnUsrATint', function(eluser) {
    if (eluser === 'error' || eluser.length < 1) {
      console.log('error o vacio')
      return ciwlbiwck('error');
    }
    else {
      revisaUsrATEnMongo(username, eluser[0].additionalProvidersData.facebook.accessToken, function(validat){
        if (validat === 'error') {
          return ciwlbiwck(validat);
        }
        else {
          if (prefix === 'no') {
            return ciwlbiwck(validat);
          }
          else {
            return ciwlbiwck('access_token='+validat);
          }
        }
      });
    }
  });
};


/**
 * Función para obtener un access_token de una página con base en los access_tokens de los usuarios que la administran
 */
exports.obtienePagATs = function(cuenta, page_id, prefix, cowlbowck) {
  /**
   * Función para hacer requests al graph de facebook
   */
  function requestAlGraph (path, callback) {
    if (typeof path === 'undefined' || path === null || path === '') {
      console.log('accesstokens.server.controller/obtienePagATint/requestAlGraph - no hubo path, así que no se puede pedir nada al graph');
      return callback('error');
    }
    else {
      var opciones = globales.options_graph;
      opciones.method = 'GET';
      opciones.path = path;
      var solicitud = https.request(opciones, function(resp) {
		        var chunks = [];
		        resp.on('data', function(chunk) {
		          chunks.push(chunk);
		        }).on('end', function() {
		          var contenido = JSON.parse(Buffer.concat(chunks));

		          if (typeof contenido.error !== 'undefined') {
			    console.log('accesstokens.server.controller/obtienePagATint/requestAlGraph.error: '+path);
			    console.log(JSON.stringify(contenido.error));
			    if (typeof contenido.error.code !== 'undefined' && contenido.error.code === 190 && typeof contenido.error.error_subcode !== 'undefined' && contenido.error.error_subcode === 460) {
			      console.log('access_token inválido');
			      return callback('invalid');
			    }
			    else {
			      return callback('error');
			    }
		          }
		          else {
			    return callback(contenido);
		          }

		        });
	              });
      solicitud.on('socket', function(socket){
	socket.setTimeout(30000);
	socket.on('timeout', function(){
	  solicitud.abort();
	});
      });
      solicitud.end();
      solicitud.on('error', function(e){
	console.log('accesstokens.server.controller/obtienePagATint/requestAlGraph - hubo un error en la conexión al graph: '+e);
	return callback('error');
      });
    }
  }    

  function encuentraCuentaCorrespondiente (pid, pages, index, callback) {
    var more = index+1;
    var cuantas_pags = pages.length;
    if (more > cuantas_pags) {
      return callback('not');
    }
    else {
      setImmediate(function(){
	if (typeof pages[index] !== 'undefined') {
	  if(pages[index].id !== pid) {
	    return encuentraCuentaCorrespondiente(pid, pages, more, callback);
	  }
	  else {
	    if (pages[index].perms.indexOf('CREATE_CONTENT') > -1) {
	      return callback(pages[index]);
	    }
	    else {
	      return encuentraCuentaCorrespondiente(pid, pages, more, callback);
	    }
	  }
	}
	else {
	  return encuentraCuentaCorrespondiente(pid, pages, more, callback);
	}
      });
    }
  }

  function tokensDeCuenta (nombreCuenta, thepageid, usuariosDeCuenta, index, validTokens, callback) {
    var more = index+1;
    var cuantosusuarios = usuariosDeCuenta.length;
    var nombreSistema = nombreCuenta;
    var page_id = thepageid;	
    if (more > cuantosusuarios) {
      return callback(validTokens);
    }
    else {
      setImmediate(function(){
	if (typeof usuariosDeCuenta[index] !== 'undefined') {
	  var path = globales.fbapiversion+'oauth/access_token_info?client_id='+globales.fb_app_id+'&access_token='+usuariosDeCuenta[index].additionalProvidersData.facebook.accessToken;
	  requestAlGraph(path, function(validacion){
	    if (validacion === 'error' || validacion === 'invalid') {
	      return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
	    }
	    else {
	      var patpath = globales.fbapiversion+'me/accounts?access_token='+validacion.access_token;
	      requestAlGraph(patpath, function(pages) {
		if (pages === 'error' || pages === 'invalid' || typeof pages.data === 'undefined' || pages.data.length < 1) {
		  return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
		}
		else {
		  encuentraCuentaCorrespondiente(page_id, pages.data, 0, function(fbaccount) {
		    if (fbaccount === 'not') {
		      return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);					    
		    }
		    else {
		      validTokens.push(fbaccount);
		      return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);					    
		    }
		  });
		}
	      });
	    }
	  });
	}
	else {
	  return tokensDeCuenta(nombreCuenta, thepageid, usuariosDeCuenta, more, validTokens, callback);
	}
      });
    }
  }

    function getCtaATs (nombreCta, pageid, usuariosCta, callback) {
	var critere = {'nombre_cta': nombreCta};
	var lesort = {created_time: -1};
	classdb.buscarToArray('verifica_auto_pat', critere, {}, 'accesstokens.server.controller/index/getCtaATs', function(items){
	    if (items === 'error') {
		return callback([]);
	    }
	    else {
		if (items.length < 1) {
		    // no existen access_tokens en bd, los pedimos a fb
		    tokensDeCuenta(nombreCta, pageid, usuariosCta, 0, [], function(vtokens){
			if (vtokens.length < 1) {
			    // no hay tokens para esta cuenta
			    return callback([]);
			}
			else {
			    var objeto = {
				nombre_cta: nombreCta,
				created_time: new Date(),
				valid_tokens: vtokens
			    };
			    classdb.inserta('verifica_auto_pat', objeto, 'accesstokens.server.controller/index/getCtaATs', function(insertao){
				return callback(vtokens);
			    });
			}
		    });
		}
		else {
		    var ts = items[0].created_time.getTime();
		    var tsm1 = (ts) + 3600000;
		    var ahora = new Date().getTime();
		    if (tsm1 < ahora) {
			tokensDeCuenta(nombreCta, pageid, usuariosCta, 0, [], function(vtokens){
			    if (vtokens.length < 1) {
				// no hay tokens para esta cuenta
				return callback([]);
			    }
			    else {
				var criterio_actualizacion = {nombre_cta: items[0].nombre_cta};
				var objeto = {
				    nombre_cta: nombreCta,
				    created_time: new Date(),
				    valid_tokens: vtokens
				};
				classdb.actualiza('verifica_auto_pat', criterio_actualizacion, objeto, 'accesstokens.server.controller/index/getCtaATs', function(actualizao){
				    return callback(vtokens);
				});
			    }
			});
		    }
		    else {
		      // y sigue vigente
		      return callback(items[0].valid_tokens);
		    }
		}
	    }
	});
    }

    var criterium = {
      $and: [
	{ 'cuenta.marca' : cuenta}, 
	{'additionalProvidersData.facebook': { $exists: true }}
      ]
    };
    var usersfields = {
      '_id' : '', 
      'displayName' : '', 
      'cuenta.marca': '',
      'additionalProvidersData.facebook.accessToken' : '',
      'additionalProvidersData.facebook.name': ''
    };
    classdb.buscarToArrayFields('users', criterium, usersfields, {}, 'accesstokens.server.controller/index/obtieneUsuariosDeCta', function(dieusern){
      if (dieusern === 'error') {
	return cowlbowck(dieusern);
      }
      else {
        getCtaATs(cuenta, page_id, dieusern, function(tdc){
          if (tdc.length > 0) {
            var el_at_elegido = tdc[Math.floor(Math.random()*tdc.length)];
            if (prefix === 'no') {
              return cowlbowck(el_at_elegido.access_token);
            }
            else {
              return cowlbowck('access_token='+el_at_elegido.access_token);
            }
          }
          else {
            console.log('no había access_tokens válidos');
            return cowlbowck('error');
          }
        });
      }
    });

};


/**
 * Función para obtener el access_token de una página con base en el access_token de un usuario específico que la administra
 */
exports.obtienePagATByUsrAT = function(cuenta, page_id, user_aid, fb_usid, us_token, prefix, cewlbewck) {
  /**
   * Obtenemos el id de la Página de Facebook para la cuenta en la que está trabajando el usuario
   * @param {string} account_name nombre corto de la cuenta que se está trabjando
   * @param {string} account_id id de mongo de la cuenta en cuestión
   * @return {string} ya sea mandamos la cadena 'error' o el id de facebook de la página conectada a la cuenta
   * @getFacebookPageByCuenta
   */
  function getFacebookPageByCuenta(account_name, account_id, callback){
    var acc_id = new ObjectID(account_id);
    var criterio = {$and : [{ _id : acc_id }, { nombreSistema : account_name }]};
    classdb.buscarToArray('accounts', criterio, {}, 'accounts/procesaPendientes/getFacebookPageByCuenta', function(items){
      if (items === 'error' || items.length < 1) {
	console.log('accounts/procesaPendientes/getFacebookPageByCuenta - hubo error o el arreglo con la cuenta llegó vacío');
	return callback('error');
      }
      else {
	if (items[0].datosPage && items[0].datosPage.id) {
	  return callback(items[0].datosPage.id);
	}
	else {
	  console.log('accounts/procesaPendientes/getFacebookPageByCuenta - si existe la cuenta pero no tiene conectada ninguna cuenta de facebook por RTUs');
	  return callback('error');
	}
      }
    });
  }

  /**
   * Pedimos las páginas administradas por este usuario
   * @param {string} fbuserid id de facebook del usuario 
   * @param {string} fbuserAT access_token de facebook del usuario
   * @return {object} objeto de error o de paginas administradas por el usuario
   * @requestUserPages
   */
  function requestUserPages(fbuserid, fbuserAT, callback) {
    var path = globales.fbapiversion+'me/accounts?access_token='+fbuserAT;
    globales.options_graph.method = 'GET';
    globales.options_graph.path = path;
    delete globales.options_graph.headers;
    var solicitud = https.request(globales.options_graph, function(risposta) {
                      var chunks = [];
		      risposta.on('data', function(dati) {
			chunks.push(dati);
		      }).on('end', function() {
		        var contenido = JSON.parse(Buffer.concat(chunks));
			if (typeof contenido.error !== 'undefined') {
			  console.log('feeds/respInbox/requestUserPages - '+JSON.stringify(contenido.error));
			  return callback('error');
			}
			else {
			  return callback(contenido.data);
			}
		      });
		    });
    solicitud.on('socket', function(socket){
      socket.setTimeout(5000);
      socket.on('timeout', function(){
	solicitud.abort();
      });
    });
    solicitud.end();
    solicitud.on('error', function(err){
      console.log('facebookPost/requestAT - error en el request: '+err);
      return callback('error');
    });
  }

  /**
   * Iteramos arreglo de páginas administradas por el usuario, hasta encontrar una que coincida con la que estamos trabajando
   * @param {string} idCuenta id de la página que queremos administrar
   * @param {array} arregloCuentas arreglo de páginas administradas por el usuario
   * @param {integer} index índice autoincrementado hasta que se recorre todo el arreglo
   * @return {object} Si encontramos la cuenta que estábamos buscando regresamos su objeto, o bien un string que dice 'sinCuentas'
   * @ descartaCuentas
   */
  function descartaCuentas(idCuenta, arregloCuentas, index, callback) {
    var cuantas = arregloCuentas.length;
    var more = index+1;
    if (more > cuantas) {
      return callback('sinCuentas');
    }
    else {
      setImmediate(function(){
        if (arregloCuentas[index].id === idCuenta) {
          return callback(arregloCuentas[index]);
        }
	else {
	  return descartaCuentas(idCuenta, arregloCuentas, more, callback);
	}
      });
    }
  }

  /**
   * Función para obtener access_token de la página
   * 1. Si no existe en bd se pide a facebook y se guarda en mongo
   * 2. Si ya existe y ya caducó se vuelve a pedir a facebook y se actualiza en mongo
   * 3. Si existe en mongo y sigue vigente se usa ese
   * @param {string} lacta nombre corto de la cuenta en cuestión
   * @param {string} idpag id de facebook de la página de la que queremos el access_token
   * @param {string} user_id id de crm del usuario para ver si administra esa página
   * @param {string} fb_userid id de facebook del usuario
   * @param {string} fb_userat access_token de facebook del usuario
   * @return {string} regresa el access_token de la página que estamos pidiendo o bien regresa 'error'
   * @getUserPageAT
   */
  function getUserPageAT(lacta, idpag ,user_id, fb_userid, fb_userat, callback) {
    var criteriof = { $and : [ { user_id : user_id }, { account_name : lacta } ] };
    classdb.buscarToArray('verifica_user_at', criteriof, {}, 'accesstokens/obtienePagATByUsrATint/getUserPageAT', function(token){
      if (token === 'error') {
	console.log('accesstokens/obtienePagATByUsrATint/getUserPageAT - error en consulta de bd, no obtuvimos user-token');
	return callback(token);
      }
      else {
	if (token.length < 1) {
          //no existe token de este usuario/cuenta
	  requestUserPages(fb_userid, fb_userat, function(cuentas) {
	    if(cuentas === 'error' || cuentas.length < 1) {
	      console.log('accesstokens/obtienePagATByUsrATint/getUserPageAT.at_nuevo - error al conseguir las fanpages en facebook o usuario no administra ninguna página');
	      return callback('error');
	    }
	    else {
	      descartaCuentas(idpag, cuentas, 0, function(cuenta){
	        if (cuenta === 'sinCuentas') {
	          console.log('accesstokens/obtienePagATByUsrATint/getUserPageAT.at_nuevo - el usuario administra cuentas pero ninguna coincide con la cuenta solicitada');
	          return callback('error');
	        }
	        else {
	          var pageAccessToken = cuenta.access_token;
	          var objeto = {
	            user_at: fb_userat,
	            page_at: pageAccessToken,
	            user_id: user_id,
	            account_name: lacta,
	            timestamp: new Date()
	          };
	          classdb.inserta('verifica_user_at', objeto, 'accesstokens/obtienePagATByUsrATint/getUserPageAT.at_nuevo', function(inserta){
	            return callback(pageAccessToken);
	          });
	        }
	      });
	    }
	  });
	}
	else {
	  var ts = token[0].timestamp.getTime();
	  var tsm1 = (ts) + 1800000;
	  var ahora = new Date().getTime();
	  if (tsm1 < ahora) {
	    //existe token  pero ya venció, lo pedimos a fb
	    requestUserPages(fb_userid, fb_userat, function(cuentas) {
	      if (cuentas === 'error' || cuentas.length < 1) {
		console.log('accesstokens/obtienePagATByUsrATint/getUserPageAT.at_updated - error al conseguir las fanpages en facebook o usuario ya no administra ninguna página');
		return callback('error');
	      }
	      else {
		descartaCuentas(idpag, cuentas, 0, function(cuenta){
		  if (cuenta === 'sinCuentas') {
		    console.log('accesstokens/obtienePagATByUsrATint/getUserPageAT.at_updated - el usuario administra cuentas pero ninguna coincide con ya la cuenta solicitada');
		    return callback('error');
		  }
		  else {
		    var pageAccessToken = cuenta.access_token;
		    var criteriou = { 'user_id' : token[0].user_id };
		    var objeto = {
		      user_at: fb_userat,
		      page_at: pageAccessToken,
		      user_id: user_id,
		      account_name: lacta,
		      timestamp: new Date()
		    };
		    classdb.actualiza('verifica_user_at', criteriou, objeto, 'feeds/respInbox/getUserPageAT.at_updated', function(inserta){
		      return callback(pageAccessToken);
		    });
		  }
		});
	      }
	    });
	  }
	  else {
	    //existe token y sigue vigente
	    return callback(token[0].page_at);
	  }
	}
      }
    });
  }
  var id_de_usuario = new ObjectID(user_aid);
  getUserPageAT(cuenta, page_id, id_de_usuario, fb_usid, us_token, function(pagtoken){
    if (pagtoken === 'error') {
      return cewlbewck(pagtoken);
    }
    else {
      if (prefix === 'no') {
        return cewlbewck(pagtoken);
      }
      else {
        return cewlbewck('access_token='+pagtoken)
      }
    }
  });

};