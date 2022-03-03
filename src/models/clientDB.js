const { Schema, model } = require('mongoose');

let clientDB = new Schema({
	clientID: {
		required: true,
		type: String,
	},
});

let Client = model('Client', clientDB);
module.exports = Client;
