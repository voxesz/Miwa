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
          name: `Informações Básicas:`,
          value: `${
            e.Dev
          } | Criador: **[vxk 🖤#1834](https://github.com/VCScript)**\n${
            e.Member
          } | Usuários: **${this.client.users.cache.size.toLocaleString()}**\n${
            e.World
          } | Guildas: **${this.client.guilds.cache.size}**\n${
            e.Archives
          } | Comandos: **${this.client.commands.size}**`,
        },
        {
          name: `Informações Técnicas:`,
          value: `${e.Config} | Tempo Online: **${uptime}**\n${e.Archive} | RAM: **${ram}MB**\n${e.Discord} | Livraria: **[Djs](https://discord.js.org/#/) ( v${version} )**\n${e.NodeJS} | NodeJS: **[${process.version}](https://nodejs.org/en/)**`,
        },
      ]);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=924840595959218196&permissions=534722768118&scope=bot`
        )
        .setLabel("Me adicione")
        .setEmoji(e.Link)
        .setStyle("LINK"),
      new MessageButton()
        .setURL(`https://discord.gg/Gfbd7kBGmw`)
        .setLabel("Suporte")
        .setEmoji(e.Help)
        .setStyle("LINK")
    );

    message.reply({ embeds: [embed], components: [row] });
  }
};
