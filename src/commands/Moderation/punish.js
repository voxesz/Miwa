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
          `${e.MemberRemove} › Sistema de **Punição**\n\n> ${
            e.Archive
          } | Suas Punições: **${userDBData.bans}**\n> ${
            e.Archives
          } | Punições da Guilda: **${guildDBData.punish.bans}**\n> ${
            e.World
          } | Logs: **${
            guildDBData.punish.channel == "null"
              ? `Nenhum canal definido.`
              : `<#${guildDBData.punish.channel}>`
          }**\n> ${e.Email} | Mensagem: \`\`\` # "${
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
                .setDescription(`${e.MemberRemove} › Sistema de **Punição**`)
                .addFields([
                  {
                    name: "Comandos:",
                    value: `> **punish <membro>** - Aplique uma punição ao membro inserido.\n> **punish list** - Veja a lista de membros punidos.\n> **punish set <chat>** - Defina o canal de logs.\n> **punish msg <msg>** - Defina a mensagem de punição.`,
                  },
                  {
                    name: `Placeholders:`,
                    value: `> **[tag]** - Mostra a tag do usuário.\n> **[id]** - Mostra o ID do usuário.\n> **[staff]** - Mostra a tag do responsável.\n> **[guild]** - Mostra o nome do servidor.\n> **[punish]** - Mostra a punição aplicada.\n> **[reason]** - Mostra o motivo da punição.`,
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

    if(['list', 'list', 'membros'].includes(args[0])) {
      if (!guildDBData.punish.members.length) {
        return message.reply(
          `${e.Error} | ${message.author}, eu não puni ninguém neste servidor até o momento.`
        );
      } else {
        const LIST = new Embed(message.author)
            .setAuthor({
              name: `${message.guild.name}`,
              iconURL: message.guild.iconURL()
            })
            .addFields({
              name: `${e.Member} | Usuários:`,
              value: `${guildDBData.punish.members
                .map(
                  (x) =>
                    `> User: **${
                      this.client.users.cache.get(x).tag
                    }**\n> ID: **${this.client.users.cache.get(x).id}**`
                )
                .join("\n\n")}`,
            });

          return message.reply({embeds: [LIST]});
      }
    }

    if(['channel', 'set', 'canal', 'chat'].includes(args[0].toLowerCase())) {
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
      } else if (guildDBData.punish.channel == channel.id) {
        return message.reply(
          `${e.Error} | ${message.author}, o canal inserido já está definido atualmente.`
        );
      } else {
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
      } else if (msg == guildDBData.punish.message) {
        return message.reply(
          `${e.Error} | ${message.author}, a mensagem inserida já está definida no momento.`
        );
      } else if (msg.length > 200) {
        return message.reply(
          `${e.Error} | ${message.author}, a mensagem deve ter no máximo \`200\` caracteres.`
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
          `${e.Correct} | ${message.author}, a mensagem do sistema foi definida como: \`\`\`${msg}\`\`\``
        );
      }
      return;
    }

    let USER = await this.client.getUser(args[0], message);

    if (USER) {
      const member = message.guild.members.cache.get(USER.id);
      if(USER.id == this.client.user.id) return message.reply(`${e.Error} | ${message.author}, você não pode me punir.`)
      else if(USER.id == message.author.id) return message.reply(`${e.Error} | ${message.author}, você não pode se punir.`)
      else if(member.roles.highest.position >= message.member.roles.highest.position) return message.reply(`${e.Error} | ${message.author}, este membro possui cargo mais alto ou equivalente ao seu!`)
      else if(member.roles.highest.position >= message.guild.me.roles.highest.position) return message.reply(`${e.Error} | ${message.author}, este membro possui cargo mais alto ou equivalente ao meu!`)

      const embed = new Embed(message.author)
        .setAuthor({ name: USER.tag, iconURL: USER.avatarURL() })
        .setDescription(
          `Utilize os **botões** abaixo para **selecionar** o tipo de **punição** que será aplicada ao **usuário**.\n\n> ${e.Help} | Caso seja um engano, utilize o botão **"Cancelar"**\n> ${e.Member} | Usuário a ser punido: **${USER.tag}**\n> ${e.Config} | Você possui **1 minuto** para interagir.`
        )
        .setThumbnail(USER.avatarURL({ dynamic: true, size: 2048 }));

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Banir")
          .setCustomId("ban")
          .setStyle("SECONDARY")
          .setEmoji(e.Trash),
        new MessageButton()
          .setLabel("Expulsar")
          .setCustomId("kick")
          .setStyle("SECONDARY")
          .setEmoji(e.MemberRemove),
        new MessageButton()
          .setLabel("Cancelar")
          .setCustomId("cancel")
          .setStyle("SECONDARY")
          .setEmoji(e.Error)
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
            content: `${e.Error} | ${message.author}, o tempo para interagir acabou.`,
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
                content: `${e.Help} | ${message.author}, insira o motivo da punição.\n> Digite **"Nada"** para **Motivo não Informado**.\n> Digite **"Cancelar"** para cancelar o banimento.`,
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
                      content: `${e.Trash} | ${message.author}, você cancelou a punição.`,
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
                      `Você está prestes a banir o usuário **${USER.tag}**. Você tem certeza disso?\n\n> ${e.Email} | Motivo selecionado: **${reason}**\n> ${e.Correct} | **Confirmar** = Banir o usuário.\n> ${e.Error} | **Cancelar** = Cancela o banimento.`
                    )
                    .setThumbnail(
                      USER.avatarURL({ dynamic: true, size: 2048 })
                    );

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setLabel("Confirmar")
                      .setCustomId("confirm")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Correct),
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
                        content: `${e.Error} | ${message.author}, o tempo para interagir acabou.`,
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
                            `${e.Correct} | ${message.author}, usuário punido com sucesso!`
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
                                  name: `${e.Member} | Usuário Punido:`,
                                  value: `> Tag: **${USER.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Crown} | Responsável:`,
                                  value: `> Tag: **${message.author.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Email} | Motivo:`,
                                  value: `> **${reason}**`,
                                },
                                {
                                  name: `${e.Trash} | Tipo de Punição:`,
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
                            content: `${e.Trash} | ${message.author}, você cancelou a punição.`,
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
                content: `${e.Help} | ${message.author}, insira o motivo da punição.\n> Digite **"Nada"** para **Motivo não Informado**.\n> Digite **"Cancelar"** para cancelar o banimento.`,
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
                      content: `${e.Trash} | ${message.author}, você cancelou a punição.`,
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
                      `Você está prestes a expulsar o usuário **${USER.tag}**. Você tem certeza disso?\n\n> ${e.Email} | Motivo selecionado: **${reason}**\n> ${e.Correct} | **Confirmar** = Expulsar o usuário.\n> ${e.Error} | **Cancelar** = Cancela a expulsão.`
                    )
                    .setThumbnail(
                      USER.avatarURL({ dynamic: true, size: 2048 })
                    );

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setLabel("Confirmar")
                      .setCustomId("confirm")
                      .setStyle("SECONDARY")
                      .setEmoji(e.Correct),
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
                        content: `${e.Error} | ${message.author}, o tempo para interagir acabou.`,
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
                            `${e.Correct} | ${message.author}, usuário punido com sucesso!`
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
                                  name: `${e.Member} | Usuário Punido:`,
                                  value: `> Tag: **${USER.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Crown} | Responsável:`,
                                  value: `> Tag: **${message.author.tag}**\n> ID: **${USER.id}**`,
                                },
                                {
                                  name: `${e.Email} | Motivo:`,
                                  value: `> **${reason}**`,
                                },
                                {
                                  name: `${e.Trash} | Tipo de Punição:`,
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
                            content: `${e.Trash} | ${message.author}, você cancelou a punição.`,
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
                content: `${e.Trash} | ${message.author}, você cancelou a punição.`,
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
