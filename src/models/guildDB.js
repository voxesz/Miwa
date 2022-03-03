const { Schema, model } = require('mongoose');

let guildDB = new Schema({
	guildID: { type: String },
	prefix: { type: String, default: 'n.' },
});

let Guild = model('Guild', guildDB);
module.exports = Guild;
