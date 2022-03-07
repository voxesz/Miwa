const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

module.exports = class Rank extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rank";
    this.category = "Economy";
    this.description = "Veja os usuários com mais dinheiro no Bot.";
    this.aliases = ["rankcoins", "rc"];
  }

  async execute({ message, args }) {
    const COINS = await require("mongoose")
      .connection.collection("users")
      .find({ coins: { $gt: 0 } })
      .sort({ coins: -1 })
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
      .setTitle(`${e.Bank} Rank de Coins`)
      .setThumbnail(message.author.avatarURL({size: 2048}))
      .setDescription(
        coinsMap
          .map(
            (x, f) =>
              `${e.Member} | **${f + 1}º** - **${x.user.tag}**\n${
                e.Money
              } | Gems: **${x.coins.toLocaleString()}**`
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
        coins: doc.coins,
      });
    }
  }
};
