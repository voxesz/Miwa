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
          `${e.MemberAdd} › Logs de **Boas-Vindas**\n\n> ${e.Archive} | Status: **${
            guildDBData.welcome.status == false ? `Desativado` : `Ativado`
          }**\n> ${
            e.Save
          } | Tipo: **${guildDBData.welcome.type.toUpperCase()}**\n> ${
            e.World
          } | Chat: **${
            guildDBData.welcome.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.welcome.channel}>`
          }**\n> ${e.Email} | Mensagem: \`\`\` # "${
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
        .setDisabled(true);

      const right = new MessageButton()
        .setCustomId("right")
        .setEmoji(e.Right)
        .setStyle("SECONDARY");

      row.setComponents(left, right);

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

          right.setDisabled(true);
          left.setDisabled(true);
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
                .setDescription(`${e.MemberAdd} › Logs de Boas-Vindas`)
                .addFields([
                  {
                    name: "Comandos:",
                    value: `> **welcome type <img/msg>** - Defina se as boas-vindas serão em imagem ou mensagem.\n> **welcome channel <chat>** - Chat que será enviada a mensagem de boas vindas.\n> **welcome msg <msg>** - Mensagem que será enviada.\n> **welcome status** - Ligue ou desligue o sistema.`,
                  },
                  {
                    name: `Placeholders:`,
                    value: `> **[user]** - Menciona o usuário. **(Apenas em tipo MSG)**\n> **[name]** - Mostra o nome do usuário\n> **[tag]** - Mostra o nome junto com a hashtag.\n> **[guild]** - Mostra o nome do servidor.\n> **[members]** - Mostra o total de membros do servidor.`,
                  },
                ]);

              right.setDisabled(true);
              left.setDisabled(false);
              await r.deferUpdate();
              await msg.edit({ embeds: [info], components: [row] });
              break;
            }
            case "left": {
              right.setDisabled(false);
              left.setDisabled(true);
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
          `${e.Error} | ${message.author}, os tipos de boas-vindas disponíveis são:\n> Img | Msg`
        );
      if (guildDBData.welcome.type == args[1].toLowerCase())
        return message.reply(
          `${e.Error} | ${message.author}, esse tipo já está definido no momento.`
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
        `${e.Correct} | ${
          message.author
        }, você definiu o tipo de boas-vindas como **${args[1].toUpperCase()}**.`
      );
    }

    if (["channel", "chat", "canal"].includes(args[0].toLowerCase())) {
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);

      if (!channel) {
        return message.reply(
          `${e.Error} | ${message.author}, você precisa inserir um canal para ser definido.`
        );
      } else if (!channel.type === "text") {
        return message.reply(
          `${e.Error} | ${message.author}, você deve inserir um canal de texto.`
        );
      } else if (guildDBData.welcome.channel == channel.id) {
        return message.reply(
          `${e.Error} | ${message.author}, o canal inserido já está definido atualmente.`
        );
      } else {
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
          `${e.Correct} | ${message.author}, o canal ${channel} foi adicionado com sucesso ao sistema.`
        );
      }
    }

    if (["message", "msg"].includes(args[0].toLowerCase())) {
      let msg = args.slice(1).join(" ");

      if (!msg) {
        return message.reply(
          `${e.Error} | ${message.author}, você precisa inserir a mensagem.`
        );
      } else if (msg == guildDBData.welcome.message) {
        return message.reply(
          `${e.Error} | ${message.author}, a mensagem inserida já está definida no momento.`
        );
      } else if (msg.length > 300) {
        return message.reply(
          `${e.Error} | ${message.author}, a mensagem deve ter no máximo \`300\` caracteres.`
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
          `${e.Correct} | ${message.author}, a mensagem do sistema foi definida como: \`\`\`${msg}\`\`\``
        );
      }
      return;
    }

    if (["stats", "status", "on", "off"].includes(args[0].toLowerCase())) {
      if (guildDBData.welcome.status == false) {
        if (guildDBData.welcome.message == "null") {
          return message.reply(
            `${e.Error} | ${message.author}, você precisa definir a mensagem antes de ligar o sistema.`
          );
        } else {
          guildDBData.welcome.status = true;
          await guildDBData.save();

          return message.reply(
            `${e.Correct} | ${message.author}, sistema ativado com sucesso.`
          );
        }
      }
      if (guildDBData.welcome.status == true) {
        guildDBData.welcome.status = false;
        await guildDBData.save();

        return message.reply(
          `${e.Correct} | ${message.author}, sistema desativado com sucesso.`
        );
      }
    }
  }
};
