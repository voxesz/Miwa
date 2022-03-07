const Command = require('../../structures/Command');
const { MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')

module.exports = class Avatar extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'avatar';
		this.category = 'Information';
		this.description = 'Veja e baixe o avatar de um usuário';
		this.aliases = ['foto', 'av'];
	}

	async execute ({ message, args }) {

		let user = await this.client.getUser(args[0], message);
		if(!user) user = message.author;

		const avatar = user.displayAvatarURL({ dynamic: true, size: 2048 });

		const embed = new Embed(message.author)
			.setAuthor({ name: user.username, iconURL: user.avatarURL({ dynamic: true }) })
			.setDescription(`Clique no **botão** abaixo para **baixar** a foto do usuário.`)
			.setImage(avatar)

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setURL(`${avatar}`)
					.setLabel('')
					.setEmoji(e.Save)
					.setStyle("LINK")
			);

		message.reply({ embeds: [embed], components: [row] });
	}
};
