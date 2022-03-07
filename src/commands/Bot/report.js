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

	async execute ({ message, args }) {

        const USER = this.client.users.cache.get(args[0]) || message.mentions.users.first()

        if(!USER) return message.reply(`${e.Error} | ${message.author}, insira o usuário que deseja reportar.`)
        if(!args[1]) return message.reply(`${e.Error} | ${message.atuhor}, insira o motivo do reporte.`)
		const motivo = args.slice(1).join(" ");
		const image = message.attachments.first()
        if(!image) return message.reply(`${e.Error} | ${message.author}, você precisa anexar uma prova.`)
		if(motivo.length < 10) return message.reply(`${e.Error} | ${message.author}, o motivo deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.REPORT_ID);

		const embed = new Embed(message.author)
		.setTitle(`${e.Config} Novo Report!`)
		.addFields([
            {
                name: `${e.MemberRemove} Usuário reportado:`,
                value: `> ${USER.tag}\n> ${USER.id}`
            },
			{
				name: `${e.Mouse} Motivo:`,
				value: `> ${motivo}`
			},
			{
				name: `${e.Member} Autor:`,
				value: `> ${message.author.tag}`
			},
			{
				name: `${e.World} Servidor:`,
				value: `> ${message.guild.name}`
			}
		])
		.setImage(image.url)
		channel.send({content: `<@${process.env.OWNER_ID}>`,embeds: [embed]})
		await message.reply(`${e.Correct} | ${message.author}, usuário reportado com sucesso. Obrigado pela colaboração!`)
		
	}
};