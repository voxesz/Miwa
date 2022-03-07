const Command = require("../../structures/Command");
const Embed = require("../../structures/Embed");
const e = require("../../utils/Emojis");
const moment = require("moment");

module.exports = class Serverinfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "serverinfo";
    this.category = "Information";
    this.description = "Veja as informações do servidor.";
    this.aliases = ["si"];
  }

  async execute({ message, args }) {

    let boost =
        message.guild.premiumSubscriptionCount === 0
          ? "Nenhum Boost"
          : `${message.guild.premiumSubscriptionCount} Boost(s) ( ${message.guild.premiumTier.replace("TIER_", "Nível ")} )`;
    const owner = await message.guild.fetchOwner().then((x) => x.user.tag)
    const created = moment.utc(message.guild.createdAt).format("DD/MM/YYYY")
    const bots = message.guild.members.cache
    .filter((x) => x.user.bot)
    .size.toLocaleString()
    
    const embed = new Embed(message.author)
    .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()})
    .setThumbnail(message.guild.iconURL({size: 2048}))
    .addFields([
        {
            name: `Informações:`,
            value: `${e.World} | Guilda: **${message.guild.name}**\n${e.Archives} | ID: **${message.guild.id}**\n${e.Crown} | Criador: **${owner}**\n${e.Config} | Criado em: **${created}**\n${e.Money} | Boost(s): **${boost}**`,
            inline: true
        },
        {
            name: `Estrutura:`,
            value: `${e.Member} | Membros: **${message.guild.memberCount.toLocaleString()}**\n${e.Mouse} | BOT's: **${bots}**\n${e.Telephone} | Canais: **${message.guild.channels.cache.size}**`,
            inline: true
        }
    ])

    message.reply({embeds: [embed]})

  }
};
