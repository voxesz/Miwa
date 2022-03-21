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

        ctx.textAlign = "left";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`ID:`, 89, 416)
        const iPos = ctx.measureText(`ID:`).width

        ctx.textAlign = "left";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(USER.id, 89 + 5 + iPos, 416)

        ctx.textAlign = "left";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Criação:`, 89, 456)
        const cPos = ctx.measureText(`Criação:`).width

        ctx.textAlign = "left";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(moment(
            this.client.users.cache.get(USER.id).createdAt
          ).format("L"), 89 + 5 + cPos, 456)

        ctx.textAlign = "left";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Discriminator:`, 89, 496)
        const tPos = ctx.measureText(`Discriminator:`).width

        ctx.textAlign = "left";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(`#${USER.discriminator}`, 89 + 5 + tPos, 496)

        let userI;
        try {
            userI = await message.guild.members.fetch(USER.id)
        }
        catch {}
        
        if(userI) {

        let boosted = "Sem booster."
        if (userI.premiumSinceTimestamp != null) boosted = moment(
            userI.premiumSinceTimestamp
          ).format("L")

        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(userI.nickname == null ? "Sem apelido." : userI.nickname, 908, 416)
        const nPos = ctx.measureText(userI.nickname).width

        ctx.textAlign = "right";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Apelido:`, 908 - 5 - nPos, 416)

        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(moment(
            this.client.users.cache.get(USER.id).joinedAt
          ).format("L"), 908, 456)
        const jPos = ctx.measureText(moment(
            this.client.users.cache.get(USER.id).joinedAt
          ).format("L")).width

        ctx.textAlign = "right";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Entrada:`, 908 - 5 - jPos, 456)

        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText(boosted, 908, 496)
        const bPos = ctx.measureText(boosted).width

        ctx.textAlign = "right";
        ctx.font = '23px "Bold"';
        ctx.fillStyle = "#EAF0FF";
        ctx.fillText(`Booster:`, 908 - 5 - bPos, 496)

    } else {
        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText("Este membro", 908, 416)

        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText("Não faz parte", 908, 456)

        ctx.textAlign = "right";
        ctx.font = '20px "Medium"';
        ctx.fillStyle = "#899AC6";
        ctx.fillText("De sua guilda", 908, 496)
    }

        const attach = new MessageAttachment(canvas.toBuffer(), "UserInfo.png");
        await message.reply({ files: [attach] });
    }
};
