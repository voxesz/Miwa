const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");

module.exports = class Characters extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "characters";
    this.category = "Utils";
    this.description = "Veja quantos caracteres tem no texto inserido.";
    this.aliases = ["ch"];
  }

  async execute({ message, args }) {

    let txt = args.slice(0).join(" ");
    if(!txt) return message.reply(`${e.InsertError} › Você precisa **inserir** o texto que deseja **contar**.`)
    let size = txt.length
    if(txt.startsWith("<:") && txt.endsWith(">") || txt.startsWith("<@") && txt.endsWith(">")) size = 1
    return message.reply(`${e.Size} › O seu **texto** possui **${size} ${size > 1 ? "caracteres" : "caractere"}**!`)

  }
};
