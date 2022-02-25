const { CommandInteraction, Message } = require("discord.js");
const Discord = require("discord.js");

class Reply {
    /**
     * 
     * @param {CommandInteraction|Message} InteractionMessage 
     */
    constructor(InteractionMessage) {
        this.intOrMessage = InteractionMessage;

        /**
         * @type {Message}
         */
        this.replied = null;
    }

    isMessage() {
        return !this.isInteraction();
    }

    isInteraction() {
        return (this.intOrMessage?.isCommand != null);
    }

    /**
     * Replys to the message or interaction.
     * @param {Discord.InteractionReplyOptions} options 
     * @returns {Promise<Message>}
     */
    async reply(options) {
        const { intOrMessage } = this;
        if (this.isMessage()) {
            return this.replied = (await intOrMessage.channel.send(options));
        } else if (this.isInteraction()) {
            return this.replied = (await intOrMessage.reply(Object.assign({
                fetchReply: true
            }, this.intOrMessage.reply)));
        }
    }

    /**
    * Edits the message or interaction.
    * @param {Discord.InteractionReplyOptions} options 
    * @returns {Promise<Message>}
    */
    async edit (options) {
        const { intOrMessage } = this;
        if (this.isMessage()) {
            await this.replied.edit(options);
        } else if (this.isInteraction()) {
            await intOrMessage.editReply(Object.assign({
                fetchReply: true
            }, this.intOrMessage.reply));
        }

        return this.replied;
    }

    /**
     * Fetches the reply.
     * @returns {Message}
     */
    fetch(){
        return this.replied
    }
}