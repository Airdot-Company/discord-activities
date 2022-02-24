//a.k.a Rock Paper Scissors

const { Channel, CommandInteraction, Message, MessageActionRow, MessageButton } = require("discord.js");
const { v4 } = require("uuid");
const { BaseCustomId } = require("../../utils/constants");
const GameError = require("../../utils/Error");
const fixText = require("../../utils/fixText");
const GamecordEmbed = require("../OptionManager/Embed");
const GamecordPayload = require("../OptionManager/Payload");

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
     */

    /**
     * @typedef RpsEmbedOptions Must be gamecord payloads.
     * @property {GamecordPayload} [WinMessage]
     * @property {GamecordPayload} [LostMessage]
     * @property {GamecordPayload} [StartGameMessage]
     * @property {GamecordPayload} [TieMessage]
     */

    /**
     * Creates an RPS game!
     * @param {RpsOptions} GameOptions 
     * @param {RpsEmbedOptions} GameEmbeds
     */
    constructor(
        GameOptions = { },
        GameEmbeds = { }
    ){
        const PrimaryStyle = "PRIMARY";

        const uuids = this.UUID = [
            v4(),
            v4(),
            v4()
        ];

        const customIds = this.customIds = {
            Rock: `${BaseCustomId}_ROCK_${uuids[0]}`,
            Paper: `${BaseCustomId}_PAPER_${uuids[1]}`,
            Scissors: `${BaseCustomId}_SCISSORS_${uuids[2]}`
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
            .setStyle(GameOptions.RockButton?.style || PrimaryStyle)
            .setCustomId(customIds.Paper),
            Scissor: new MessageButton()
            .setLabel(GameOptions.ScissorButton?.label || `Scissors`)
            .setEmoji(GameOptions.ScissorButton?.Emoji || `✂️`)
            .setStyle(GameOptions.ScissorButton?.style || PrimaryStyle)
            .setCustomId(customIds.Scissors)
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
        const {
            Payloads,
            customIds
        } = this;

        if(!SlashCommand || Interaction?.author != null) throw new GameError(
            `We currently do not support message commands!`,
            GameError.Errors.MESSAGE_COMMAND
        );
        if(!Interaction || !Interaction.isCommand()) throw new GameError(
            `Interaction must be a command interaction.`,
            GameError.Errors.INVALID_INTERACTION
        );
        if(!Channel || !Channel?.isText()) throw new GameError(
            `Channel must be a text channel.`,
            GameError.Errors.INVALID_CHANNEL
        );
        
        const Payload = {
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
            )
        }
        const StartPayload = Payloads.Start
        .setComponents([
            Payload.default
        ])
        .setFetchReply()
        .toJSON();

        /**
         * @type {Message}
         */
        const Reply = await Interaction.reply(StartPayload);

        const i = await Reply.awaitMessageComponent({
            filter: i => i.user.id == Interaction.user.id,
            componentType: "BUTTON"
        });

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

        const AI = choicesAr[Math.round(Math.random() * choicesAr.length)-1];

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

        const WinPayload = Payloads.Win
        .setComponents([
            Payload.disabled()
        ])
        .replaceOptions(optionChecker)
        .toJSON();

        const LostPayload = Payloads.Lost
        .setComponents([
            Payload.disabled()
        ])
        .replaceOptions(optionChecker)
        .toJSON();

        const TiePayload = Payloads.Tie
        .setComponents([
            Payload.disabled()
        ])
        .replaceOptions(optionChecker)
        .toJSON();

        const OriginalCustomId = i.customId.replace(BaseCustomId + "_", "")
        .replace(`_${this.UUID[0]}`, "")
        .replace(`_${this.UUID[1]}`, "")
        .replace(`_${this.UUID[2]}`, "");

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
}

module.exports = RockPaperScissors;