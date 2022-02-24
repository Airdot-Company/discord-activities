module.exports = class GameError extends Error {
    /**
     * @param {String} message 
     * @param {String} header 
     */
    constructor(message, header) {
      if (typeof message != "string")
        throw new GameError(
          `Expected a string for 'message', recieved ${typeof message}`,
          'INVALID_CONSTRUCTOR_ARGUMENT'
        );
      if (typeof header != "string")
        throw new GameError(
          `Expected a string for 'header', recieved ${typeof header}`,
          'INVALID_CONSTRUCTOR_ARGUMENT'
        );
  
      super(message);
      this.name = `Gamecord.js Error [${header}]`;
    }
  }
  
module.exports.Errors = {
    "INVALID_ARG": "INVALID_ARGUMENT",
    "INVALID_CONSTRUCTOR_ARGUMENT": "INVALID_CONSTRUCTOR_ARGUMENT",
    "INVALID_EMBED": "INVALID_EMBED",
    "MESSAGE_COMMAND": "MESSAGE_COMMAND",
    "INVALID_INTERACTION": "INVALID_INTERACTION",
    "INVALID_CHANNEL": "INVALID_CHANNEL"
}