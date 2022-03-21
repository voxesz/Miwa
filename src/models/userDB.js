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
		coinFlip: { type: Date, default: null },
	},
	social: {
		name: { type: String, default: null },
		bio: { type: String, default: null },
		followers: { type: Array, default: [] },
		following: { type: Array, default: [] },
		verified: { type: Boolean, default: false },
		backgrounds: { type: Array, default: [1] },
		actual: { type: Number, default: 1 }
	}
});

let User = model('User', userDB);
module.exports = User;
