/* eslint-disable no-undef */
const { MessageEmbed, Util, Collection } = require('discord.js');
const moment = require('moment');
const e = require('../../utils/Emojis');

module.exports = class messageCreate {
	constructor (client) {
		this.client = client;
	}

	async execute (message) {
		const { cooldowns } = this.client;
		if(!message.guild || message.author.bot) return;

		const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);

		const server = await this.client.guildDB.findOne({ guildID: message.guild.id });
    if(!server) await this.client.guildDB.create({ guildID: message.guild.id });

		var prefix = prefix;
		if(!server) {
			prefix = 'n.';
		}
		else {
			prefix = server.prefix;
		}

		if (message.content.match(GetMention(this.client.user.id))) {
			message.reply(`Olá ${message.author}! Meu prefixo é ${prefix}`);
		}

		if (message.content.indexOf(prefix) !== 0) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		const cmd =
      this.client.commands.get(command) ||
      this.client.commands.get(this.client.aliases.get(command));

	  if (!cmd) return;

	  if(message.guild) {
		  let needPermissions = [];

		  cmd.botPermissions.forEach((perm) => {
			  if(['SPEAK', 'CONNECT'].includes(perm)) {
				  if(!message.member.voice.channel) return;
				  if (!message.member.voice.channel.permissionsFor(message.guild.me).has(perm)) {
					  needPermissions.push(perm);
				  }
				}
				else if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
					needPermissions.push(perm);
				}
		  });

		  if (needPermissions.length > 0) {
				const needPerm = [];

				for(let perms of needPermissions) {
				  if(!message.member.permissions.has(perms)) {
					  needPerm.push(perms);
				  }
			 }
				return message.reply(`${e.Error} | ${message.author}, eu não possuo permissão.`);
			}

			let neededPermissions = [];
			cmd.userPermissions.forEach((perm) => {
				if (!message.channel.permissionsFor(message.member).has(perm)) {
					neededPermissions.push(perm);
				}
			});

			if (neededPermissions.length > 0 && !this.client.developers.some(x => x === message.author.id)) {
				const neededPerm = [];

				for(let perms of neededPermissions) {
					  if(!message.member.permissions.has(perms)) {
						  neededPerm.push(perms);
					  }
				 }
				return message.reply(`${e.Error} | ${message.author}, você precisa da(s) permissão(ôes) \`${neededPerm.join(', ')}\` para isso.`);
			}
	  }

	  if (cmd.staffOnly && !this.client.developers.some(x => x === message.author.id)) {
			return;
		}

	  if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Collection());

	  const now = Date.now();
	  const timestamps = cooldowns.get(cmd);
	  const cooldownAmount = (cmd.cooldown || 3) * 1000;

	  if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
		  const timeLeft = (expirationTime - now) / 1000;
		  return message.reply({ content: `${e.Error} | ${message.author}, você precisa esperar ${timeLeft.toFixed(1)} para usar este comando.` });
			}
	  }
	  timestamps.set(message.author.id, now);

	  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		if(command) {
			const embedError = new MessageEmbed()
			    .setAuthor({ name: `${this.client.user.username} | Logs`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
				.setTimestamp()
				.setColor(process.env.COLOR)
				.setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
				.setDescription(`Comando **${cmd.name}** executado no servidor **${message.guild.name}** (\`${message.guild.id}\`)`)
				.addFields(
					{
						name: 'Args',
						value: `\`${args.join(' ')}\``
					},
					{
						name: 'Usuário',
						value: `**${message.author.tag}** (\`${message.author.id}\`)`
					},
					{
						name: 'Data',
						value: `**${moment(Date.now()).format('L LT')}**`
					},
				);
			this.client.sendLogs(embedError);

			try {
				await cmd.execute({ message, args });
			}
			catch (err) {
				await message.reply(`Desculpe um erro ocorreu e o comando não foi executado corretamente. Eu peço para você reportar o erro para meus desenvolvedores e esperar que seja corrigido. Obrigado.`);
				console.log(err);
			}
			const user = await this.client.userDB.findOne({ _id: message.author.id });
			if(!user) await this.client.userDB.create({ _id: message.author.id });
		}
	}
};
