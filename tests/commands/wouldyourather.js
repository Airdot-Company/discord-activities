const { SlashCommandBuilder, SlashCommandUserOption, ChatInputCommandInteraction } = require("discord.js");
const { WouldYouRather, MultiplayerRockPaperScissors, RockPaperScissors } = require("../../dist/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("would_you_rather")
        .setDescription("Play a game of would you rather")
        .addUserOption(e => new SlashCommandUserOption()
            .setName("member")
            .setDescription("Play Rock Paper Scissors with a friend!")
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {*} client 
     */
    execute: function (interaction, client) {
        const Member = interaction.options.getMember("member");
        if (Member != null) {
            //new MultiplayerRockPaperScissors()
            //    .setMember(Member)
            //    .StartGame(interaction);
        } else {
            new WouldYouRather()
                .StartGame(interaction);
        }
    }
}