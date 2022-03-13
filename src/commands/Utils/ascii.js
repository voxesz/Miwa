const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const figlet = require("figlet");

module.exports = class Ascii extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ascii";
    this.category = "Utils";
    this.description = "Transforme uma palavra em código ascii.";
    this.aliases = [];
  }

  async execute({ message, args }) {

    let txt = args.slice(0).join(" ");
    if(!txt) return message.reply(`${e.InsertError} › Você precisa **inserir** o texto.`)
    if(txt.length > 20) return message.reply(`${e.Size} › Você só pode escrever **20 caracteres**.`)
    figlet.text(txt, (err, result) => {
        message.reply(`\`\`\`\n${result}\`\`\``);
      });

  }
};
