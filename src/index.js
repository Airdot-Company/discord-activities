const Discord = require("discord.js");
const SinglePlayerRPS = require("./games/Games/rps");
const MultiplayerRPS = require("./games/Multiplayer/rps");
const GamecordEmbed = require("../src/games/OptionManager/Embed");
const GamecordPayload = require("../src/games/OptionManager/Payload")

module.exports = {
    SinglePlayerRPS,
    MultiplayerRPS,
    GamecordEmbed,
    GamecordPayload
};