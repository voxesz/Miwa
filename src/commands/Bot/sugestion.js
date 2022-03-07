const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class Sugestion extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'sugestion';
		this.category = 'Bot';
		this.description = 'Faça uma sugestão para o Bot.';
		this.aliases = ['suggest', "sugerir", "sugestão"];
	}

	async execute ({ message, args }) {

        if(!args[0]) return message.reply(`${e.Error} | ${message.author}, insira a sua sugestão.`)
		const sugestion = args.slice(0).join(" ");
        if(sugestion.length < 10) return message.reply(`${e.Error} | ${message.author}, a sugestão deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.SUGESTION_ID);

		const embed = new Embed(message.author)
		.setTitle(`${e.Thunder} Nova Sugestão!`)
		.addFields([
			{
				name: `${e.Mouse} Sugestão:`,
				value: `> ${sugestion}`
			},
			{
				name: `${e.Member} Autor:`,
				value: `> ${message.author.tag}`
			},
		])
		const msg = await channel.send({content: `<@${process.env.OWNER_ID}>`, embeds: [embed]})
        await msg.react(e.Like)
        await msg.react(e.Deslike)
		return message.reply(`${e.Correct} | ${message.author}, sugestão enviada com sucesso. Obrigado pela colaboração!`)
		
	}
};