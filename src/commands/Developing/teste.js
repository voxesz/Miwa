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

    const user = await this.client.userDB.findOne({_id: message.author.id})
    message.channel.send(`<t:${Math.floor(this.client.convertMilliseconds(Date.now() + user.cooldowns.work))}:R>`)

  }

};
