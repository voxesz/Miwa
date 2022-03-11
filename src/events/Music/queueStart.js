const e = require('../../utils/Emojis');

module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (player, track) {
		if (player.reconnect) {
			delete player.reconnect;
			return;

		}
		  if (!player.textChannelId) return;

		const channel = this.client.channels.cache.get(player.textChannelId);

		if (player.lastPlayingMsgID) {
			const msg = channel.messages.cache.get(player.lastPlayingMsgID);

			if (msg) msg.delete();
		}

		if(player.trackRepeat === true) {
			return;
		}

	}
};