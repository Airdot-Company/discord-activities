import { ButtonInteraction, ChannelType, ChatInputCommandInteraction, GuildMember, InteractionType, TextChannel, User } from "discord.js";
import { HexColorString } from "../typings";

function isMember(member: any, canBeNull: boolean = false): member is GuildMember {
    if (canBeNull && member == null) return true;
    else if (!canBeNull && member == null) return false;

    return member instanceof GuildMember;
}

function isUser(user: any): user is User {
    return user instanceof User;
}

function isCommandInteraction(interaction: any, canBeNull: boolean = false): interaction is ChatInputCommandInteraction {
    if (canBeNull && interaction == null) return true;
    else if (!canBeNull && interaction == null) return false;
    if (interaction?.type == null) return false;
    return interaction.type == InteractionType.ApplicationCommand;
}

function isButtonInteraction(interaction: any, canBeNull: boolean = false): interaction is ButtonInteraction {
    if (canBeNull && interaction == null) return true;
    else if (!canBeNull && interaction == null) return false;
    if (interaction?.type == null) return false;
    return interaction.type == InteractionType.MessageComponent;
}

function isTextChannel(channel: any, canBeNull: boolean = false): channel is TextChannel {
    if (canBeNull && channel == null) return true;
    else if (!canBeNull && channel == null) return false;
    if (channel?.type == null) return false;
    return channel.type == ChannelType.GuildText;
}

function isHexColor(color: string): color is HexColorString {
    if (typeof color != "string") return false;
    return color.startsWith("#");
}

export const Verifiers = {
    isMember,
    isUser,
    isCommandInteraction,
    isButtonInteraction,
    isTextChannel,
    isHexColor
}