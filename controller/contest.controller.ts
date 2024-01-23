import { CacheType, ChatInputCommandInteraction, Interaction, User } from "discord.js";
import ContestModel from "../model/contest.model";
import playerModel from "../model/player.model";
import teamModel from "../model/team.model";
import { createEmbed } from "../feature/component";
import flagModel from "../model/flag.model";
import { Flags } from "../interface/model.interface";

export const createContest = async (
    idContest: String | null,
    nameContest: String | null,
    description: String | null,
    status: Boolean | null,
    startTime: String | null,
    endTime: String | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        const newContest = new ContestModel({ idContest, nameContest, description, status, startTime, endTime });
        await newContest.save();
        await interaction.reply("Thêm thành công!");
    } catch (error) {
        await interaction.reply("Không thể thêm contest vào lúc này!");
    }
}

export const getAllContest = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contests = await ContestModel.find({});
        let result = "";
        contests.forEach(contest => {
            result += `**ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n\n`;
        });
        await interaction.reply(result);
    } catch (error) {
        await interaction.reply("Không thể lấy danh sách contest vào lúc này!");
    }
}

export const updateContest = async(
    idContest: String | null,
    nameContest: String | null,
    description: String | null,
    status: Boolean | null,
    startTime: String | null,
    endTime: String | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        const contest = await ContestModel.findOneAndUpdate({ idContest }, {
            nameContest, description, status, startTime, endTime
        });
        await interaction.reply("Cập nhật thành công!");
    } catch (error) {
        await interaction.reply("Không thể cập nhật contest vào lúc này!");
    }
}

export const deleteContest = async (idContest: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOneAndDelete({ idContest });
        await interaction.reply("Xóa thành công!");
    } catch (error) {
        await interaction.reply("Không thể xóa contest vào lúc này!");
    }
}

export const getInfoContest = async (idContest: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            await interaction.reply(`**ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n\n`);
        } else {
            await interaction.reply("Không tìm thấy contest!");
        }
    } catch (error) {
        await interaction.reply("Không thể lấy thông tin contest vào lúc này!");
    }
}

export const joinContest = async (idContest: String | null, user: User, password: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            const idTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
            if (idTeam) {
                const teamContest = await ContestModel.findOne({ "teams.team.idTeam": idTeam.idTeam });
                const team = await teamModel.findOne({ idTeam: idTeam.idTeam });
                if (teamContest) {
                    await interaction.reply("Bạn đã tham gia contest này rồi!");
                } else {
                    if ((contest.public == false) && (password !== contest.password)) {
                        return await interaction.reply("Mật khẩu của contest không đúng!");
                    }
                    const newTeam = {
                        team: {
                            idTeam: idTeam,
                            name: team?.name,
                            description: team?.description,
                            score: 0,
                            flags: [],
                            members: team?.members
                        },
                        score: 0
                    }
                    await ContestModel.findOneAndUpdate({ idContest }, {
                        $push: {
                            teams: newTeam
                        }
                    });
                    await interaction.reply("Tham gia contest thành công!");
                    
                }
            } else {
                await interaction.reply("Hãy gia nhập một team để đăng ký contest!");
            }
        } else {
            await interaction.reply("Không tìm thấy contest!");
        }
        
    } catch (error) {
        await interaction.reply("Không thể tham gia contest vào lúc này!");
    }
}

export const leaveContest = async (idContest: String | null, user: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            const idTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
            if (idTeam) {
                const teamContest = await ContestModel.findOne({ "teams.team.idTeam": idTeam.idTeam });
                if (teamContest) {
                    await ContestModel.findOneAndUpdate({ idContest }, {
                        $pull: {
                            teams: {
                                "team.idTeam": idTeam.idTeam
                            }
                        }
                    });
                    await interaction.reply("Rời contest thành công!");
                } else {
                    await interaction.reply("Bạn chưa tham gia contest này!");
                }
            } else {
                await interaction.reply("Bạn chưa gia nhập team!");
            }
        } else {
            await interaction.reply("Không tìm thấy contest!");
        }
    } catch (error) {
        await interaction.reply("Không thể rời contest vào lúc này!");
    }
}

export const scoreBoardContest = async (idContest: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            let result = "";
            contest.teams.forEach((team, index) => {
                result += `${index + 1}. **ID:** ${team.team.idTeam}\n\t**Name:** ${team.team.name}\n\t**Score:** ${team.score}\n\n`;
            });
            const embed = createEmbed(`Scoreboard contest: ***${contest.nameContest}***`, result, null, null, 0x0099FF);
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply("Không tìm thấy contest!");
        }
    } catch (error) {
        await interaction.reply("Không thể lấy scoreboard vào lúc này!");
    }
}

export const addChallengeContest = async (idContest: String | null, idChall: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            const checkChall = await ContestModel.findOne({ "teams.team.flags": idChall });
            if (checkChall) {
                await interaction.reply("Challenge này đã được thêm vào contest!");
            } else {
                await ContestModel.findOneAndUpdate({ idContest }, {
                    $push: {
                        "teams.$.team.flags": idChall
                    }
                });
                await interaction.reply("Thêm challenge vào contest thành công!");
            }
        } else {
            await interaction.reply("Không tìm thấy contest!");
        }
    } catch (error) {
        await interaction.reply("Không thể thêm challenge vào contest vào lúc này!");
    }
}

export const listContests = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contests = await ContestModel.find({}).sort({ startTime: 1 });
        let result = "";
        contests.forEach((contest, index) => {
            result += `${index + 1}. **ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n\n`;
        });
        const embed = createEmbed("Danh sách contest", result, null, null, 0x0099FF);
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply("Không thể lấy danh sách contest vào lúc này!");
    }
}

export const getAllChallOfContest = async (admin: Boolean, category: String | null, idContest: String, interaction: ChatInputCommandInteraction<CacheType>) => {
    let challenges: Array<Flags>;
    if (!category) {

        if (admin) {
            challenges = await flagModel.find({ idContest: idContest }, "idChall nameAuthor nameChall point level description mode url category idContest");

        } else {
            challenges = await flagModel.find({ mode: true, idContest: null }, "idChall nameAuthor nameChall point level description mode url category");
        }
    } else {
        if (admin) {
            challenges = await flagModel.find({ category: category, idContest: idContest }, "idChall nameAuthor nameChall point level description mode url category idContest");
        } else {
            challenges = await flagModel.find({ mode: true, category: category, idContest: null }, "idChall nameAuthor nameChall point level description mode url category");
        }
    }   
    let infoChallenges = "";
    challenges.map((challenge: Flags, index: number) => {
        infoChallenges += `${index + 1}. ***Tên thử thách:*** ` + challenge.nameChall +
            "***\n\tID:*** " + challenge.idChall +
            "***\n\tTác giả:*** " + challenge.nameAuthor +
            "***\n\tLoại:*** " + challenge.category +
            "***\n\tMô tả:*** " + challenge.description +
            "***\n\tĐiểm:*** " + challenge.point +
            "***\n\tĐộ khó:*** " + challenge.level +
            "***\n\tLink thử thách:*** " + challenge.url + "\n";
        if (admin) {
            infoChallenges += "***\n\tTrạng thái:*** " + (challenge.mode ? "Public" : "Private") + "***\tID Challenge:*** " + challenge.idChall + "\n" + "***\n\tID Contest:*** " + challenge.idContest ?? "Không" + "\n";
        }
    });
    const embed = createEmbed("Danh sách thử thách" + (category ? ` thuộc loại ${category}` : ""), infoChallenges);
    await interaction.reply({ embeds: [embed] });
}