const { CommandInteraction, Message } = require("discord.js");
const Discord = require("discord.js");

class ReplyManager {
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

    /**
     * Gets the user.
     * @type {Discord.User}
     */
    get User(){
        if(this.isInteraction()){
            return this.intOrMessage.user;
        } else if(this.isMessage()){
            return this.intOrMessage.author;
        }
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
            }, options)));
        }
    }

    /**
    * Edits the message or interaction.
    * @param {Discord.InteractionReplyOptions} options 
    * @param {Discord.ButtonInteraction} ButtonInteraction
    * @returns {Promise<Message>}
    */
    async edit(options, ButtonInteraction = null) {
        const { intOrMessage } = this;
        if(ButtonInteraction != null){
            this.replied = await ButtonInteraction.update(Object.assign({
                fetchReply: true
            }, options));
        } else {
            if (this.isMessage()) {
                await this.replied.edit(options);
            } else if (this.isInteraction()) {
                await intOrMessage.editReply(Object.assign({
                    fetchReply: true
                }, options));
            }
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

module.exports = ReplyManager;