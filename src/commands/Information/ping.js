const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');

module.exports = class Ping extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'ping';
		this.category = 'Information';
		this.description = 'Veja o ping do BOT.';
		this.aliases = ['pong', '🏓', ':ping_pong:'];
	}

	async execute ({ message }) {
		const startDB = process.hrtime();
		await this.client.userDB.findOne({ idU: message.author.id });
		const stopDB = process.hrtime(startDB);
		const pingDB = Math.round((stopDB[0] * 1e9 + stopDB[1]) / 1e6);

		const lavalinkUSAPing = await this.client.music.nodes.find(n => n.identifier === 'Cosmos').ping();
		const lavalinkEuPing = await this.client.music.nodes.find(n => n.identifier === 'Aurora').ping();

		message.reply(`${e.Tip} › Veja minhas conexões abaixo:\n> ${e.Wifi} | API Ping: **${this.client.ws.ping}ms**\n> ${e.Earth} | Database Ping: **${pingDB}ms**\n> ${e.Volcano} | Lavalink: **${lavalinkUSAPing}ms** | **${lavalinkEuPing}ms**`);
	}
};
