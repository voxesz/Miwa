const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");
const moment = require("moment");

module.exports = class Nodes extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "nodes";
    this.category = "Information";
    this.description = "Veja os status do lavalink.";
    this.aliases = ["node", "ls"];
  }

  async execute({ message, args }) {
    const nodes = this.client.music.nodes;
    const embed = new Embed(message.author).setAuthor({
      name: this.client.user.username,
      iconURL: this.client.user.avatarURL(),
    });

    embed.addFields([
        {
            name: `${e.Cosmos} › ${nodes[0].options.id}`,
            value: `> ${e.Switch} | Status: **${String(nodes[0].state).replace("0", "Reconectando").replace("1", "Conectado").replace("2", "Desconectado")}**
            > ${e.MusicBox} | Players: **${nodes[0].stats.players}**
            > ${e.Time} | Uptime: **${moment
              .duration(nodes[0].stats.uptime)
              .format("d[d] h[h] m[m] s[s]")}**\n> ${e.Memory} | RAM: **${(nodes[0].stats.memory.used / 1024 / 1024).toFixed(0)}MB**`,
            inline: true
        },
        {
            name: `${e.Andromeda} › ${nodes[1].options.id}`,
            value: `> ${e.Switch} | Status: **${String(nodes[1].state).replace("0", "Reconectando").replace("1", "Conectado").replace("2", "Desconectado")}**
            > ${e.MusicBox} | Players: **${nodes[1].stats.players}**
            > ${e.Time} | Uptime: **${moment
              .duration(nodes[1].stats.uptime)
              .format("d[d] h[h] m[m] s[s]")}**\n> ${e.Memory} | RAM: **${(nodes[1].stats.memory.used / 1024 / 1024).toFixed(0)}MB**`,
            inline: true
        }
    ])

    message.reply({ embeds: [embed] });
  }
};
