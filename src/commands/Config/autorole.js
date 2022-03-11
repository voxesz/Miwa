const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");
const Embed = require("../../structures/Embed");

module.exports = class Autorole extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "autorole";
    this.category = "Config";
    this.description = "Configure o sistema de cargo automático do servidor.";
    this.aliases = ["autocargo", "cargo"];

    this.userPermissions = ["MANAGE_GUILD"];
    this.botPermissions = ["MANAGE_ROLES"];
  }

  async execute({ message, args }) {
    const guildDBData = await this.client.guildDB.findOne({
      guildID: message.guild.id,
    });

    const autorole = guildDBData.autorole;

    if (!args[0]) {
      const embed = new Embed(message.author)
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `${e.Role} › Sistema de **Cargo Automático**\n\n> ${
            e.Switch
          } | Status: **${
            guildDBData.autorole.status == false ? `Desativado` : `Ativado`
          }**\n> ${e.Role} | Cargo: **${
            guildDBData.autorole.roles.length == 0
              ? `Nenhum cargo definido.`
              : `${autorole.roles.map((x) => `<@&${x}>`).join(", ")}`
          }**`
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
                .setDescription(`${e.Role} › Sistema de **Cargo Automático**`)
                .addFields([
                  {
                    name: `${e.Command} | Comandos:`,
                    value: `> **autorole add <cargo>** - Adicione um cargo ao sistema.\n> **autorole remove <cargo>** - Remova um cargo do sistema\n> **autorole list** - Veja a lista de cargos adicionados.\n> **autorole status** - Ligue ou desligue o sistema.`,
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

    if (["add", "adicionar"].includes(args[0].toLowerCase())) {
      const role =
        message.guild.roles.cache.get(args[1]) ||
        message.mentions.roles.first();

      if (!role) {
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir o **cargo** que deseja **adicionar** ao sistema.`
        );
      } else if (autorole.roles.length >= 5) {
        return message.reply(
          `${e.Error} › Você já **atingiu** o limite de **5 cargos**.`
        );
      } else if (autorole.roles.find((x) => x === role.id)) {
        return message.reply(
          `${e.Warning} › O cargo **inserido** já está **adicionado** ao sistema.`
        );
      } else {
        message.reply(
          `${e.Success} › O **cargo** ${role} foi **adicionado** ao sistema.`
        );
        if (guildDBData) {
          guildDBData.autorole.roles.push(role.id);
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "autorole.roles": role.id,
          });
        }
      }
      return;
    }

    if (["remove", "remover"].includes(args[0].toLowerCase())) {
      const role =
        message.guild.roles.cache.get(args[1]) ||
        message.mentions.roles.first();

      if (!role) {
        return message.reply(
          `${e.InsertError} › Você **precisa** inserir o **cargo** que deseja **remover** do sistema.`
        );
      } else if (!autorole.roles.length) {
        return message.reply(
          `${e.Warning} › Não há **nenhum cargo** adicionado ao **sistema**.`
        );
      } else if (!autorole.roles.find((x) => x === role.id)) {
        return message.reply(
          `${e.Warning} › O **cargo** inserido **não** está **listado** no sistema.`
        );
      } else {
        message.reply(
          `${e.Success} › ${message.author}, o cargo ${role} foi removido do sistema.`
        );
        guildDBData.autorole.roles.pull(role.id);
        await guildDBData.save();
      }

      return;
    }

    if (["list", "lista"].includes(args[0].toLowerCase())) {
      if (!autorole.roles.length) {
        return message.reply(
          `${e.Warning} › Não há **nenhum cargo** adicionado ao **sistema**.`
        );
      } else {
        const LIST = new Embed(message.author)
        .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()})
        .setDescription(`${e.Role} › **Cargos** Automáticos:\n\n${autorole.roles.map((x) => `> <@&${x}>`).join("\n")}`);

        message.reply({ embeds: [LIST] });
      }

      return;
    }

    if (["stats", "status", "on", "off"].includes(args[0].toLowerCase())) {
      if (guildDBData.autorole.status == false) {
        if (guildDBData.autorole.roles.length == 0) {
          return message.reply(
            `${e.InsertError} › Você precisa **inserir** algum **cargo** no sistema para **liga-lo**.`
          );
        } else {
          guildDBData.autorole.status = true;
          await guildDBData.save();

          return message.reply(
            `${e.On} › Agora o **sistema** se encontra **ligado**.`
          );
        }
      }
      if (guildDBData.autorole.status == true) {
        guildDBData.autorole.status = false;
        await guildDBData.save();

        return message.reply(
          `${e.Off} › Agora o **sistema** se encontra **desligado**.`
        );
      }
    }
  }
};
