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
          `${e.Flag} › Sistema de **Cargo Automático**\n\n> ${
            e.Archive
          } | Status: **${
            guildDBData.autorole.status == false ? `Desativado` : `Ativado`
          }**\n> ${e.Save} | Cargo: **${
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
                .setDescription(`${e.Flag} › Sistema de **Cargo Automático**`)
                .addFields([
                  {
                    name: "Comandos:",
                    value: `> **autorole add <cargo>** - Adicione um cargo ao sistema.\n> **autorole remove <cargo>** - Remova um cargo do sistema\n> **autorole list** - Veja a lista de cargos adicionados.\n> **autorole status** - Ligue ou desligue o sistema.`,
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

    if (["add", "adicionar"].includes(args[0].toLowerCase())) {
      const role =
        message.guild.roles.cache.get(args[1]) ||
        message.mentions.roles.first();

      if (!role) {
        return message.reply(
          `${e.Error} | ${message.author}, você precisa inserir o cargo que deseja adicionar ao sistema.`
        );
      } else if (autorole.roles.length >= 5) {
        return message.reply(
          `${e.Error} | ${message.author}, você já atingiu o limite de **5 cargos**.`
        );
      } else if (autorole.roles.find((x) => x === role.id)) {
        return message.reply(
          `${e.Error} | ${message.author}, o cargo inserido já está adicionado no sistema.`
        );
      } else {
        message.reply(
          `${e.Correct} | ${message.author}, o cargo ${role} foi adicionado no sistema.`
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
          `${e.Error} | ${message.author}, você precisa inserir o cargo que deseja remover do sistema.`
        );
      } else if (!autorole.roles.length) {
        return message.reply(
          `${e.Error} | ${message.author}, não há nenhum cargo adicionado no sistema.`
        );
      } else if (!autorole.roles.find((x) => x === role.id)) {
        return message.reply(
          `${e.Error} | ${message.author}, o cargo inserido não está adicionado no sistema.`
        );
      } else {
        message.reply(
          `${e.Correct} | ${message.author}, o cargo ${role} foi removido do sistema.`
        );
        guildDBData.autorole.roles.pull(role.id);
        await guildDBData.save();
      }

      return;
    }

    if (["list", "lista"].includes(args[0].toLowerCase())) {
      if (!autorole.roles.length) {
        return message.reply(
          `${e.Error} | ${message.author}, não há nenhum cargo adicionado no sistema.`
        );
      } else {
        const LIST = new Embed(message.author).setDescription(
          autorole.roles.map((x) => `<@&${x}>`).join(", ")
        );

        message.reply({ embeds: [LIST] });
      }

      return;
    }

    if (["stats", "status", "on", "off"].includes(args[0].toLowerCase())) {
      if (guildDBData.autorole.status == false) {
        if (guildDBData.autorole.roles.length == 0) {
          return message.reply(
            `${e.Error} | ${message.author}, você precisa definir o(s) cargo(s) automático(s) antes de ligar o sistema.`
          );
        } else {
          guildDBData.autorole.status = true;
          await guildDBData.save();

          return message.reply(
            `${e.Correct} | ${message.author}, sistema ativado com sucesso.`
          );
        }
      }
      if (guildDBData.autorole.status == true) {
        guildDBData.autorole.status = false;
        await guildDBData.save();

        return message.reply(
          `${e.Correct} | ${message.author}, sistema desativado com sucesso.`
        );
      }
    }
  }
};
