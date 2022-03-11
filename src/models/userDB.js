const { Schema, model } = require('mongoose');

let userDB = new Schema({
	_id: { type: String, required: true },
	coins: { type: Number, default: 0 },
	bans: { type: Number, default: 0 },
	exp: {
		xp: { type: Number, default: 0 },
		level: { type: Number, default: 1 }
	},
	cooldowns: {
		work: { type: Date, default: null },
		daily: { type: Date, default: null },
	}
});

let User = model('User', userDB);
module.exports = User;
