import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, Message } from "discord.js";
import fetch from "node-fetch";
import { LimitedButtonBuilder } from "../../lib/Button";
import { Game } from "../../lib/Game";
import { WouldYouRatherIds, WouldYouRatherOptions } from "../../typings";
import { CreateId } from "../../utils/CustomId";
import { ErrorMessages, GameError } from "../../utils/Error";
import { Verifiers } from "../../utils/Verifiers";

export class WouldYouRather extends Game {
    private Ids: WouldYouRatherIds;
    public Options: WouldYouRatherOptions;

    constructor(
        options?: WouldYouRatherOptions
    ) {
        super();

        const CustomIds = this.Ids = {
            Option1: CreateId("Option1"),
            Option2: CreateId("Option2"),
            PlayAgain: CreateId("PlayAgain")
        }
    }

    setOptions(options: WouldYouRatherOptions) {
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

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        const fetched = await (await fetch("http://api.tovade.xyz/v1/fun/wyr")).json();
        const Option1 = {
            Label: fetched.questions[0],
            Percentage: fetched.percentage[1]
        }
        const Option2 = {
            Label: fetched.questions[1],
            Percentage: fetched.percentage[2]
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
                new ButtonBuilder()
                    .setLabel(Option1.Label)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(Ids.Option1),
                new ButtonBuilder()
                    .setLabel(Option2.Label)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(Ids.Option2)
            )
        const DisabledActionButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`${Option1.Label} (${Option1.Percentage}%)`)
                    .setStyle(Option1.Percentage > Option2.Percentage ? ButtonStyle.Success : ButtonStyle.Danger)
                    .setCustomId(Ids.Option1)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setLabel(`${Option2.Label} (${Option2.Percentage}%)`)
                    .setStyle(Option2.Percentage > Option1.Percentage ? ButtonStyle.Success : ButtonStyle.Danger)
                    .setCustomId(Ids.Option2)
                    .setDisabled(true)
            )

        const PlayAgainButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Play Again")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(Ids.PlayAgain)
            );

        const Payload = {
            embeds: [
                new EmbedBuilder()
                    .setTitle("Activity Started")
                    .setDescription(`Select a button below.`)
                    .setColor(Options.EmbedColor)
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

        collector.on("collect", async i => {
            const Selected = i.customId;
            const Embed = new EmbedBuilder()
                .setColor(Options.EmbedColor)
                .addFields([{
                    name: `You Selected:`,
                    value: Selected == Ids.Option1 ? Option1.Label : Option2.Label
                }]);

            await i.update({
                components: [DisabledActionButtons, PlayAgainButtons]
            });

            const PlayAgainButton = await StartedMessage.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 1000000,
                filter: FilterInteraction => FilterInteraction.user.id == Interaction.user.id
            });

            new WouldYouRather()
                .setOptions({
                    ...Options
                })
                .StartGame(PlayAgainButton);
        });
    }
}