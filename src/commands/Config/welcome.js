const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");
const Embed = require("../../structures/Embed");

module.exports = class Welcome extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "welcome";
    this.category = "Config";
    this.description = "Configure o sistema de boas vindas do servidor.";
    this.aliases = ["setentrada", "entrada"];

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
          `${e.Welcome} › Logs de **Boas-Vindas**\n\n> ${e.Switch} | Status: **${
            guildDBData.welcome.status == false ? `Desativado` : `Ativado`
          }**\n> ${
            e.Folder
          } | Tipo: **${guildDBData.welcome.type.toUpperCase()}**\n> ${
            e.Chat
          } | Chat: **${
            guildDBData.welcome.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.welcome.channel}>`
          }**\n> ${e.Message} | Mensagem: \n\`\`\`md\n# "${
            guildDBData.welcome.message == "null"
              ? `Nenhuma mensagem definida.`
              : guildDBData.welcome.message
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
                .setDescription(`${e.Welcome} › Logs de **Boas-Vindas**`)
                .addFields([
                  {
                    name: `${e.Command} | Comandos:`,
                    value: `> **welcome type <img/msg>** - Defina se as boas-vindas serão em imagem ou mensagem.\n> **welcome channel <chat>** - Chat que será enviada a mensagem de boas vindas.\n> **welcome msg <msg>** - Mensagem que será enviada.\n> **welcome status** - Ligue ou desligue o sistema.`,
                  },
                  {
                    name: `${e.Image} | Placeholders:`,
                    value: `> **[user]** - Menciona o usuário. **(Apenas em tipo MSG)**\n> **[name]** - Mostra o nome do usuário\n> **[tag]** - Mostra o nome junto com a hashtag.\n> **[guild]** - Mostra o nome do servidor.\n> **[members]** - Mostra o total de membros do servidor.`,
                  },
                ]);

              row.setComponents(left);
              await r.deferUpdate();
              await msg.edit({ embeds: [info], components: [row] });
              break;
            }
            case "left": {
              row.setComponents(right);
              await r.deferUpdate();
              await msg.edit({ embeds: [embed], components: [row] });
              break;
            }
          }
        });
      return;
    }

    if (["type", "tipo"].includes(args[0].toLowerCase())) {
      if (!["img", "msg"].includes(args[1].toLowerCase()))
        return message.reply(
          `${e.Folder} › Os **tipos** de boas-vindas **disponíveis** são:\n> **IMG** | **MSG**`
        );
      if (guildDBData.welcome.type == args[1].toLowerCase())
        return message.reply(
          `${e.Warning} › Este tipo **já** está **definido** no momento.`
        );

      if (guildDBData) {
        guildDBData.welcome.type = args[1].toLowerCase();
        await guildDBData.save();
      } else {
        await this.client.guildDB.create({
          guildID: message.guild.id,
          "welcome.type": args[1].toLowerCase(),
        });
      }
      return message.reply(
        `${e.Success} › Você **definiu** o **tipo** de boas-vindas como **${args[1].toUpperCase()}**.`
      );
    }

    if (["channel", "chat", "canal"].includes(args[0].toLowerCase())) {
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
      if (guildDBData.welcome.channel == channel.id) {
        return message.reply(
          `${e.Warning} › O chat **inserido** já está **adicionado** ao sistema.`
        );
      }
        if (guildDBData) {
          guildDBData.welcome.channel = channel.id;
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "welcome.channel": channel.id,
          });
        }
        return message.reply(
          `${e.Success} › O **chat** ${channel} foi **adicionado** com sucesso ao **sistema**.`
        );
    }

    if (["message", "msg"].includes(args[0].toLowerCase())) {
      let msg = args.slice(1).join(" ");

      if (!msg) {
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir a **mensagem** que deseja **adicionar** ao sistema.`
        );
      } else if (msg == guildDBData.welcome.message) {
        return message.reply(
          `${e.Warning} › A mensagem **inserida** já está **definida** no sistema.`
        );
      } else if (msg.length > 300) {
        return message.reply(
          `${e.Size} › A **mensagem** deve ter no máximo **300 caracteres**.`
        );
      } else {
        if (guildDBData) {
          guildDBData.welcome.message = msg;
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "welcome.message": msg,
          });
        }
        await message.reply(
          `${e.Success} › Você **alterou** a mensagem do **sistema** com sucesso! \n\`\`\`ini\nResultado: "${msg}"\`\`\``
        );
      }
      return;
    }

    if (["stats", "status", "on", "off"].includes(args[0].toLowerCase())) {
      if (guildDBData.welcome.status == false) {
        if (guildDBData.welcome.message == "null") {
          return message.reply(
            `${e.InsertError} › Você precisa **definir** a **mensagem** do sistema para **isso**.`
          );
        } else {
          guildDBData.welcome.status = true;
          await guildDBData.save();

          return message.reply(
            `${e.On} › Agora o **sistema** se encontra **ligado**.`
          );
        }
      }
      if (guildDBData.welcome.status == true) {
        guildDBData.welcome.status = false;
        await guildDBData.save();

        return message.reply(
          `${e.Off} › Agora o **sistema** se encontra **desligado**.`
        );
      }
    }
  }
};
