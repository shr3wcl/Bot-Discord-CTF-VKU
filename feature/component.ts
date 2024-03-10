import { ColorResolvable, EmbedBuilder } from "discord.js";

export const createEmbed = (title: string, description: string, thumbnail: string | null = null, url: string | null = null, color: ColorResolvable | null = 0x0099FF) => {
    const validColor = typeof color === "number" && !isNaN(color) ? color : 0x0099FF;

    const validThumbnail = thumbnail && thumbnail.trim() !== "" ? thumbnail : null;

    return new EmbedBuilder()
        .setColor(validColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(validThumbnail)
        .setURL(url);
}
