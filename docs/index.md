## Getting Started
First off, install `@airdot/activities` by using yarn add:
```bash
yarn add @airdot/activities
```
or if you're using npm:
```bash
npm install @airdot/activities
```

## Rock Paper Scissors
### Multiplayer
Let user's play with their friends, it's more fun to play with friends:
```js
const { MultiplayerRockPaperScissors } = require("@airdot/activities");

// Get the member from ChatInputCommandInteraction#options
const Member = interaction.options.getMember("member");
// Create and start the game through the game builder    
new MultiplayerRockPaperScissors()
    // This is who the other player is
    .setMember(Member)
    // Note: Activities only supports ChatInputCommandInteractions
    // and ButtonInteractions
    .StartGame(interaction);
```

### Single Player
You can also play single player

```js
const { RockPaperScissors } = require("@airdot/activities");

// Create and start the game through the game builder    
new RockPaperScissors()
    // Note: Activities only supports ChatInputCommandInteractions
    // and ButtonInteractions
    .StartGame(interaction);
```