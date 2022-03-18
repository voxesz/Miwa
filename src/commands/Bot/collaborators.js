const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class Collaborators extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'collaborators';
		this.category = 'Bot';
		this.description = 'Veja as pessoas que ajudaram no meu desenvolvimento.';
		this.aliases = ['collab'];
	}

	async execute ({ message, args }) {

        const embed = new Embed(message.author)
        .setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
        .addFields([
            {
                name: `${e.Heart} › Colaboradores:`,
                value: `> [zSplinterUS](https://github.com/zSpl1nterUS)\n> [Niskii](https://github.com/Niskii3)\n> [yJon4s](https://github.com/yJon4ss)`
            },
            {
                name: `${e.Partners} › Parceiros:`,
                value: `> [Zafriel](https://discord.gg/Tr4ZtYt7YM)\n> [Suki](https://discord.gg/xBe7hABxMD)\n> [Siesta](https://discord.gg/359uJGepyU)\n> [Tune](https://discord.com/api/oauth2/authorize?client_id=725067926457155706&scope=bot%20applications.commands&permissions=3525952)`
            }
        ])

        message.reply({embeds: [embed]})
		
	}
};