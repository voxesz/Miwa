const { Schema, model } = require("mongoose");

let guildDB = new Schema({
  guildID: { type: String },
  prefix: { type: String, default: "-" }, 
  punish: {
    channel: { type: String, default: "null" },
    message: { type: String, default: "null" },
    members: { type: Array, default: [] },
    bans: { type: Number, default: 0 }
  },
  cmd: {
    channels: { type: Array, default: [] },
    cmds: { type: Array, default: [] },
    message: { type: String, default: "null" },
    status: { type: Boolean, default: false },
  },
  welcome: {
    channel: { type: String, default: "null" },
    message: { type: String, default: "null" },
    status: { type: Boolean, default: false },
    type: { type: String, default: "msg" },
  },
  captcha: {
    channel: { type: String, default: "null" },
    message: { type: String, default: "null" },
    status: { type: Boolean, default: false },
    role: { type: String, default: "null" }
  },
  autorole: {
    roles: { type: Array, default: [] },
    status: { type: Boolean, default: false },
  },
});

let Guild = model("Guild", guildDB);
module.exports = Guild;
