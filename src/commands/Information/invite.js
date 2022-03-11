const Command = require('../../structures/Command');
const { MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')

module.exports = class Avatar extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'invite';
		this.category = 'Information';
		this.description = 'Veja os meus links.';
		this.aliases = ['link', 'links'];
	}

	async execute ({ message, args }) {

		const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setURL(
                `https://discord.com/oauth2/authorize?client_id=924840595959218196&permissions=534722768118&scope=bot`
              )
              .setLabel("Me adicione")
              .setEmoji(e.Add)
              .setStyle("LINK"),
            new MessageButton()
              .setURL(`https://discord.gg/Gfbd7kBGmw`)
              .setLabel("Suporte")
              .setEmoji(e.Link)
              .setStyle("LINK"),
			);

		message.reply({ content: ` `, components: [row] });
	}
};
