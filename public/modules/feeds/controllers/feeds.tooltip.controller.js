'use strict';

// Feeds controller
angular
    .module('feeds')
    .controller('FeedsTooltip', function ($scope) {
	console.log($scope);
	$scope.htmlTooltip = '<a data-ng-controller="ModalDemoCtrl" data-ng-click="open({{twit}})">Responder</a><br><a>Descartar</a>';
    });


