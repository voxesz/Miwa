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

    const user = await this.client.userDB.findOne({
      _id: message.author.id,
    });

    if (!USER)
      return message.reply(
        `${e.InsertError} › Você **precisa** inserir o **membro** que deseja fazer a **transação**.`
      );

      if (USER.id === message.author.id)
      return message.reply(
        `${e.Error} › Você **não** pode **enviar** dinheiro a si **mesmo**.`
      );
    
      if(USER.bot) return message.reply(`${e.Bot} › Você **não** pode **enviar** dinheiro a um **Bot**.`)

    if (!args[1])
      return message.reply(
        `${e.InsertError} › Você **precisa** inserir a **quantia** que deseja **enviar**.`
      );

    const money = await this.client.convertAbbrev(args[1]);

    if (isNaN(money) || money <= 0)
      return message.reply(
        `${e.Size} › Você **precisa** inserir uma quantia **válida**.`
      );

    if (money > user.coins)
      return message.reply(
        `${e.NoMoney} › Você **não** possui **dinheiro** suficiente para **realizar** a transação.`
      );

    const target = await this.client.userDB.findOne({ _id: USER.id });

    const row = new MessageActionRow();

    const yesButton = new MessageButton()
      .setCustomId("yes")
      .setLabel("")
      .setEmoji(e.Success)
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
      content: `${e.Warn} › Você tem **certeza** que deseja **realizar** esta transação para o(a) **${
        USER.tag
      }**?\n> ${e.Money} | Quantia a ser enviada: **${money.toLocaleString()} gems**.`,
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
      if (x.user.id !== message.author.id) {
        return x.deferUpdate();
      }

      collect = x;

      switch (x.customId) {
        case "yes": {
          message.reply(
            `${e.Success} › **Transação** realizada com **sucesso**.`
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
            `${e.Block} › Você **cancelou** a transação.`
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
