'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Influencer Schema
 */
var InfluencerSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Influencer name',
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

mongoose.model('Influencer', InfluencerSchema);