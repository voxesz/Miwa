const { Schema, model } = require('mongoose');

let clientDB = new Schema({
	clientID: { type: String, required: true },
	blacklist: { type: Array, default: [] }
});

let Client = model('Client', clientDB);
module.exports = Client;
