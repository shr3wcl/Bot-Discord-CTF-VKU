import { CacheType, ChatInputCommandInteraction, Interaction, User } from "discord.js";
import { Contest, Flags } from "../interface/model.interface";
import FlagModel from "../model/flag.model";
import scoreModel from "../model/score.model";
import playerModel from "../model/player.model";
import { createEmbed } from "../feature/component";
import contestModel from "../model/contest.model";

export const saveFlag = async (
    idChall: string | null,
    nameAuthor: string | null,
    nameChall: string | null,
    point: number | null,
    level: string | null,
    description: string | null,
    flag: string | null,
    mode: boolean | null,
    url: string | null,
    category: string | null,
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    try {
        if (!idChall || !nameAuthor || !nameChall || !point || !level || !description || !flag || !mode || !url || !category) {
            throw new Error("Invalid input data");
        }

        const newFlag = new FlagModel({ idChall, nameAuthor, nameChall, point, level, description, flag, mode, url, category });
        await newFlag.save();
        await interaction.reply("Thêm thành công!");
    } catch (error) {
        console.error(error);
        await interaction.reply("Không thể thêm flag vào lúc này!");
    }
}



export const checkFlag = async (flag: string | null, player: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        if (!flag) {
            throw new Error("Flag không hợp lệ");
        }

        const checkedFlag = await FlagModel.findOne({ flag: flag, mode: true });

        if (!checkedFlag) {
            return await interaction.reply("Flag không chính xác, hãy thử lại!");
        }

        const submittedFlag = await scoreModel.findOne({ idUser: player.id, flag: flag });

        if (submittedFlag) {
            return await interaction.reply("Flag này đã được bạn submit rồi, hãy nộp flag của một challenge khác nhé!");
        }

        const user = await playerModel.findOne({ idUser: player.id });

        if (user) {
            user.point = (checkedFlag.point?.valueOf() || 0) + (user.point?.valueOf() || 0);
            user.numberFlags = (user.numberFlags?.valueOf() || 0) + 1;
            await user.save();
        } else {
            const newUser = new playerModel({ idUser: player.id, nameUser: player.tag, level: "💻 Newbie", point: checkedFlag.point, numberFlags: 1 });
            await newUser.save();
        }

        await new scoreModel({ idChall: checkedFlag.idChall, idUser: player.id, flag: flag }).save();

        return await interaction.reply(`Flag chính xác! \nChúc mừng @${player.tag}. Đừng chia sẻ cờ với ai nhé ^^`);
    } catch (error) {
        console.error(error);
        return await interaction.reply("Có lỗi xảy ra khi kiểm tra flag!");
    }
}



export const getAllChallenge = async (admin: boolean, category: string | null, idContest: string | null, password: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        let contest: Contest | null = null;

        if (idContest) {
            contest = await contestModel.findOne({ idContest });

            if (!contest) {
                return await interaction.reply("Không tìm thấy contest này!");
            }

            const checkUser = contest.teams.some(team => team.team.members.some(member => member.idUser === interaction.user.id));
            if (!checkUser) {
                return await interaction.reply("Bạn không tham gia contest này!");
            }
        }

        let query: any = { mode: !admin };
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        if (idContest) {
            query.idContest = idContest;
        }

        const challenges: Flags[] = await FlagModel.find(query, "idChall nameAuthor nameChall point level description mode url category");

        if (challenges.length === 0 && contest) {
            await interaction.reply(`Các challenge của contest ***${contest.nameContest}*** chưa được cập nhập hoặc public!`);
        } else {
            let infoChallenges = "";
            challenges.forEach((challenge: Flags, index: number) => {
                infoChallenges += `${index + 1}. ***Tên thử thách:*** ${challenge.nameChall}
                ***\n\tID:*** ${challenge.idChall}
                ***\n\tTác giả:*** ${challenge.nameAuthor}
                ***\n\tLoại:*** ${challenge.category}
                ***\n\tMô tả:*** ${challenge.description}
                ***\n\tĐiểm:*** ${challenge.point}
                ***\n\tĐộ khó:*** ${challenge.level}
                ***\n\tLink thử thách:*** ${challenge.url}\n`;

                if (admin) {
                    infoChallenges += `***\n\tTrạng thái:*** ${challenge.mode ? "Public" : "Private"}\tID Challenge:*** ${challenge.idChall}\n ***\n\tID Contest:*** ${challenge.idContest ?? "Không"}\n`;
                }
            });

            const embed = createEmbed(`Danh sách thử thách${category ? ` thuộc loại ${category}` : ""}`, infoChallenges);
            await interaction.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra khi lấy danh sách thử thách!");
    }
}



export const deleteChallenge = async (admin: boolean, idChallenge: string | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        if (admin) {
            const deletedChallenge = await FlagModel.findOneAndDelete({ idChall: idChallenge });
            if (deletedChallenge) {
                await interaction.reply("Admin đã xóa thử thách có id là " + idChallenge);
            } else {
                await interaction.reply("Không tìm thấy thử thách có id là " + idChallenge);
            }
        } else {
            await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
        }
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra khi xóa thử thách!");
    }
}


export const updateURLChall = async (admin: boolean, idChallenge: string | null, url: string | null, status: boolean | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    try {
        if (admin) {
            const challenge = await FlagModel.findOne({ idChall: idChallenge });

            if (challenge) {
                if (url) {
                    challenge.url = url;
                }
                if (status !== null) {
                    challenge.mode = status;
                }
                await challenge.save();
                await interaction.reply("Admin đã cập nhật thử thách có id: " + idChallenge);
            } else {
                await interaction.reply("Không tìm thấy thử thách có id: " + idChallenge + " để cập nhật");
            }
        } else {
            await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
        }
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra khi cập nhật thử thách!");
    }
}



export const scoreBoard = async (interaction: ChatInputCommandInteraction<CacheType>, page: number = 1, pageSize: number = 10) => {
    try {
        const offset = (page - 1) * pageSize;
        const score = await playerModel.find({}, "idUser nameUser point numberFlags level")
            .sort({ point: -1 })
            .skip(offset)
            .limit(pageSize);

        if (score.length === 0) {
            await interaction.reply("Không có thông tin bảng xếp hạng.");
            return;
        }

        let infoScore = "";
        score.forEach((player, index) => {
            const rank = index + offset + 1;
            infoScore += `${rank}.  ***ID:*** ${player.idUser}***\n\tTên:*** ${player.nameUser}***\tĐiểm:*** ${player.point}***\tSố lượng cờ:*** ${player.numberFlags}***\tCấp độ:*** ${player.level}\n`;
        });

        const embed = createEmbed("Bảng xếp hạng", infoScore);
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.reply("Có lỗi xảy ra khi tải thông tin bảng xếp hạng.");
    }
}
