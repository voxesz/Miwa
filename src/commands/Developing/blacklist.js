const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

module.exports = class Blacklist extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "blacklist";
    this.category = "Developing";
    this.description = "Adicione ou remova um membro da lista negra.";
    this.aliases = ["lista-negra", "bl"];

    this.staffOnly = true;
  }

  async execute({ message, args }) {
    const cliente = await this.client.clientDB.findOne({
      clientID: this.client.user.id,
    });

    if (args[0] == "list") {
      if (!cliente.blacklist.length) {
        return message.reply(
          `${e.Error} | ${message.author}, minha lista negra está vazia.`
        );
      } else {
        const LIST = new Embed(message.author)
          .setTitle(`${e.Archives} Lista Negra`)
          .addFields({
            name: `${e.Member} | Usuários:`,
            value: `${cliente.blacklist
              .map(
                (x) =>
                  `> User: **\`${
                    this.client.users.cache.get(x).tag
                  }\`**\n> ID: **\`${this.client.users.cache.get(x).id}\`**`
              )
              .join("\n\n")}`,
          });

        message.reply({ embeds: [LIST] });
      }

      return;
    }

    let USER = this.client.users.cache.get(args[0]) || message.mentions.users.first()
    if (!args[0]) {
      return message.reply(
        `${e.Help} | ${message.author}, insira o usuário que deseja adicionar na Lista Negra.`
      );
    } else if (cliente.blacklist.some((x) => x == USER.id)) {
      await this.client.clientDB.findOneAndUpdate(
        { clientID: this.client.user.id },
        { $pull: { blacklist: USER.id } }
      );
      return message.reply(
        `${e.Correct} | ${message.author}, o membro **${USER.tag}** foi removido da minha Lista Negra.`
      );
    } else {
      await this.client.clientDB.findOneAndUpdate(
        { clientID: this.client.user.id },
        { $push: { blacklist: USER.id } }
      );
      message.reply(
        `${e.Correct} | ${message.author}, o membro **${USER.tag}** foi adicionado a minha Lista Negra.`
      );
    }
  }
};
