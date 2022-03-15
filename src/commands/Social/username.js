const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");

module.exports = class Username extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "username";
    this.category = "Social";
    this.description = "Altere o nome de usuário de seu perfil.";
    this.aliases = ["name", "un"];
  }

  async execute({ message, args }) {
    
    const regex = new RegExp('^[A-Za-z0-9_-]*$')
    if(!regex.test(`${args[0]}`)) return message.reply(`${e.InsertError} › Seu **nome de usuário** só pode conter **letras**, **números** e **acentos**.`)
    const name = args[0]
    if(!name) return message.reply(`${e.InsertError} › Você **precisa** inserir o **nome** que deseja **definir**.`)
    if(name.length > 20) return message.reply(`${e.Size} › Seu **nome de usuário** não pode ter **mais** que **20 caracteres**.`)

    await this.client.userDB.findOneAndUpdate(
        { _id: message.author.id },
        { $set: { "social.name": name } }
      );

    return message.reply(`${e.Success} › Seu **nome de usuário** foi alterado com **sucesso** para: **${args[0]}**`)

  }
};
