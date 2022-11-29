import { ActionRowBuilder, AnyComponent, AnyComponentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, inlineCode, Message, ModalBuilder, SelectMenuBuilder, spoiler, TextInputBuilder, TextInputStyle, time, TimestampStyles } from "discord.js";
import fetch from "node-fetch";
import { ShuffleString, getRandomSentence } from "../../utils/Word";
import { DefaultColor } from "../../constants";
import { LimitedButtonBuilder } from "../../lib/Button";
import { Game } from "../../lib/Game";
import { FindTheWordIds, FindTheWordOptions } from "../../typings";
import { CreateId } from "../../utils/CustomId";
import { ErrorMessages, GameError } from "../../utils/Error";
import { Verifiers } from "../../utils/Verifiers";
import { DisableButtons, ResolvedComponent } from "../../utils/Buttons";

const DefaultTime = 10000;

export class FindTheWord extends Game {
    private Ids: FindTheWordIds;
    public Options: FindTheWordOptions;

    constructor(
        options?: FindTheWordOptions
    ) {
        super();

        const CustomIds = this.Ids = {
            Guess: CreateId("Guess"),
            PlayAgain: CreateId("PlayAgain")
        }
    }

    setOptions(options: FindTheWordOptions) {
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
            EmbedColor: DefaultColor,
            Time: DefaultTime
        }

        const words = getRandomSentence(2);
        let found = [] as string[];
        const word = ShuffleString(
            words.join("")
        );

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
                new ButtonBuilder()
                    .setLabel("Take a guess")
                    .setEmoji("🔎")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(Ids.Guess),
            )

        const PlayAgainButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Play Again")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(Ids.PlayAgain)
            );

        const TimeLeft = time(new Date(Date.now() + Options.Time), TimestampStyles.RelativeTime)
        const Payload = {
            embeds: [
                new EmbedBuilder()
                    .setTitle("Activity Started - Find the word!")
                    .setDescription(`Ends ${TimeLeft}\n\n${inlineCode(word)}`)
                    .setColor(Options.EmbedColor)
                /*.addFields([{
                    name: `words (dev!)`,
                    value: words.map(e => spoiler(inlineCode(e))).join(" ")
                }])*/
            ],
            components: [ActionButtons],
            fetchReply: true
        };

        const StartedMessage = Interaction.replied ? await Interaction.followUp(Payload) : await Interaction.reply(Payload);

        const collector = StartedMessage.createMessageComponentCollector({
            filter: i => i.user.id == Interaction.user.id,
            componentType: ComponentType.Button,
            time: 1000000
        });

        const isPlural = words.length > 1

        setTimeout(async () => {
            const Reply = await Interaction.fetchReply();
            await Interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Activity Ended")
                        .setDescription(`${inlineCode(word)}`)
                        .addFields([{
                            name: "Found Words",
                            value: found.length == 0 ? "None" : found.map(e => inlineCode(e)).join(" ")
                        }])
                        .setColor(Options.EmbedColor)
                ],
                components: [
                    new ActionRowBuilder<ResolvedComponent>()
                        .addComponents(
                            DisableButtons(Reply.components[0].components)
                        ), PlayAgainButtons]
            });

            const FollowUp = await Interaction.followUp({
                content: `⏱️ Times up! The word${isPlural ? "s are" : " is"} ${words.map(e => inlineCode(e)).join(", ")}`,
                components: [PlayAgainButtons],
                fetchReply: true
            });

            const PlayAgainButton = await FollowUp.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 1000000,
                filter: FilterInteraction => FilterInteraction.user.id == Interaction.user.id
            });

            new FindTheWord()
                .setOptions({
                    ...Options
                })
                .StartGame(PlayAgainButton);
            collector.stop();
        }, Options.Time)

        collector.on("collect", async i => {
            const Selected = i.customId;

            i.showModal(
                new ModalBuilder()
                    .setTitle("Take a guess!")
                    .setCustomId("GUESS_MODAL")
                    .setComponents(
                        new ActionRowBuilder<TextInputBuilder>()
                            .addComponents(
                                new TextInputBuilder()
                                    .setCustomId("WORD")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setMinLength(1)
                                    .setMaxLength(30)
                                    .setLabel("Word")
                            )
                    )
            )

            const Modal = await i.awaitModalSubmit({
                time: 0
            });

            const SelectedWord = Modal.fields.getTextInputValue("WORD");
            if (words.includes(SelectedWord)) {
                await Modal.reply({
                    content: `${Modal.user} found ${isPlural ? "a" : "the"} word! \`${SelectedWord}\``
                });

                found.push(SelectedWord);

                const isMore = words.length != found.length;
                await i.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Activity Started - Find the word!")
                            .setDescription(`${isMore ? `Ends ${TimeLeft}\n\n` : ""}${inlineCode(word)}`)
                            .addFields([{
                                name: "Found Words",
                                value: found.map(e => inlineCode(e)).join(" ")
                            }])
                            .setColor(Options.EmbedColor)
                    ],
                    components: words.length == found.length ? [
                        new ActionRowBuilder<ResolvedComponent>()
                            .addComponents(
                                DisableButtons(i.message.components[0].components)
                            ), PlayAgainButtons] : [ActionButtons]
                });
            } else {
                await Modal.reply({
                    ephemeral: true,
                    content: `❌ Your guess is wrong, try again.`
                });
            }

            const PlayAgainButton = await StartedMessage.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 1000000,
                filter: FilterInteraction => FilterInteraction.user.id == Interaction.user.id
            });

            new FindTheWord()
                .setOptions({
                    ...Options
                })
                .StartGame(PlayAgainButton);
        });
    }
}