const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require('../../structures/Embed');
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = class Background extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "background";
    this.category = "Social";
    this.description = "Veja os backgrounds que você possui.";
    this.aliases = ["backgrounds", "bg"];
  }

  async execute({ message, args }) {

    if(message.author.id !== process.env.OWNER_ID) return;
    
    const embed = new Embed(message.author)
    .setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
    .setDescription(`${e.Image} › Seus **Backgrounds**:\n\n> ${e.Folder} | Background: **Default**\n> ${e.Money} | Preço: **0 coins**`)
    .setImage(`https://i.imgur.com/wesq7up.jpg`)

    const row = new MessageActionRow()
    
    const right = new MessageButton()
    .setCustomId("right")
    .setEmoji(e.Right)
    .setStyle("SECONDARY")
    const left = new MessageButton()
    .setCustomId("left")
    .setEmoji(e.Left)
    .setStyle("SECONDARY")

    row.setComponents([left, right])

    message.reply({embeds: [embed], components: [row]})

  }
};
