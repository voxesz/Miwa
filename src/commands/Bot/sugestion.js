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

        if(!args[0]) return message.reply(`${e.InsertError} › Insira a **sugestão** que deseja **enviar**.`)
		const sugestion = args.slice(0).join(" ");
        if(sugestion.length < 10) return message.reply(`${e.Size} › A **sugestão** deve ter no mínimo **10 caracteres**.`)

		const channel = this.client.channels.cache.get(process.env.SUGESTION_ID);

		const embed = new Embed(message.author)
		.setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
		.setDescription(`${e.Idea} › Nova **sugestão** enviada.\n\n> ${e.Tip} › Sugestão: **${sugestion}**\n> ${e.User} › Autor: **${message.author.tag}**`)
		const msg = await channel.send({embeds: [embed]})
        await msg.react(e.Like)
        await msg.react(e.Deslike)
		return message.reply(`${e.Success} › Sugestão **enviada** com **sucesso**, obrigada pela **ajuda**! :>`)
		
	}
};