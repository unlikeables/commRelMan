function funcioniteradora(arreglo_a_iterar, variable_x, index, arreglo_almacenador, callback) {
  var more = index+1;
  var cuantos = arreglo_a_iterar.length();
  if (more > cuantos) {
    return callback(arreglo_almacenador);
  }
  else {
    setImmediate(function(){
      if (typeof arreglo_a_iterar[index] !== 'undefined') {
        // aquí procesamos, hacemos indexof y lo que sea, si el indexof > que -1 metemos al arreglo_almacenador;
        if (arreglo_a_iterar.indexOf(variable_x) >= 0) {
          arreglo_almacenador.push(variable_x);
          return funcioniteradora(arreglo_almacenador, variable_x, more, arreglo_almacenador, callback);
        }
        else {
          // si no, pues solo volvemos a llamar a la función
          return funcioniteradora(arreglo_almacenador, variable_x, more, arreglo_almacenador, callback);
        }
      }
      else {
        return funcioniteradora(arreglo_almacenador, variable_x, more, arreglo_almacenador, callback);
      }
    });
  }
};

// se llama asi
var arreglito = ['a','b','c','d','e','f','g'];
var variablita = c;
funcioniteradora(arreglito, variablita, 0, [], function(respuesta) {
  
});