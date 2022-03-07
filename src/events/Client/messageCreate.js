/* eslint-disable no-undef */
const { MessageActionRow, MessageButton, Collection } = require("discord.js");
const moment = require("moment");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

module.exports = class messageCreate {
  constructor(client) {
    this.client = client;
  }

  async execute(message) {
    const { cooldowns } = this.client;
    if (!message.guild || message.author.bot) return;

    const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);

    const server = await this.client.guildDB.findOne({
      guildID: message.guild.id,
    });
    if (!server)
      await this.client.guildDB.create({ guildID: message.guild.id });

    var prefix = prefix;
    if (!server) {
      prefix = "-";
    } else {
      prefix = server.prefix;
    }

    if (message.content.match(GetMention(this.client.user.id))) {
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setURL(
            `https://discord.com/oauth2/authorize?client_id=924840595959218196&permissions=534722768118&scope=bot`
          )
          .setLabel("Me adicione")
          .setEmoji(e.Link)
          .setStyle("LINK"),
        new MessageButton()
          .setURL(
            `https://discord.gg/Gfbd7kBGmw`
          )
          .setLabel("Suporte")
          .setEmoji(e.Help)
          .setStyle("LINK")
      );
      message.reply({
        content: `${e.Mouse} | Olá ${message.author}! Está precisando de ajuda? Utilize **${prefix}help**.`, components: [row]
      });
    }

    if (message.content.indexOf(prefix) !== 0) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd =
      this.client.commands.get(command) ||
      this.client.commands.get(this.client.aliases.get(command));

    if (!cmd) return;

    if (message.guild) {
      let needPermissions = [];

      cmd.botPermissions.forEach((perm) => {
        if (["SPEAK", "CONNECT"].includes(perm)) {
          if (!message.member.voice.channel) return;
          if (
            !message.member.voice.channel
              .permissionsFor(message.guild.me)
              .has(perm)
          ) {
            needPermissions.push(perm);
          }
        } else if (
          !message.channel.permissionsFor(message.guild.me).has(perm)
        ) {
          needPermissions.push(perm);
        }
      });

      if (needPermissions.length > 0) {
        const needPerm = [];

        for (let perms of needPermissions) {
          if (!message.member.permissions.has(perms)) {
            needPerm.push(perms);
          }
        }
        return message.reply(
          `${e.Error} | ${
            message.author
          }, eu preciso da(s) permissão(ões) \`${needPerm.join(
            ", "
          ).replace("_", " ")}\` para isso.`
        );
      }

      let neededPermissions = [];
      cmd.userPermissions.forEach((perm) => {
        if (!message.channel.permissionsFor(message.member).has(perm)) {
          neededPermissions.push(perm);
        }
      });

      if (
        neededPermissions.length > 0 &&
        !this.client.developers.some((x) => x === message.author.id)
      ) {
        const neededPerm = [];

        for (let perms of neededPermissions) {
          if (!message.member.permissions.has(perms)) {
            neededPerm.push(perms);
          }
        }
        return message.reply(
          `${e.Error} | ${
            message.author
          }, você precisa da(s) permissão(ões) \`${neededPerm.join(
            ", "
          ).replace("_", " ")}\` para isso.`
        );
      }
    }

    if (
      cmd.staffOnly &&
      !this.client.developers.some((x) => x === message.author.id)
    ) {
      return;
    }

    if (!this.client.developers.some((x) => x === message.author.id)) {
      if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Collection());

      const now = Date.now();
      const timestamps = cooldowns.get(cmd);
      const cooldownAmount = (cmd.cooldown || 3) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime =
          timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply({
            content: `${e.Error} | ${
              message.author
            }, você precisa esperar **${timeLeft.toFixed(
              1
            )} segundos** para usar este comando.`,
          });
        }
      }
      timestamps.set(message.author.id, now);

      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (server.cmd.status) {
      if (!this.client.developers.some((x) => x === message.author.id)) {
        if (server.cmd.cmds.some((x) => x === cmd.name))
          return message.reply(
            `${e.Error} | ${message.author}, este comando foi bloqueado pela Equipe do(a) **${message.guild.name}**.`
          );
        if (!server.cmd.channels.some((x) => x === message.channel.id)) {
          if (!message.member.permissions.has("ADMINISTRATOR"))
            return message.reply(`${server.cmd.message}`);
        }
      }
    }

    if (command) {
      const cliente = await this.client.clientDB.findOne({
        clientID: this.client.user.id,
      });

      if (cliente.blacklist.some((x) => x == message.author.id)) {
        return message.reply(
          `${e.Error} | ${message.author}, você está em minha Lista Negra, portanto não pode me usar.`
        );
      }

      const embedError = new Embed(this.client.user)
        .setAuthor({
          name: `${this.client.user.username} | Logs`,
          iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `Comando **${cmd.name}** executado no servidor **${message.guild.name}** (\`${message.guild.id}\`)`
        )
        .addFields(
          {
            name: "Args",
            value: `\`${args.join(" ")}\``,
          },
          {
            name: "Usuário",
            value: `**${message.author.tag}** (\`${message.author.id}\`)`,
          },
          {
            name: "Data",
            value: `**${moment(Date.now()).format("L LT")}**`,
          }
        );
      this.client.sendLogs(embedError);

      try {
        await cmd.execute({ message, args, prefix });
      } catch (err) {
        await message.reply(
          `Desculpe um erro ocorreu e o comando não foi executado corretamente. Eu peço para você reportar o erro para meus desenvolvedores e esperar que seja corrigido. Obrigado.`
        );
        console.log(err);
      }
      const user = await this.client.userDB.findOne({ _id: message.author.id });
      if (!user) await this.client.userDB.create({ _id: message.author.id });
    }
  }
};
