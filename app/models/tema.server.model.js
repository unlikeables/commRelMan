'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Account Schema
 */
 var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

var TemaSchema = new Schema({
	tema: {
		type: String,
		required: 'Por favor agregue el nombre del tema',
	},
	subtemas: {
        subtema: String
    }
});

mongoose.model('Tema', TemaSchema);