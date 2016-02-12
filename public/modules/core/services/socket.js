'use strict';
/*global io:false */
//socket factory that provides the socket service

/*angular.module('core').service('Socket', ['$rootScope','$location','Authentication', function ($rootScope,$location,Authentication) {
	console.log();
 if (Authentication.user) {
      this.socket = io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() ,{query:'cuenta='+Authentication.user.cuenta.marca});
    } else {
      $location.path('/');
    }
    console.log('SOCKET ON SERVICE !!!');
    console.log(this.socket)
    this.on = function(eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function(data) {
            callback(data);
        });
      }
    };

    this.emit = function(eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    this.removeAllListeners = function(eventName) {
    	console.log('REMOVIENDO !!!!');
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };

  }
]);*/



angular.module('core').factory('Socket', ['socketFactory', '$location','Authentication',
  function(socketFactory, $location, Authentication) {


    if(Authentication.user.cuenta){
      var socket = io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() ,{query:'cuenta='+Authentication.user.cuenta.marca});
    }else{
      var socket = io.connect();
    }
    if(socket){
        socket.on('error',function(){
      console.log('El socket se desconecto !!!');
    });
    
    return socketFactory({
      prefix: '',
      //ioSocket: io.connect('http://localhost:8080')
      ioSocket: socket
    });

    }

  }
]);



/*angular.module('core').factory('Socket', ['socketFactory', '$location','Authentication',
  function(socketFactory, $location, Authentication) {
    //console.log($location.protocol() + '://' + $location.host() + ':' + $location.port());
    if(Authentication.user.cuenta){
      var socket = io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() ,{query:'cuenta='+Authentication.user.cuenta.marca});
    }else{
      var socket = io.connect();
    }
    if(socket){
        socket.on('error',function(){
      console.log('El socket se desconecto !!!');
    });
    return socket;
    }
  	
   /* return socketFactory({
      prefix: '',
      ioSocket: io.connect( $location.protocol() + '://' + $location.host() + ':' + $location.port() ,{query:'cuenta='+Authentication.user.cuenta.marca})
    });
  }
]);*/