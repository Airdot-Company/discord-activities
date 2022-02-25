//a.k.a Rock Paper Scissors

const { Channel, CommandInteraction, Message, MessageActionRow, MessageButton, GuildMember, User } = require("discord.js");
const { v4 } = require("uuid");
const { timestamp: Timestamp } = require("discord.js-util");
const { BaseCustomId } = require("../../utils/constants");
const GameError = require("../../utils/Error");
const fixText = require("../../utils/fixText");
const GamecordEmbed = require("../OptionManager/Embed");
const GamecordPayload = require("../OptionManager/Payload");
const ReplyManager = require("../OptionManager/ReplyManager");

class RockPaperScissors {
    /**
     * @typedef RpsButton
     * @property {String} [label]
     * @property {String} [Emoji]
     * @property {String} [style]
     */

    /**
     * @typedef RpsOptions
     * @property {RpsButton} [RockButton]
     * @property {RpsButton} [PaperButton]
     * @property {RpsButton} [ScissorButton]
     * @property {RpsButton} [JoinButton]
     * @property {RpsButton} [DenyButton]
     * @property {Number} [TimeToJoin]
     */

    /**
     * @typedef RpsEmbedOptions Must be gamecord payloads.
     * @property {GamecordPayload} [WinMessage]
     * @property {GamecordPayload} [LostMessage]
     * @property {GamecordPayload} [StartGameMessage]
     * @property {GamecordPayload} [TieMessage]
     * @property {GamecordPayload} [awaitUserJoin]
     * @property {GamecordPayload} [awaitUserInput]
     * @property {GamecordPayload} [YouMessage]
     * @property {GamecordPayload} [BotMessage]
     */

