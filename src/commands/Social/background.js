const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require('../../structures/Embed');
const { MessageActionRow, MessageButton, Collection } = require("discord.js");

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

    const backgrounds = {
        one: { name: "Default", id: "01", link: "https://i.imgur.com/wesq7up.jpg" },
        two: { name: "Flowers", id: "02", link: "https://i.imgur.com/KgdBaN9.png" },
        three: { name: "Nature", id: "03", link: "https://i.imgur.com/wesq7up.jpg" }
    }
    
    const embed = new Embed(message.author)
    .setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})

    /*.setDescription(`${e.Image} › Seus **Backgrounds**:\n\n> ${e.Folder} | Background: **Default**\n> ${e.Money} | Preço: **0 coins**`)
    .setImage(`https://i.imgur.com/wesq7up.jpg`)*/

    const itens = new Set()
    let actualPage = 1

    Object.entries(backgrounds).map(([, x]) => {
        itens.add(
            `> ${e.Image} | Nome: **${x.name}**\n> ${e.ID} | ID: **${x.id}**\n> ${e.Link} | Link: **${x.link}**`
        )
    })

    const pages = Math.ceil(itens.length / 1);
    let paginatedItens = itens.paginate(actualPage, 1)

    embed.setDescription(paginatedItens.join(' '))

    const row = new MessageActionRow()
    
    const right = new MessageButton()
    .setCustomId("right")
    .setEmoji(e.Right)
    .setStyle("SECONDARY")
    .setDisabled(false)

    const left = new MessageButton()
    .setCustomId("left")
    .setEmoji(e.Left)
    .setStyle("SECONDARY")
    .setDisabled(false)

    if(pages <= 1) left.setDisabled(true)

    row.setComponents([left, right])

    const msg = await message.reply({embeds: [embed], components: [row]})

    if(pages <= 1) return;

    const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id
    }

    const collector = msg.createMessageComponentCollector({filter: filter, time: 60000})

  }
};