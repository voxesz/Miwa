const Command = require("../../structures/Command");
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')

module.exports = class Verify extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "verify";
    this.category = "Developing";
    this.description = "Verifique o perfil de um usuário.";
    this.aliases = ["verificar"];

    this.staffOnly = true;
  }

  async execute({ message, args }) {

    let user = await this.client.getUser(args[0], message)
    if(!user) return message.reply(`${e.InsertError} › Insira o **usuário** que deseja **verificar**.`)

    const userDBData = await this.client.userDB.findOne({_id: user.id})

    if(userDBData.social.verified == false) {

    await this.client.userDB.findOneAndUpdate(
        { _id: user.id },
        { $set: { "social.verified": true } }
      );

        return message.reply(`${e.Success} › O usuário **${userDBData.social.name == null ? user.username : userDBData.social.name}** agora possui o perfil **verificado**!`)

    } else {

        await this.client.userDB.findOneAndUpdate(
            { _id: user.id },
            { $set: { "social.verified": false } }
          );
    
            return message.reply(`${e.Success} › O usuário **${userDBData.social.name == null ? user.username : userDBData.social.name}** não possui mais o perfil **verificado**!`)

    }
  }

};
