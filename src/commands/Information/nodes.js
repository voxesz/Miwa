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

    const lavalinkUSAPing = await this.client.music.nodes.find(n => n.identifier === 'Cosmos').ping();
    const lavalinkEUPing = await this.client.music.nodes.find(n => n.identifier === 'Andromeda').ping();
    const lavalinkEUAPing = await this.client.music.nodes.find(n => n.identifier === 'Astro').ping();

    embed.addFields([
        {
            name: `${e.Cosmos} › ${nodes[0].options.id}`,
            value: `> ${e.Switch} | Status: **${String(nodes[0].state).replace("0", "Reconectando").replace("1", "Conectado").replace("2", "Desconectado")}**
            > ${e.Earth} | Região: **${nodes[0].options.region}**
            > ${e.MusicBox} | Players: **${nodes[0].stats.players}**
            > ${e.Time} | Uptime: **${moment
              .duration(nodes[0].stats.uptime)
              .format("d[d] h[h] m[m] s[s]")}**\n> ${e.Memory} | RAM: **${(nodes[0].stats.memory.used / 1024 / 1024).toFixed(0)}MB**\n> ${e.Wifi} | Ping: **${lavalinkUSAPing}ms**`,
            inline: true
        },
        {
            name: `${e.Andromeda} › ${nodes[1].options.id}`,
            value: `> ${e.Switch} | Status: **${String(nodes[1].state).replace("0", "Reconectando").replace("1", "Conectado").replace("2", "Desconectado")}**
            > ${e.Earth} | Região: **${nodes[1].options.region}**
            > ${e.MusicBox} | Players: **${nodes[1].stats.players}**
            > ${e.Time} | Uptime: **${moment
              .duration(nodes[1].stats.uptime)
              .format("d[d] h[h] m[m] s[s]")}**\n> ${e.Memory} | RAM: **${(nodes[1].stats.memory.used / 1024 / 1024).toFixed(0)}MB**\n> ${e.Wifi} | Ping: **${lavalinkEUPing}ms**`,
            inline: true
        },
        {
          name: `${e.Astro} › ${nodes[2].options.id}`,
          value: `> ${e.Switch} | Status: **${String(nodes[2].state).replace("0", "Reconectando").replace("1", "Conectado").replace("2", "Desconectado")}**
          > ${e.Earth} | Região: **${nodes[2].options.region}**
          > ${e.MusicBox} | Players: **${nodes[2].stats.players}**
          > ${e.Time} | Uptime: **${moment
            .duration(nodes[2].stats.uptime)
            .format("d[d] h[h] m[m] s[s]")}**\n> ${e.Memory} | RAM: **${(nodes[2].stats.memory.used / 1024 / 1024).toFixed(0)}MB**\n> ${e.Wifi} | Ping: **${lavalinkEUAPing}ms**`,
          inline: true
      }
    ])

    message.reply({ embeds: [embed] });
  }
};
