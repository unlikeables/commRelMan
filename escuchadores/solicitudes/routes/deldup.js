/* solicitudes/deldup/GET - borra duplicadas en base de datos */
'use strict';
var express = require('express');
var url = require('url'), qs = require('querystring'), _ = require('lodash'), http = require('http'), https = require('https');
var bst = require('better-stack-traces').install();
var globales = require('../../globals.js');
var classdb = require('../../classdb.js');

var router = express.Router();


/* GET Facebook Inbox. */
router.get('/', function(req, res, next) {
    function revisaCuenta(lacuenta, callback) {
	var coleccion = lacuenta.nombreSistema+'_consolidada';
	var group = {_id: {id: "$id"}, uniqueIds: {$addToSet: "$_id"}, count: {$sum: 1}};
	var match = {count: {$gte: 2}};
	var sort = {count: -1};
	classdb.dups_aggregate(coleccion, group, match, sort, 150, 'solicitudes/quitadupes/revisaCuenta', function(dupes){
	    return callback(dupes);
	});
    }
    
    function procesaCuentas(accounts, index, arregloNombres, dupes_ctas, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    return callback(arregloNombres, dupes_ctas);
	}
	else {
	    setImmediate(function() {
		if (typeof accounts[index] !== 'undefined') {
		    revisaCuenta(accounts[index], function(revisada){
			if (revisada === 'error' || revisada.length < 1) {
			    return procesaCuentas(accounts, more, arregloNombres, dupes_ctas, callback);			    
			}
			else {
			    var nombrecta = accounts[index].nombreSistema;
			    arregloNombres.push(nombrecta);
			    dupes_ctas[nombrecta] = revisada;
			    return procesaCuentas(accounts, more, arregloNombres, dupes_ctas, callback);
			}
		    });
		}
		else {
		    return procesaCuentas(accounts, more, arregloNombres, dupes_ctas, callback);
		}
	    });
	}
    }


    function borraDuplicadas(nombresys, porborrar, index, callback){
	var more = index+1;
	var cuantosrep = porborrar.length;
	if (more > cuantosrep) {
	    return callback('bordupes para '+nombresys+' ok');
	}
	else {
	    setImmediate(function() {
		if (typeof porborrar[index] !== 'undefined') {
		    var colezione = nombresys+'_consolidada';
		    var critere = {$and: 
				   [
				       {id: porborrar[index]._id.id}, 
				       {$or: 
					[
					    {'clasificacion': {$exists: true}},
					    {'atendido': {$exists: true}},
					    {'sentiment': {$exists: true}}, 
					    {'descartado': {$exists: true}}
					]
				       }
				   ]};
		    var lesort = {'created_time': 1};
		    classdb.buscarToArrayLimit(colezione, critere, lesort, 1, 'solicitudes/deldup/borraDuplicadas', function(items){
			if (items === 'error') {
			    return borraDuplicadas(nombresys, porborrar, more, callback);
			}
			else {
			    if (items.length < 1) {
				var aeliminar = porborrar[index].uniqueIds;
				aeliminar.shift();
				var criterior = {_id: {$in: aeliminar}};
				classdb.remove(colezione, criterior, 'solicitudes/deldup/borraDuplicadas.sinrespuestas', function(borradas) {
				    return borraDuplicadas(nombresys, porborrar, more, callback);
				});
			    }
			    else {
				var uniq = porborrar[index].uniqueIds;
				var uniqustr = porborrar[index].uniqueIds.join();
				var uniquarr = uniqustr.split(',');
				var idmessage = ''+items[0]._id;
				var indice = uniquarr.indexOf(idmessage);

				if (indice > -1) {
				    uniq.splice(indice, 1);
				    var criteriore = {_id: {$in: uniq}};
				    classdb.remove(colezione, criteriore, 'solicitudes/deldup/borraDuplicadas.sinrespuestas', function(borradas) {
					return borraDuplicadas(nombresys, porborrar, more, callback);
				    });
				}
				else {
				    uniq.shift();
				    var criteriorem = {_id: {$in: uniq}};
				    classdb.remove(colezione, criteriorem, 'solicitudes/deldup/borraDuplicadas.sinrespuestas', function(borradas) {
					return borraDuplicadas(nombresys, porborrar, more, callback);
				    });
				}
			    }
			}
		    });
		}
		else {
		    return borraDuplicadas(nombresys, porborrar, more, callback);
		}
	    });
	}
    }

    function procesaDuplicadas(accounts, processed, index, callback) {
	var more = index+1;
	var cuantasctas = accounts.length;
	if (more > cuantasctas) {
	    return callback('procesa dupes ok');
	}
	else {
	    setImmediate(function() {
		if (typeof accounts[index] !== 'undefined') {
		    var nombreCta = accounts[index];
		    borraDuplicadas(nombreCta, processed[nombreCta], 0, function(borrados){
			console.log(borrados);
			return procesaDuplicadas(accounts, processed, more, callback);
		    });
		}
		else {
		    return procesaDuplicadas(accounts, processed, more, callback);
		}
	    });
	}
    }

    classdb.buscarToArray('accounts', {}, {nombreSistema: 1}, 'solicitudes/deldup.main', function(cuentas){
	console.log('**************** solicitudes/deldup/GET - elimina posts duplicados de todas las cuentas *****************');
	if (cuentas === 'error') {
	    res.jsonp(cuentas);
	}
	else {
	    procesaCuentas(cuentas, 0, [], {}, function(ctas_nombres, procesadas){
		procesaDuplicadas(ctas_nombres, procesadas, 0, function(borradas){
		    console.log(borradas);
		});
		res.jsonp('deldup ok');		    
	    });
	}
    });
});

module.exports = router;
