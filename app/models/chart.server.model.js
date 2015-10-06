'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Chart Schema
 */
var ChartSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Chart name',
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

mongoose.model('Chart', ChartSchema);