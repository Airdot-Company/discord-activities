import { ActionRowComponent, ButtonBuilder, ButtonComponent, ComponentBuilder, ComponentType, MessageActionRowComponent, MessageComponent, SelectMenuBuilder, SelectMenuComponent } from "discord.js";
import { LimitedButtonBuilder } from "../lib/Button";

export function isSelect(component: MessageComponent): component is SelectMenuComponent {
    const ResolvedComponent = component.toJSON();
    return ResolvedComponent.type == ComponentType.RoleSelect ||
        ResolvedComponent.type == ComponentType.ChannelSelect ||
        ResolvedComponent.type == ComponentType.UserSelect ||
        ResolvedComponent.type == ComponentType.MentionableSelect ||
        ResolvedComponent.type == ComponentType.StringSelect;
}

export function DisableButtons(components: MessageActionRowComponent[]) {
    return components.map(e => {
        const isSelectMenu = isSelect(e);
        if (isSelectMenu) return SelectMenuBuilder.from(e).setDisabled(true)
        else return ButtonBuilder.from(e).setDisabled(true);
    });
}