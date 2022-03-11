const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");
const Embed = require("../../structures/Embed");

module.exports = class Cmd extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "cmd";
    this.category = "Config";
    this.description = "Configure os canais permitidos e comandos proibidos.";
    this.aliases = ["cmdblock", "cmd-block"];

    this.userPermissions = ["MANAGE_GUILD"];
  }

  async execute({ message, args }) {
    const guildDBData = await this.client.guildDB.findOne({
      guildID: message.guild.id,
    });

    if (!args[0]) {
      const embed = new Embed(message.author)
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `${e.Block} › Sistema de **Bloquear Comandos**\n\n> ${e.Switch} | Status: **${
            guildDBData.cmd.status == false ? `Desativado` : `Ativado`
          }**\n> ${e.Chat} | Chat: **${
            guildDBData.cmd.channels.length == 0
              ? `Nenhum canal adicionado.`
              : `${guildDBData.cmd.channels.map((x) => `<#${x}>`).join(", ")}`
          }**\n> ${e.Command} | Comandos: **${
            guildDBData.cmd.cmds.length == 0
              ? "Nenhum comando adicionado."
              : `${guildDBData.cmd.cmds.map((x) => `${x}`).join(", ")}`
          }**\n> ${e.Message} | Mensagem: \n\`\`\`md\n# "${
            guildDBData.cmd.message == "null"
              ? `Nenhuma mensagem definida.`
              : guildDBData.cmd.message
          }"\`\`\``
        );

      let row = new MessageActionRow();

      const left = new MessageButton()
        .setCustomId("left")
        .setEmoji(e.Left)
        .setStyle("SECONDARY")

      const right = new MessageButton()
        .setCustomId("right")
        .setEmoji(e.Right)
        .setStyle("SECONDARY");

      row.setComponents(right);

      let msg = await message.reply({ embeds: [embed], components: [row] });

      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };

      msg
        .createMessageComponentCollector({
          filter: filter,
          time: 60000,
        })

        .on("end", async (r, reason) => {
          if (reason != "time") return;

          msg.delete()
        })

        .on("collect", async (r) => {
          if (r.user.id !== message.author.id) {
            return r.deferUpdate();
          }
          switch (r.customId) {
            case "right": {
              const info = new Embed(message.author)
                .setAuthor({
                  name: message.guild.name,
                  iconURL: message.guild.iconURL({ dynamic: true }),
                })
                .setDescription(`${e.Block} › Sistema de **Bloquear Comandos**`)
                .addFields({
                  name: `${e.Command} | Comandos:`,
                  value: `> **cmd set <chat>** - Chats que serão permitidos o uso de comandos.\n> **cmd add <cmd>** - Comandos que serão proibidos.\n> **cmd msg <msg>** - Altere a mensagem de erro.\n> **cmd status** - Ligue ou desligue o sistema.`,
                });

              row.setComponents(left)
              await r.deferUpdate();
              await msg.edit({ embeds: [info], components: [row] });
              break;
            }
            case "left": {
              row.setComponents(right)
              await r.deferUpdate();
              await msg.edit({ embeds: [embed], components: [row] });
              break;
            }
          }
        });
      return;
    }

    if (["add", "cmd", "command"].includes(args[0].toLowerCase())) {
      if (!args[1])
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir o **comando** que deseja **adicionar** ao sistema.`
        );

      const command = args[1].toLowerCase();
      const cmd =
        this.client.commands.get(command) ||
        this.client.commands.get(this.client.aliases.get(command));

      if (!cmd) {
        return message.reply(
          `${e.FindError} › **Desculpe**, não **encontrei** o comando que você **solicitou**.`
        );
      } else {
        if (guildDBData.cmd.cmds.some((x) => x === cmd.name)) {
          await this.client.guildDB.findOneAndUpdate(
            { guildID: message.guild.id },
            { $pull: { "cmd.cmds": cmd.name } }
          );
          return message.reply(
            `${e.Success} › O comando **${cmd.name}** foi **removido** com sucesso do **sistema**.`
          );
        } else {
          await this.client.guildDB.findOneAndUpdate(
            { guildID: message.guild.id },
            { $push: { "cmd.cmds": cmd.name } }
          );
          return message.reply(
            `${e.Success} › O comando **${cmd.name}** foi **adicionado** com sucesso ao **sistema**.`
          );
        }
      }
    }

    if (["set", "channel", "chat", "canal"].includes(args[0].toLowerCase())) {
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);

      if (!channel) {
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir o **chat** que deseja **adicionar** ao sistema.`
        );
      }
      if (channel.type !== "GUILD_TEXT") {
        return message.reply(
          `${e.Error} › O **chat** deve ser do tipo **Texto**.`
        );
      }
        if (!guildDBData.cmd.channels.includes(channel.id)) {
          await this.client.guildDB.findOneAndUpdate(
            { guildID: message.guild.id },
            { $push: { "cmd.channels": channel.id } }
          );
          return message.reply(
            `${e.Success} › O **chat** ${channel} foi **adicionado** com sucesso ao **sistema**.`
          );
        } else {
          await this.client.guildDB.findOneAndUpdate(
            { guildID: message.guild.id },
            { $pull: { "cmd.channels": channel.id } }
          );
          return message.reply(
            `${e.Success} › O **chat** ${channel} foi **removido** com sucesso do **sistema**.`
          );
        }
    }

    if (["message", "msg"].includes(args[0].toLowerCase())) {
      let msg = args.slice(1).join(" ");

      if (!msg) {
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir a **mensagem** que deseja **adicionar** ao sistema.`
        );
      } else if (msg == guildDBData.cmd.message) {
        return message.reply(
          `${e.Warning} › A mensagem **inserida** já está **definida** no sistema.`
        );
      } else if (msg.length > 100) {
        return message.reply(
          `${e.Size} › A **mensagem** deve ter no máximo **100 caracteres**.`
        );
      } else {
        if (guildDBData) {
          guildDBData.cmd.message = msg;
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "cmd.message": msg,
          });
        }
        await message.reply(
          `${e.Success} › Você **alterou** a mensagem do **sistema** com sucesso! \n\`\`\`ini\nResultado: "${msg}"\`\`\``
        );
      }
      return;
    }

    if (["stats", "status", "on", "off"].includes(args[0].toLowerCase())) {
      if (guildDBData.cmd.status == false) {
        if (guildDBData.cmd.message == "null") {
          return message.reply(
            `${e.InsertError} › Você precisa **definir** a **mensagem** do sistema para **isso**.`
          );
        } else {
          guildDBData.cmd.status = true;
          await guildDBData.save();

          return message.reply(
            `${e.On} › Agora o **sistema** se encontra **ligado**.`
          );
        }
      }
      if (guildDBData.cmd.status == true) {
        guildDBData.cmd.status = false;
        await guildDBData.save();

        return message.reply(
          `${e.Off} › Agora o **sistema** se encontra **desligado**.`
        );
      }
    }
  }
};
