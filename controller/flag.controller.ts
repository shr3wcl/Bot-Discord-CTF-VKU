import { CacheType, ChatInputCommandInteraction, Interaction, User } from "discord.js";
import { Contest, Flags } from "../interface/model.interface";
import FlagModel from "../model/flag.model";
import scoreModel from "../model/score.model";
import playerModel from "../model/player.model";
import { createEmbed } from "../feature/component";
import contestModel from "../model/contest.model";

export const saveFlag = async (
    idChall: String | null,
    nameAuthor: String | null,
    nameChall: String | null,
    point: Number | null,
    level: String | null,
    description: String | null,
    flag: String | null,
    mode: Boolean | null,
    url: String | null,
    category: String | null,
    interaction: ChatInputCommandInteraction<CacheType>) =>
{
    try {
        const newFlag = new FlagModel({ idChall, nameAuthor, nameChall, point, level, description, flag, mode, url, category });
        await newFlag.save();
        await interaction.reply("Thêm thành công!");
    } catch (error) {
        await interaction.reply("Không thể thêm flag vào lúc này!");
    }
}


export const checkFlag = async (flag: String | null, players: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const checkFlag = await FlagModel.findOne({ flag: flag, mode: true });
    if (checkFlag) {
        const checkSubmit = await scoreModel.findOne({ idUser: players.id, flag: flag });

        if (!checkSubmit) {
            const checkUser = await playerModel.findOne({ idUser: players.id });
            if (checkUser) {
                checkUser.point = (checkFlag.point?.valueOf() || 0) + (checkUser.point?.valueOf() || 0);
                checkUser.numberFlags = (checkUser.numberFlags?.valueOf() || 0) + 1;
                await checkUser.save();
            } else {
                const newUser = new playerModel({ idUser: players.id, nameUser: players.globalName, level: "💻 Newbie", point: checkFlag.point, numberFlags: 1 });
                await newUser.save();
            }
            await new scoreModel({ idChall: checkFlag.idChall, idUser: players.id, flag: flag }).save();
            return await interaction.reply(`Flag chính xác! \nChúc mừng @${players.tag}. Đừng chia sẻ cờ với ai nhé ^^`);
        } else {
            return await interaction.reply("Flag này đã được bạn submit rồi, hãy nộp flag của một challenge khác nhé!");
        }
    } else {
        await interaction.reply("Flag chưa chính xác, hãy thử lại!");
    }
}


export const getAllChallenge = async (admin: Boolean, category: String | null, idContest: String | null, password: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    let contest: Contest | null = null;
    if (idContest != null) {
        contest = await contestModel.findOne({ idContest: idContest });
        if (contest == null) {
            return await interaction.reply("Không tìm thấy contest này!");
        }

        // Testing
        const checkUser = contest.teams.find(team => team.team.members.find(member => member.idUser == interaction.user.id));
        if (!checkUser) {
            return await interaction.reply("Bạn không tham gia contest này!");
        }
    }
    
    let challenges: Array<Flags> = [];
    challenges = await FlagModel.find({
        mode: !admin,
        category: category ?? { $regex: /.*/ },
        idContest: idContest
    }, "idChall nameAuthor nameChall point level description mode url category");
        
    if (challenges.length == 0 && contest != null) {
        await interaction.reply(`Các challenge của contest ***${contest.nameContest}*** chưa được cập nhập hoặc public!`);
    }
    else {
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
}


export const deleteChallenge = async (admin: Boolean, idChallenge: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        await FlagModel.findOneAndDelete({ idChall: idChallenge });
        await interaction.reply("Admin đã xóa thử thách có id là " + idChallenge);
    } else {
        await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
    }
}

export const updateURLChall = async (admin: Boolean, idChallenge: String | null, url: String | null, status: Boolean | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        const challenge = await FlagModel.findOne({ idChall: idChallenge });

        if (challenge) {
            challenge.url = url;
            challenge.mode = status ? true : false;
            await challenge.save();
            await interaction.reply("Admin đã cập nhập thử thách có id: " + idChallenge);
        }
        else {
            await interaction.reply("Không tìm thấy thử thách có id: " + idChallenge + " để cập nhập");
        }
    } else {
        await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
    }
}


export const scoreBoard = async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const score = await playerModel.find({}, "idUser nameUser point numberFlags level").sort({ point: -1 });
    let infoScore = "";
    score.map((player, index) => {
        infoScore += `${index + 1}.  ***ID:*** ${player.idUser}***\n\tTên:*** ${player.nameUser}***\tĐiểm:*** ${player.point}***\tSố lượng cờ:*** ${player.numberFlags}***\tCấp độ:*** ${player.level}\n`;
    });
    const embed = createEmbed("Bảng xếp hạng", infoScore);
    await interaction.reply({ embeds: [embed] });
}