const Command = require('../../structures/Command');
const { inspect } = require('util');
const e = require('../../utils/Emojis');
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class Eval extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'eval';
		this.category = 'Developing';
		this.description = 'Simule um código no Bot.';
		this.aliases = ['ev', 'e'];

		this.staffOnly = true;
	}

	async execute ({ message, args }) {

		if(!args[0]) return;

		let x = new MessageButton();
		x.setCustomId('x');
		x.setStyle("SECONDARY");
		x.setEmoji(e.Trash);

		const filter = i => ['x'].includes(i.customId);

		const collector = message.channel.createMessageComponentCollector({ filter, time: 120000, idle: 120000 });

		let row = new MessageActionRow().setComponents(x);

		const clean = (text) => {
			if (text === 'string') {
				text = text.slice(0, 1970)
					.replace(/`/g, `\`${String.fromCharCode(8203)}`)
					.replace(/@/g, `@${String.fromCharCode(8203)}`);
			}
			return text;
		};

		try {
			const code = args.join(' ');
			let evaled = eval(code);

			if (evaled instanceof Promise) {evaled = await evaled;}

			const msg = await message.reply({ content: `**Saída**: \`\`\`js\n${clean(inspect(evaled, { depth: 0 }).replace(new RegExp(this.client.token, 'gi'), '******************').slice(0, 1970))}\n\`\`\``, components: [row] });
			collector.on('collect', async (button) => {

				if (button.user.id != message.author.id) {
					return await button.reply({ content: `${e.Error} › **Desculpe**, você precisa **utilizar** o comando para **isto**.`, ephemeral: true });
				}

				switch(button.customId) {
					case 'x':
						await msg.edit({ content: `${e.Success} › **Resultado** do eval **fechado** com sucesso.`, components: [] });

						collector.stop();
						break;
				}
			});
		}
		catch (error) {
			message.reply(`**Error:** \`\`\`js\n${String(error.stack.slice(0, 1970))}\n\`\`\``);
		}
	}
};