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

    const work = moment
        .duration(
            28800000 - (Date.now() - user.cooldowns.work)
        )
        .format("d[d] h[h] m[m] s[s]"),
      daily = moment.duration(
          86400000 - (Date.now() - user.cooldowns.daily)
      ).format("d[d] h[h] m[m] s[s]")

    let embed = new Embed(message.author)
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.avatarURL(),
      })
      .setDescription(
        `${e.Config} › Seus **Cooldowns**\n\n ${
          user.cooldowns.work !== null &&
          28800000 - (Date.now() - user.cooldowns.work) > 0
            ? `> ${e.Work} | Work: **${work}**`
            : `> ${e.Work} | Work: **Pode ser utilizado.**`
        } \n ${
          user.cooldowns.daily !== null &&
          86400000 - (Date.now() - user.cooldowns.daily) > 0
            ? `> ${e.Calendar} | Daily: **${daily}**`
            : `> ${e.Calendar} | Daily: **Pode ser utilizado.**`
        }`
      );

    message.reply({
      embeds: [embed],
    });
  }
};
