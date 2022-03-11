const Command = require("../../structures/Command");
const Embed = require('../../structures/Embed')
const e = require('../../utils/Emojis')
const path = require("path");

module.exports = class Reload extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "reload";
    this.category = "Developing";
    this.description = "Reinicie os comandos.";
    this.aliases = ["rl"];

    this.staffOnly = true;
  }

  async execute({ message, args }) {

    if (!args[0])
    return message.reply(
      `${e.InsertError} › Você **precisa** inserir o **comando** que deseja **reiniciar**.`
    );

  const cmd =
    this.client.commands.get(args[0].toLowerCase()) ||
    this.client.commands.get(this.client.aliases.get(args[0].toLowerCase()));

  if (!cmd)
    return message.reply(`${e.FindError} › **Desculpe**, não **encontrei** o comando **${args[0]}**.`);

  const cmdFile = path.parse(`../../commands/${cmd.category}/${cmd.name}.js`);

  if (!cmdFile.ext || cmdFile.ext !== ".js")
    return message.reply(
      `${e.InsertError} › Você **precisa** inserir o **comando**.`
    );

  const reload = async (commandPath, commandName) => {
    const props = new (require(`${commandPath}/${commandName}`))(this.client);
    delete require.cache[require.resolve(`${commandPath}/${commandName}`)];

    this.client.commands.set(props.name, props);
  };

  const response = reload(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`).catch(
    (error) => {
      if (error)
        return message.reply(
          `${e.Error} › Erro: **${error.name}** ( \`${error.message}\` )`
        );
    }
  );

  if (response)
    return message.reply(
      `${e.Success} › O comando **${cmd.name}** foi recarregado com sucesso.`
    );
  }

};
