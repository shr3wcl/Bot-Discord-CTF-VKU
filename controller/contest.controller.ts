import { CacheType, ChannelType, ChatInputCommandInteraction, Interaction, TextChannel, User } from "discord.js";
import ContestModel from "../model/contest.model";
import playerModel from "../model/player.model";
import teamModel from "../model/team.model";
import { createEmbed } from "../feature/component";
import flagModel from "../model/flag.model";
import { Flags } from "../interface/model.interface";
import contestModel from "../model/contest.model";

export const createContest = async (
    idContest: string | null,
    nameContest: string | null,
    description: string | null,
    status: string | null,
    startTime: string | null,
    endTime: string | null,
    publicMode: boolean | null,
    password: string | null,
    url: string | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        if (!nameContest) {
            return await interaction.reply("Vui lòng nhập tên contest!");
        }

        const checkContest = await contestModel.findOne({ nameContest });
        if (checkContest) {
            return await interaction.reply("Tên contest này đã tồn tại!");
        }

        if (!interaction.guild) {
            return await interaction.reply("Không thể tạo contest trong một server!");
        }

        const channel = await interaction.guild.channels.create({
            name: nameContest.toString(),
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: ["ViewChannel"]
                }
            ],
            parent: process.env.ID_ROOT_DIR
        });

        const newContest = new ContestModel({
            idContest,
            nameContest,
            description,
            status,
            startTime,
            endTime,
            public: publicMode,
            password,
            createdBy: `${interaction.user.username}:${interaction.user.id}`,
            idChannel: channel.id
        });
        await newContest.save();

        await interaction.reply("Thêm thành công!");
    } catch (error) {
        console.log(error);
        await interaction.reply("Không thể thêm contest vào lúc này!");
    }
}


export const updateContest = async (
    idContest: string | null,
    nameContest: string | null,
    description: string | null,
    status: boolean | null,
    startTime: string | null,
    endTime: string | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        const contestExists = await ContestModel.exists({ idContest });
        if (!contestExists) {
            return await interaction.reply("Không tìm thấy contest để cập nhật!");
        }

        const updatedFields: any = {};
        if (nameContest) updatedFields.nameContest = nameContest;
        if (description) updatedFields.description = description;
        if (status !== null) updatedFields.status = status;
        if (startTime) updatedFields.startTime = startTime;
        if (endTime) updatedFields.endTime = endTime;

        await ContestModel.findOneAndUpdate({ idContest }, updatedFields);

        await interaction.reply("Cập nhật thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể cập nhật contest vào lúc này!");
    }
}

export const deleteContest = async (idContest: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contestExists = await ContestModel.exists({ idContest });
        if (!contestExists) {
            return await interaction.reply("Không tìm thấy contest để xóa!");
        }

        await ContestModel.findOneAndDelete({ idContest });

        await interaction.reply("Xóa thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể xóa contest vào lúc này!");
    }
}


export const getInfoContest = async (idContest: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (!contest) {
            return await interaction.reply("Không tìm thấy contest!");
        }

        await interaction.reply(`**ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n\n`);
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể lấy thông tin contest vào lúc này!");
    }
}


export const joinContest = async (idContest: string | null, user: User, idTeam: string | null, password: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (!contest) {
            return await interaction.reply("Không tìm thấy contest!");
        }

        const listIdTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
        if (!listIdTeam) {
            return await interaction.reply("Hãy gia nhập một team để đăng ký contest!");
        }

        if (idTeam && listIdTeam.idTeam && !listIdTeam.idTeam.includes(idTeam)) {
            return await interaction.reply("Bạn không tham gia team này!");
        }

        const teamContest = await ContestModel.findOne({ "teams.team.idTeam": idTeam });
        if (teamContest) {
            return await interaction.reply("Team của bạn đã tham gia contest này rồi!");
        }

        const team = await teamModel.findOne({ idTeam: listIdTeam.idTeam });
        if (!team) {
            return await interaction.reply("Không tìm thấy thông tin team!");
        }

        if (!contest.public && password !== contest.password) {
            return await interaction.reply("Mật khẩu của contest không đúng!");
        }

        const newTeam = {
            team: {
                idTeam: team.idTeam,
                name: team.name,
                description: team.description,
                score: 0,
                flags: [],
                members: team.members
            },
            score: 0
        };

        await ContestModel.findOneAndUpdate({ idContest }, { $push: { teams: newTeam } });

        const channel = interaction.guild?.channels.cache.get(contest.idChannel.toString()) as TextChannel;
        if (channel && team.members) {
            for (const member of team.members) {
                if (member.idUser) {
                    const guildMember = await interaction.guild?.members.fetch(member.idUser.toString());
                    if (guildMember) {
                        await channel.permissionOverwrites.create(guildMember.id, {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        });
                    }
                }
            }
        }

        await interaction.reply("Tham gia contest thành công!");
    } catch (error) {
        await interaction.reply("Không thể tham gia contest vào lúc này!");
    }
};


