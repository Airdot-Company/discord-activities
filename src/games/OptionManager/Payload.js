const Discord = require("discord.js");
const GameError = require("../../utils/Error");
const GamecordEmbed = require("./Embed");

class GamecordPayload {
    /**
     * @typedef GamecordPayloadOptions
     * @property {GamecordEmbed[]} [embeds]
     * @property {String} [content]
     * @property {Discord.MessageMentionOptions} [mentions]
     * @property {Boolean} [ephemeral]
     */

    /**
     * Creates a gamecord payload.
     * @param {GamecordPayloadOptions} Options 
     */
    constructor(
        Options = {
            embeds: null
        }
    ) {
        /**
         * The gamecord embeds.
         * @type {GamecordEmbed[]}
         */
        this.embeds = [];

        if (Options?.embeds != null) {
            for (const embed of Options?.embeds) {
                if (embed.type != "GAMECORD_EMBED") throw new GameError(
                    `Embeds must be an array of Gamecord Embeds`,
                    GameError.Errors.INVALID_EMBED
                )

                this.embeds.push(embed.build().Embed());
            };
        }

        /**
         * The reply content.
         * @type {String}
         */
        this.content = Options?.content || null;

        /**
         * The message mentions.
         * @type {Discord.MessageMentionOptions}
         */
        this.Mentions = Options?.mentions || "NONE";

        /**
         * If the reply is ephemeral.
         * @type {Boolean}
         */
        this.ephemeral = Options?.ephemeral || false;

        /**
         * If the reply should be fetched.
         * @private
         * @type {Boolean}
         */
        this.fetchReply = false;

        /**
         * The message components.
         * @type {Discord.MessageActionRow[]}
         */
        this.components = null;
    }

    setFetchReply(boolean = true) {
        this.fetchReply = boolean
        return this;
    }

    /**
     * @private
     * @returns {Discord.MessageMentionOptions}
     */
    parseMentions() {
        if (this.Mentions == "NONE") {
            return {
                users: [],
                roles: []
            }
        } else if(this.Mentions == "ALL"){
            return null;
        } else {
            return this.Mentions;
        }
    }

    setComponents(components) {
        this.components = components
        return this;
    }

    replaceOptions(optionChecker = (e => e)) {
        this.embeds.forEach(embed => {
            embed.setTitle(optionChecker(embed.title))
            embed.setDescription(optionChecker(embed.description))
        });
        if (this.content != null) this.content = optionChecker(this.content);

        return this;
    }

    /**
     * @returns {Discord.InteractionReplyOptions}
     */
    toJSON() {
        return {
            embeds: this.embeds,
            content: this.content,
            allowedMentions: this.parseMentions(),
            ephemeral: this.ephemeral,
            fetchReply: this.fetchReply,
            components: this.components
        };
    }
}

module.exports = GamecordPayload;