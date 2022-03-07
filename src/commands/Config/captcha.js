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
          `${e.Return} › Sistema de **Verificação**\n\n> ${
            e.Save
          } | Cargo: **${guildDBData.captcha.role == "null" ? "Nenhum cargo definido." : `<@&${guildDBData.captcha.role}>`}**\n> ${
            e.World
          } | Chat: **${
            guildDBData.captcha.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.captcha.channel}>`
          }**\n> ${e.Email} | Mensagem: \`\`\` # "${
            guildDBData.captcha.message == "null"
              ? `Nenhuma mensagem definida.`
              : guildDBData.captcha.message
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
                .setDescription(`${e.Return} › Sistema de **Verificação**`)
                .addFields([
                  {
                    name: "Comandos:",
                    value: `> **captcha role <cargo>** - Defina o cargo que será dado ao verificar.\n> **captcha set <chat>** - Envie a verificação no chat inserido.\n> **captcha msg <msg>** - Mensagem que será enviada.`,
                  },
                  {
                    name: `Placeholders:`,
                    value: `> **[role]** - Menciona o cargo.`,
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
    if (["role", "cargo"].includes(args[0].toLowerCase())) {
        const role =
          message.guild.roles.cache.get(args[1]) ||
          message.mentions.roles.first();
  
        if (!role) {
          return message.reply(
            `${e.Error} | ${message.author}, você precisa inserir o cargo que deseja adicionar ao sistema.`
          );
        } else if (role.id === guildDBData.captcha.role) {
          return message.reply(
            `${e.Error} | ${message.author}, o cargo inserido é o mesmo definido atualmente.`
          );
        } else {
          message.reply(
            `${e.Correct} | ${message.author}, o cargo ${role} foi adicionado no sistema.`
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
  
        if (guildDBData.captcha.message == "null") return message.reply(`${e.Error} | ${message.author}, você precisa definir a mensagem antes de iniciar o sistema.`)
        if (!channel) {
          return message.reply(
            `${e.Error} | ${message.author}, você precisa inserir um canal.`
          );
        } else if (!channel.type === "text") {
          return message.reply(
            `${e.Error} | ${message.author}, você deve inserir um canal de texto.`
          );
        } else {
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
          .setAuthor({name: `${message.guild.name} - Verificação`, iconURL: message.guild.iconURL()})
          .setDescription(`${guildDBData.captcha.message.replace("[role]", `<@&${guildDBData.captcha.role}>`)}`)
          .setFooter({text: `Mensagem configurada pela Equipe do ${message.guild.name}.`, iconURL: message.guild.iconURL()})

          const row = new MessageActionRow()
          .addComponents(
              new MessageButton()
              .setCustomId('captcha')
              .setLabel('Verificar')
              .setStyle("SECONDARY")
              .setEmoji(e.Correct)
          )

          if(guildDBData.captcha.msg !== "null") {
            const msg = channel.messages.fetch(guildDBData.captcha.msg)
            msg.delete()
          }
          const mensagem = await channel.send({embeds: [embed], components: [row]})
          await this.client.guildDB.findOneAndUpdate({guildID: message.guild.id}, {$set: {"captcha.msg": mensagem.id}})
          return message.reply(
            `${e.Correct} | ${message.author}, o sistema foi iniciado com sucesso no canal ${channel}.`
          );
        }
      }
  
      if (["message", "msg"].includes(args[0].toLowerCase())) {
        let msg = args.slice(1).join(" ");
  
        if (!msg) {
          return message.reply(
            `${e.Error} | ${message.author}, você precisa inserir a mensagem.`
          );
        } else if (msg == guildDBData.captcha.message) {
          return message.reply(
            `${e.Error} | ${message.author}, a mensagem inserida já está definida no momento.`
          );
        } else if (msg.length > 300) {
          return message.reply(
            `${e.Error} | ${message.author}, a mensagem deve ter no máximo \`300\` caracteres.`
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
            `${e.Correct} | ${message.author}, a mensagem do sistema foi definida como: \`\`\`${msg}\`\`\``
          );
        }
        return;
      }
  }
};
