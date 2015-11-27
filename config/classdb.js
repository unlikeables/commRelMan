'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbase = '';
var mongobase = 'mongodb://localhost/likeable-crm-dev';
var Q = require('q');
/*
  MongoClient.connect(mongobase, function(err, db) {
    if (err) {
      console.log('error de conexión' +err);
    }
    else {
      console.log('conexión exitosa');
      dbase = db;
    }
  });
*/

var conexion = function(mbeis) {
  var d = Q.defer();
  MongoClient.connect(mbeis, function(error,db){
    if(error) {
      return d.reject(error); }
    else {
      console.log('conexión exitosa');
      dbase = db;
      d.resolve(dbase);
    }
  });
  return d.promise;
};

var promesa_conexion = conexion(mongobase);

module.exports = {
  nuevoBuzon : function(coleccion, cuenta_id, inicio, metodo, callback){
    promesa_conexion.done(function(){
      var colect = dbase.collection(coleccion);
      colect.aggregate(
        [
          { $match:
           { $and:
             [
               { from_user_id:{$ne: cuenta_id}},
               { _id:{$exists:true}},
               { eliminado:{$exists:false}}
             ]
           }
          },
          { $sort:{'created_time':-1}},
          { $group:{_id:'$from_user_id',count:{$sum:1},doc :{$first : '$$ROOT'},created:{$max:'$created_time'}}},
          {$skip:inicio},{$limit:15},{$sort:{'created':-1}}
        ],
        {allowDiskUse: true},
        function(error,data){
          /*
          colect.aggregate(
            [
              { $match:
                { $and:[
                  {from_user_id:{$ne: cuenta_id}},
                  {_id:{$exists:true}},
                  {eliminado:{$exists:false}}]
                }
              },
              {$sort:{'created_time':-1}},
              {$group:{_id:"$from_user_id",count:{$sum:1},doc :{$first : "$$ROOT"},created:{$max:"$created_time"}}},
              {$skip:inicio},{$limit:15},{$sort:{'created':-1}}
            ],
            {allowDiskUse: true},
            function(error,data){
           */
	  if(error){
	    console.log(error);
	    return callback('error');
	  }else{
	    return callback(data);
	  }
	}
      );
    });
  },

  dups_aggregate :  function(coleccion, group, match, sort, limit, metodo, callback) {
    promesa_conexion.done(function(){
      var colect = dbase.collection(coleccion);
      colect.aggregate([{$group: group}, {$match: match}, {$sort: sort}, {$limit: limit}], {allowDiskUse: true}, function(error, data) {
	if (error) {
	  console.log(metodo+' - classdb/dups_aggregate - error en aggregate: '+error);
	  return callback('error');
	}
	else {
	  return callback(data);
	}
      });
    });
  },

  existefind : function(coleccion, criterio, metodo, callback){
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.find(criterio).toArray(function(error, items) {
	if(error) {
	  console.log(metodo+' - classdb/existefind - error en find: '+error);
	  return callback('error');
	}
	else{
	  if(items.length < 1) {
	    return callback('noexiste');
	  }
	  else {
	    return callback('existe');
	  }
	}
      });
    });
  },

  existecount : function(coleccion, criterio, metodo, callback) {
    promesa_conexion.done(function(){
      var colecti = dbase.collection(coleccion);
      colecti.count(criterio,function(error, respu){
	if(error){
	  console.log(metodo+' - classdb/existecount - error en count: '+error);
	  return callback('error');
	}else{
	  if(respu > 0){
	    return callback('existe');
	  }
	  else{
	    return callback('noexiste');
	  }
	}
      });
    });
  },

  count : function(coleccion, criterio, metodo, callback) {
    promesa_conexion.done(function(){
      var colecti = dbase.collection(coleccion);
      colecti.count(criterio,function(error, respu){
	if(error){
	  console.log(metodo+' - classdb/count - error en count: '+error);
	  return callback('error');
	}else{
	  return callback(respu);
	}
      });
    });
  },
    
  inserta : function(coleccion, objeto, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.insert(objeto, function(errae, inserta) {
	if(errae) {
	  console.log(metodo+' - classdb/inserta - error en insert: '+errae);
	  return callback('error');
	}
	else{
	  return callback('ok');
	}
      });
    });
  },

  insertacresult : function(coleccion, objeto, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.insert(objeto, function(errae, inserta) {
	if(errae) {
	  console.log(metodo+' - classdb/inserta - error en insert: '+errae);
	  return callback('error');
	}
	else{
	  return callback(inserta);
	}
      });
    });
  },

  actualiza : function(coleccion, criterio, set, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$set: set}, {w:1}, function(error, result){
      if (error) {
	console.log(metodo+' - classdb/actualiza - error en update: '+error);
	return callback('error');
      }
        else {
	  return callback('ok');
        }
      });
    });
  },

  actualizaPull : function(coleccion, criterio, pull, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$pull: pull}, {w:1}, function(error, result){
	if (error) {
	  console.log(metodo+' - classdb/actualiza - error en update: '+error);
	  return callback('error');
	}
	else {
	  return callback('ok');
	}
      });
    });
  },    

  actualizacresult : function(coleccion, criterio, set, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$set: set}, {w:1}, function(error, actualizado){
	if (error) {
	  console.log(metodo+' - classdb/actualiza - error en update: '+error);
	  return callback('error');
	}
	else {
	  return callback(actualizado);
	}
      });
    });
  },

  actualizaAddToSet : function(coleccion, criterio, addtoset, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$addToSet: addtoset}, {w:1}, function(error, result){
	if (error) {
	  console.log(metodo+' - classdb/actualizaAddToSet - error en update: '+error);
	  return callback('error');
	}
	else {
 	  return callback('ok');
	}
      });
    });
  },

  actualizaAddToSetcresult : function(coleccion, criterio, addtoset, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$addToSet: addtoset}, {w:1}, function(error, actualizado){
	if (error) {
	  console.log(metodo+' - classdb/actualizaAddToSet - error en update: '+error);
	  return callback('error');
	}
	else {
 	  return callback(actualizado);
	}
      });
    });
  },

  actualizaUnset : function(coleccion, criterio, unset, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$unset: unset}, {w:1}, function(error, result){
	if (error) {
	  console.log(metodo+' - classdb/actualizaUnset - error en update: '+error);
	  return callback('error');
	}
	else {
	  return callback('ok');
	}
      });
    });
  },

  actualizaUnsetDelete : function(coleccion, criterio, unset, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$unset: unset},{multi:true}, function(error, result){
	if (error) {
	  console.log(metodo+' - classdb/actualizaUnset - error en update: '+error);
	  return callback('error');
	}
	else {
	  return callback('ok');
	}
      });
    });
  },

  actualizaUnsetcresult : function(coleccion, criterio, unset, metodo, callback) {
    promesa_conexion.done(function(){
      var colect= dbase.collection(coleccion);
      colect.update(criterio, {$unset: unset}, {w:1}, function(error, actualizado){
	if (error) {
	  console.log(metodo+' - classdb/actualizaUnset - error en update: '+error);
	  return callback('error');
	}
	else {
	  return callback(actualizado);
	}
      });
    });
  },

  buscarToArray : function(coleccion, criterio, sort, metodo, callback) {
    promesa_conexion.done(function(){
      var colecc = dbase.collection(coleccion);
      colecc.find(criterio).sort(sort).toArray(function(error, items) {
	if (error) {
	  console.log(metodo+' - classdb/buscarToArray - error en find: '+error);
	  return callback('error');
	}
	else {
	  return callback(items);
	}	
      });
    });
  },

  buscarToArrayLimit : function(coleccion, criterio, sort, limit, metodo, callback) {
    promesa_conexion.done(function(){
      var colecc = dbase.collection(coleccion);
      colecc.find(criterio).sort(sort).limit(limit).toArray(function(error, items) {
	if (error) {
	  console.log(metodo+' - classdb/buscarToArrayLimit - error en find: '+error);
	  return callback('error');
	}
	else {
	  return callback(items);
	}	
      });
    });
  },

  buscarToArrayFields : function(coleccion, criterio, fields, sort, metodo, callback) {
    promesa_conexion.done(function(){
      var colecc = dbase.collection(coleccion);
      colecc.find(criterio, fields).sort(sort).toArray(function(error, items) {
	if (error) {
	  console.log(metodo+' - classdb/buscarToArrayFields - error en find: '+error);
          return callback('error');
	}
	else {
          return callback(items);
	}	
      });
    });
  },

  buscarToArrayFieldsLimit : function(coleccion, criterio, fields, sort, limit, metodo, callback) {
    promesa_conexion.done(function(){
      var colecc = dbase.collection(coleccion);
      colecc.find(criterio, fields).sort(sort).limit(limit).toArray(function(error, items) {
	if (error) {
	  console.log(metodo+' - classdb/buscarToArrayFieldsLimit - error en find: '+error);
	  return callback('error');
	}
	else {
	  return callback(items);
	}	
      });
    });
  },

  buscarToStream : function(collection, criterio, sort, metodo, callback) {
    promesa_conexion.done(function(){
      var datos = [];
      var coleccion = dbase.collection(collection);
      var arreglo = coleccion.find(criterio).sort(sort).stream();
      arreglo.on('error', function(e) {
	console.log(metodo+' - classdb/buscarToStream - error en find: '+e);
	return callback('error');
      });
      arreglo.on('data', function(item) {
	datos.push(item);
      });
      arreglo.on('end', function() {
	return callback(datos);
      });
    });
  },

  buscarToStreamLimit : function(collection, criterio, sort, limit, metodo, callback) {
    promesa_conexion.done(function(){
      var datos = [];
      var coleccion = dbase.collection(collection);
      var arreglo = coleccion.find(criterio).sort(sort).limit(limit).stream();
      arreglo.on('error', function(e) {
	console.log(metodo+' - classdb/buscarToStreamLimit - error en find: '+e);
	return callback('error');
      });
      arreglo.on('data', function(item) {
	datos.push(item);
      });
      arreglo.on('end', function() {
	return callback(datos);
      });
    });
  },

  buscarToStreamLimitSkip : function(collection, criterio, sort, limit, skip,metodo, callback) {
    promesa_conexion.done(function(){
      var datos = [];
      var coleccion = dbase.collection(collection);
      var arreglo = coleccion.find(criterio).sort(sort).skip(skip).limit(limit).stream();
      arreglo.on('error', function(e) {
	console.log(metodo+' - classdb/buscarToStreamFieldsLimit - error en find: '+e);
	return callback('error');
      });
      arreglo.on('data', function(item) {
	datos.push(item);
      });
      arreglo.on('end', function() {
	return callback(datos);
      });
    });
  },

  buscarToStreamFields : function(collection, criterio, fields, sort, metodo, callback){
    promesa_conexion.done(function(){
      var datos = [];
      var coleccion = dbase.collection(collection);
      var arreglo = coleccion.find(criterio, fields).sort(sort).stream();
      arreglo.on('error', function(e) {
	console.log(metodo+' - classdb/buscarToStreamFields - error en find: '+e);
	return callback('error');
      });	
      arreglo.on('data', function(item) {
	datos.push(item);
      });
      arreglo.on('end', function() {
	return callback(datos);
      });
    });
  },

  buscarToStreamFieldsLimit : function(collection, criterio, fields, sort, limit, metodo, callback) {
    promesa_conexion.done(function(){
      var datos = [];
      var coleccion = dbase.collection(collection);
      var arreglo = coleccion.find(criterio, fields).sort(sort).limit(limit).stream();
      arreglo.on('error', function(e) {
	console.log(metodo+' - classdb/buscarToStreamFieldsLimit - error en find: '+e);
	return callback('error');
      });
      arreglo.on('data', function(item) {
	datos.push(item);
      });
      arreglo.on('end', function() {
        return callback(datos);
      });
    });
  },

  creaIndexDeTexto : function(collection, propiedad, lengua, metodo, callback) {
    promesa_conexion.done(function() {
      var coleccion = dbase.collection(collection);
      coleccion.createIndex(propiedad, {default_language: lengua, background: true}, function(error, risposta) {
        if(error) {
          console.log(metodo+' - classdb/creaIndexDeTexto - error en creacion: '+error);
          return callback('error');
        }
        else {
          return callabck(responsa);
        }        
      });
    });
  },

  creaIndexSinTexto : function(collection, propiedad, metodo, callback) {
    promesa_conexion.done(function(){
      var coleccion = dbase.collection(collection);
      coleccion.createIndex(propiedad, {background: true}, function(error, responsa) {
        if(error) {
          console.log(metodo+' - classdb/creaIndexSinTexto - error en creacion: '+error);
          return callback('error');
        }
        else {
          return callback(responsa);
        }
      });
    });
  },

  remove : function(collection, criterio, metodo, callback){
    promesa_conexion.done(function(){
      var coleccion = dbase.collection(collection);
      coleccion.remove(criterio,function(error,respons) {
	if(error){
	  console.log(metodo+' - classdb/remove - error en Remove: '+error);
	  return callback('error');
	}
	else{
	  return callback(respons);
	}	
      });
    });
  }
};

