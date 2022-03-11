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

        const deleteCount = parseInt(args[0], 10);
        if (!deleteCount || deleteCount < 1 || deleteCount > 99)
          return message.reply(`${e.Size} › O **número** de mensagens **deve** ser de **1** a **99**.`);

        let fetched = await message.channel.messages.fetch({
          limit: deleteCount + 1,
        });


        message.channel.bulkDelete(fetched);
        message.channel.send(`${e.Trash} › Você **deletou** com sucesso **${deleteCount} mensagens**!`).then((msg) => {
            setTimeout(() => {
              msg.delete();
            }, 2000);
          });

  }
};
