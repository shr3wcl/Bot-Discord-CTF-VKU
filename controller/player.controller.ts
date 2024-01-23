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
        return "🥷 Binary warrior";
    } else if (2500 < value && value <= 3500) {
        return "🚩 Redteam";
    } else if (3500 < value && value < 5000) {
        return "⚔️ Legendary";
    } else if (5000 <= value && value < 10000) {
        return "🎖️ Guru"
    } else if (10000 <= value && value < 20000) {
        return "🏆 Omniscient";
    } else if (20000 <= value && value < 50000) {
        return "👑 God";
    } else if (50000 <= value) {
        return "👸 Root King";
    }
}

export const getInfoHacker = async (player: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: player.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    } else {
        let listTeam: (string | null)[] = user.idTeam
            ? await Promise.all(user.idTeam.map(async (currentValue: String, index: number) => {
                const team = await teamModel.findOne({ idTeam: currentValue });
                return team ? team.name + " - " + team.idTeam : null;
            }))
            : ["Chưa có team"];
        
        listTeam = listTeam.join("\n\t\t") as unknown as (string | null)[];

        const infoHacker = `***Biệt danh***: ${user.nameUser}` +
            `***\nCấp độ***: ${user.level}` +
            `***\nSố flag đã submit***: ${user.numberFlags}` +
            `***\nĐiểm số***: ${user.point}`
            + `***\nTeam***: ${listTeam}`;
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
        const team = await teamModel.findOne({ idTeam: idTeam });

        if (team?.members.find((member: any) => member.idUser === user.idUser)) {
            return await interaction.reply("Bạn đã có trong team này!");
        }
        
        if (team && team.idTeam) {
            if(user.idTeam) {
                user.idTeam.push(team.idTeam);
            }
            else {
                user.idTeam = [team.idTeam];
            }
            team.members.push(user);
            await team.save();
            await user.save();
            await interaction.reply("Đã tham gia team thành công!");
        } else {
            await interaction.reply("Team không tồn tại!");
        }
    }
}

export const createTeam = async (hacker: User, nameTeam: String, description: String, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const user = await playerModel.findOne({ idUser: hacker.id });
        if (user) {
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
                
                if (user.idTeam) {
                    user.idTeam.push(idTeam);
                } else {
                    user.idTeam = [idTeam];
                }
                
                await user.save();
                await interaction.reply("Tạo team thành công!");
            }
        } else {
            await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
        }
    } catch (error) {
        console.log(error);
        
        await interaction.reply("Có lỗi xảy ra! Không thể tạo team bây giờ.");
    }
}

export const leaveTeam = async (hacker: User, idTeam: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (user) {
        const checkTeam = await teamModel.findOne({ idTeam: idTeam });
        if (checkTeam && user.idTeam) {
            const index = checkTeam.members.findIndex((member: any) => member.idUser === user.idUser);
            if (index !== -1) {
                checkTeam.members.splice(index, 1);
                await checkTeam.save();
                const indexUser = user.idTeam.findIndex((team: any) => team === idTeam);
                if (indexUser !== -1) {
                    user.idTeam.splice(indexUser, 1);
                    await user.save();
                }
                await interaction.reply("Rời team thành công!");
            } else {
                await interaction.reply("Bạn không có trong team này!");
            }
        } else {
            await interaction.reply("Team không tồn tại!");
        }
    } else {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    }
}

export const listParticipatedContest = async (hacker: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (user) {
        const listContest = await teamModel.find({ "members.idUser": user.idUser }, "name idTeam contests");
        if (listContest.length > 0) {
            const listContestName = listContest.map((contest: any) => {
                return contest.name + " - " + contest.idTeam;
            });
            const embed = createEmbed("Danh sách contest đã và đang tham gia", listContestName.join("\n\t\t"));
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply("Bạn chưa tham gia contest nào!");
        }
    } else {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
    }
}

// export const getAllChallengeSolved = async (hacker: User, interaction: ChatInputCommandInteraction<CacheType>){
    
// }