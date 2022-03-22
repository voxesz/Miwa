const { MessageSelectMenu, MessageActionRow } = require("discord.js");
const e = require("../../utils/Emojis");
const Embed = require("../../structures/Embed");

const Command = require("../../structures/Command");

module.exports = class Help extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "help";
    this.category = "Information";
    this.description = "Veja todas as minhas funcionalidades.";
    this.aliases = ["ajuda"];
  }

  async execute({ message, args }) {
    const { commands } = this.client;

    const block = [];
    if (!this.client.developers.some((x) => x === message.author.id)) {
      block.push("Developing");
    }

    const list = commands
      .map((x) => x.category)
      .filter((x, f, y) => y.indexOf(x) === f)
      .filter((c) => !block.includes(c));

    const menuOptions = [];

    for (let value of list) {
      menuOptions.push({
        value: value,
        description: `Comandos da categoria **${value}**.`,
        commandList: commands
          .filter((x) => x.category === value)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((f) => `**${f.name}**`)
          .join("\n> "),
      });
    }

    const AJUDA = new Embed(message.author).setThumbnail(this.client.user.avatarURL({format: "jpeg", size: 2048})).setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()});

    if (!args[0]) return this.menu({ menuOptions, message });

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));

    if (!command) {
      return message.reply(
        `${e.FindError} › **Desculpe**, não **encontrei** o comando **solicitado**.`
      );
    }

    AJUDA.setDescription(`${e.Information} › Central de **Ajuda**\n\n> ${e.Command} | Comando: **${command.name}**\n> ${e.Folder} | Categoria: **${command.category}**\n> ${e.Message} | Descrição: **${
      !command.description.length ? `Sem descrição.` : command.description
    }**\n> ${e.Config} | Alternativas: **${
      !command.aliases.length
        ? `Sem alternativas.`
        : command.aliases.join(", ")
    }**`)

    await message.reply({ embeds: [AJUDA] });
  }

  async menu({ menuOptions, message }) {
    const row = new MessageActionRow();

    const menu = new MessageSelectMenu()
      .setCustomId("MenuSelection")
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(`Selecione a categoria que deseja ver.`);

    menuOptions.forEach((option) => {
      switch (option.value) {
        case "Bot": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos relacionados a Miwa.`,
            value: option.value,
            emoji: e.Moon,
          });
          break;
        }
        case "Config": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos relacionados a configuração do Bot no servidor.`,
            value: option.value,
            emoji: e.Config,
          });
          break;
        }
        case "Economy": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Utilize a economia do Bot.`,
            value: option.value,
            emoji: e.Money,
          });
          break;
        }
        case "Information": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos com informações úteis.`,
            value: option.value,
            emoji: e.Information,
          });
          break;
        }
        case "Moderation": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos para ser utilizados pela equipe do servidor.`,
            value: option.value,
            emoji: e.Crown,
          });
          break;
        }
        case "Music": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Utilize para ouvir música no Bot.`,
            value: option.value,
            emoji: e.Music,
          });
          break;
        }
        case "Social": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos relacionados a parte de Rede Social do Bot.`,
            value: option.value,
            emoji: e.User,
          });
          break;
        }
        case "Utils": {
          menu.addOptions({
            label: option.label ? option.label : option.value,
            description: `Comandos úteis sem categoria especifica.`,
            value: option.value,
            emoji: e.Earth,
          });
          break;
        }
      }
    });

    const server = await this.client.guildDB.findOne({
      guildID: message.guild.id,
    });

    const EMBED = new Embed(message.author)
    .setThumbnail(this.client.user.avatarURL({format: "jpeg", size: 2048})).setTitle(
      `${e.Information} › Central de Ajuda`
      )
      .setDescription(`**Olá** ${message.author}! ${e.Hand}\nEstá precisando de **ajuda**? Selecione no **menu** abaixo a **categoria** que deseja ver meus **comandos**.\n\nEu **possuo** no momento **${this.client.commands.size} comandos** para seu uso.\nCaso tenha **duvida** sobre algum, utilize **${server.prefix}help <comando>**.`);

    row.setComponents(menu);

    const msg = await message.reply({
      embeds: [EMBED],
      components: [row],
    });

    const filter = (interaction) => {
      return interaction.isSelectMenu() && interaction.message.id === msg.id;
    };

    const collector = message.channel.createMessageComponentCollector({
      time: 180000,
      filter: filter,
    });

    collector.on("collect", async (r) => {
      if (r.user.id !== message.author.id) {
        return r.reply({
          content: `${e.Error} › **Desculpe**, você precisa **utilizar** o comando para **isto**.`,
          ephemeral: true,
        });
      }

      const menuOptionData = menuOptions.find((v) => v.value === r.values[0]);

      EMBED.setDescription(
        `${e.Config} › Categoria: **${menuOptionData.value}**`
      );
      EMBED.fields = [];
      EMBED.addField(`${e.Command} | Comandos:`, `> ${menuOptionData.commandList}`,
      );

      await msg.edit({ embeds: [EMBED] }, true);
      await r.deferUpdate();
    });

    collector.on("end", async (r, reason) => {
      if (reason != "time") return;
      msg.delete();
    });
  }
};
