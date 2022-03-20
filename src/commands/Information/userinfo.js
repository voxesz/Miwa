const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
const { getColorFromURL } = require("color-thief-node");
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

        const attach = new MessageAttachment(canvas.toBuffer(), "UserInfo.png");

        await message.reply({ files: [attach] });
    }
};
