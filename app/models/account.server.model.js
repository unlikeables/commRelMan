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

var AccountSchema = new Schema({
	marca: {
		type: String,
		default: '',
		required: 'Por favor agregue el nombre de la marca',
		trim: true
	},
	nombreSistema: {
		type: String,
		default: '',
		required: 'Por favor agregue el nombre clave en el sistema',
		trim: true
	},
	datosPage: {
		type: {},
		default: '',
		trim: true
	},
/*	telefono: {
		type: String,
		trim: true,
		default: '',
		required: 'Por favor agregue el número de teléfono',
		validate: [validateLocalStrategyProperty, 'Por favor agregue el número de teléfono'],
		match: [/^([0-9\+\s\+\-])+$/, 'Por favor agregue un número de teléfono válido']
	},*/
	correo: {
		type: String,
		trim: true,
		default: '',
		required: 'Por favor agregue el su correo electrónico',
		validate: [validateLocalStrategyProperty, 'Por favor agregue su correo'],
		match: [/.+\@.+\..+/, 'Por favor agregue un correo válido']
	},
/*	google_api_key: {
		type: String,
		default: '',
		required: 'Por favor agregue la APPI KEY de google',
		trim: true
	},*/
	twitter_consumer_key: {
		type: String,
		default: '',
		required: 'Por favor agregue la COSTUMER KEY de Twitter',
		trim: true
	},
	twitter_consumer_secret: {
		type: String,
		default: '',
		required: 'Por favor agregue la COSTUMER SECRET de Twitter',
		trim: true
	},
	twitter_access_token: {
		type: String,
		default: '',
		required: 'Por favor agregue el ACCESS TOKEN de Twitter',
		trim: true
	},	
	twitter_access_token_secret: {
		type: String,
		default: '',
		required: 'Por favor agregue el ACCESS TOKEN SECRET de Twitter',
		trim: true
	},
	twitter_screenname_principal: {
		type: String,
		default: '',
		required: 'Por favor agregue el SCREEN NAME de la cuenta principal de Twitter',
		trim: true
	},
	twitter_id_principal: {
		type: String,
		default: '',
		required: 'Por favor agregue el ID de la cuenta principal de Twitter',
		trim: true
	},
	twitter_screenname_respuesta: {
		type: String,
		default: '',
		required: 'Por favor agregue el SCREEN NAME de la cuenta de respuesta de Twitter',
		trim: true
	},
	twitter_id_respuesta: {
		type: String,
		default: '',
		required: 'Por favor agregue el ID de la cuenta de respuesta de Twitter',
		trim: true
	},
	terminos: {
		type: String,
		default: '',
		required: 'Por favor agregue los términos a buscar separados por comas',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Account', AccountSchema);