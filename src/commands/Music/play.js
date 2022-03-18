const Embed = require("../../structures/Embed");
const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");

module.exports = class Play extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "play";
    this.category = "Music";
    this.description = "Peça uma música para eu tocar.";
    this.aliases = ["p"];
  }

  async execute({ message, args }) {
    if (this.client.music.players.get(message.guild.id)) {
      if (
        message.member.voice.channel.id !== message.guild.me.voice.channel?.id
      ) {
        return message.reply(
          `${e.Error} › Você **precisa** estar no **mesmo** canal de voz que **eu**.`
        );
      }
    }

    if (!message.member.voice.channel?.id) {
      return message.reply(
        `${e.Error} › Você **precisa** estar no **mesmo** canal de voz que **eu**.`
      );
    }

    const music = args.join(" ");

    if (!music) {
      return message.reply(
        `${e.InsertError} › Insira a **música** que deseja **escutar**.`
      );
    }

    const result = await this.client.music.search(music, message.author);

    if (result.loadType === "LOAD_FAILED") {
      return message.reply(
        `${e.Error} › Ocorreu um **erro** ao reproduzir esta **música**.`
      );
    }
    if (result.loadType === "NO_MATCHES") {
      return message.reply(
        `${e.Error} › **Desculpe**, não **encontrei** nenhum **resultado** para a música **solicitada**.`
      );
    }

    const player = this.client.music.createPlayer({
      guildId: message.guild.id,
      voiceChannelId: message.member.voice.channel.id,
      textChannelId: message.channel.id,
      selfDeaf: true,
    });

    player.connect();

    if (result.loadType === "PLAYLIST_LOADED") {
      for (const track of result.tracks) {
        player.queue.push(track);
        track.setRequester(message.author);
      }

      if (!player.playing) player.play();

      let embed = new Embed(message.author)
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL(),
        })
        .setDescription(
          `${e.Playlist} › **Playlist** carregada.\n\n> ${e.Music} | Nome: **${
            result.playlistInfo.name
          }**\n> ${e.Size} | Duração: **${formatTime(
            convertMilliseconds(result.playlistInfo?.duration),
            "hh:mm:ss"
          )}**\n> ${e.Musics} | Músicas: **${result.tracks.length}**`
        );

      const regex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

      regex.test(args[0]) && embed.setURL(args[0]);

      message.channel.send({ embeds: [embed] });
    } else {
      player.queue.push(track);
      if (!player.playing) {
        player.play();
      } else {
        message.reply(
          `${e.Music} › A música **${msc.title}** foi adicionada a **lista de reprodução**.\n> ${e.User} | **Solicitada** por: ${message.author}`
        );
      }
    }
  }
};

function convertMilliseconds(ms) {
  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);

  return {
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}

function formatTime(time, format, twoDigits = true) {
  const formats = {
    dd: "days",
    hh: "hours",
    mm: "minutes",
    ss: "seconds",
  };

  return format.replace(/dd|hh|mm|ss/g, (match) =>
    time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0")
  );
}
