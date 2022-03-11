const Command = require('../../structures/Command');
const e = require('../../utils/Emojis')

module.exports = class Prefix extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'prefix';
		this.category = 'Config';
		this.description = 'Altere o meu prefixo em seu servidor.';
		this.aliases = ['prefixo', 'setprefix'];

        this.userPermissions = ['MANAGE_GUILD'];
	}

	async execute ({ message, args, prefix }) {

        const guildDBData = await this.client.guildDB.findOne({ guildID: message.guild.id });

		if(!args[0]) return message.reply(`${e.Config} › Meu **prefixo** atual nesta guilda é **${prefix}**\n> ${e.Tip} | Para **altera-lo**, utilize o comando **${prefix}prefix <prefixo>**`);

		if(args[0].length > 3) {
			return message.reply(`${e.Size} › O **prefixo** deve ter no máximo **3 caracteres**.`);
		}

		if (guildDBData) {
			guildDBData.prefix = args[0];
			await guildDBData.save();
		}
		else {
			await this.client.guildDB.create({
				guildID: message.guild.id,
				prefix: args[0]
			});
		}

		message.reply(`${e.Success} › Meu **prefixo** nesta guilda foi **alterado** para **${args[0]}**`);
		
	}
};
