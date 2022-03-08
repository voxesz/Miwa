const Command = require("../../structures/Command");
const { MessageActionRow, MessageButton } = require("discord.js");
const Embed = require("../../structures/Embed");
const e = require("../../utils/Emojis");

module.exports = class Clear extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "clear";
    this.category = "Moderation";
    this.description = "Limpe uma determinada quantia de mensagens.";
    this.aliases = ["limpar"];

    this.userPermissions = ["MANAGE_MESSAGES"];
    this.botPermissions = ["MANAGE_MESSAGES"];
  }

  async execute({ message, args }) {
    if (!args[0])
      return message.reply(
        `${e.Error} | ${message.author}, você precisa inserir quantas mensagens deseja apagar.`
      );

    const amount = parseInt(args[0]);

    if (amount > 1000 || amount < 2)
      return message.reply(
        `${e.Error} | ${message.author}, a quantia deve ser um número de **2** à **1000**.`
      );

    const size = Math.ceil(amount / 100);

    if (size === 1) {
      let messages = await message.channel.messages.fetch({ limit: amount });

      const deleted = await message.channel.bulkDelete(messages, true);
    } else {
      let length = 0;

      for (let i = 0; i < size; i++) {
        let messages = await message.channel.messages.fetch({
          limit: i === size.length - 1 ? amount - (pages - 1) * 100 : 100,
        });

        messages = messages.array().filter((x) => x.pinned === false);

        const deleted = await message.channel.bulkDelete(messages, true);

        length += deleted.size;

        if (deleted.size < messages.length) continue;
      }
    }
  }
};
