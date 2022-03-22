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
        this.subCommands = ["buy"]

        this.staffOnly = true;
    }

    async execute({ message, args }) {

        const subs =
            args[0] &&
            this.client.subCommands.get(this.reference).find(
                    (cmd) =>
                        cmd.name.toLowerCase() === args[0].toLowerCase() ||
                        cmd.aliases.includes(args[0].toLowerCase())
                )

        let subCommand
        let sub

        if (!sub) {
            sub = "null"
            this.client.subCommands
                .get(this.reference)
                .find(
                    (cmd) =>
                        cmd.name.toLowerCase() === args[0].toLowerCase() ||
                        cmd.aliases.includes(args[0].toLowerCase())
                )
        } else subCommand = subs;

        if(subCommand != undefined) return subCommand.execute({message, args})

        const userDBData = await this.client.userDB.findOne({ _id: message.author.id })

        const backgrounds = {
            one: { name: "Default", id: "1", link: "https://i.imgur.com/wesq7up.jpg" },
            two: { name: "Flowers", id: "2", link: "https://i.imgur.com/KgdBaN9.png" },
            three: { name: "Hole", id: "3", link: "https://i.imgur.com/XWpP8Qs.png" },
            four: { name: "Japan", id: "4", link: "https://i.imgur.com/0wmcVBK.png" }
        }

        const embed = new Embed(message.author)
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .setImage(Object.values(backgrounds)[0].link)

        const itens = new Collection()
        let actualPage = 1

        Object.entries(backgrounds).map(([, x]) => {
            itens.push(
                `> ${e.Image} | Nome: **${x.name}**\n> ${e.ID} | ID: **${x.id}**\n> ${e.Link} | Link: **${x.link}**`
            )
        })

        const pages = 4;
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

        const use = new MessageButton()
            .setCustomId("use")
            .setEmoji(e.Download)
            .setStyle("SECONDARY")
            .setDisabled(false)

        if (pages <= 1) left.setDisabled(true)

        row.setComponents([left, right, use])

        const msg = await message.reply({ embeds: [embed], components: [row] })

        if (pages <= 1) return;

        const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id
        }

        msg.createMessageComponentCollector({ filter: filter, time: 60000 })
            .on('end', async (r, reason) => {
                if (reason != 'time') return;

                right.setDisabled(true)
                left.setDisabled(true)
                use.setDisabled(true)

                row = new MessageActionRow().setComponents([left, right, use])

                await msg.edit({ embeds: [embed.setFooter({ text: "O tempo para interagir acabou." })], components: [row] })
            })
            .on('collect', async (r) => {
                if (r.user.id !== message.author.id) return r.deferUpdate()
                switch (r.customId) {
                    case 'right':
                        if (actualPage === pages) return;
                        actualPage++
                        paginatedItens = itens.paginate(actualPage, 1)
                        embed.setDescription(paginatedItens.join(" "))
                        embed.setImage(Object.values(backgrounds)[actualPage - 1].link)

                        if (actualPage === pages) right.setDisabled(true)

                        left.setDisabled(false)

                        row = new MessageActionRow().setComponents([left, right, use])

                        await r.deferUpdate();
                        await msg.edit({ embeds: [embed], components: [row] })
                        break;

                    case 'left':
                        if (actualPage === 1) return;
                        actualPage--
                        paginatedItens = itens.paginate(actualPage, 1)
                        embed.setDescription(paginatedItens.join(" "))
                        embed.setImage(Object.values(backgrounds)[actualPage - 1].link)

                        if (actualPage === 1) left.setDisabled(true)

                        right.setDisabled(false)

                        row = new MessageActionRow().setComponents([left, right, use])

                        await r.deferUpdate();
                        await msg.edit({ embeds: [embed], components: [row] })
                        break;
                    case 'use':
                        const bgID = Object.values(backgrounds)[actualPage - 1].id
                        const bgName = Object.values(backgrounds)[actualPage - 1].name
                        await this.client.userDB.findOneAndUpdate({ _id: message.author.id }, { $set: { "social.actual": bgID } })
                        if (userDBData.social.backgrounds.find((x) => x == bgID)) {
                            await this.client.userDB.findOneAndUpdate({ _id: message.author.id }, { $set: { "social.actual": bgID } })
                        }
                        await r.deferUpdate();
                        return r.followUp({ content: `${e.Success} › Background **alterado** com sucesso para **${bgName}**.`, ephemeral: true })
                }
            })

    }
};