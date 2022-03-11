module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (node) {
		console.log(`🟩 | Node ${node.identifier} conectado!`);

		for (const player of [...this.client.music.players.values()].filter(p => p.node === node).values()) {
			const position = player.position;
			player.connect();
			player.play({ startTime: position });
		  }

		setInterval(() => {
			node.send({
				op: 'ping',
			});
		}, 45000);
	}
};