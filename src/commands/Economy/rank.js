const Command = require("../../structures/Command");
const {
  MessageAttachment,
} = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });
const e = require("../../utils/Emojis");
const Embed = require('../../structures/Embed')

module.exports = class Rank extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rank";
    this.category = "Economy";
    this.description = "Veja os usuários com mais dinheiro no Bot.";
    this.aliases = ["rankcoins", "rc"];
  }

  async execute({ message, args }) {
    const COINS = await require("mongoose")
      .connection.collection("users")
      .find({ coins: { $gt: 0 } })
      .sort({ coins: -1 })
      .toArray();

    const coins = Object.entries(COINS)
      .map(([, x]) => x._id)
      .sort((x, f) => x.coins - f.coins);

    const members = [];

    await this.PUSH(coins, members);

    const coinsMap = members
      .map((x) => x)
      .sort((x, f) => f.coins - x.coins)
      .slice(0, 5);

      const db1 = await this.client.userDB.findOne({_id: coinsMap[0].user.id}),
      db2 = await this.client.userDB.findOne({_id: coinsMap[1].user.id}),
      db3 = await this.client.userDB.findOne({_id: coinsMap[2].user.id}),
      db4 = await this.client.userDB.findOne({_id: coinsMap[3].user.id}),
      db5 = await this.client.userDB.findOne({_id: coinsMap[4].user.id})

      const canvas = createCanvas(1100, 1600);
      const ctx = canvas.getContext("2d");
      const avatar = await loadImage(
        coinsMap[0].user.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar, 120, 136, 260, 260);
      const avatar2 = await loadImage(
        coinsMap[1].user.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar2, 120, 427, 260, 260);
      const avatar3 = await loadImage(
        coinsMap[2].user.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar3, 120, 724, 260, 260);
      const avatar4 = await loadImage(
        coinsMap[3].user.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar4, 120, 1024, 260, 260);
      const avatar5 = await loadImage(
        coinsMap[4].user.displayAvatarURL({ format: "jpeg", size: 2048 })
      );
      ctx.drawImage(avatar5, 120, 1322, 260, 260);

      const background = await loadImage(
        "./src/assets/img/png/Rank_Card.png"
      );
      ctx.drawImage(background, 0, 0, 1100, 1600);

      ctx.textAlign = "left";
      ctx.font = '70px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      await this.client.renderEmoji(ctx, coinsMap[0].user.username.length >= 13 ? coinsMap[0].user.username.slice(0, 13) + ("...") : coinsMap[0].user.username, 420, 219);
      const w1 = ctx.measureText(coinsMap[0].user.username.length >= 13 ? coinsMap[0].user.username.slice(0, 13) + ("...") : coinsMap[0].user.username).width;

      ctx.font = '40px "Regular"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`#${coinsMap[0].user.discriminator}`, 420 + w1, 219);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Gems: `, 420, 293);
      const s = ctx.measureText("Gems: ").width;

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${db1.coins}`, 420 + s, 293);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Rank: `, 420, 367);
      const x = ctx.measureText("Rank: ").width;

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`1`, 420 + x, 367);

      ctx.textAlign = "left";
      ctx.font = '70px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      await this.client.renderEmoji(ctx, coinsMap[1].user.username.length >= 13 ? coinsMap[1].user.username.slice(0, 13) + ("...") : coinsMap[1].user.username, 420, 509);
      const w2 = ctx.measureText(coinsMap[1].user.username.length >= 13 ? coinsMap[1].user.username.slice(0, 13) + ("...") : coinsMap[1].user.username).width;

      ctx.font = '40px "Regular"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`#${coinsMap[1].user.discriminator}`, 420 + w2, 509);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Gems: `, 420, 583);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${db2.coins}`, 420 + s, 583);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Rank: `, 420, 657);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`2`, 420 + x, 657);

      ctx.textAlign = "left";
      ctx.font = '70px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      await this.client.renderEmoji(ctx, coinsMap[2].user.username.length >= 13 ? coinsMap[2].user.username.slice(0, 13) + ("...") : coinsMap[2].user.username, 420, 802);
      const w3 = ctx.measureText(coinsMap[2].user.username.length >= 13 ? coinsMap[2].user.username.slice(0, 13) + ("...") : coinsMap[2].user.username).width;

      ctx.font = '40px "Regular"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`#${coinsMap[2].user.discriminator}`, 420 + w3, 802);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Gems: `, 420, 876);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${db3.coins}`, 420 + s, 876);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Rank: `, 420, 950);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`3`, 420 + x, 950);

      ctx.textAlign = "left";
      ctx.font = '70px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      await this.client.renderEmoji(ctx, coinsMap[3].user.username.length >= 13 ? coinsMap[3].user.username.slice(0, 13) + ("...") : coinsMap[3].user.username, 420, 1102);
      const w4 = ctx.measureText(coinsMap[3].user.username.length >= 13 ? coinsMap[3].user.username.slice(0, 13) + ("...") : coinsMap[3].user.username).width;

      ctx.font = '40px "Regular"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`#${coinsMap[3].user.discriminator}`, 420 + w4, 1102);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Gems: `, 420, 1176);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${db4.coins}`, 420 + s, 1176);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Rank: `, 420, 1250);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`4`, 420 + x, 1250);

      ctx.textAlign = "left";
      ctx.font = '70px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      await this.client.renderEmoji(ctx, coinsMap[4].user.username.length >= 13 ? coinsMap[4].user.username.slice(0, 13) + ("...") : coinsMap[4].user.username, 420, 1392);
      const w5 = ctx.measureText(coinsMap[4].user.username.length >= 13 ? coinsMap[4].user.username.slice(0, 13) + ("...") : coinsMap[4].user.username).width;

      ctx.font = '40px "Regular"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`#${coinsMap[4].user.discriminator}`, 420 + w5, 1392);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Gems: `, 420, 1466);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`${db5.coins}`, 420 + s, 1466);

      ctx.font = '50px "Medium"';
      ctx.fillStyle = "#C2C2C2";
      ctx.textAlign = "left";
      ctx.fillText(`Rank: `, 420, 1540);

      ctx.font = '60px "Bold"';
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "left";
      ctx.fillText(`5`, 420 + x, 1540);


      const attach = new MessageAttachment(canvas.toBuffer(), "Rank.png");

      await message.reply({ files: [attach] });

    const TOP = new Embed(message.author)
      .setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
      .setThumbnail(message.author.avatarURL({size: 2048}))
      .setDescription(
        `${e.Bank} › Rank de **Coins**\n\n${coinsMap
          .map(
            (x, f) =>
              `> ${e.User} | **${f + 1}º** - **${x.user.tag}**\n> ${
                e.Money
              } | Gems: **${x.coins.toLocaleString()}**`
          )
          .join("\n")}`
      );
    //message.reply({ embeds: [TOP] });
  }

  async PUSH(coins, members) {
    for (const member of coins) {
      const doc = await this.client.userDB.findOne({ _id: member });

      members.push({
        user: await this.client.users.fetch(member).then((user) => {
          return user;
        }),
        coins: doc.coins,
      });
    }
  }
};
