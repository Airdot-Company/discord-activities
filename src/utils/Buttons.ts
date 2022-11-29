import { ActionRowComponent, AnyComponentBuilder, ButtonBuilder, ButtonComponent, ChannelSelectMenuBuilder, ComponentBuilder, ComponentType, MentionableSelectMenuBuilder, MessageActionRowComponent, MessageComponent, RoleSelectMenuBuilder, SelectMenuBuilder, SelectMenuComponent, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { LimitedButtonBuilder } from "../lib/Button";

export type ResolvedComponent = RoleSelectMenuBuilder |
    ChannelSelectMenuBuilder |
    UserSelectMenuBuilder |
    MentionableSelectMenuBuilder |
    SelectMenuBuilder |
    ButtonBuilder;

export function ResolveComponent(component: MessageComponent | AnyComponentBuilder): ResolvedComponent {
    const ResolvedComponent = component.toJSON();
    if (ResolvedComponent.type == ComponentType.RoleSelect) {
        return RoleSelectMenuBuilder.from(ResolvedComponent);
    } else if (ResolvedComponent.type == ComponentType.ChannelSelect) {
        return ChannelSelectMenuBuilder.from(ResolvedComponent);
    } else if (ResolvedComponent.type == ComponentType.UserSelect) {
        return UserSelectMenuBuilder.from(ResolvedComponent);
    } else if (ResolvedComponent.type == ComponentType.MentionableSelect) {
        return MentionableSelectMenuBuilder.from(ResolvedComponent);
    } else if (ResolvedComponent.type == ComponentType.StringSelect) {
        return StringSelectMenuBuilder.from(ResolvedComponent);
    } else if (ResolvedComponent.type == ComponentType.Button) {
        return ButtonBuilder.from(ResolvedComponent);
    }
}

export function DisableButtons(components: MessageActionRowComponent[]) {
    return components.map(e => {
        return ResolveComponent(e).setDisabled(true);
    });
}