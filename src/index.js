const Discord = require("discord.js");
const RPS = require("./games/Games/rps");
const GamecordEmbed = require("../src/games/OptionManager/Embed");
const GamecordPayload = require("../src/games/OptionManager/Payload")

module.exports = {
    RPS,
    GamecordEmbed,
    GamecordPayload
};