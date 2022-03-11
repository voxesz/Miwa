const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");
const Embed = require("../../structures/Embed");

module.exports = class Captcha extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "captcha";
    this.category = "Config";
    this.description = "Configure o sistema de verificação do servidor.";
    this.aliases = ["verificação", "verificar"];

    this.userPermissions = ["MANAGE_GUILD"];
    this.botPermissions = ["MANAGE_ROLES"]
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
          `${e.Captcha} › Sistema de **Verificação**\n\n> ${
            e.Role
          } | Cargo: **${guildDBData.captcha.role == "null" ? "Nenhum cargo definido." : `<@&${guildDBData.captcha.role}>`}**\n> ${
            e.Chat
          } | Chat: **${
            guildDBData.captcha.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.captcha.channel}>`
          }**\n> ${e.Message} | Mensagem: \n\`\`\`md\n# "${guildDBData.captcha.message == "null"
          ? `Nenhuma mensagem definida.`
          : guildDBData.captcha.message}"\`\`\``
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
                .setDescription(`${e.Return} › Sistema de **Verificação**`)
                .addFields([
                  {
                    name: `${e.Command} | Comandos:`,
                    value: `> **captcha role <cargo>** - Defina o cargo que será dado ao verificar.\n> **captcha set <chat>** - Envie a verificação no chat inserido.\n> **captcha msg <msg>** - Mensagem que será enviada.`,
                  },
                  {
                    name: `${e.Image} | Placeholders:`,
                    value: `> **[role]** - Menciona o cargo.`,
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
    if (["role", "cargo"].includes(args[0].toLowerCase())) {
        const role =
          message.guild.roles.cache.get(args[1]) ||
          message.mentions.roles.first();
  
        if (!role) {
          return message.reply(
            `${e.InsertError} › Você **precisa** inserir o **cargo** que deseja **adicionar** ao sistema.`
          );
        } else if (role.id === guildDBData.captcha.role) {
          return message.reply(
            `${e.Warning} › O cargo **inserido** já está **adicionado** ao sistema.`
          );
        } else {
          message.reply(
            `${e.Success} › O **cargo** ${role} foi **adicionado** ao sistema.`
          );
          if (guildDBData) {
            guildDBData.captcha.role = role.id;
            await guildDBData.save();
          } else {
            await this.client.guildDB.create({
              guildID: message.guild.id,
              "captcha.role": role.id,
            });
          }
        }
        return;
      }
  
      if (["channel", "definir", "canal", "set"].includes(args[0].toLowerCase())) {
        const channel =
          message.mentions.channels.first() ||
          message.guild.channels.cache.get(args[1]);
  
        if (guildDBData.captcha.message == "null") return message.reply(`${e.InsertError} › Você precisa **definir** a **mensagem** do sistema para **isso**.`)
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
          if (guildDBData) {
            guildDBData.captcha.channel = channel.id;
            await guildDBData.save();
          } else {
            await this.client.guildDB.create({
              guildID: message.guild.id,
              "captcha.channel": channel.id,
            });
          }
          const embed = new Embed(message.author)
          .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()})
          .setDescription(`${e.Captcha} › **Verificação**\n\n${guildDBData.captcha.message.replace("[role]", `<@&${guildDBData.captcha.role}>`)}`)
          .setFooter({text: `Mensagem configurada pela Equipe do ${message.guild.name}.`, iconURL: message.guild.iconURL()})

          const row = new MessageActionRow()
          .addComponents(
              new MessageButton()
              .setCustomId('captcha')
              .setLabel('Verificar')
              .setStyle("SECONDARY")
              .setEmoji(e.Captcha)
          )
          channel.send({embeds: [embed], components: [row]})
          return message.reply(
            `${e.Success} › O **sistema** foi **iniciado** com sucesso no **canal** ${channel}.`
          );
      }
  
      if (["message", "msg"].includes(args[0].toLowerCase())) {
        let msg = args.slice(1).join(" ");
  
        if (!msg) {
          return message.reply(
            `${e.InsertError} › Você **precisa** inserir a **mensagem** que deseja **adicionar** ao sistema.`
          );
        } else if (msg == guildDBData.captcha.message) {
          return message.reply(
            `${e.Warning} › A mensagem **inserida** já está **definida** no sistema.`
          );
        } else if (msg.length > 300) {
          return message.reply(
            `${e.Size} › A **mensagem** deve ter no máximo **300 caracteres**.`
          );
        } else {
          if (guildDBData) {
            guildDBData.captcha.message = msg;
            await guildDBData.save();
          } else {
            await this.client.guildDB.create({
              guildID: message.guild.id,
              "captcha.message": msg,
            });
          }
          await message.reply(
            `${e.Success} › Você **alterou** a mensagem do **sistema** com sucesso! \n\`\`\`ini\nResultado: "${msg}"\`\`\``
          );
        }
        return;
      }
  }
};
