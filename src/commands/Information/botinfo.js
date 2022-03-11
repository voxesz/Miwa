const Command = require("../../structures/Command");
const { MessageActionRow, MessageButton, version } = require("discord.js");
const Embed = require("../../structures/Embed");
const e = require("../../utils/Emojis");
const moment = require("moment");

module.exports = class Botinfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "botinfo";
    this.category = "Information";
    this.description = "Veja as informações do Bot.";
    this.aliases = ["bi"];
  }

  async execute({ message, args }) {
    moment.locale("pt-BR");

    const users = this.client.guilds.cache.map((g) => g.memberCount).reduce((a, g) => a + g).toLocaleString();
    const uptime = moment
      .duration(this.client.uptime)
      .format("d[d] h[h] m[m] s[s]");
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = new Embed(message.author)
      .setAuthor({
        name: this.client.user.username,
        iconURL: this.client.user.avatarURL(),
      })
      .setThumbnail(this.client.user.avatarURL({ size: 2048 }))
      .addFields([
        {
          name: `${e.List} › Informações Básicas:`,
          value: `> ${
            e.Developer
          } | Criador: **[vxk 🖤#1834](https://github.com/VCScript)**\n> ${
            e.User
          } | Usuários: **${users}**\n> ${
            e.Earth
          } | Guildas: **${this.client.guilds.cache.size}**\n> ${
            e.Command
          } | Comandos: **${this.client.commands.size}**`,
        },
        {
          name: `${e.Config} › Informações Técnicas:`,
          value: `> ${e.Time} | Tempo Online: **${uptime}**\n> ${e.Memory} | Memória RAM: **${ram}MB**\n> ${e.Programming} | Livraria: **[Djs](https://discord.js.org/#/) ( v${version} )**\n> ${e.JavaScript} | NodeJS: **[${process.version}](https://nodejs.org/en/)**`,
        },
      ]);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=924840595959218196&permissions=534722768118&scope=bot`
        )
        .setLabel("Me adicione")
        .setEmoji(e.Add)
        .setStyle("LINK"),
      new MessageButton()
        .setURL(`https://discord.gg/Gfbd7kBGmw`)
        .setLabel("Suporte")
        .setEmoji(e.Link)
        .setStyle("LINK"),
      new MessageButton()
        .setURL(`https://top.gg/bot/924840595959218196`)
        .setLabel("Vote em mim")
        .setEmoji(e.Love)
        .setStyle("LINK")
    );

    message.reply({ embeds: [embed], components: [row] });
  }
};
