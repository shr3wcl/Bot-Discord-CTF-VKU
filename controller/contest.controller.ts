import { CacheType, ChannelType, ChatInputCommandInteraction, Interaction, TextChannel, User } from "discord.js";
import ContestModel from "../model/contest.model";
import playerModel from "../model/player.model";
import teamModel from "../model/team.model";
import { createEmbed } from "../feature/component";
import flagModel from "../model/flag.model";
import { Flags } from "../interface/model.interface";
import contestModel from "../model/contest.model";

export const createContest = async (
    idContest: String | null,
    nameContest: String | null,
    description: String | null,
    status: String | null,
    startTime: String | null,
    endTime: String | null,
    publicMode: Boolean | null,
    password: String | null,
    url: String | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        const checkContest = await contestModel.findOne({ nameContest });
        if (checkContest) {
            return await interaction.reply("Tên contest này đã tồn tại!");
        }
        if (nameContest && interaction.guild) {
            const channel = await interaction.guild.channels.create({
                name: nameContest.toString(),
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ["ViewChannel"]
                    }
                ],
                parent: "1199280111493586994"
            });
            const newContest = new ContestModel({ idContest, nameContest, description, status, startTime, endTime, public: publicMode, password, createdBy: `${interaction.user.username}:${interaction.user.id}`, idChannel: channel.id });
            await newContest.save();
            await interaction.reply("Thêm thành công!");
        } else {
            await interaction.reply("Không thể thêm contest vào lúc này!");
        }
    } catch (error) {
        console.log(error);
        
        await interaction.reply("Không thể thêm contest vào lúc này!");
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

export const joinContest = async (idContest: String | null, user: User, idTeam: String | null, password: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            const listIdTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
            if (listIdTeam) {
                if (listIdTeam.idTeam && idTeam && !listIdTeam?.idTeam.includes(idTeam)) {
                    return await interaction.reply("Bạn không tham gia team này!");
                }
                
                const teamContest = await ContestModel.findOne({ "teams.team.idTeam": idTeam });
                
                if (teamContest) {
                    return await interaction.reply("Team của bạn đã tham gia contest này rồi!");
                } else {
                    const team = await teamModel.findOne({ idTeam: listIdTeam.idTeam });

                    if ((contest.public == false) && (password !== contest.password)) {
                        return await interaction.reply("Mật khẩu của contest không đúng!");
                    }
                    const newTeam = {
                        team: {
                            idTeam: team?.idTeam,
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

                    const channel = interaction.guild?.channels.cache.get(contest.idChannel.toString()) as TextChannel;
                    
                    if (channel) {
                        if (team?.members) {
                            team?.members.forEach(async (member) => {
                                if (member.idUser) {
                                    const user = await interaction.guild?.members.fetch(member.idUser.toString());
                                    if (user) {
                                        await channel.permissionOverwrites.create(user.id, {
                                            ViewChannel: true, 
                                            SendMessages: true,
                                            ReadMessageHistory: true,
                                        });
                                    }
                                }
                            });
                        }
                    }
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

export const leaveContest = async (idContest: String | null, user: User, idteam: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        const contest = await ContestModel.findOne({ idContest });
        if (contest) {
            const listIdTeam = await playerModel.findOne({ idUser: user.id }).select("idTeam");
            if (listIdTeam) {
                if (listIdTeam.idTeam && idteam && !listIdTeam?.idTeam.includes(idteam)) {
                    return await interaction.reply("Bạn không tham gia team này!");
                }
                const teamContest = await ContestModel.findOne({ "teams.team.idTeam": idteam });
                if (teamContest) {
                    const channel = interaction.guild?.channels.cache.get(contest.idChannel.toString()) as TextChannel;
                    if (channel) {
                        if (teamContest.teams[0].team.members) {
                            teamContest.teams[0].team.members.forEach(async (member) => {
                                if (member.idUser) {
                                    const user = await interaction.guild?.members.fetch(member.idUser.toString());
                                    if (user) {
                                        await channel.permissionOverwrites.create(user.id, {
                                            ViewChannel: false,
                                            SendMessages: false,
                                            ReadMessageHistory: false
                                        });
                                    }
                                }
                            });
                        }
                    }
                    await ContestModel.findOneAndUpdate({ idContest }, {
                        $pull: {
                            teams: {
                                team: {
                                    idTeam: idteam
                                }
                            }
                        }
                    });
                    await interaction.reply("Rời contest thành công!");
                } else {
                    await interaction.reply("Bạn chưa tham gia contest này!");
                }
            } else {
                await interaction.reply("Bạn chưa tham gia team nào!");
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
            result += `${index + 1}. **ID:** ${contest.idContest}\n**Name:** ${contest.nameContest}\n**Description:** ${contest.description}\n**Status:** ${contest.status}\n**Start time:** ${contest.startTime}\n**End time:** ${contest.endTime}\n**URL:** ${contest.url}\n\n`;
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