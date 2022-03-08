const Command = require('../../structures/Command');
const { exec } = require('child_process');

const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

module.exports = class Shell extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'shell';
		this.category = 'Developing';
		this.description = 'Simule um código no Bot.';
		this.aliases = ['sh'];

		this.staffOnly = true;
	}

	async execute ({ message, args }) {

        if(!args[0]) {return;}

		exec(args.join(' '), async (_err, stdout, stderr) => {
			if (!stdout && !stderr) {
				message.reply(`Erro fds, n sei oq colocar aq`);
				return;
			}

			const res = (stdout || stderr).replace(ANSI_REGEX, '');

			if (stderr) {
				await message.reply({ content: `Stderr: \`\`\`sh\n${res.slice(0, 2000)}\n\`\`\`` });
			}
			else {
				await message.reply({ content: `**Stdout:**\`\`\`sh\n${res.slice(0, 2000)}\n\`\`\`` });
			}
		});
		
	}
};