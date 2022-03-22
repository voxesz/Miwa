const { Client, Collection, WebhookClient } = require("discord.js");
const { promisify } = require("util");
const klaw = require("klaw");
const path = require("path");

const guildDB = require("../models/guildDB");
const userDB = require("../models/userDB");
const clientDB = require("../models/clientDB");

const readdir = promisify(require("fs").readdir);

module.exports = class MiwaClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();
    this.subCommands = new Collection()
    this.guildDB = guildDB;
    this.userDB = userDB;
    this.clientDB = clientDB;

    this.getUser = this.findUser;
    this.sendLogs = this.commandLogs;

    this.developers = ["689265428769669155"];
    this.maintenance = []
  }

  load(commandPath, commandName) {
    const props = new (require(`${commandPath}/${commandName}`))(this);
    if(props.isSub) {
      if(!this.subCommands.get(props.reference)) {
        this.subCommands.set(props.reference, new Collection())
      }
      this.subCommands.get(props.reference).set(props.name, props)
    }
    if (props.isSub) return;
    props.location = commandPath;

    if (props.init) {
      props.init(this);
    }

    this.commands.set(props.name, props);
    props.aliases.forEach((aliases) => {
      this.aliases.set(aliases, props.name);
    });
    return false;
  }

  async onLoad(client) {
    klaw("src/commands").on("data", (item) => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = client.load(
        cmdFile.dir,
        `${cmdFile.name}${cmdFile.ext}`
      );
      if (response) return;
    });

    const eventFiles = await readdir("./src/events/Client");
    eventFiles.forEach((file) => {
      const eventName = file.split(".")[0];
      const event = new (require(`../events/Client/${file}`))(client);
      client.on(eventName, (...args) => event.execute(...args));
      delete require.cache[require.resolve(`../events/Client/${file}`)];
    });
    
    const musicFiles = await readdir('./src/events/Music');
		musicFiles.forEach((file) => {
			const eventName = file.split('.')[0];
			const event = new (require(`../events/Music/${file}`))(client);
			client.music.on(eventName, (...args) => event.execute(...args));
			delete require.cache[require.resolve(`../events/Music/${file}`)];
		});
  }

  async applyLineBreaks(string, maxCharLengthPerLine) {
    const split = string.split(" ");
    const chunks = [];

    for (var i = 0, j = 0; i < split.length; i++) {
      if ((chunks[j] + split[i]).length > maxCharLengthPerLine) j++;

      chunks[j] = (chunks[j] || "") + split[i] + " ";
    }

    return chunks.map((c) => c.trim()).join("\n");
  }

  async convertMilliseconds(ms) {
    const seconds = ~~(ms / 1000);
    const minutes = ~~(seconds / 60);
    const hours = ~~(minutes / 60);
    const days = ~~(hours / 24);
  
    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    };
  }

  async convertAbbrev(num) {
    const number = parseFloat(num.substr(0, num.length - 1));
    const unit = num.substr(-1);
    const zeros = {
      k: 1e3,
      M: 1e6,
      G: 1e9,
      T: 1e12,
    };

    return !zeros[unit] ? parseFloat(num) : number * zeros[unit];
  }

  async renderEmoji(ctx, message, x, y) {
    const emoji = require("node-canvas-with-twemoji-and-discord-emoji");
    return await emoji.fillTextWithTwemoji(ctx, message, x, y);
  }

  async findUser(args, message) {
    if (!args || !message) return;

    let user;

    if (/<@!?\d{17,18}>/.test(args)) {
      user = await message.client.users.fetch(args.match(/\d{17,18}/)?.[0]);
    } else {
      try {
        user = await message.guild.members
          .search({ query: args })
          .then((x) => x.first().user);
      } catch {}
      try {
        user = await message.client.users.fetch(args).catch(null);
      } catch {}
    }
    if (user) return user;
  }

  async commandLogs(content) {
    const webhookClient = new WebhookClient({
      token: String(process.env.LOGS_TOKEN),
      id: process.env.LOGS_ID,
    });
    webhookClient.send({
      embeds: [content],
    });
  }
};
