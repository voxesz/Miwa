const e = require('../../utils/Emojis');

module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (player, track) {
		const channel = this.client.channels.cache.get(player.textChannelId);
		if(!player.textChannelId) {
			return;
		}

		channel.send(`${e.Error} | Ocorreu um erro ao reproduzir a música.`);
		player.skip();

		console.error(`🟥 | Ocorreu um erro em uma música no servidor ${player.guildId}. Música: ${track.title}`);
	}
};