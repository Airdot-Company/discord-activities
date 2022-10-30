export class GameError extends Error {
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
      this.name = `Error [${header}]`;
    }
  }
  
export enum ErrorMessages {
    InvalidArgument = "INVALID_ARGUMENT",
    InvalidContructorArgument = "INVALID_CONSTRUCTOR_ARGUMENT",
    InvalidMessageOptions = "INVALID_EMBED",
    InvalidInteraction = "INVALID_INTERACTION",
    InvalidChannel = "INVALID_CHANNEL",
    InvalidMember = "INVALID_MEMBER"
}