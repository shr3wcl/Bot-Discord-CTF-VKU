import { CacheType } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import playerModel from '../model/player.model';
import { createEmbed } from '../feature/component';

export const getInfoHacker = async (player: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: player.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa trong bảng vàng, hãy submit ít nhất một flag để được ghi vào =))");
    } else {
        const infoHacker = `Biệt danh: ${user.nameUser}` +
            `\nCấp độ: ${user.level}` +
            `\nSố flag đã submit: ${user.numberFlags}` +
            `\nĐiểm số: ${user.point}`;
        const embed = createEmbed(`Thông tin của hacker ${player.globalName}`,
            infoHacker
        );
        await interaction.reply({ embeds: [embed] });
    }
}