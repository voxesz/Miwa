
module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (packet) {
		this.client.music.handleVoiceUpdate(packet);
	}
};