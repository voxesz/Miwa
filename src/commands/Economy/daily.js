const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Daily extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "daily";
    this.category = "Economy";
    this.description = "Resgate o seu premio diário.";
    this.aliases = ["diario"];
  }

  async execute({ message }) {
    const userDBData = await this.client.userDB.findOne({
      _id: message.author.id,
    });

    let coins = Math.floor(Math.random() * 3000);
    const xp = Math.floor(Math.random() * 100);
    let daily = userDBData.daily;
    let time = 8.64e7 - (Date.now() - daily);

    if (daily !== null && 8.64e7 - (Date.now() - daily) > 0) {
      return message.reply(
        `${e.Error} | ${
          message.author
        }, você precisa aguardar **${this.formatTime(
          this.convertMilliseconds(time)
        )}** para resgatar seu premio novamente.`
      );
    } else {
      message.reply(`${e.Correct} | ${message.author}, você resgatou seu premio diário e ganhou:\n> ${e.Money} | **${coins.toLocaleString()} gems**\n> ${e.Thunder} | **${xp} de experiência**.`
      );

      if (userDBData) {
        userDBData.daily = Date.now();
        userDBData.coins = userDBData.coins + coins;
        userDBData.exp.xp = userDBData.exp.xp + xp;
        await userDBData.save();
      } else {
        await this.client.userDBData.create({
          _id: message.author.id,
          daily: Date.now(),
          coins: coins,
          xp: xp,
        });
      }
    }
  }

  formatTime(time) {
    if (!time) return;
    return moment.duration(time).format("d[d] h[h] m[m] s[s]");
  }

  convertMilliseconds(ms) {
    const seconds = ~~(ms / 1000);
    const minutes = ~~(seconds / 60);
    const hours = ~~(minutes / 60);

    return {
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    };
  }
};
