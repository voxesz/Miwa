const Command = require("../../../structures/Command");
const e = require("../../../utils/Emojis");

module.exports = class Buy extends Command {
    constructor(client) {
        super(client);
        this.client = client;

        this.name = "buy";
        this.category = "Social";
        this.description = "Faça a compra de backgrounds.";
        this.aliases = ["comprar", "adquirir"];
        this.reference = "Background";

        this.staffOnly = true;
        this.isSub = true
    }

    async execute({ message, args }) {

        message.reply("sexo")

    }
};