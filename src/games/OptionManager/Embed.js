const { AuthorName, URL, Colors } = require("../../utils/constants");
const Discord = require("discord.js");
const GameError = require("../../utils/Error");

/**
 * @typedef SelectedOptions
 * @property {String} [selectedOptions.title]
 * @property {String} [selectedOptions.description]
 * @property {String} [selectedOptions.color]
 */

/**
 * Sets the options if they are not set.
 * @param {GamecordEmbed} Embed 
 * @param {SelectedOptions} Options 
 */
module.exports.selecteOptions = (Embed, Options) => {
    Embed = Embed;

    if(!Embed.title && Options.title) Embed.setTitle(Options.title);
    if(Options.color) Embed.setColor(Options.color);
    if(!Embed.description && Options.description) Embed.setDescription(Options.description);

    return Embed;
}

/**
 * Checks if its a valid Gamecord Embed.
 * @param {GamecordEmbed} Embed 
 */
module.exports.validateEmbed = (Embed) => {
    if(Embed?.build()?.type != "GAMECORD_EMBED") return false
    else return true;
}

class GamecordEmbed {
    /**
     * Gamecord.js Embed. Used to set embed options.
     * **Please use this instead of a `Discord.MessageEmbed` because then it will brake the code.**
     * @param {SelectedOptions} selectedOptions 
     */
    constructor(selectedOptions){
        /**
         * The title of the embed.
         * @type {String}
         */
        this.title = selectedOptions?.title || null;

        /**
         * The description of the embed.
         * @type {String}
         */
        this.description = selectedOptions?.description || null;

        /**
         * The author of the embed.
         * @type {Discord.MessageEmbedAuthor}
         * @readonly You can't remove this!
         */
        this.author = {
            name: AuthorName,
            url: URL.Website,
            iconURL: URL.IconURL
        }

        /**
         * The color of the embed. (Default: BLURPLE)
         * @type {Discord.ColorResolvable}
         */
        this.color = selectedOptions?.color || "BLURPLE";

        /**
         * The gamecord embed type.
         * @type {"GAMECORD_EMBED"}
         */
        this.type = "GAMECORD_EMBED";
    }

    /**
     * Sets the embed title.
     * @param {String} text 
     * @returns {GamecordEmbed}
     */
    setTitle(text){
        if(typeof text != "string" || text == null) throw new GameError(`text must be a string`, GameError.Errors.INVALID_ARG);
        this.title = text
        return this;
    }

    /**
     * Sets the embed description.
     * @param {String} text 
     * @returns {GamecordEmbed}
     */
    setDescription(text){
        if(typeof text != "string" || text == null) throw new GameError(`text must be a string`, GameError.Errors.INVALID_ARG);
        this.description = text
        return this;
    }

    /**
     * Sets the color of the embed.
     * @param {Discord.ColorResolvable} color 
     * @returns {GamecordEmbed}
     */
    setColor(color){
        if(typeof color != "string" || color == null) throw new GameError(`color must be a string`, GameError.Errors.INVALID_ARG);
        if(!Colors.includes(color) && !color.startsWith("#")) throw new GameError(`color must be a DiscordColor or a hex color`, GameError.Errors.INVALID_ARG);
        this.color = color
        return this;
    }

    build(){
        return {
            type: `GAMECORD_EMBED`,
            Embed: () => new Discord.MessageEmbed()
            .setDescription(this.description)
            .setTitle(this.title)
            .setColor(this.color)
            .setAuthor(this.author)
        }
    }
}

module.exports = GamecordEmbed;