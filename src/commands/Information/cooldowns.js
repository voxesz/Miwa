const Command = require("../../structures/Command");
const Embed = require("../../structures/Embed");
const e = require("../../utils/Emojis");
const moment = require("moment");

module.exports = class Cooldowns extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "cooldowns";
    this.category = "Information";
    this.description = "Veja o tempo restante para tais atividades.";
    this.aliases = ["cd", "cooldown"];
  }

  async execute({ message, args }) {
    const user = await this.client.userDB.findOne({
      _id: message.author.id,
    });

    const cooldownW = 28800000,
    cooldownD = 86400000

    let embed = new Embed(message.author)
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.avatarURL(),
      })
      .setDescription(
        `${e.Config} › Seus **Cooldowns**\n\n ${user.cooldowns.work !== null &&
          28800000 - (Date.now() - user.cooldowns.work) > 0
          ? `> ${e.Work} | Work: **<t:${~~((Date.now() / 1000) + ((cooldownW - (Date.now() - user.cooldowns.work)) / 1000))}:R>**`
          : `> ${e.Work} | Work: **Pode ser utilizado.**`
        } \n ${user.cooldowns.daily !== null &&
          86400000 - (Date.now() - user.cooldowns.daily) > 0
          ? `> ${e.Calendar} | Daily: **<t:${~~((Date.now() / 1000) + ((cooldownD - (Date.now() - user.cooldowns.work)) / 1000))}:R>**`
          : `> ${e.Calendar} | Daily: **Pode ser utilizado.**`
        }`
      );

    message.reply({
      embeds: [embed],
    });
  }
};
