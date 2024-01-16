import { Players } from './../interface/model.interface';
import { CacheType } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import playerModel from '../model/player.model';
import { createEmbed } from '../feature/component';
import teamModel from '../model/team.model';


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
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    } else {
        const teamName = user.idTeam ? (await teamModel.findOne({ idTeam: user.idTeam }))?.name : "Chưa có team";
        const infoHacker = `***Biệt danh***: ${user.nameUser}` +
            `***\nCấp độ***: ${user.level}` +
            `***\nSố flag đã submit***: ${user.numberFlags}` +
            `***\nĐiểm số***: ${user.point}`
            + `***\nTeam***: ${teamName}`;
        const embed = createEmbed(`Thông tin của hacker: "***${player.globalName}***"`,
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
        await interaction.reply("Bạn không phải là Admin để thực hiện chức năng này!");
    }
}

export const joinTeam = async (hacker: User, idTeam: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    } else {
        if (user.idTeam) {
            await interaction.reply("Bạn đã có team rồi!");
        } else {
            const team = await teamModel.findOne({ idTeam: idTeam });
            if (team) {
                user.idTeam = team.idTeam;
                await user.save();
                await interaction.reply("Đã tham gia team thành công!");
            } else {
                await interaction.reply("Team không tồn tại!");
            }
        }
    }
}

export const createTeam = async (hacker: User, nameTeam: String, description: String, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const user = await playerModel.findOne({ idUser: hacker.id });
        if (!user) {
            await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
        } else {
            if (user.idTeam) {
                await interaction.reply("Bạn đã có team rồi!");
            } else {
                const team = await teamModel.findOne({ name: nameTeam });
                if (team) {
                    await interaction.reply("Tên team đã tồn tại!");
                } else {
                    const idTeam = Math.random().toString(36).substring(2, 14);
                    const newTeam = new teamModel({
                        idTeam: idTeam,
                        name: nameTeam,
                        description: description,
                        score: 0,
                        contests: [],
                        members: [user]
                    });
                    await newTeam.save();
                    user.idTeam = newTeam.idTeam;
                    await user.save();
                    await interaction.reply("Tạo team thành công!");
                }
            }
        }
    } catch (error) {
        await interaction.reply("Có lỗi xảy ra! Không thể tạo team bây giờ.");
    }
}

export const leaveTeam = async (hacker: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    } else {
        if (user.idTeam) {
            const team = await teamModel.findOne({ idTeam: user.idTeam });
            if (team) {
                user.idTeam = "";
                await user.save();
                await interaction.reply("Đã rời team thành công!");
            } else {
                await interaction.reply("Team không tồn tại!");
            }
        } else {
            await interaction.reply("Bạn chưa có team!");
        }
    }
}
// export const getAllChallengeSolved = async (hacker: User, interaction: ChatInputCommandInteraction<CacheType>){
    
// }