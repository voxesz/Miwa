const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = class Punish extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "punish";
    this.category = "Moderation";
    this.description = "Aplique uma punição a um membro do servidor.";
    this.aliases = ["ban", "kick", "punir"];

    this.userPermissions = ["BAN_MEMBERS", "KICK_MEMBERS"];
    this.botPermissions = ["BAN_MEMBERS", "KICK_MEMBERS"];
  }

  async execute({ message, args }) {
    const guildDBData = await this.client.guildDB.findOne({
        guildID: message.guild.id,
      }),
      userDBData = await this.client.userDB.findOne({ _id: message.author.id });

    if (!args[0]) {
      const embed = new Embed(message.author)
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `${e.Punish} › Sistema de **Punições**\n\n> ${
            e.ID
          } | Suas Punições: **${userDBData.bans}**\n> ${
            e.Folder
          } | Punições da Guilda: **${guildDBData.punish.bans}**\n> ${
            e.Earth
          } | Logs: **${
            guildDBData.punish.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.punish.channel}>`
          }**\n> ${e.Message} | Mensagem: \`\`\` # "${
            guildDBData.punish.message == "null"
              ? `Embed padrão.`
              : guildDBData.punish.message
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
                .setDescription(`${e.Punish} › Sistema de **Punições**`)
                .addFields([
                  {
                    name: `${e.Command} | Comandos:`,
                    value: `> **punish <membro>** - Aplique uma punição ao membro inserido.\n> **punish list** - Veja a lista de membros punidos.\n> **punish set <chat>** - Defina o canal de logs.\n> **punish msg <msg>** - Defina a mensagem de punição.`,
                  },
                  {
                    name: `${e.Image} | Placeholders:`,
                    value: `> **[tag]** - Mostra a tag do usuário.\n> **[id]** - Mostra o ID do usuário.\n> **[staff]** - Mostra a tag do responsável.\n> **[guild]** - Mostra o nome do servidor.\n> **[punish]** - Mostra a punição aplicada.\n> **[reason]** - Mostra o motivo da punição.`,
                  },
                ]);

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

    if(['list', 'list', 'membros'].includes(args[0])) {
      if (!guildDBData.punish.members.length) {
        return message.reply(
          `${e.List} › Até o **momento**, eu não **puni** ninguém nesta **guilda**.`
        );
      } else {
        const LIST = new Embed(message.author)
            .setAuthor({
              name: `${message.guild.name}`,
              iconURL: message.guild.iconURL()
            })
            .setDescription(`${e.User} › Usuários:\n\n${guildDBData.punish.members
              .map(
                (x) =>
                  `> User: **${
                    this.client.users.cache.get(x).tag
                  }**\n> ID: **${this.client.users.cache.get(x).id}**`
              )
              .join("\n\n")}`)
            .setThumbnail(message.guild.iconURL({size: 2048}))

          return message.reply({embeds: [LIST]});
      }
    }

    if(['channel', 'set', 'canal', 'chat'].includes(args[0].toLowerCase())) {
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
      if (guildDBData.punish.channel == channel.id) {
        return message.reply(
          `${e.Warning} › O chat **inserido** já está **adicionado** ao sistema.`
        );
      }
        if (guildDBData) {
          guildDBData.punish.channel = channel.id;
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "punish.channel": channel.id,
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
      } else if (msg == guildDBData.punish.message) {
        return message.reply(
          `${e.Warning} › A mensagem **inserida** já está **definida** no sistema.`
        );
      } else if (msg.length > 200) {
        return message.reply(
          `${e.Size} › A **mensagem** deve ter no máximo **200 caracteres**.`
        );
      } else {
        if (guildDBData) {
          guildDBData.punish.message = msg;
          await guildDBData.save();
        } else {
          await this.client.guildDB.create({
            guildID: message.guild.id,
            "punish.message": msg,
          });
        }
        await message.reply(
          `${e.Success} › Você **alterou** a mensagem do **sistema** com sucesso! \n\`\`\`ini\nResultado: "${msg}"\`\`\``
        );
      }
      return;
    }

    let USER = await this.client.getUser(args[0], message);

    if (USER) {
      const member = message.guild.members.cache.get(USER.id);
      if(USER.id == this.client.user.id) return message.reply(`${e.Error} › Não tem como eu me banir, né?`)
      else if(USER.id == message.author.id) return message.reply(`${e.Error} › Você **não** pode se **punir**.`)
      else if(member.roles.highest.position >= message.member.roles.highest.position) return message.reply(`${e.Rank} › Você só pode **punir** membros com **cargo inferior** ao seu.`)
      else if(member.roles.highest.position >= message.guild.me.roles.highest.position) return message.reply(`${e.Rank} › Eu **não** consigo **punir** este membro.`)

      const embed = new Embed(message.author)
        .setAuthor({ name: USER.tag, iconURL: USER.avatarURL() })
        .setDescription(
          `Utilize os **botões** abaixo para **selecionar** o tipo de **punição** que será aplicada ao **usuário**.\n\n> ${e.Tip} | Caso seja um engano, utilize o botão **"Cancelar"**\n> ${e.User} | Usuário a ser punido: **${USER.tag}**\n> ${e.Time} | Você possui **1 minuto** para interagir.`
        )
        .setThumbnail(USER.avatarURL({ dynamic: true, size: 2048 }));

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Banir")
          .setCustomId("ban")
          .setStyle("SECONDARY")
          .setEmoji(e.Punish),
        new MessageButton()
          .setLabel("Expulsar")
          .setCustomId("kick")
          .setStyle("SECONDARY")
          .setEmoji(e.Kick),
        new MessageButton()
          .setLabel("Cancelar")
          .setCustomId("cancel")
          .setStyle("SECONDARY")
          .setEmoji(e.Trash)
      );

      const msg = await message.reply({ embeds: [embed], components: [row] });

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

          msg.edit({
            content: `${e.Time} › O **tempo** para interagir **acabou**.`,
            embeds: [],
            components: [],
          });
        })

        .on("collect", async (r) => {
          if (r.user.id !== message.author.id) {
            return r.deferUpdate();
          }
          switch (r.customId) {
            case "ban": {
              msg.edit({
                content: `${e.Idea} › Insira o **motivo** da punição.\n> Digite **"Nada"** para **Motivo não informado**.\n> Digite **"Cancelar"** para cancelar o **banimento**.`,
                embeds: [],
                components: [],
              });
              const filter = (m) => m.author.id === message.author.id;
              let collector = msg.channel
                .createMessageCollector({
                  filter: filter,
                  max: 1,
                  time: 60000 * 2,
                })

                .on("collect", async (collected) => {
                  var reason;

                  if (
                    ["cancelar", '"cancelar"'].includes(
                      collected.content.toLowerCase()
                    )
                  ) {
                    message.reply({
                      content: `${e.Block} › Você **cancelou** a punição.`,
                      embeds: [],
                      components: [],
                    });

                    msg.delete();
                    return collector.stop();
                  }
                  if (
                    ["nada", '"nada"'].includes(collected.content.toLowerCase())
                  ) {
                    reason = "Motivo não informado";
                  } else {
                    reason = collected.content;
                  }
                  const embed = new Embed(message.author)
                    .setAuthor({ name: USER.tag, iconURL: USER.avatarURL() })
                    .setDescription(
                      `${e.Warn} › **Você** está prestes a **banir** o usuário **${USER.tag}**. Você tem **certeza** disso?\n\n> ${e.Message} | **Motivo** selecionado: **${reason}**\n> ${e.Success} | **Confirmar** = Banir o usuário.\n> ${e.Error} | **Cancelar** = Cancela o banimento.`
                    )
                    .setThumbnail(
                      USER.avatarURL({ dynamic: true, size: 2048 })
                    );

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setLabel("Confirmar")
                      .setCustomId("confirm")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Success),
                    new MessageButton()
                      .setLabel("Cancelar")
                      .setCustomId("cancel")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Error)
                  );

                  msg.delete();
                  const mensagem = await message.reply({
                    embeds: [embed],
                    components: [row],
                  });

                  const filtro = (interaction) => {
                    return (
                      interaction.isButton() &&
                      interaction.message.id === mensagem.id
                    );
                  };

                  mensagem
                    .createMessageComponentCollector({
                      filter: filtro,
                      time: 60000,
                    })

                    .on("end", async (r, reason) => {
                      if (reason != "time") return;

                      mensagem.edit({
                        content: `${e.Time} › O **tempo** para interagir **acabou**.`,
                        embeds: [],
                        components: [],
                      });
                    })

                    .on("collect", async (r) => {
                      if (r.user.id !== message.author.id) {
                        return r.deferUpdate();
                      }
                      switch (r.customId) {
                        case "confirm": {
                          await this.client.userDB.findOneAndUpdate(
                            { _id: message.author.id },
                            { $set: { bans: userDBData.bans + 1 } }
                          );
                          await this.client.guildDB.findOneAndUpdate(
                            { guildID: message.guild.id },
                            {
                              $set: {
                                "punish.bans": guildDBData.punish.bans + 1,
                              },
                              $push: {
                                "punish.members": USER.id
                              }
                            }
                          );
                          const canal = this.client.channels.cache.get(
                            guildDBData.punish.channel == "null"
                              ? message.channel.id
                              : guildDBData.punish.channel
                          );
                          message.reply(
                            `${e.Success} › Você **baniu** o usuário **${USER.tag}** com **sucesso**!`
                          );
                          if (guildDBData.punish.message == "null") {
                            const punish = new Embed(this.client.user)
                              .setAuthor({
                                name: message.guild.name,
                                iconURL: message.guild.iconURL(),
                              })
                              .setThumbnail(
                                USER.avatarURL({ dynamic: true, size: 2048 })
                              )
                              .addFields([
                                {
                                  name: `${e.User} › Usuário Punido:`,
                                  value: `> Tag: **${USER.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Crown} › Responsável:`,
                                  value: `> Tag: **${message.author.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Message} › Motivo:`,
                                  value: `> **${reason}**`,
                                },
                                {
                                  name: `${e.Punish} › Tipo de Punição:`,
                                  value: `> **Banimento**.`,
                                },
                              ])
                              .setFooter({
                                text: `O usuário ${
                                  message.author.tag
                                } já puniu ${userDBData.bans + 1} membros!`,
                                iconURL: message.author.avatarURL({
                                  dynamic: true,
                                }),
                              });
                            await canal.send({ embeds: [punish] });
                          } else {
                            await canal.send(`${guildDBData.punish.message
                              .replace("[tag]", USER.tag)
                              .replace("[id]", USER.id)
                              .replace("[staff]", message.author.tag)
                              .replace("[guild]", message.guild.name)
                              .replace("[punish]", "Banimento")
                              .replace("[reason]", USER.username)}}`);
                          }
                          mensagem.delete();
                          await member.ban({ days: 7, reason: reason });

                          break;
                        }
                        case "cancel": {
                          mensagem.edit({
                            content: `${e.Block} › Você **cancelou** a punição.`,
                            embeds: [],
                            components: [],
                          });
                          break;
                        }
                      }
                    });
                });
              break;
            }
            case "kick": {
              msg.edit({
                content: `${e.Idea} › Insira o **motivo** da punição.\n> Digite **"Nada"** para **Motivo não informado**.\n> Digite **"Cancelar"** para cancelar o **banimento**.`,
                embeds: [],
                components: [],
              });
              const filter = (m) => m.author.id === message.author.id;
              let collector = msg.channel
                .createMessageCollector({
                  filter: filter,
                  max: 1,
                  time: 60000 * 2,
                })

                .on("collect", async (collected) => {
                  var reason;

                  if (
                    ["cancelar", '"cancelar"'].includes(
                      collected.content.toLowerCase()
                    )
                  ) {
                    message.reply({
                      content: `${e.Block} › Você **cancelou** a punição.`,
                      embeds: [],
                      components: [],
                    });

                    msg.delete();
                    return collector.stop();
                  }
                  if (
                    ["nada", '"nada"'].includes(collected.content.toLowerCase())
                  ) {
                    reason = "Motivo não informado";
                  } else {
                    reason = collected.content;
                  }
                  const embed = new Embed(message.author)
                    .setAuthor({ name: USER.tag, iconURL: USER.avatarURL() })
                    .setDescription(
                      `${e.Warn} › **Você** está prestes a **expulsar** o usuário **${USER.tag}**. Você tem **certeza** disso?\n\n> ${e.Message} | **Motivo** selecionado: **${reason}**\n> ${e.Success} | **Confirmar** = Expulsar o usuário.\n> ${e.Error} | **Cancelar** = Cancela a expulsão.`
                    )
                    .setThumbnail(
                      USER.avatarURL({ dynamic: true, size: 2048 })
                    );

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setLabel("Confirmar")
                      .setCustomId("confirm")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Success),
                    new MessageButton()
                      .setLabel("Cancelar")
                      .setCustomId("cancel")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Error)
                  );

                  msg.delete();
                  const mensagem = await message.reply({
                    embeds: [embed],
                    components: [row],
                  });

                  const filtro = (interaction) => {
                    return (
                      interaction.isButton() &&
                      interaction.message.id === mensagem.id
                    );
                  };

                  mensagem
                    .createMessageComponentCollector({
                      filter: filtro,
                      time: 60000,
                    })

                    .on("end", async (r, reason) => {
                      if (reason != "time") return;

                      mensagem.edit({
                        content: `${e.Time} › O **tempo** para interagir **acabou**.`,
                        embeds: [],
                        components: [],
                      });
                    })

                    .on("collect", async (r) => {
                      if (r.user.id !== message.author.id) {
                        return r.deferUpdate();
                      }
                      switch (r.customId) {
                        case "confirm": {
                          await this.client.userDB.findOneAndUpdate(
                            { _id: message.author.id },
                            { $set: { bans: userDBData.bans + 1 } }
                          );
                          await this.client.guildDB.findOneAndUpdate(
                            { guildID: message.guild.id },
                            {
                              $set: {
                                "punish.bans": guildDBData.punish.bans + 1,
                              },
                              $push: {
                                "punish.members": USER.id
                              }
                            }
                          );
                          const canal = this.client.channels.cache.get(
                            guildDBData.punish.channel == "null"
                              ? message.channel.id
                              : guildDBData.punish.channel
                          );
                          message.reply(
                            `${e.Success} › Você **expulsou** o usuário **${USER.tag}** com **sucesso**!`
                          );
                          if (guildDBData.punish.message == "null") {
                            const punish = new Embed(this.client.user)
                              .setAuthor({
                                name: message.guild.name,
                                iconURL: message.guild.iconURL(),
                              })
                              .setThumbnail(
                                USER.avatarURL({ dynamic: true, size: 2048 })
                              )
                              .addFields([
                                {
                                  name: `${e.User} › Usuário Punido:`,
                                  value: `> Tag: **${USER.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Crown} › Responsável:`,
                                  value: `> Tag: **${message.author.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Message} › Motivo:`,
                                  value: `> **${reason}**`,
                                },
                                {
                                  name: `${e.Punish} › Tipo de Punição:`,
                                  value: `> **Expulsão**.`,
                                },
                              ])
                              .setFooter({
                                text: `O usuário ${
                                  message.author.tag
                                } já puniu ${userDBData.bans + 1} membros!`,
                                iconURL: message.author.avatarURL({
                                  dynamic: true,
                                }),
                              });
                            await canal.send({ embeds: [punish] });
                          } else {
                            await canal.send(`${guildDBData.punish.message
                              .replace("[tag]", USER.tag)
                              .replace("[id]", USER.id)
                              .replace("[staff]", message.author.tag)
                              .replace("[guild]", message.guild.name)
                              .replace("[punish]", "Expulsão")
                              .replace("[reason]", USER.username)}`);
                          }
                          mensagem.delete();
                          await member.kick({ reason: reason });

                          break;
                        }
                        case "cancel": {
                          mensagem.edit({
                            content: `${e.Block} › Você **cancelou** a punição.`,
                            embeds: [],
                            components: [],
                          });
                          break;
                        }
                      }
                    });
                });
              break;
            }
            case "cancel": {
              msg.edit({
                content: `${e.Block} › Você **cancelou** a punição.`,
                embeds: [],
                components: [],
              });
              break;
            }
          }
        });
    }
  }
};
