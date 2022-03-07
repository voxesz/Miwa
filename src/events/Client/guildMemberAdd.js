const {
  MessageButton,
  MessageActionRow,
  Guild,
  MessageAttachment,
} = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });
const e = require("../../utils/Emojis");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async execute(member = Guild) {
    const server = await this.client.guildDB.findOne({
      guildID: member.guild.id,
    });

    if (server.welcome.status == true) {
      if (server.welcome.channel == "null") return;
      const channel = this.client.channels.cache.get(
        `${server.welcome.channel}`
      );

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("configured")
          .setLabel(
            `Mensagem configurada pela Equipe do(a) ${member.guild.name}`
          )
          .setStyle("SECONDARY")
          .setEmoji(e.Lock)
          .setDisabled(true)
      );

      if (server.welcome.type == "msg") {
        const mensagem = server.welcome.message
          .replace("[user]", `<@${member.id}>`)
          .replace("[name]", `${member.user.username}`)
          .replace("[tag]", `${member.user.tag}`)
          .replace("[members]", member.guild.memberCount)
          .replace("[guild]", member.guild.name);

        await channel.send({
          content: mensagem,
          components: [row],
        });
      }
      if (server.welcome.type == "img") {

		const msg = server.welcome.message
		.replace('[name]', `${member.user.username}`)
		.replace('[tag]', `${member.user.tag}`)
		.replace('[members]', member.guild.memberCount)
		.replace('[guild]', member.guild.name)

        const canvas = createCanvas(700, 400);
        const ctx = canvas.getContext("2d");
        const avatar = await loadImage(
          member.user.displayAvatarURL({ format: "jpeg", size: 2048 })
        );
        ctx.drawImage(avatar, 34, 86, 230, 230);

        const background = await loadImage(
          "./src/assets/img/png/Welcome_Card.png"
        );
        ctx.drawImage(background, 0, 0, 700, 400);

        ctx.font = '34px "Bold"';
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText(member.guild.name, 350, 50);

        ctx.textAlign = "left";
        ctx.font = '40px "Bold"';
        ctx.fillStyle = "#FFFFFF";
        await this.client.renderEmoji(ctx, member.user.username.length >= 10 ? member.user.username.slice(0, 10) + ("...") : message.user.username, 301, 183);
        const w = ctx.measureText(member.user.username.length >= 10 ? member.user.username.slice(0, 10) + ("...") : message.user.username).width;

        ctx.font = '24px "Regular"';
        ctx.fillStyle = "#9E9E9E";
        ctx.textAlign = "left";
        ctx.fillText(`#${member.user.discriminator}`, 301 + w, 183);

        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.fillText(await this.client.applyLineBreaks(msg, 26), 301, 213);

        ctx.font = '20px "Regular"';
        ctx.fillStyle = "#9E9E9E";
        ctx.textAlign = "left";
        ctx.fillText(member.user.id, 33, 360);

        const attach = new MessageAttachment(canvas.toBuffer(), "Welcome.png");

        await channel.send({ files: [attach], components: [row] });
      }

      if (server.autorole.status == true) {
        if (server.autorole.roles.length == 0) return;
        member.roles.add(server.autorole.roles);
      }
    }
  }
};
