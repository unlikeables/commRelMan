'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Csv Schema
 */
var CsvSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Csv name',
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

mongoose.model('Csv', CsvSchema);