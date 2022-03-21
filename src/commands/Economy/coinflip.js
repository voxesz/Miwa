const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');

module.exports = class Coinflip extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = 'coinflip';
    this.category = 'Economy';
    this.description = 'Tire a sorte no cara ou coroa.';
    this.aliases = ['cf'];
  }

  async execute({ message, args }) {

    const user = await this.client.userDB.findOne({ _id: message.author.id })

    let flipTime = userDBData.cooldowns.coinFlip;
    let time = 300000 - (Date.now() - flipTime);

    if (flipTime !== null && 300000 - (Date.now() - daily) > 0) {
      return message.reply(
        `${e.Time} › Você **precisa** aguardar **${this.formatTime(
          this.convertMilliseconds(time)
        )}** para utilizar **isto** novamente.`
      );
    } else {

      if (!args[0]) return message.reply(`${e.InsertError} › Você precisa **inserir** quanto **dinheiro** deseja apostar.`);

      let moneyapostado = parseInt(args[0])

      if (moneyapostado > user.coins) return message.reply(`${e.NoMoney} › Você **não** possui **dinheiro** suficiente.`);

      if (moneyapostado < 0 || isNaN(moneyapostado) || moneyapostado == 0) return message.reply(`${e.Size} › Você deve **inserir** uma quantia **válida**.`);

      const coinflip = _ => Math.random() < 0.5

      if (coinflip()) {
        message.reply(`${e.Coin} › Você teve **sorte** e ganhou **${moneyapostado.toLocaleString()} gems**.`);
        await this.client.userDB.findOneAndUpdate({ _id: message.author.id },
          {
            $set: {
              coins: user.coins + moneyapostado,
              "cooldowns.coinFlip": Date.now()
            }
          })
      } else {
        message.reply(`${e.Coin} › Você teve **azar** e perdeu **${moneyapostado.toLocaleString()} gems**.`);
        await this.client.userDB.findOneAndUpdate({ _id: message.author.id },
          {
            $set: {
              coins: user.coins - moneyapostado,
              "cooldowns.coinFlip": Date.now()
            }
          })
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
