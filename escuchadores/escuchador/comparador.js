/*Variables que guardan los paquetes solicitados*/
var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

//Se exporta todo el modulo para poderlo mandar a llamar en cualquier archivo
module.exports = comparador = {
    //Creación de función find
    find : function(coleccion){
	//variable que guardara el arreglo de cuentas que se tiene
	var cuentas=[];
	//Variable que sirve como contador
	var cuenta=0;
	//coleccion = coleccion || null;
	//Creación de la conexión a la base de datos mongo
	MongoClient.connect('mongodb://localhost:27017/likeable-crm-dev', function(err, db) {
	    //Validación que realiza una impresión en la consola si existe un error
	    if(err) { console.log(err);}
	    //Variable que guarda la la colección que usaremos
	    var collection = db.collection('accounts');
	    //Variable que guarda la busqueda de la información de accounts
	    //var arreglo=collection.find({datosTwitter:{$exists:true}}).stream();
	    var arreglo=collection.find({datosTwitter:{$ne:""}}).stream();
	    //Realización de ciclo de las busquedas obtenidas
	    arreglo.on("data", function(item){
		console.log(item);
	    	//Creación de arreglos que contendrán la información requerida
		var trackPrincipal=[];
		var trackRespuesta=[];
		var trackFinal=[];
		//var terminos=[];
		var followRespuesta=[];
		var followPrincipal=[];
		var followFinal=[];
		//Llenado del arreglo de los tracks principales
		trackPrincipal.push(item.datosTwitter.twitter_screenname_principal.trim());
		//Llenado del arreglo de los tracks de respuesta
		if(item.datosTwitter.twitter_screenname_respuesta){
		    trackRespuesta.push(item.datosTwitter.twitter_screenname_respuesta.trim());
		}
		//Arreglo final de tracks
		trackFinal=_.union(trackPrincipal,trackRespuesta);
		
		//Llenado del arreglo de los follows principales
		followPrincipal.push(parseInt(item.datosTwitter.twitter_id_principal));
		//Llenado del arreglo de los follow de respuesta
		// console.log(item.datosTwitter.twitter_id_respuesta);
		if (item.datosTwitter.twitter_id_respuesta !== null) {
		    followRespuesta.push(parseInt(item.datosTwitter.twitter_id_respuesta));
		    
		    //Arreglo final de los follow
		    followFinal=_.union(followPrincipal,followRespuesta);
		}
		else {
		   // console.log('aquí es');
		    followFinal = followPrincipal;
		}
		
		//Separacion de la cadena de terminos tomando en cuenta una ,
		//terminos=item.terminos.split(',');
		
		//Creación de objeto de las cuentas
		var objetoCuentas = {
   		    nombre: item.nombreSistema,
   		    track: trackFinal,
   		    //terms: terminos,
   		    follow: followFinal
		};
		//Llenado del arreglo con las cuentas que se tienen
		cuentas[cuenta]=objetoCuentas;
		//Incremento del contador
		cuenta++; 
	    });//Cierra ciclo de las busquedas obtenidas
	    //Evento close de arreglo
	    arreglo.on("close", function(){
		//Creación de arreglo vacio
		var config=[]; 
		//Eliminamos la cache del archivo config.js
		delete require.cache[require.resolve("./config.js")];
		//Asignación del objeto que se tiene en config.js a la variable config
		config = require("./config.js");
		//Creación de variable diferencias la cual ayudará a saber si se ejecuta o no una acción
		var diferencias=0;
		//Impresión de información en consola con fines de desarrollo
		console.log(config);
		console.log("\n\n");
		console.log(cuentas);
		//Validaciones campo por campo de cada cuenta contenida en la base y en el archivo config.js
		if(typeof config.cuentas !== 'undefined' && config.cuentas.length === cuentas.length) {
		    for(var i=0;i<cuentas.length;i++){
			
			//Compara los nombres de las cuentas
			if(cuentas[i].nombre!=config.cuentas[i].nombre){
			    diferencias++;
			}
			//Finaliza comparación de los nombres de las cuentas
			
			//Compara los tracks de las cuentas
			if(config.cuentas[i].track.length===cuentas[i].track.length){
			    for(var j=0;j<cuentas[i].track.length;j++){
				if(cuentas[i].track[j]!=config.cuentas[i].track[j]){
				    diferencias++;
				}
			    }
			} 
			else{
			    diferencias++;
			}
			//Finaliza comparación de los tracks
			
			//Comparación de los terms a buscar
			/*if(config.cuentas[i].terms.length===cuentas[i].terms.length){
			 for(var j=0;j<cuentas[i].terms.length;j++){
			 if(cuentas[i].terms[j]!=config.cuentas[i].terms[j]){
			 diferencias++;
			 }
			 }
			 } 
			 else{
			 diferencias++;
			 }*/
			//Finaliza comparación de los terms a buscar
			
			//Comparación de los follow a buscar
			if(config.cuentas[i].follow.length===cuentas[i].follow.length){
			    for(var j=0;j<cuentas[i].follow.length;j++){
				if(cuentas[i].follow[j]!=config.cuentas[i].follow[j]){
				    diferencias++;
				}
			    }
			} 
			else{
			    diferencias++;
			}
			//Finaliza comparación de los follow a buscar
			
		    }
		}
		else{
		    diferencias++;
		}
		
		       //Validación que sirve para analizar si no se deben realizar cambios, o si se deben realizar cambios y reiniciar
		//el servicio
		if(diferencias!=0){
		    //Impresión del número de diferencias
		    console.log("Hay diferencias: "+diferencias); 
		    //en la variable otro se guarda el archivo config como lectura, y realización de cambios en objetos para su mejor lectura
		    //var otro=JSON.parse(fs.readFileSync('./config/escuchador/config.js', 'utf8').replace("module.exports=", "").replace(";",""));
		    var otro=JSON.parse(fs.readFileSync('escuchadores/escuchador/config.js', 'utf8').replace("module.exports=", "").replace(";",""));
		    var llaves=JSON.stringify(otro.llaves).replace("{", "{\n\t").replace(/,/g,",\n\t").replace("}", "\n}");
		    var accounts=JSON.stringify(cuentas).replace(/{/g, "{\n\t").replace(/"track"/g,'\n\t"track"').replace(/],/g,"],\n\t").replace(/]},/g,"]\n},\n").replace(/]}]/g,"]\n}]");
		    var cadena='module.exports= {\n"llaves" : \n'+llaves+',\n"cuentas" : \n'+accounts+'\n};';
		    //Realización de la escritura en el archivo config
		    fs.writeFile('escuchadores/escuchador/config.js', cadena, function(err) {
    			//Si hay un error lo imprime en consola, en caso contrario muestra un mensaje
    			if( err ){
        		    console.log( err );
    			}
    			else{
     	   		    console.log('Se ha escrito correctamente');
    			}
		    });//Cierra escritura del archivo
		    //se realiza el reinicio del archivo
		    //var restart=require("./restartServer.js");
		    //restart.restart();
		    diferencias=0;
		}
		db.close();
	    });
	});
    } //cierra find
}//Cierra comparador

// comparador.find();
