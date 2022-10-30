import { ColorResolvable } from "discord.js";
import { LimitedButtonBuilder } from "./lib/Button";

export type HexColorString = `#${string}`;

export interface MultiplayerRockPaperScissorsIds {
    Rock: string;
    Paper: string;
    Scissors: string;
    Join: string;
    Deny: string;
    PlayAgain: string;
}

export interface MultiplayerRockPaperScissorsButtons {
    Paper?: LimitedButtonBuilder;
    Rock?: LimitedButtonBuilder;
    Scissors?: LimitedButtonBuilder;
    Join?: LimitedButtonBuilder;
    Deny?: LimitedButtonBuilder;
    PlayAgain?: LimitedButtonBuilder;
}

export interface MultiplayerRockPaperScissorsOptions {
    Buttons?: MultiplayerRockPaperScissorsButtons;
    /**
     * The time for the other user to join.
     * 
     * *Optionally, you can use [ms](https://npm.im/ms) to turn a string into ms*
     */
    JoinTime?: number;
    EmbedColor?: HexColorString;
    /**
     * This is not recommended to use as it may get people annoyed.
     */
    SkipInvite?: boolean;
}

export interface RockPaperScissorsIds {
    Rock: string;
    Paper: string;
    Scissors: string;
    PlayAgain: string;
}

export interface RockPaperScissorsButtons {
    Paper?: LimitedButtonBuilder;
    Rock?: LimitedButtonBuilder;
    Scissors?: LimitedButtonBuilder;
    PlayAgain?: LimitedButtonBuilder;
}

export interface RockPaperScissorsOptions {
    Buttons?: RockPaperScissorsButtons;
    EmbedColor?: HexColorString;
}