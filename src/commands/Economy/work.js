const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const moment = require("moment");

module.exports = class Work extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "work";
    this.category = "Economy";
    this.description = "Trabalhe para ganhar gems.";
    this.aliases = ["trabalhar"];
  }

  async execute({ message, args }) {
    const user = await this.client.userDB.findOne({ _id: message.author.id });

    const xp = Math.floor(Math.random() * 70);

    if (
      user.cooldowns.work !== null &&
      28800000 - (Date.now() - user.cooldowns.work) > 0
    ) {
      message.reply(
        `${e.Time} › Você **deve** aguardar **${moment
          .duration(28800000 - (Date.now() - user.cooldowns.work))
          .format("d[d] h[h] m[m] s[s]")}** para isso.`
      );
    } else {
      let amount = Math.floor(Math.random() * 3000);

      message.reply(
        `${e.Success} › você **trabalhou** com sucesso e ganhou:\n> ${
          e.Money
        } | **${amount.toLocaleString()} gems**\n> ${e.Thunder} | **${xp} XP**`
      );

      await this.client.userDB.findOneAndUpdate(
        { _id: message.author.id },
        {
          $set: {
            "cooldowns.work": Date.now(),
            coins: user.coins + amount,
            "exp.xp": user.exp.xp + xp,
          },
        }
      );
      let nextLevel = 500 * user.exp.level;
      if (user.exp.xp >= nextLevel) {
        user.exp.level = user.exp.level + 1;
        user.exp.xp = user.exp.xp - nextLevel;
        await user.save();
        await message.react(e.LevelUP);
      }
    }
  }
};
