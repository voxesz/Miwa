const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class Bug extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'bug';
		this.category = 'Bot';
		this.description = 'Reporte um bug ao meu desenvolvedor.';
		this.aliases = ['reportbug'];
	}

	async execute ({ message, args }) {

        if(!args[0]) return message.reply(`${e.InsertError} › Insira o **BUG** que deseja **reportar** ao meu **desenvolvedor**.`)
		const bug = args.slice(0).join(" ");
		const image = message.attachments.first()
		if(bug.length < 10) return message.reply(`${e.Size} › O **BUG** deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.BUG_ID);

		const embed = new Embed(message.author)
		.setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
		.setDescription(`${e.Bug} › Um novo **BUG** foi encontrado.\n\n> ${e.BugInfo} › BUG encontrado: **${bug}**\n> ${e.User} › Autor: **${message.author.tag}**\n> ${e.Earth} › Guilda: **${message.guild.name}**`)
		.setImage(image)
		await channel.send({content: `<@${process.env.OWNER_ID}>`, embeds: [embed]})
		return message.reply(`${e.Success} › BUG **enviado** ao meu desenvolvedor com **sucesso**, obrigada pela **ajuda**! :>`)
		
	}
};