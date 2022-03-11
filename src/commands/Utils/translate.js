const Command = require("../../structures/Command");
const e = require("../../utils/Emojis");
const translate = require("@iamtraction/google-translate");

module.exports = class Translate extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "translate";
    this.category = "Utils";
    this.description = "Traduza a frase inserida.";
    this.aliases = ["traduzir"];
  }

  async execute({ message, args }) {

    if(!args[0]) return message.reply(`${e.InsertError} › Insira a **linguagem** para qual deseja **traduzir**.`)
    const text = args.slice(1).join(" ");

    if (!text)
      return message.reply(
        `${e.InsertError} › Insira a **frase** que deseja **traduzir**.`
      );

    try {
      const trad = await translate(text, {
        to: args[0],
      });

      message.reply(
        `${e.Translate} › **Tradução**:\n> ${trad.text ? trad.text : ""}`
      );
    } catch (err) {
      console.log(err);
      if (err)
        if (
          err.message.startsWith("The language") &&
          err.message.endsWith("is not supported.")
        )
          return message.reply(
            `${e.Error} › **Desculpe**, eu **não** possuo esta **linguagem.**`
          );
    }

  }
};
