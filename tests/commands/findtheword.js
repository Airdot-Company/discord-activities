const { SlashCommandBuilder, SlashCommandUserOption, ChatInputCommandInteraction } = require("discord.js");
const { FindTheWord, MultiplayerRockPaperScissors, RockPaperScissors } = require("../../dist/index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("find_the_word")
        .setDescription("Play a game of find the word")
        .addUserOption(e => new SlashCommandUserOption()
            .setName("member")
            .setDescription("Play fin the word with a friend!")
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
            new FindTheWord()
                .StartGame(interaction);
        }
    }
}