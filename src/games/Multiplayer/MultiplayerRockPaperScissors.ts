import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, Message } from "discord.js";
import { ExtractRockPaperScissorsId } from "../../utils/Text";
import { LimitedButtonBuilder } from "../../lib/Button";
import { Game } from "../../lib/Game";
import { MultiplayerRockPaperScissorsIds, MultiplayerRockPaperScissorsOptions } from "../../typings";
import { CreateId } from "../../utils/CustomId";
import { ErrorMessages, GameError } from "../../utils/Error";
import { Verifiers } from "../../utils/Verifiers";

const DefaultJoinTime = 300000;

export class MultiplayerRockPaperScissors extends Game {
    private Member: GuildMember;
    private Options: MultiplayerRockPaperScissorsOptions;
    private Ids: MultiplayerRockPaperScissorsIds;

    constructor(
        Member?: GuildMember,
        Options?: MultiplayerRockPaperScissorsOptions,
    ) {
        super();

        if (!Verifiers.isMember(Member, true)) throw new GameError(
            `Invalid User`,
            ErrorMessages.InvalidMember
        );

        const CustomIds = this.Ids = {
            Rock: CreateId("Rock"),
            Paper: CreateId("Paper"),
            Scissors: CreateId("Scissors"),
            Join: CreateId("Accept_Invite"),
            Deny: CreateId("Deny_Invite"),
            PlayAgain: CreateId("Multiplayer_Play_Again_RPS", false)
        }
    }

    setMember(member: GuildMember) {
        this.Member = member;
        return this;
    }

    setOptions(options: MultiplayerRockPaperScissorsOptions) {
        this.Options = options;
        return this;
    }

    async StartGame(Interaction: (CommandInteraction | ButtonInteraction)) {
        let {
            Ids,
            Member,
            Options
        } = this;
        const EmbedColor = Options?.EmbedColor || "#5865f2";
        const InteractionMember = await Interaction.guild.members.fetch(Interaction.user.id);
        const MemberUser = await Member.user.fetch();
        Options = {
            ...Options,
            JoinTime: DefaultJoinTime,
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

        if (MemberUser.bot) {
            return Interaction.reply({
                content: "You can't play with a bot",
                ephemeral: true
            });
        }

        if (Interaction.user.id == Member.id) {
            return Interaction.reply({
                content: "You can't play with yourself",
                ephemeral: true
            });
        }

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

        const InviteButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                (Options?.Buttons?.Join.Builder || new ButtonBuilder()
                    .setLabel("Join")
                    .setStyle(ButtonStyle.Primary)
                ).setCustomId(Ids.Join),
                (Options?.Buttons?.Deny.Builder || new ButtonBuilder()
                    .setLabel("Deny")
                    .setStyle(ButtonStyle.Danger)
                ).setCustomId(Ids.Deny),
            );

        const PlayAgainButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                (Options?.Buttons?.PlayAgain.Builder || new ButtonBuilder()
                    .setLabel("Play Again")
                    .setStyle(ButtonStyle.Primary)
                ).setCustomId(Ids.PlayAgain)
            )

