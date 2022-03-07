const Command = require('../../structures/Command');
const { inspect } = require('util');
const e = require('../../utils/Emojis');

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

			const msg = await message.reply({ content: `**Saída**: \`\`\`js\n${clean(inspect(evaled, { depth: 0 }).replace(new RegExp(this.client.token, 'gi'), '******************').slice(0, 1970))}\n\`\`\`` });
		}
		catch (error) {
			message.reply(`**Error:** \`\`\`js\n${String(error.stack.slice(0, 1970))}\n\`\`\``);
		}
	}
};