    /**
     * Creates an RPS game!
     * @param {RpsOptions} GameOptions 
     * @param {RpsEmbedOptions} GameEmbeds
     * @param {User} User
     * @param {Boolean} Devlopment **Only** use this if you are a developer!
     */
    constructor(
        User,
        GameOptions = { },
        GameEmbeds = { },
        Devlopment
    ){
        this.dev = Devlopment;

        if(!User || User?.username == null) throw new GameError(
            `Invalid User`,
            GameError.Errors.INVALID_USER
        );
    
        const PrimaryStyle = "PRIMARY";

        this.User = User;

        const uuids = this.UUID = [
            v4(),
            v4(),
            v4(),
            v4(),
            v4()
        ];

        this.TimeToJoin = GameOptions.TimeToJoin || 300000;

        const customIds = this.customIds = {
            Rock: `${BaseCustomId}_ROCK_${uuids[0]}`,
            Paper: `${BaseCustomId}_PAPER_${uuids[1]}`,
            Scissors: `${BaseCustomId}_SCISSORS_${uuids[2]}`,
            Join: `${BaseCustomId}_RPS_JOIN_${uuids[3]}`,
            Deny: `${BaseCustomId}_RPS_DENY_${uuids[3]}`
        }

        this.Buttons = {
            Rock: new MessageButton()
            .setLabel(GameOptions.RockButton?.label || `Rock`)
            .setEmoji(GameOptions.RockButton?.Emoji || `🪨`)
            .setStyle(GameOptions.RockButton?.style || PrimaryStyle)
            .setCustomId(customIds.Rock),
            Paper: new MessageButton()
            .setLabel(GameOptions.ScissorButton?.label || `Paper`)
            .setEmoji(GameOptions.ScissorButton?.Emoji || `📄`)
            .setStyle(GameOptions.ScissorButton?.style || PrimaryStyle)
            .setCustomId(customIds.Paper),
            Scissor: new MessageButton()
            .setLabel(GameOptions.ScissorButton?.label || `Scissors`)
            .setEmoji(GameOptions.ScissorButton?.Emoji || `✂️`)
            .setStyle(GameOptions.ScissorButton?.style || PrimaryStyle)
            .setCustomId(customIds.Scissors),
            Req: new MessageButton()
            .setLabel(GameOptions.JoinButton?.label || `Accept & Join`)
            .setEmoji(GameOptions.JoinButton?.Emoji || `✅`)
            .setStyle(GameOptions.DenyButton?.style || PrimaryStyle)
            .setCustomId(customIds.Join),
            Deny: new MessageButton()
            .setLabel(GameOptions.DenyButton?.label || `Deny`)
            .setEmoji(GameOptions.DenyButton?.Emoji || `❌`)
            .setStyle(GameOptions.DenyButton?.style || PrimaryStyle)
            .setCustomId(customIds.Deny)
        }

        this.Payloads = {
            Start: GameEmbeds.StartGameMessage || new GamecordPayload({
                embeds: [
                    new GamecordEmbed()
                    .setTitle(`The game has started!`)
                    .setDescription(`The RPS game has started! Please click a button.`)
                ]
            }),
            Lost: GameEmbeds.LostMessage || new GamecordPayload({
                embeds: [
                    new GamecordEmbed()
                    .setTitle(`❌ Lost!`)
                    .setDescription(`You picked {{playerPick}} and AI has picked {{aiPick}}! You lost {{playerMention}}!`)
                ]
            }),
            Win: GameEmbeds.WinMessage || new GamecordPayload({
                embeds: [
                    new GamecordEmbed()
                    .setTitle(`🏆 Win!`)
                    .setDescription(`You picked {{playerPick}} and AI has picked {{aiPick}}! You won {{playerMention}}!`)
                ]
            }),
            Tie: GameEmbeds.TieMessage || new GamecordPayload({
                embeds: [
                    new GamecordEmbed()
                    .setTitle(`🪢 Tie!`)
                    .setDescription(`You picked {{playerPick}} and AI has picked {{aiPick}}! It's a tie!`)
                ]
            }),
            userInput: GameEmbeds.awaitUserJoin || new GamecordPayload({
                embeds: [
                    new GamecordEmbed()
                    .setTitle(`📥 Joining a game!`)
                    .setDescription(`{{playerMention}} wants you to join a game {{player2Mention}}!\n\n⏰ Join Timer ends: {{time}}`)
                ],
                content: `{{player2Mention}}`,
                mentions: "ALL"
            }),
            BotMessage: GameEmbeds.BotMessage || new GamecordPayload({
                content: `❌ You can't play with bots!`,
                ephemeral: true
            }),
            YouMessage: GameEmbeds.YouMessage || new GamecordPayload({
                content: `❌ You can't play with yourself!`,
                ephemeral: true
            })
        }
    }

