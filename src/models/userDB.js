const { Schema, model } = require('mongoose');

let userDB = new Schema({
	_id: { type: String, required: true },
	coins: { type: Number, default: 0 },
	daily: { type: Number, default: 0 },
	bans: { type: Number, default: 0 },
	exp: {
		xp: { type: Number, default: 0 },
		level: { type: Number, default: 1 }
	}
});

let User = model('User', userDB);
module.exports = User;
