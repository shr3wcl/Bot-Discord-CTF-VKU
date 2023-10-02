import { ColorResolvable, EmbedBuilder } from "discord.js";

export const createEmbed = (title: string, description: string, thumbnail: string | null = null, url: string | null = null, color: ColorResolvable | null = 0x0099FF) => {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description).setThumbnail(thumbnail).setURL(url);
}