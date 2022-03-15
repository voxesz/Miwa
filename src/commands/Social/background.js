const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require('../../structures/Embed');
const { MessageActionRow, MessageButton } = require("discord.js");
const Collection = require('../../utils/Collection')

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

    const itens = new Collection()
    let actualPage = 1

    Object.entries(backgrounds).map(([, x]) => {
        itens.push(
            `> ${e.Image} | Nome: **${x.name}**\n> ${e.ID} | ID: **${x.id}**`
        )
    })

    const pages = Math.ceil(itens.length / 1);
    let paginatedItens = itens.paginate(actualPage, 1)

    embed.setDescription(paginatedItens.join(' '))

    let row = new MessageActionRow()
    
    const right = new MessageButton()
    .setCustomId("right")
    .setEmoji(e.Right)
    .setStyle("SECONDARY")
    .setDisabled(false)

    const left = new MessageButton()
    .setCustomId("left")
    .setEmoji(e.Left)
    .setStyle("SECONDARY")
    .setDisabled(true)

    if(pages <= 1) left.setDisabled(true)

    row.setComponents([left, right])

    const msg = await message.reply({embeds: [embed], components: [row]})

    if(pages <= 1) return;

    const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id
    }

    const collector = msg.createMessageComponentCollector({filter: filter, time: 60000})

    .on('end', async(r, reason) => {
        if(reason != 'time') return;

        right.setDisabled(true)
        left.setDisabled(true)

        row = new MessageActionRow().setComponents([left, right])

        await msg.edit({embeds: [embed.setFooter({text: "O tempo para interagir acabou."})], components: [row]})
    })
    .on('collect', async(r) => {
        switch (r.setCustomId) {
            case 'right': {

            if(actualPage === pages) return;
            actualPage++
            paginatedItens = itens.paginate(actualPage, 1)
            embed.setDescription(paginatedItens.join(" "))

            if(actualPage === pages) right.setDisabled(true)

            left.setDisabled(false)
            
            row = new MessageActionRow().setComponents([left, right])

            await r.deferUpdate();
            await msg.edit({embeds: [embed], components: [row]})
        }
        }
    })

  }
};