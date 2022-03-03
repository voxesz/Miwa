module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute () {
		setInterval(() => {
			const status = [
				{
					name: 'Precisa de ajuda? Utilize n.help',
				},
				{
					name: `Online em ${this.client.guilds.cache.size} servidores.`,
				},
			];
			let randomStatus = status[Math.floor(Math.random() * status.length)];
			this.client.user.setActivity(randomStatus.name);
		}, 25 * 1000);

		console.log('🟩 | Nait iniciado com sucesso!');
	}
};
