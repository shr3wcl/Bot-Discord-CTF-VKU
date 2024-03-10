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
    try {
        const user = await playerModel.findOne({ idUser: player.id });

        if (!user) {
            await interaction.reply("Người dùng này chưa có trong hệ thống! Submit ít nhất một Flag để được thêm vào hệ thống");
            return;
        }

        const { nameUser, level, numberFlags, point, idTeam } = user;
        const nickname = player.globalName ?? "Không rõ";

        let teamInfo = "Chưa có team";
        if (idTeam && idTeam.length > 0) {
            const teams = await teamModel.find({ idTeam: { $in: idTeam } });
            if (teams.length > 0) {
                teamInfo = teams.map(team => `${team.name} - ${team.idTeam}`).join("\n\t\t");
            }
        }

        const infoHacker = `***Biệt danh***: ${nickname}` +
            `***\nCấp độ***: ${level}` +
            `***\nSố flag đã submit***: ${numberFlags}` +
            `***\nĐiểm số***: ${point}`
            + `***\nTeam***: ${teamInfo}`;

        const embed = createEmbed(`Thông tin của hacker: "***${nickname}***"`, infoHacker);
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra khi tải thông tin của hacker.");
    }
}


export const updateLevelAllUser = async (admin: Boolean, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        try {
            const hackers = await playerModel.find();
            const updateOperations = hackers.map(async (hacker: Players) => {
                hacker.level = setLevelHacker(hacker.point);
                await hacker.save();
            });
            await Promise.all(updateOperations);
            await interaction.reply("Cấp độ của tất cả Hacker đã được cập nhật");
        } catch (error) {
            console.error(error);
            await interaction.reply("Có lỗi xảy ra khi cập nhật cấp độ của tất cả Hacker.");
        }
    } else {
        await interaction.reply("Bạn không phải là Admin để thực hiện chức năng này!");
    }
}


export const joinTeam = async (hacker: User, idTeam: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Hãy submit ít nhất một Flag để được thêm vào hệ thống");
    } else {
        const team = await teamModel.findOne({ idTeam: idTeam });

        if (!team) {
            await interaction.reply("Nhóm không tồn tại!");
            return;
        }

        if (team.members.find((member: any) => member.idUser === user.idUser)) {
            await interaction.reply("Bạn đã có trong nhóm này!");
            return;
        }

        if (!user.idTeam) {
            user.idTeam = [];
        }

        team.idTeam ? user.idTeam.push(team.idTeam) : null;
        team.members.push(user);

        try {
            await Promise.all([team.save(), user.save()]);
            await interaction.reply("Đã tham gia nhóm thành công!");
        } catch (error) {
            console.error(error);
            await interaction.reply("Có lỗi xảy ra khi tham gia nhóm.");
        }
    }
}


export const createTeam = async (hacker: User, nameTeam: String, description: String, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const user = await playerModel.findOne({ idUser: hacker.id });
        if (!user) {
            await interaction.reply("Người dùng này chưa có trong hệ thống! Hãy submit ít nhất một Flag để được thêm vào hệ thống");
            return;
        }

        const existingTeam = await teamModel.findOne({ name: nameTeam });
        if (existingTeam) {
            await interaction.reply("Tên team đã tồn tại!");
            return;
        }

        const idTeam = Math.random().toString(36).substring(2, 14);
        const newTeam = new teamModel({
            idTeam: idTeam,
            name: nameTeam,
            description: description,
            score: 0,
            contests: [],
            members: [user]
        });

        await Promise.all([newTeam.save(), user.updateOne({ $push: { idTeam: idTeam } })]);
        await interaction.reply("Tạo team thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra! Không thể tạo team bây giờ.");
    }
}


export const leaveTeam = async (hacker: User, idTeam: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    const user = await playerModel.findOne({ idUser: hacker.id });
    if (!user) {
        await interaction.reply("Người dùng này chưa có trong hệ thống! Hãy submit ít nhất một Flag để được thêm vào hệ thống");
        return;
    }

    const checkTeam = await teamModel.findOne({ idTeam: idTeam });
    if (!checkTeam) {
        await interaction.reply("Team không tồn tại!");
        return;
    }

    if (!user.idTeam || !user.idTeam.includes(idTeam ?? "")) {
        await interaction.reply("Bạn không có trong team này!");
        return;
    }

    const index = checkTeam.members.findIndex((member: any) => member.idUser === user.idUser);
    if (index !== -1) {
        checkTeam.members.splice(index, 1);
        await Promise.all([checkTeam.save(), user.updateOne({ $pull: { idTeam: idTeam } })]);
        await interaction.reply("Rời team thành công!");
    } else {
        await interaction.reply("Bạn không có trong team này!");
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
