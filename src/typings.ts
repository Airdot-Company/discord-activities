import { ColorResolvable } from "discord.js";
import { LimitedButtonBuilder } from "./lib/Button";

export type HexColorString = `#${string}`;

export interface GameIds {
    PlayAgain: string;
}

export interface GameOptions {
    EmbedColor?: HexColorString;
}

export interface GameButtons {
    PlayAgain?: LimitedButtonBuilder;
}

export interface MultiplayerRockPaperScissorsIds extends GameIds {
    Rock: string;
    Paper: string;
    Scissors: string;
    Join: string;
    Deny: string;
}

export interface MultiplayerRockPaperScissorsButtons extends GameButtons {
    Paper?: LimitedButtonBuilder;
    Rock?: LimitedButtonBuilder;
    Scissors?: LimitedButtonBuilder;
    Join?: LimitedButtonBuilder;
    Deny?: LimitedButtonBuilder;
}

export interface MultiplayerRockPaperScissorsOptions extends GameOptions {
    Buttons?: MultiplayerRockPaperScissorsButtons;
    /**
     * The time for the other user to join.
     * 
     * *Optionally, you can use [ms](https://npm.im/ms) to turn a string into ms*
     */
    JoinTime?: number;
    /**
     * This is not recommended to use as it may get people annoyed.
     */
    SkipInvite?: boolean;
}

export interface RockPaperScissorsIds extends GameIds {
    Rock: string;
    Paper: string;
    Scissors: string;
}

export interface RockPaperScissorsButtons extends GameButtons {
    Paper?: LimitedButtonBuilder;
    Rock?: LimitedButtonBuilder;
    Scissors?: LimitedButtonBuilder;
}

export interface RockPaperScissorsOptions extends GameOptions {
    Buttons?: RockPaperScissorsButtons;
}

export interface WouldYouRatherIds extends GameIds {
    Option1: string;
    Option2: string;
}

export interface WouldYouRatherOptions extends GameOptions { }

export interface FindTheWordIds extends GameIds {
    Guess: string;
}

export interface FindTheWordOptions extends GameOptions {
    Time?: number;
}