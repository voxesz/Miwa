const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class Collaborators extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'collaborators';
		this.category = 'Bot';
		this.description = 'Veja as pessoas que colaboraram no desenvolvimento da Miwa.';
		this.aliases = ['collabs', 'contributors'];
	}

	async execute ({ message, args }) {

        const embed = new Embed(message.author)
        .setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
        .setDescription(`Obrigado a todos que confiaram neste projeto, agradeço de coração. <3`)
        .addFields([
            {
                name: `${e.Heart} › Colaboradores:`,
                value: `> **Niskii** - ( Niskii#6694 )\n> **Jonas** - ( yJon4s_#4747 )\n> **Taiga** - ( Taiga Aisaka#9759 )\n> **Splinter** - ( zSpl1nterUS_#6455 )`
            },
            {
                name: `${e.Like} › Parcerias:`,
                value: `> **[Zafriel](https://discord.gg/vsYPVtg4mM)** ( BOT )`
            }
        ])

        message.reply({embeds: [embed]})
		
	}
};