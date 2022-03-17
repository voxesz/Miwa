const e = require('../../utils/Emojis');
const Embed = require('../../structures/Embed')

module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async execute(player, track) {
		if (player.reconnect) {
			delete player.reconnect;
			return;

		}
		if (!player.textChannelId) return;

		const channel = this.client.channels.cache.get(player.textChannelId);

		if (player.lastPlayingMsgID) {
			const msg = channel.messages.cache.get(player.lastPlayingMsgID);

			if (msg) msg.delete();
		}

		if (player.trackRepeat === true) {
			return;
		}

		const plataform = track.source;
		let emoji = e.Youtube;
		if (plataform == "spotify") emoji = e.Spotify;
		if (plataform == "deezer") emoji = e.Deezer;
		if (plataform == "apple-music") emoji = e.Apple;
		const music = new Embed(track.requester)
			.setAuthor({
				name: this.client.user.username,
				iconURL: this.client.user.avatarURL(),
			})
			.setDescription(
				`${e.MusicBox} › Começando a **Música**.\n\n> ${e.Music
				} | Música: **${track.title}**\n> ${e.User} | Autor: **${track.author
				}**\n> ${emoji} | Plataforma: **${plataform.charAt(0).toUpperCase() +
				plataform.slice(1).replace("-", " ")
				}**`
			);

		channel.send({ embeds: [music] });

	}
};