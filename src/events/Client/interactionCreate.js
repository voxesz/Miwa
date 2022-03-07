const { Guild } = require("discord.js");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

module.exports = class interactionCreate {
  constructor(client) {
    this.client = client;
  }

  async execute(interaction) {

    const guildDBData = await this.client.guildDB.findOne({guildID: interaction.guild.id})

    if (interaction.isButton() && interaction.customId === "captcha") {
        interaction.deferUpdate();

        const role = guildDBData.captcha.role
        interaction.member.roles.add(role);
    }
    
  }
};
