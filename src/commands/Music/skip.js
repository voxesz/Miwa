const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "skip";
    this.category = "Music";
    this.description = "Pule a música que está tocando no momento.";
    this.aliases = ["pular"];
  }

  async execute({ message }) {
    const player = this.client.music.players.get(message.guild.id);

    if (!player)
      return message.reply(`${e.Error} › Eu **não** estou **tocando** música neste **servidor**.`);

    if (!message.member.voice.channel)
      return message.reply(`${e.Error} › Você **precisa** estar no **mesmo** canal de voz que **eu**.`);

    if (
      message.client.music.players.get(message.guild.id) != null &&
      message.member.voice.channel.id != message.guild.me.voice.channel.id
    )
      return message.reply(`${e.Error} › Você **precisa** estar no **mesmo** canal de voz que **eu**.`);

    if (!player.current)
      return message.reply(`${e.Error} › Eu **não** estou **tocando** música neste **servidor**.`);

    player.skip();

    message.react(e.Right)
  }
};
