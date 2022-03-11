const e = require('../../utils/Emojis');

module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (player) {
		const channel = this.client.channels.cache.get(player.textChannelId);

		player.destroy();
		await channel.send(`${e.Trash} | A fila de músicas acabou, portanto eu sai.`);
	}
};