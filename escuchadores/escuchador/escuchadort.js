var bst = require('better-stack-traces').install();
var config=require('./configt.js');
var MongoClient = require('mongodb').MongoClient,
    _ = require('lodash'),
    Twit = require('twit'),
    T = new Twit(config.llaves),
    configCuentas=config.cuentas,
    losdatos = {};

//Serie de ciclos que sirven para poder llenar los arreglos necesarios con la información de la base de datos
//Ciclo para llenar el arreglo con los nombres de las cuentas

function getFirstArrays(accounts, callback) {
    var datosctas = { cuentas : [], terms : [], termsuc : []};
    var cuentas = [], terms = [], termsuc = []; 
    var num = 0;
    for (var k in accounts) {
	num++;
	cuentas[k] = accounts[k].nombre;
	if (accounts[k].terms.length > 0 && accounts[k].terms[0] !== null) {
	    for (var l in accounts[k].terms) {
		terms.push(accounts[k].terms[l].toLowerCase());
		termsuc.push(accounts[k].terms[l]);
	    }
	}
	if (num === accounts.length) {
	    terms.sort(function(a, b){
		return b.length - a.length; // ASC -> a - b; DESC -> b - a
	    });
    
	    termsuc.sort(function(a, b){
		return b.length - a.length; // ASC -> a - b; DESC -> b - a
	    });
    
	    datosctas.cuentas = cuentas;
	    datosctas.terms = _.uniq(terms);
	    datosctas.termsuc = _.uniq(termsuc);
	    return callback(datosctas);
	}
    }    
};

function get_termsAccounts_array(thedata, callback) {
    var theterms = thedata.termsuc;
    var dietermen = thedata.terms;
    var terms_accounts = {};
    var te_acc_wp_uc = {};
    var termsc = 0;
    for (var i in dietermen) {
	termsc++;
	var elterm = theterms[i];
	terms_accounts[dietermen[i]] = [];
	te_acc_wp_uc[theterms[i]] = [];
	var ctas = 0;
	for (var j in configCuentas) {
	    ctas++;
	    var arrayterms = configCuentas[j].terms;
	    if (arrayterms.indexOf(elterm) >=0) {
		terms_accounts[dietermen[i]].push(configCuentas[j].nombre.toLowerCase()+'_terms');
		te_acc_wp_uc[theterms[i]].push(configCuentas[j].nombre+'_terms');
	    }
	    if (termsc === theterms.length && ctas === configCuentas.length) {
		var ctaf = 0;
		for (var k in configCuentas[j].terms) {
		    ctaf++;
		    if (ctaf === configCuentas[j].terms.length) {
			thedata.terms_accounts = terms_accounts;
			thedata.te_acc_wp_uc = te_acc_wp_uc;
			return callback(thedata);
		    }
		}
	    }
	}
    }
};

function clasifica(untweet, losdatos, callback){
    var terms = losdatos.terms, 
	terms_acc = losdatos.terms_accounts,
	eltwitlc = untweet.text.toLowerCase();
    console.log(eltwitlc);
    untweet.colecciones_te = [];
    var colecciones_te = [];
    var num = 0;
    for (var i in terms) {
	num++;
	if(eltwitlc.indexOf(terms[i]) >= 0) {
	    // insertamos en bd AT
	    console.log(i+' es índice term');
	    eltwitlc = eltwitlc.replace(terms[i], '');
	    colecciones_te = colecciones_te.concat(terms_acc[terms[i]]);
	}
	if (num === terms.length) {
	    if (colecciones_te.length > 0) {
		untweet.colecciones_te = _.uniq(colecciones_te);
	    }
	    else {
		delete untweet.colecciones_te;
	    }
	    return callback(untweet);
	}
    }
};

function existetweet(coleccion, tweet, callback) {
    MongoClient.connect('mongodb://localhost:27017/likeable-crm-dev', function(err, db) {
	//Validación la cual valida si ha ocurrido un error, y en caso de que ocurra lo imprime en pantalla
	if(err) { 
	    console.log(err);
	    console.log('imposible conectar con mongo');
	    return callback(err, null);
	}else{
	    var collection = db.collection(coleccion);
	    collection.find({'id_str' : tweet.id_str}).toArray(function(error, items){
		if (error) {
		    db.close();
		    console.log(error);
		    return callback(error, null);
		}
		else {
		    db.close();
		    return callback(null, items);
		}
	    });
	}
    });   
};

function insertauntweet(coleccion, tweet, callback) {
    MongoClient.connect('mongodb://localhost:27017/likeable-crm-dev', function(err, db) {
	//Validación la cual valida si ha ocurrido un error, y en caso de que ocurra lo imprime en pantalla
	if(err) { 
	    console.log(err);
	    console.log('imposible conectar con mongo');
	    return callback(err, null);
	}else{
	    var collection = db.collection(coleccion);
	    collection.insert(tweet, function(erre, inserted){
		if(erre){ 
		    db.close();
		    console.log('Error al insertar tweet '+erre);
		    return callback(erre, null);
		}
		else {
		    db.close();		    
		    return callback(null, inserted);
		}
	    });
	}
    });   
};

function procesatweet(tweet, colecciones, index, callback) {
    if (index !== parseInt(index, 10) || typeof index === 'undefined' || index === null) {
	index = 0;
    }
    var more = index+1;
    if(more <= colecciones.length) {
	existetweet(colecciones[index], tweet, function(erre, check) {
	    if (erre) {
		console.log('error:' +erre);
		return procesatweet(tweet, colecciones, more, callback);
	    }
	    else {
		if (check.length < 1) {
		    // no existe tweet, lo insertamos
		    console.log('tweet '+tweet.id_str+' no existe, insertamos');
		    insertauntweet(colecciones[index], tweet, function(err, ins) {
			if (err) {
			    console.log('error: '+err);
			}
			else {
			    console.log('ok');
			}
			return procesatweet(tweet, colecciones, more, callback);
		    });
		}
		else {
		    console.log('tweet '+tweet.id_str+' ya existe, no insertamos');
		    // tweet ya existe, seguimos iterando
		    return procesatweet(tweet, colecciones, more, callback);
		}
	    }
	});
    }
    else {
	return callback(index);
    }
};

getFirstArrays(configCuentas, function(losdatos) {
    get_termsAccounts_array(losdatos, function(losterms){
	var terms = losterms.terms;
	var stream = T.stream("statuses/filter", {"track" : terms});
	stream.on('tweet', function (tweet) { 
	    //Variable twiturl la cual almacena la url del Twit que se ha ingresado actualmente
	    tweet.tw_url = "https://twitter.com/"+tweet.user.screen_name+"/status/"+tweet.id_str;
	    //Creación de una fecha entendible para el usuario final
	    tweet.created_time = new Date();   
	    //Se manda a llamar la función de metetwit pasándole como parámetro la cadena del tweet
	    clasifica(tweet, losterms, function(tuit) {
		// console.log(tuit.colecciones_te);
		var colecciones = [];
		if (tuit.colecciones_te) { 
		    var numa = 0;
		    for (var a in tuit.colecciones_te) {
			numa++;
			colecciones.push(tuit.colecciones_te[a]);
			if (numa === tuit.colecciones_te.length) {
			    delete tuit.colecciones_pr;
			}
		    }
		}
		procesatweet(tuit, colecciones, 0, function(indx){
		    console.log(indx);
		});
	    });
	});
    });
});
