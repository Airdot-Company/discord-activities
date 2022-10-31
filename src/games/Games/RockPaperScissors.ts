import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, Message } from "discord.js";
import { ExtractRockPaperScissorsId } from "../../utils/Text";
import { LimitedButtonBuilder } from "../../lib/Button";
import { Game } from "../../lib/Game";
import { MultiplayerRockPaperScissorsIds, MultiplayerRockPaperScissorsOptions, RockPaperScissorsIds, RockPaperScissorsOptions } from "../../typings";
import { CreateId } from "../../utils/CustomId";
import { ErrorMessages, GameError } from "../../utils/Error";
import { Verifiers } from "../../utils/Verifiers";

const DefaultJoinTime = 300000;

export class RockPaperScissors extends Game {
    private Options: RockPaperScissorsOptions;
    private Ids: RockPaperScissorsIds;

    constructor(
        Options?: RockPaperScissorsOptions
    ) {
        super();

        const CustomIds = this.Ids = {
            Rock: CreateId("Rock"),
            Paper: CreateId("Paper"),
            Scissors: CreateId("Scissors"),
            PlayAgain: CreateId("Play_Again")
        }
    }

    setOptions(options: RockPaperScissorsOptions) {
        this.Options = options;
        return this;
    }

    async StartGame(Interaction: (CommandInteraction | ButtonInteraction)) {
        let {
            Ids,
            Options
        } = this;
        const InteractionMember = await Interaction.guild.members.fetch(Interaction.user.id);
        Options = {
            ...Options,
            EmbedColor: "#5865f2"
        }

        if (!Verifiers.isHexColor(Options?.EmbedColor)) throw new GameError(
            `EmbedColor must be a hex color string.`,
            ErrorMessages.InvalidArgument
        );

        if (
            !Verifiers.isCommandInteraction(Interaction, false) &&
            !Verifiers.isButtonInteraction(Interaction, false)
        ) throw new GameError(
            `Interaction must be a application command interaction or button interaction.`,
            ErrorMessages.InvalidInteraction
        );

        const ActionButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                (Options?.Buttons?.Rock.Builder || new ButtonBuilder()
                    .setLabel("Rock")
                    .setEmoji("🪨")
                    .setStyle(ButtonStyle.Secondary)
                ).setCustomId(Ids.Rock),
                (Options?.Buttons?.Paper.Builder || new ButtonBuilder()
                    .setLabel("Paper")
                    .setEmoji("📄")
                    .setStyle(ButtonStyle.Secondary)
                ).setCustomId(Ids.Paper),
                (Options?.Buttons?.Scissors.Builder || new ButtonBuilder()
                    .setLabel("Scissors")
                    .setEmoji("✂️")
                    .setStyle(ButtonStyle.Secondary)
                ).setCustomId(Ids.Scissors),
            );

        const PlayAgainButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                (Options?.Buttons?.PlayAgain.Builder || new ButtonBuilder()
                    .setLabel("Play Again")
                    .setStyle(ButtonStyle.Primary)
                ).setCustomId(Ids.PlayAgain)
            );

        const StartedMessage = await Interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Activity Started")
                    .setDescription(`Select a button below.`)
                    .setColor(Options.EmbedColor)
            ],
            components: [ActionButtons],
            fetchReply: true
        })

        const collector = StartedMessage.createMessageComponentCollector({
            filter: i => i.user.id == Interaction.user.id,
            componentType: ComponentType.Button,
            time: 1000000
        });

        collector.on("collect", async i => {
            let PlayAgainMessage: Message;
            const Selected = i.customId;
            const Items = [Ids.Rock, Ids.Paper, Ids.Scissors];
            const Random = Items[Math.floor(Math.random() * Items.length)];
            const Embed = new EmbedBuilder()
                .setColor(Options.EmbedColor)
                .addFields([{
                    name: `You Selected:`,
                    value: ExtractRockPaperScissorsId(Selected, true)
                }, {
                    name: `Random User Selected:`,
                    value: ExtractRockPaperScissorsId(Random, true)
                }]);
            //Calculate entries
            if (
                (Selected === Ids.Scissors && Random === Ids.Paper) ||
                (Selected === Ids.Rock && Random === Ids.Scissors) ||
                (Selected === Ids.Paper && Random === Ids.Rock)
            ) {
                PlayAgainMessage = await i.reply({
                    embeds: [
                        Embed
                            .setTitle(`🏆 ${Interaction.user.username} wins!`)
                            .setDescription(`${Interaction.user.username} has won the game, would you like to play again?`)
                    ],
                    components: [PlayAgainButtons],
                    fetchReply: true
                });
            } else if (Selected == Random) {
                PlayAgainMessage = await i.reply({
                    embeds: [
                        Embed
                            .setTitle("Tie")
                            .setDescription(`You're tied, would you like to play again?`)
                    ],
                    components: [PlayAgainButtons],
                    fetchReply: true
                });
            } else {
                PlayAgainMessage = await i.reply({
                    embeds: [
                        Embed
                            .setTitle(`🏆 Random User wins!`)
                            .setDescription(`Random User has won the game, would you like to play again?`)
                    ],
                    components: [PlayAgainButtons],
                    fetchReply: true
                });
            }

            const PlayAgainButton = await PlayAgainMessage.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 1000000,
                filter: FilterInteraction => FilterInteraction.user.id == Interaction.user.id
            });

            new RockPaperScissors()
                .setOptions({
                    ...Options
                })
                .StartGame(PlayAgainButton);
        });
    }
}