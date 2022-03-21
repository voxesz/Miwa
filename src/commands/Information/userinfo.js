const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
const { getColorFromURL } = require("color-thief-node");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });
const moment = require('moment')

module.exports = class Userinfo extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = "userinfo";
        this.category = "Information";
        this.description = "Veja as informações do usuário inserido.";
        this.aliases = ["ui"];

        this.staffOnly = true;
    }

    async execute({ message, args }) {

        message.channel.sendTyping()

        let USER = await this.client.getUser(args[0], message);
        if (!USER) USER = message.author;

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        const avatar = await loadImage(
            USER.displayAvatarURL({ format: "jpeg", size: 2048 })
        );
        ctx.drawImage(avatar, 383, 53, 250, 250);

        const background = await loadImage("./src/assets/img/png/Userinfo.png");
        ctx.drawImage(background, 0, 0, 1000, 600);

        const name = USER.username;
        const discrim = USER.discriminator;

        ctx.textAlign = 'center';
        ctx.font = '40px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        await this.client.renderEmoji(ctx, name, 500, 337)
        const text = ctx.measureText(name).width;

        ctx.textAlign = 'center';
        ctx.font = '23px "Regular"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(`#${discrim}`, 500, 337)

        ctx.textAlign = "left";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`ID:`, 89, 416)
        const iPos = ctx.measureText(`ID:`).width

        ctx.textAlign = "left";
        ctx.font = '20px "Bold"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(USER.id, 89 + 5 + iPos, 416)

        ctx.textAlign = "left";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Criação:`, 89, 456)
        const cPos = ctx.measureText(`Criação:`).width

        ctx.textAlign = "left";
        ctx.font = '20px "Bold"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(moment(
            this.client.users.cache.get(USER.id).createdAt
          ).format("L"), 89 + 5 + cPos, 456)

        const attach = new MessageAttachment(canvas.toBuffer(), "UserInfo.png");
        await message.reply({ files: [attach] });
    }
};
