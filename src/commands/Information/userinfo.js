const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Bold.ttf", { family: "Bold" });
registerFont("src/assets/fonts/Montserrat-Medium.ttf", { family: "Medium" });
registerFont("src/assets/fonts/Montserrat-Regular.ttf", { family: "Regular" });

module.exports = class Userinfo extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = "userinfo";
        this.category = "Information";
        this.description = "Veja as informações do usuário inserido.";
        this.aliases = ["ui"];
    }

    async execute({ message, args }) {

        message.channel.sendTyping()

        let USER = await this.client.getUser(args[0], message);
        if (!USER) USER = message.author;

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = '#1f2430';
        ctx.fillRect(0, 0, 1000, 600)

        ctx.arc(200, 190, 130, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.save();
        ctx.clip();

        const avatar = await loadImage(
            USER.displayAvatarURL({ format: "jpeg", size: 2048 })
        );
        ctx.drawImage(avatar, 70, 60, 260, 260);
        ctx.restore()

        ctx.font = '50px "Bold"';
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        await this.client.renderEmoji(ctx, USER.username, 360, 180);
        const w = ctx.measureText(USER.username).width;

        ctx.font = '30px "Regular"';
        ctx.fillStyle = "#B0B0B0";
        ctx.textAlign = "left";
        ctx.fillText(`#${USER.discriminator}`, 360 + w, 180);

        let list = [];
        const flags = USER.flags === null ? "" : USER.flags.toArray()
        list.push(flags)

        if (USER.id === process.env.OWNER_ID) list.push("OWNER");

        list = list
            .join(",")
            .replace("EARLY_VERIFIED_BOT_DEVELOPER", e.Verified_Developer)
            .replace("HOUSE_BRAVERY", e.Bravery)
            .replace("HOUSE_BRILLIANCE", e.Brilliance)
            .replace("HOUSE_BALANCE", e.Balance)
            .replace("VERIFIED_BOT", e.Verified_Bot)
            .replace("OWNER", e.Owner)

        ctx.font = `40px "Regular"`;

        await this.client.renderEmoji(ctx, list.split(",").join(" "), 360, 230);


        const attach = new MessageAttachment(canvas.toBuffer(), "UserInfo.png");

        await message.reply({ files: [attach] });
    }
};
