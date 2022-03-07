const { Guild } = require("discord.js");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

module.exports = class guildCreate {
  constructor(client) {
    this.client = client;
  }

  async execute(guild = Guild) {
    this.client.guildDB.create({
      guildID: guild.id,
    });

    const embed = new Embed(this.client.user)
      .setTitle(`${e.Archive} ${this.client.user.username} Adicionado!`)
      .setThumbnail(guild.iconURL({format: "jpeg", size: 2048}))
      .addFields(
        {
          name: `${e.World} Nome:`,
          value: `> ${guild.name}`,
        },
        {
          name: `${e.Archives} ID do Servidor`,
          value: `> ${guild.id}`,
        },
        {
          name: `${e.Member} Total de Usuários`,
          value: `> ${guild.memberCount}`,
        }
      );

    const channel = this.client.channels.cache.get(process.env.SERVER_LOGS);

    channel.send({ embeds: [embed] });
  }
};
