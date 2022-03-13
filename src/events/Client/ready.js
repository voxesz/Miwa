module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute () {
		const client = await this.client.clientDB.findOne({clientID: this.client.user.id})
		if(!client) await this.client.clientDB.create({clientID: this.client.user.id})
		this.client.music.start(this.client.user.id);
		setInterval(() => {
			const status = [
				{
					name: 'Need help? Use -help | @Miwa',
				},
				{
					name: `Online in ${this.client.guilds.cache.size} guilds. | @Miwa`,
				},
				{
					name: `Pray for Ukraine | @Miwa`
				}
			];
			let randomStatus = status[Math.floor(Math.random() * status.length)];
			this.client.user.setActivity(randomStatus.name);
		}, 25 * 1000);

		console.log(`🟩 | ${this.client.user.username} iniciado com sucesso!`);
	}
};
