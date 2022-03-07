const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = class Pay extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "pay";
    this.category = "Economy";
    this.description = "Envie dinheiro para outro usuário.";
    this.aliases = ["pagar", "doar"];
  }

  async execute({ message, args }) {
    let USER = await this.client.getUser(args[0], message);
    if (!USER) USER = message.author;

    const user = await this.client.userDB.findOne({
      _id: message.author.id,
    });

    if (!USER)
      return message.reply(
        `${e.Error} | ${message.author}, você precisa inserir o membro que deseja fazer a transação.`
      );
    
      if(USER.bot) return message.reply(`${e.Error} | ${message.author}, você não pode enviar dinheiro a um Bot.`)

    if (!args[1])
      return message.reply(
        `${e.Error} | ${message.author}, você precisa inserir a quantia que deseja enviar.`
      );

    const money = await this.client.convertAbbrev(args[1]);

    if (String(money) === "NaN")
      return message.reply(
        `${e.Error} | ${message.author}, você precisa inserir uma quantia válida.`
      );

    if (money <= 0)
      return message.reply(
        `${e.Error} | ${message.author}, a quantia enviada não pode ser igual ou menor que 0.`
      );

    if (USER.id === message.author.id)
      return message.reply(
        `${e.Error} | ${message.author}, você não pode enviar dinheiro para si mesmo.`
      );

    if (money > user.coins)
      return message.reply(
        `${e.Error} | ${message.author}, você não possui dinheiro suficiente para realizar a transação.`
      );

    const target = await this.client.userDB.findOne({ _id: USER.id });

    const row = new MessageActionRow();

    const yesButton = new MessageButton()
      .setCustomId("yes")
      .setLabel("")
      .setEmoji(e.Correct)
      .setStyle("SECONDARY")
      .setDisabled(false);

    const noButton = new MessageButton()
      .setCustomId("no")
      .setLabel("")
      .setEmoji(e.Error)
      .setStyle("SECONDARY")
      .setDisabled(false);

    row.addComponents([yesButton, noButton]);

    const msg = await message.reply({
      content: `${e.Money} | ${
        message.author
      }, tem certeza que deseja realizar esta transação para o(a) **${
        USER.tag
      }**?\n> Quantia a ser enviada: **${money.toLocaleString()} coins**.`,
      components: [row],
    });

    let collect;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("collect", async (x) => {
      if (x.user.id != message.author.id)
        return x.reply({
          content: `${e.Error} | ${x.user}, você precisa utilizar o comando para isso.`,
          ephemeral: true,
        });

      collect = x;

      switch (x.customId) {
        case "yes": {
          message.reply(
            `${e.Correct} | ${message.author}, transação realizada com sucesso.`
          );

          await this.client.userDB.findOneAndUpdate(
            { _id: message.author.id },
            {
              $set: {
                coins: user.coins - money,
              },
            }
          );
          if (!target) {
            await this.client.userDB.create({
              _id: USER.id,
              coins: money,
            });
          } else {
            await this.client.userDB.findOneAndUpdate(
              { _id: USER.id },
              {
                $set: {
                  coins: target.coins + money,
                },
              }
            );
          }

          msg.delete();
          break;
        }

        case "no": {
          msg.delete();

          return message.reply(
            `${e.Error} | ${message.author}, você cancelou a transação.`
          );
        }
      }
    });

    collector.on("end", (x) => {
      if (collect) return;
      //x.update({ components: [] });
    });
  }
};
