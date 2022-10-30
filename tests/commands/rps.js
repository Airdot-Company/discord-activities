const { SlashCommandBuilder, SlashCommandUserOption, ChatInputCommandInteraction } = require("discord.js");
const { MultiplayerRockPaperScissors, RockPaperScissors } = require("../../dist/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rock_paper_scissors")
        .setDescription("Play a game of rock paper scissors")
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
            new MultiplayerRockPaperScissors()
                .setMember(Member)
                .StartGame(interaction);
        } else {
            new RockPaperScissors()
                .StartGame(interaction);
        }
    }
}