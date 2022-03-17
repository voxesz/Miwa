const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });
const { getColorFromURL } = require('color-thief-node');

module.exports = class Userinfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "userinfo";
    this.category = "Social";
    this.description = "Veja as informações do usuário inserido.";
    this.aliases = ["ui"];
  }

  async execute({ message, args }) {

    message.channel.sendTyping()

    let USER = await this.client.getUser(args[0], message);
    if (!USER) USER = message.author;

    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext("2d");

    const avatar = USER.displayAvatarURL()
    const color = await getColorFromURL(avatar)
    ctx.fillStyle = 'rgb(' + color.join(', ') + ')';
    ctx.fillRect(0, 0, 1000, 600)

    const attach = new MessageAttachment(canvas.toBuffer(), "UserInfo.png");

    await message.reply({ files: [attach] });
  }
};