    /**
     * Starts the game.
     * @param {Channel} Channel 
     * @param {CommandInteraction} Interaction 
     * @param {Boolean} SlashCommand
     */
    async start(Channel, Interaction, SlashCommand){
        const Int = new ReplyManager(Interaction);
        const {
            Payloads,
            customIds
        } = this;

        if((!Interaction || !Interaction.isCommand()) && Int.isInteraction()) throw new GameError(
            `Interaction must be a command interaction.`,
            GameError.Errors.INVALID_INTERACTION
        );
        if(!Channel || !Channel?.isText()) throw new GameError(
            `Channel must be a text channel.`,
            GameError.Errors.INVALID_CHANNEL
        );

        if(this.User.bot){
            const BotPayload = Payloads.BotMessage
            .toJSON();

            await Int.reply(BotPayload)
            return;
        }

        if((this.User.id == Int.User.id) && !this.dev){
            const YouPayload = Payloads.YouMessage
            .toJSON();
            
            await Int.reply(YouPayload)
            return;
        }
        
        const thisThis = this;

        const Payload = {
            MultiplayerButtons: new MessageActionRow()
            .addComponents(
                this.Buttons.Req,
                this.Buttons.Deny
            ),
            MultiplayerButtonsDisabled: new MessageActionRow()
            .addComponents(
                new MessageButton(this.Buttons.Req).setDisabled(true),
                new MessageButton(this.Buttons.Deny).setDisabled(true).setStyle(`DANGER`)
            ),
            disabled: () => {
                return new MessageActionRow()
                .addComponents(
                    new MessageButton(this.Buttons.Rock).setDisabled(true),
                    new MessageButton(this.Buttons.Paper).setDisabled(true),
                    new MessageButton(this.Buttons.Scissor).setDisabled(true)
                )
            },
            default: new MessageActionRow()
            .addComponents(
                this.Buttons.Rock,
                this.Buttons.Paper,
                this.Buttons.Scissor
            ),
            /**
             * @param {"WON"|"LOST"|"TIE"} status 
             * @param {"ROCK"|"PAPER"|"SCISSORS"} pick
             */
            defaultDisabled: (status, pick) => {
                pick = pick.toUpperCase();

                function getPick(){
                    if(pick == "PAPER"){
                        return thisThis.Buttons.Paper
                    } else if(pick == "ROCK"){
                        return thisThis.Buttons.Rock
                    } else if(pick == "SCISSORS"){
                        return thisThis.Buttons.Scissor
                    }
                }

                function actionRow(button){
                    return {
                        type: 1,
                        components: perfectActionRow(button)
                    }
                }

                function perfectActionRow(button){
                    if(button.customId == customIds.Paper){
                        return [
                            new MessageButton(thisThis.Buttons.Rock).setDisabled(true),
                            new MessageButton(button).setDisabled(true),
                            new MessageButton(thisThis.Buttons.Scissor).setDisabled(true)
                        ]
                    } else if(button.customId == customIds.Rock){
                        return [
                            new MessageButton(button).setDisabled(true),
                            new MessageButton(thisThis.Buttons.Paper).setDisabled(true),
                            new MessageButton(thisThis.Buttons.Scissor).setDisabled(true)
                        ]
                    } else if(button.customId == customIds.Scissors){
                        return [
                            new MessageButton(thisThis.Buttons.Rock).setDisabled(true),
                            new MessageButton(thisThis.Buttons.Paper).setDisabled(true),
                            new MessageButton(button).setDisabled(true)
                        ]
                    }
                }

                if(status == "LOST"){
                    return actionRow(new MessageButton(getPick()).setStyle("DANGER").setDisabled(true));
                } else if(status == "TIE"){
                    return actionRow(new MessageButton(getPick()).setStyle("SECONDARY").setDisabled(true));
                } else if(status == "WON"){
                    return actionRow(new MessageButton(getPick()).setStyle("SUCCESS").setDisabled(true));
                }
            }
        }

        const JoinPayload = Payloads.userInput
        .setComponents([
            Payload.MultiplayerButtons
        ])
        .replaceOptions(e => {
            return e.replaceAll(`{{time}}`,
                new Timestamp()
                .setTime(Date.now() + this.TimeToJoin)
                .setStyle("R")
                .toString()
            )
            .replaceAll(`{{playerName}}`, Int.User.username)
            .replaceAll(`{{player}}`, Int.User.username)
            .replaceAll(`{{playerId}}`, Int.User.id)
            .replaceAll(`{{playerTag}}`, Int.User.tag)
            .replaceAll(`{{playerMention}}`, Int.User.toString())
            .replaceAll(`{{player2Name}}`, this.User.username)
            .replaceAll(`{{player2}}`, this.User.username)
            .replaceAll(`{{player2Id}}`, this.User.id)
            .replaceAll(`{{player2Tag}}`, this.User.tag)
            .replaceAll(`{{player2Mention}}`, this.User.toString());
        })
        .setFetchReply();

        /**
         * @type {Message}
         */
        const Reply = await Int.reply(JoinPayload.toJSON());

        setTimeout(async () => {
            const load = JoinPayload.setComponents([
                Payload.MultiplayerButtonsDisabled
            ])
            .toJSON();

            await Int.edit(load);
            return;
        }, this.TimeToJoin);

        const joinBt = await Interaction.channel.awaitMessageComponent({
            filter: i => i.user.id == this.User.id,
            componentType: "BUTTON",
            time: this.TimeToJoin
        });

        if(joinBt.customId == customIds.Deny) {
            const load = JoinPayload.setComponents([
                Payload.MultiplayerButtonsDisabled
            ])
            .toJSON();

            await Int.edit(load, joinBt);
            return;
        }

        const StartPayload = Payloads.Start
        .setComponents([
            Payload.default
        ])
        .toJSON();


        await Int.edit(StartPayload);

        const collector = await Reply.channel.createMessageComponentCollector({
            filter: i => i.user.id == Int.User.id,
            componentType: "BUTTON"
        });

        let player1Picked = false;
        let player1Pick = null;

        collector.on("collect", async i => {
            if(![customIds.Rock, customIds.Paper, customIds.Scissors].includes(i.customId)) return;

            if(!player1Picked){
                player1Pick = i.customId;
            } else {
                const choicesAr = [
                    "ROCK",
                    "PAPER",
                    "SCISSORS"
                ];
                const choices = {
                    "ROCK": "ROCK",
                    "PAPER": "PAPER",
                    "SCISSORS": "SCISSORS"
                };
        
                let AICount = (Math.round((Math.random() * choicesAr.length)-1));
                if(AICount == -1) AICount = 0;
                const AI = choicesAr[AICount];
                //if(AI == undefined) console.log(`💻 For debug reasons:`, AI, choicesAr, AICount);
        
                const optionChecker = (text) => {
                    const customId = i.customId.replace(BaseCustomId + "_", "")
                    .replace(`_${this.UUID[0]}`, "")
                    .replace(`_${this.UUID[1]}`, "")
                    .replace(`_${this.UUID[2]}`, "");
        
                    return text.replaceAll(`{{playerPick}}`, fixText(customId))
                    .replaceAll(`{{aiPick}}`, fixText(AI))
                    .replaceAll(`{{playerName}}`, i.user.username)
                    .replaceAll(`{{player}}`, i.user.username)
                    .replaceAll(`{{playerId}}`, i.user.id)
                    .replaceAll(`{{playerTag}}`, i.user.tag)
                    .replaceAll(`{{playerMention}}`, i.user.toString());
                }
        
                const OriginalCustomId = i.customId.replace(BaseCustomId + "_", "")
                .replace(`_${this.UUID[0]}`, "")
                .replace(`_${this.UUID[1]}`, "")
                .replace(`_${this.UUID[2]}`, "");
        
                /**
                 * @type {"WON"|"LOST"|"TIE"|"UNKNOWN"}
                 */
                let PlayerStatus = "UNKNOWN";
                if (
                    (AI === choices.SCISSORS && i.customId === customIds.Paper) ||
                    (AI === choices.ROCK && i.customId === customIds.Scissors) ||
                    (AI === choices.PAPER && i.customId === customIds.Rock)
                ) {
                    PlayerStatus = "LOST";
                } else if(AI == OriginalCustomId){
                    PlayerStatus = "TIE";
                } else {
                    PlayerStatus = "WON";
                }
        
                const WinPayload = Payloads.Win
                .setComponents([
                    Payload.defaultDisabled(PlayerStatus, OriginalCustomId)
                ])
                .replaceOptions(optionChecker)
                .toJSON();
        
                const LostPayload = Payloads.Lost
                .setComponents([
                    Payload.defaultDisabled(PlayerStatus, OriginalCustomId)
                ])
                .replaceOptions(optionChecker)
                .toJSON();
        
                const TiePayload = Payloads.Tie
                .setComponents([
                    Payload.defaultDisabled(PlayerStatus, OriginalCustomId)
                ])
                .replaceOptions(optionChecker)
                .toJSON();
        
                if (
                    (AI === choices.SCISSORS && i.customId === customIds.Paper) ||
                    (AI === choices.ROCK && i.customId === customIds.Scissors) ||
                    (AI === choices.PAPER && i.customId === customIds.Rock)
                ) {
                    await i.update(LostPayload);
                } else if(AI == OriginalCustomId){
                    await i.update(TiePayload);
                } else {
                    await i.update(WinPayload);
                }
            }
        });
    }
}

module.exports = RockPaperScissors;