const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const {
  MessageAttachment,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });
const Embed = require('../../structures/Embed')
const users = new Set();

module.exports = class Profile extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "profile";
    this.category = "Social";
    this.description = "Veja o perfil do usuário inserido.";
    this.aliases = ["perfil"];
  }

  async execute({ message, args }) {
    let USER = await this.client.getUser(args[0], message);
    if (!USER) USER = message.author;

    const userDBData = await this.client.userDB.findOne({ _id: USER.id });
    if (!userDBData) return message.reply(`${e.Error} › **Desculpe**, você parece **novo** pra mim, poderia **executar** o comando **novamente**?`)

    const row = new MessageActionRow();

    const follow = new MessageButton()
      .setCustomId("follow")
      .setLabel("Seguir")
      .setStyle("SECONDARY")
      .setEmoji(e.Follow)

    const following = new MessageButton()
      .setCustomId("following")
      .setLabel("Amigos")
      .setStyle("SECONDARY")
      .setEmoji(e.Friends)

    const followers = new MessageButton()
      .setCustomId("followers")
      .setLabel("Seguidores")
      .setStyle("SECONDARY")
      .setEmoji(e.Like)

    row.setComponents([follow, followers]);

    if (USER.id == message.author.id) follow.setDisabled(true);
    if (userDBData.social.followers.some((x) => x == message.author.id))
      row.setComponents([following, followers]);

    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");
    const background = await loadImage("./src/assets/img/jpeg/Background.jpeg");
    ctx.drawImage(background, 0, 0, 1000, 600);

    const userBG = await loadImage("./src/assets/img/jpeg/Testes.jpg");
    ctx.drawImage(userBG, 0, 0, 2560, 1600);

    const main = await loadImage("./src/assets/img/png/Profile_Card.png");
    ctx.drawImage(main, 0, 0, 1000, 600);

    ctx.textAlign = "center";
    ctx.font = '40px "Bold"';
    ctx.fillStyle = "#FFFFFF";
    await this.client.renderEmoji(
      ctx,
      userDBData.social.name == null ? USER.username : userDBData.social.name,
      500,
      415
    );

    ctx.textAlign = "center";
    ctx.font = '37px "Bold"';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(userDBData.social.followers.length, 271, 293);

    ctx.textAlign = "center";
    ctx.font = '37px "Bold"';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(userDBData.social.following.length, 721, 293);

    ctx.textAlign = "left";
    ctx.font = '20px "Medium"';
    ctx.fillStyle = "#CCCCCC";
    ctx.fillText(
      userDBData.social.bio == null
        ? "Este membro não possui uma biografia."
        : userDBData.social.bio,
      17,
      532
    );

    ctx.arc(500, 220, 130, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.save();
    ctx.clip();

    const avatar = await loadImage(
      USER.displayAvatarURL({ format: "jpeg", size: 2048 })
    );
    ctx.drawImage(avatar, 365, 90, 260, 260);

    ctx.restore();

    let list = [];
    if (userDBData.social.verified) list.push("VERIFICADO");
    list = list.join(",").replace("VERIFICADO", e.Verify);
    ctx.font = `50px "Bold"`;
    await this.client.renderEmoji(ctx, list.split(",").join(" "), 545, 350);

    const attach = new MessageAttachment(canvas.toBuffer(), "Profile.png");

    var msg = await message.reply({ files: [attach], components: [row] });

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
        return;
      })

      .on("collect", async (r) => {
        if (r.user.id !== message.author.id) {
          return r.deferUpdate();
        }
        switch (r.customId) {
          case "follow": {
            await r.deferUpdate();
              if (userDBData.social.followers.find((x) => x == message.author.id))
                return r.followUp({
                  content: `${e.Error} › Você **já** segue este **usuário**.`,
                  ephemeral: true
                });
              await this.client.userDB.findOneAndUpdate(
                { _id: message.author.id },
                { $push: { "social.following": USER.id } }
              );
              await this.client.userDB.findOneAndUpdate(
                { _id: USER.id },
                { $push: { "social.followers": message.author.id } }
              );
              r.followUp({
                content: `${e.Success} › **Agora** você está **seguindo** o(a) **${userDBData.social.name == null
                  ? USER.username
                  : userDBData.social.name
                }**.`, ephemeral: true
              });
              row.setComponents([following, followers]);
            await msg.edit({ components: [row] });
            break;
          }
          case "following": {
            await r.deferUpdate();
              if (!userDBData.social.followers.find((x) => x == message.author.id))
                return r.followUp({
                  content: `${e.Error} › Você **não** segue mais este **usuário**.`,
                  ephemeral: true
                });
              await this.client.userDB.findOneAndUpdate(
                { _id: message.author.id },
                { $pull: { "social.following": USER.id } }
              );
              await this.client.userDB.findOneAndUpdate(
                { _id: USER.id },
                { $pull: { "social.followers": message.author.id } }
              );
              r.followUp({
                content: `${e.Success} › Você **deixou** de seguir o(a) **${userDBData.social.name == null
                  ? USER.username
                  : userDBData.social.name
                  }**.`,
                ephemeral: true
              });
              row.setComponents([follow, followers]);
              await msg.edit({ components: [row] });
            break;
          }
          case "followers": {
            await r.deferUpdate();
            if (!users.has(message.author.id)) {
              users.add(interaction.user.id);
              if(userDBData.social.followers.length == 0) return r.followUp({content: `${e.Size} › ${USER.id == message.author.id ? "**Você** não possui **seguidores**." : "Este **usuário** não possui **seguidores**."}`, ephemeral: true})
              const LIST = new Embed(message.author)
                .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                .setDescription(`${e.Like} › **Seguidores**:\n\n${userDBData.social.followers
                  .map(
                    (x) =>
                      `> ${e.User} | User: **${this.client.users.cache.get(x).tag
                      }**`
                  )
                  .join("\n")}`)

              msg.reply({ embeds: [LIST] });
                    }
            break;
          }
        }
      });
  }
};
