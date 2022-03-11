const Command = require('../../structures/Command');
const e = require('../../utils/Emojis');

module.exports = class Coinflip extends Command {
	constructor (client) {
		super(client);
		this.client = client;

		this.name = 'coinflip';
		this.category = 'Economy';
		this.description = 'Tire a sorte no cara ou coroa.';
		this.aliases = ['cf'];
	}

	async execute ({ message, args }) {

		const user = await this.client.userDB.findOne({ _id: message.author.id })
  
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
                  coins: user.coins + moneyapostado
                }
              })
          } else {
            message.reply(`${e.Coin} › Você teve **azar** e perdeu **${moneyapostado.toLocaleString()} gems**.`);
            await this.client.userDB.findOneAndUpdate({ _id: message.author.id },
              {
                $set: {
                  coins: user.coins - moneyapostado
                }
              })
          }
	}
};
