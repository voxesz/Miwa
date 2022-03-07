const Command = require("../../structures/Command");
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')

module.exports = class Teste extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "teste";
    this.category = "Developing";
    this.description = "Comando destinado a testes.";
    this.aliases = ["test"];

    this.staffOnly = true;
  }

  async execute({ message, args }) {

    const COINS = await require("mongoose")
      .connection.collection("users")
      .find({ "exp.xp": { $gt: 0 } })
      .sort({ "exp.xp": -1 })
      .toArray();

    const coins = Object.entries(COINS)
      .map(([, x]) => x._id)
      .sort((x, f) => x.coins - f.coins);

    const members = [];

    await this.PUSH(coins, members);

    const coinsMap = members
      .map((x) => x)
      .sort((x, f) => f.coins - x.coins)
      .slice(0, 5);

    const TOP = new Embed(message.author)
      .setTitle(`${e.Bank} Rank de XP`)
      .setThumbnail(message.author.avatarURL({size: 2048}))
      .setDescription(
        coinsMap
          .map(
            (x, f) =>
              `${e.Member} | **${f + 1}º** - **${x.user.tag}**\n${
                e.Money
              } | XP: **${x.coins}**`
          )
          .join("\n")
      );
    message.reply({ embeds: [TOP] });
  }

  async PUSH(coins, members) {
    for (const member of coins) {
      const doc = await this.client.userDB.findOne({ _id: member });

      members.push({
        user: await this.client.users.fetch(member).then((user) => {
          return user;
        }),
        "exp.xp": doc.exp.xp,
      });
    }

  }

};
