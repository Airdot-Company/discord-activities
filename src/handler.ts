import { ButtonInteraction, Interaction } from "discord.js";
import { RockPaperScissors } from "./games/Games/RockPaperScissors";
import { MultiplayerRockPaperScissors } from "./games/Multiplayer/MultiplayerRockPaperScissors";

export function HandleButton(Button: Interaction) {
    if (!Button.isButton()) return;

    if (Button.customId == "Multiplayer_Play_Again_RPS") {

    } else if (Button.customId == "Play_Again_RPS") {
        new RockPaperScissors()
            .StartGame(Button);
    }
}