        let ButtonInteraction: ButtonInteraction;
        if (Options?.SkipInvite == null || Options?.SkipInvite == false) {
            const Message = await Interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: "Rock Paper Scissors"
                        })
                        .setTitle("You've been invited to a activity")
                        .setDescription(`${MemberUser.username} has invited you to an activity.`)
                        .setColor(Options.EmbedColor)
                ],
                content: Member.toString(),
                components: [InviteButtons],
                fetchReply: true
            });

            setTimeout(async () => {
                return Interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Invite Expired")
                            .setDescription(`Ask ${Member.displayName} for a new invite!`)
                            .setColor(Options.EmbedColor)
                    ]
                });
            }, (this.Options?.JoinTime || DefaultJoinTime));

            ButtonInteraction = await Message.awaitMessageComponent({
                filter: i => {
                    if (i.user.id == Member.id) {
                        return true;
                    } else {
                        i.reply({
                            content: "You can't join a game for someone else.",
                            ephemeral: true
                        });
                        return false;
                    }
                },
                componentType: ComponentType.Button,
                time: this.Options?.JoinTime || DefaultJoinTime
            });

            Message.edit({
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            InviteButtons.components.map(e => e.setDisabled(true))
                        )
                ]
            })

            if (ButtonInteraction.customId == Ids.Deny) {
                return ButtonInteraction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Invite Denied")
                            .setDescription(`${Member.displayName} has denied the invite to the activity.`)
                            .setColor(Options.EmbedColor)
                    ]
                });
            }
        }

        const StartedMessage = await (ButtonInteraction == null ? Interaction : ButtonInteraction).reply({
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
            filter: i => (i.user.id == Interaction.user.id) || (i.user.id == Member.id),
            componentType: ComponentType.Button,
            time: 1000000
        });

        let Selected: { Inviter: string; Member: string; } = {
            Inviter: null,
            Member: null
        };

        collector.on("collect", async i => {
            const isMember = i.user.id == Member.id;
            const Select = Selected[isMember ? "Member" : "Inviter"];
            if (Select != null) {
                i.reply({
                    content: "🎲 You've already selected an option.",
                    ephemeral: true
                });
                return;
            }

            if (isMember) {
                Selected.Member = i.customId;
            } else {
                Selected.Inviter = i.customId;
            }

            i.reply({
                content: "Answer locked in!",
                ephemeral: true
            });

            let PlayAgainMessage: Message;
            if (collector.collected.size > 1) {
                const Embed = new EmbedBuilder()
                    .setColor(Options?.EmbedColor)
                    .addFields([{
                        name: `${MemberUser.username} Selected:`,
                        value: ExtractRockPaperScissorsId(Selected.Member, true)
                    }, {
                        name: `${Interaction.user.username} Selected:`,
                        value: ExtractRockPaperScissorsId(Selected.Inviter, true)
                    }]);
                //Calculate entries
                if (
                    (Selected.Inviter === Ids.Scissors && Selected.Member === Ids.Paper) ||
                    (Selected.Inviter === Ids.Rock && Selected.Member === Ids.Scissors) ||
                    (Selected.Inviter === Ids.Paper && Selected.Member === Ids.Rock)
                ) {
                    PlayAgainMessage = await Interaction.channel.send({
                        embeds: [
                            Embed
                                .setTitle(`🏆 ${Interaction.user.username} wins!`)
                                .setDescription(`${Interaction.user.username} has won the game, would you like to play again?`)
                        ],
                        components: [PlayAgainButtons],
                    });
                } else if (Selected.Inviter == Selected.Member) {
                    PlayAgainMessage = await Interaction.channel.send({
                        embeds: [
                            Embed
                                .setTitle("Tie")
                                .setDescription(`You're tied, would you like to play again?`)
                        ],
                        components: [PlayAgainButtons]
                    });
                } else {
                    PlayAgainMessage = await Interaction.channel.send({
                        embeds: [
                            Embed
                                .setTitle(`🏆 ${MemberUser.username} wins!`)
                                .setDescription(`${MemberUser.username} has won the game, would you like to play again?`)
                        ],
                        components: [PlayAgainButtons]
                    });
                }

                StartedMessage.edit({
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                ActionButtons.components.map(e => e.setDisabled(true))
                            )
                    ]
                })

                const PlayAgainCollector = PlayAgainMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: i => (i.user.id == Interaction.user.id) || (i.user.id == Member.id),
                    time: 1000000
                });

                PlayAgainCollector.on("collect", async PlayAgainButton => {
                    if (PlayAgainCollector.collected.size > 1) {
                        new MultiplayerRockPaperScissors()
                            .setMember(
                                PlayAgainButton.user.id != Member.id ? Member :
                                    await Interaction.guild.members.fetch(Interaction.user.id)
                            )
                            .setOptions({
                                SkipInvite: true,
                                ...Options
                            })
                            .StartGame(PlayAgainButton);

                        await PlayAgainMessage.edit({
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        PlayAgainButtons.components[0].setDisabled(true)
                                            .setLabel(
                                                PlayAgainButtons.components[0].data.label.replace("(1)", "(2)")
                                            )
                                    )
                            ]
                        });
                    } else {
                        await PlayAgainButton.update({
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        PlayAgainButtons.components[0].setLabel(
                                            PlayAgainButtons.components[0].data.label.replace(" (1)", "") + ` (${PlayAgainCollector.collected.size})`
                                        )
                                    )
                            ]
                        })
                    }
                });
            }
        });
    }
}