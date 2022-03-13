const Command = require("../../structures/Command");
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')

module.exports = class Teste extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "teste";
    this.category = "Developing";
    this.description = "Comando destinado a testes.";
    this.aliases = ["test"];

    this.staffOnly = true;
  }

  async execute({ message, args }) {

    const name = args.slice(0).join(" ");
    
    await this.client.userDB.findOneAndUpdate({_id: message.author.id}, {$set: {"social.bio": name}})
    return message.reply("blz mano, bio trocou")

  }

};
