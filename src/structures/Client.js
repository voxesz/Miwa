const { Client, Collection, WebhookClient } = require('discord.js');
const { promisify } = require('util');
const klaw = require('klaw');
const path = require('path');

const guildDB = require('../models/guildDB');
const userDB = require('../models/userDB');
const clientDB = require('../models/clientDB');

const readdir = promisify(require('fs').readdir);

module.exports = class NaitClient extends Client {
	constructor (options) {
		super(options);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.cooldowns = new Collection();
		this.guildDB = guildDB;
		this.userDB = userDB;
		this.clientDB = clientDB;

		this.getUser = this.findUser;
		this.sendLogs = this.commandLogs;

		this.developers = ['689265428769669155'];
	}

	load (commandPath, commandName) {
		const props = new (require(`${commandPath}/${commandName}`))(this);
		props.location = commandPath;

		if (props.init) {
			props.init(this);
		}

		this.commands.set(props.name, props);
		props.aliases.forEach((aliases) => {
			this.aliases.set(aliases, props.name);
		});
		return false;
	}

	async onLoad (client) {
		klaw('src/commands').on('data', (item) => {
			const cmdFile = path.parse(item.path);
			if (!cmdFile.ext || cmdFile.ext !== '.js') return;
			const response = client.load(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
			if (response) return;
		});

		const eventFiles = await readdir('./src/events/Client');
		eventFiles.forEach((file) => {
			const eventName = file.split('.')[0];
			const event = new (require(`../events/Client/${file}`))(client);
			client.on(eventName, (...args) => event.execute(...args));
			delete require.cache[require.resolve(`../events/Client/${file}`)];
		});
	}

	async findUser (args, message) {
		if (!args || !message) return;

		let user;

		if (/<@!?\d{17,18}>/.test(args)) {
			user = await message.client.users.fetch(args.match(/\d{17,18}/)?.[0]);
		}
		else {
			try {
				user = await message.guild.members.search({ query: args }).then((x) => x.first().user);
			}
			catch {}
			try {
				user = await message.client.users.fetch(args).catch(null);
			}
			catch {}
		}
		if (user) return user;
	}

	async commandLogs (content) {
		const webhookClient = new WebhookClient({
			token: String(process.env.LOGS_TOKEN),
			id: process.env.LOGS_ID,
		});
		webhookClient.send({
			embeds: [content],
		});
	}
};
