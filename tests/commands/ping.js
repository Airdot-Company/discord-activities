const { SlashCommandBuilder, SlashCommandUserOption, ChatInputCommandInteraction } = require("discord.js");
const { MultiplayerRockPaperScissors } = require("../../dist/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get the bot's ping."),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {*} client 
     */
    execute: function (interaction, client) {
        const Now = Date.now()
        interaction.reply({
            ephemeral: true,
            content: `That took ${(interaction.createdTimestamp - Date.now()).toString().replace("-", "")}ms and the websocket heartbeat is ${client.ws.ping}ms`
        })
    }
}