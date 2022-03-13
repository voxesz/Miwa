const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class Report extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'report';
		this.category = 'Bot';
		this.description = 'Reporte uma pessoa que está abusando de bugs.';
		this.aliases = ['reportar', 'denunciar'];
	}

	async execute ({ message, args, prefix }) {

        const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first()

        if(!USER) return message.reply(`${e.UserError} › Você **precisa** inserir o **usuário** que deseja **reportar**.\n> ${e.Tip} › **Dica:** Utilize **${prefix}report <@Membro> <Motivo>**`)
        if(!args[1]) return message.reply(`${e.InsertError} › Você **precisa** inserir o **motivo** do reporte.\n> ${e.Tip} › **Dica:** Utilize **${prefix}report <@Membro> <Motivo>**`)
		const motivo = args.slice(1).join(" ");
		const image = message.attachments.first()
        if(!image) return message.reply(`${e.Upload} › Você precisa **anexar** uma prova.`)
		if(motivo.length < 10) return message.reply(`${e.Size} › O **motivo** deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.REPORT_ID);

		const embed = new Embed(message.author)
		.setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
		.setDescription(`${e.Alert} › Um novo **reporte** foi enviado.\n\n> ${e.Criminal} › Usuário reportado: **${USER.tag} (${USER.id})**\n>\n> ${e.User} › Autor: **${message.author.tag}**\n> ${e.Earth} › Guilda: **${message.guild.name}**`)
		.setImage(image.url)
		channel.send({content: `<@&${process.env.STAFF_ID}>`,embeds: [embed]})
		await message.reply(`${e.Success} › Reporte **enviado** a minha equipe com **sucesso**, logo resolveremos a situação! :>`)
		
	}
};