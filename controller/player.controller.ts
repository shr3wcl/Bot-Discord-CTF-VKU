import { Players } from './../interface/model.interface';
import { CacheType } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import playerModel from '../model/player.model';
import { createEmbed } from '../feature/component';


const setLevelHacker = (point: Number) => {
    const value = point.valueOf() || 0;
    if (0 <= value && value <= 500) {
        return "🥸 Newbie";
    } else if (500 < value && value <= 1000) {
        return "⭐ Script Kiddle";
    } else if (1000 < value && value <= 1500) {
        return "🏴‍☠️ Hacker";
    } else if (1500 < value && value <= 2500) {
        return "🥷 Ninja warrior";
    } else if (2500 < value && value <= 3500) {
        return "🚩 Redteam";
    } else if (3500 < value && value < 10000) {
        return "⚔️ Legendary";
    } else {
        return "🎖️ GOD";
    }
}

export const getInfoHacker = async (player: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: player.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa trong bảng vàng, hãy submit ít nhất một flag để được ghi vào =))");
    } else {
        const infoHacker = `***Biệt danh***: ${user.nameUser}` +
            `***\nCấp độ***: ${user.level}` +
            `***\nSố flag đã submit***: ${user.numberFlags}` +
            `***\nĐiểm số***: ${user.point}`;
        const embed = createEmbed(`Thông tin của hacker "***${player.globalName}***"`,
            infoHacker
        );
        await interaction.reply({ embeds: [embed] });
    }
}

export const updateLevelAllUser = async (admin: Boolean, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        const hackers = await playerModel.find();
        hackers.forEach(async (hacker: Players) => {
            hacker.level = setLevelHacker(hacker.point);
            await hacker.save();
        })
        await interaction.reply("Cấp độ của toàn bộ Hacker đã được cập nhập");
    } else {
        await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
    }
}

// export const getAllChallengeSolved = async (hacker: User, interaction: ChatInputCommandInteraction<CacheType>){
    
// }