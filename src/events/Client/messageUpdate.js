module.exports = class {
	constructor (client) {
		this.client = client;
	}

	async execute (oldMessage, newMessage) {

		if (newMessage.author.bot || !newMessage.guild) return;
		if (oldMessage.content === newMessage.content) return;

		this.client.emit('messageCreate', newMessage);
	}
};
