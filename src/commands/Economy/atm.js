const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');

module.exports = class Atm extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'atm';
		this.category = 'Economy';
		this.description = 'Veja quantas gems o usuário possui.';
		this.aliases = ['coins', "gems"];
	}

	async execute ({ message, args }) {

		let USER = await this.client.getUser(args[0], message);
		if(!USER) USER = message.author;

		const user = await this.client.userDB.findOne({ _id: USER.id });

		return message.reply(`${e.Money} | ${USER.id == message.author.id ? "**Você** possui" : `O(a) **${USER.tag}** possui`} atualmente **${!user ? "0" : user.coins.toLocaleString()} gems**.`);

	}
};