export const leaveContest = async (idContest: string | null, user: User, idteam: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (!contest) {
            return await interaction.reply("Không tìm thấy contest!");
        }

        const listIdTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
        if (!listIdTeam || !listIdTeam.idTeam || !listIdTeam.idTeam.includes(idteam ?? "")) {
            return await interaction.reply("Bạn không tham gia team này!");
        }

        const teamContest = contest.teams.find(team => team.team.idTeam === idteam);
        if (!teamContest) {
            return await interaction.reply("Bạn chưa tham gia contest này!");
        }

        const channel = interaction.guild?.channels.cache.get(contest.idChannel.toString()) as TextChannel;
        if (channel && teamContest.team.members) {
            for (const member of teamContest.team.members) {
                if (member.idUser) {
                    const guildMember = await interaction.guild?.members.fetch(member.idUser.toString());
                    if (guildMember) {
                        await channel.permissionOverwrites.create(guildMember.id, {
                            ViewChannel: false,
                            SendMessages: false,
                            ReadMessageHistory: false
                        });
                    }
                }
            }
        }

        await ContestModel.findOneAndUpdate({ idContest }, { $pull: { teams: { "team.idTeam": idteam } } });

        await interaction.reply("Rời contest thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể rời contest vào lúc này!");
    }
}


export const scoreBoardContest = async (idContest: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (!contest) {
            return await interaction.reply("Không tìm thấy contest!");
        }

        let result = "";
        contest.teams.forEach((team, index) => {
            result += `${index + 1}. **ID:** ${team.team.idTeam}\n\t**Name:** ${team.team.name}\n\t**Score:** ${team.score}\n\n`;
        });

        const embed = createEmbed(`Scoreboard contest: ***${contest.nameContest}***`, result, null, null, 0x0099FF);

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể lấy scoreboard vào lúc này!");
    }
}


export const addChallengeContest = async (idContest: string | null, idChall: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (!contest) {
            return await interaction.reply("Không tìm thấy contest!");
        }

        await ContestModel.findOneAndUpdate({ idContest }, {
            $push: {
                "teams.$.team.flags": idChall
            }
        });

        await interaction.reply("Thêm challenge vào contest thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể thêm challenge vào contest vào lúc này!");
    }
}


export const listContests = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contests = await ContestModel.find({}).sort({ startTime: 1 });

        const contestList = contests.map((contest, index) => {
            return `${index + 1}. **ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n**URL:** ${contest.url}\n\n`;
        }).join('');

        const embed = createEmbed("Danh sách contest", contestList, null, null, 0x0099FF);

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể lấy danh sách contest vào lúc này!");
    }
}

export const getAllChallOfContest = async (admin: boolean, category: string | null, idContest: string, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const query: any = { idContest: idContest };
        if (!admin) {
            query.mode = true;
            query.idContest = null;
        }
        if (category) {
            query.category = category;
        }

        const challenges = await flagModel.find(query, "idChall nameAuthor nameChall point level description mode url category idContest");

        let infoChallenges = "";
        challenges.forEach((challenge: Flags, index: number) => {
            infoChallenges += `${index + 1}. ***Tên thử thách:*** ${challenge.nameChall}\n\t***ID:*** ${challenge.idChall}\n\t***Tác giả:*** ${challenge.nameAuthor}\n\t***Loại:*** ${challenge.category}\n\t***Mô tả:*** ${challenge.description}\n\t***Điểm:*** ${challenge.point}\n\t***Độ khó:*** ${challenge.level}\n\t***Link thử thách:*** ${challenge.url}\n`;

            if (admin) {
                infoChallenges += `\t***Trạng thái:*** ${challenge.mode ? "Public" : "Private"}\t***ID Challenge:*** ${challenge.idChall}\n\t***ID Contest:*** ${challenge.idContest ? challenge.idContest : "Không"}\n`;
            }
        });

        const embed = createEmbed(`Danh sách thử thách${category ? ` thuộc loại ${category}` : ""}`, infoChallenges);
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể lấy danh sách thử thách vào lúc này!");
    }
}
