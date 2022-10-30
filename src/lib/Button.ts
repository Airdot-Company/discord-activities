import { ButtonBuilder, ButtonStyle, Emoji, EmojiResolvable } from "discord.js";

export enum InteractableButtonStyles {
    Primary = ButtonStyle.Primary,
    Secondary = ButtonStyle.Secondary,
    Success = ButtonStyle.Success,
    Danger = ButtonStyle.Danger
};

export interface LimitedButtonBuilderOptions {
    Label?: string;
    Style?: InteractableButtonStyles;
    Emoji?: EmojiResolvable;
}

export class LimitedButtonBuilder {
    public Builder: ButtonBuilder = new ButtonBuilder();

    setLabel(label: string) {
        this.Builder.setLabel(label);
        return this;
    }

    setEmoji(emoji: EmojiResolvable) {
        this.Builder.setEmoji(emoji);
        return this;
    }

    setStyle(style: InteractableButtonStyles) {
        //@ts-expect-error
        this.Builder.setStyle(style);
        return this;
    }
}