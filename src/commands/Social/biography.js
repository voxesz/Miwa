const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");

module.exports = class Biography extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "biography";
    this.category = "Social";
    this.description = "Altere a biografia do seu perfil.";
    this.aliases = ["biografia", "bio"];
  }

  async execute({ message, args }) {
    
    const bio = args.slice(0).join(" ")
    if(!bio) return message.reply(`${e.InsertError} › Você **precisa** inserir a **biografia** que deseja **definir**.`)
    if(bio.length > 200) return message.reply(`${e.Size} › Sua **biografia** não pode ter **mais** que **200 caracteres**.`)

    await this.client.userDB.findOneAndUpdate(
        { _id: message.author.id },
        { $set: { "social.bio": bio } }
      );

    return message.reply(`${e.Success} › Sua **biografia** foi alterado com **sucesso**. \n\`\`\`ini\nResultado: "${bio}"\`\`\``)

  }
};
