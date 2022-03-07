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

        if(!args[0]) return message.reply(`${e.Error} | ${message.author}, insira o Bug que deseja reportar ao meu desenvolvedor.`)
		const bug = args.slice(0).join(" ");
		const image = message.attachments.first()
		if(bug.length < 10) return message.reply(`${e.Error} | ${message.author}, o bug deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.BUG_ID);

		const embed = new Embed(message.author)
		.setTitle(`${e.Config} Bug encontrado!`)
		.addFields([
			{
				name: `${e.Mouse} Bug reportado:`,
				value: `> ${bug}`
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
		.setImage(!image ? message.author.avatarURL({size: 2048}) : image)
		channel.send({content: `<@${process.env.OWNER_ID}>`, embeds: [embed]})
		await message.reply(`${e.Correct} | ${message.author}, bug reportado com sucesso. Obrigado pela colaboração!`)
		
	}
};