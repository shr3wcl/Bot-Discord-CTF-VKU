import { CacheType, ChatInputCommandInteraction, Interaction, User } from "discord.js";
import { Flags } from "../interface/model.interface";
import FlagModel from "../model/flag.model";
import scoreModel from "../model/score.model";
import playerModel from "../model/player.model";
import { createEmbed } from "../feature/component";

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
    interaction: ChatInputCommandInteraction<CacheType>) =>
{
    try {
        const newFlag = new FlagModel({ idChall, nameAuthor, nameChall, point, level, description, flag, mode, url });
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
                const newUser = new playerModel({ idUser: players.id, nameUser: players.globalName, level: "Newbie", point: checkFlag.point, numberFlags: 1 });
                await newUser.save();
            }
            await new scoreModel({ idChall: checkFlag.idChall, idUser: players.id, flag: flag }).save();
            return await interaction.reply(`Flag chính xác! \nChúc mừng @${players.tag}. Đừng chia sẻ cờ với ai nhé ^^`);
        } else {
            return await interaction.reply("Bạn đã nộp flag này rồi, hãy nộp flag của một challenge khác nhé!");
        }
    } else {
        await interaction.reply("Flag chưa chính xác, hãy thử lại!");
    }
}


export const getAllChallenge = async (admin: Boolean, interaction: ChatInputCommandInteraction<CacheType>) => {
    let challenges;
    if (admin) {
        challenges = await FlagModel.find({}, "idChall nameAuthor nameChall point level description mode url");
    } else {
        challenges = await FlagModel.find({ mode: true }, "idChall nameAuthor nameChall point level description mode url");
    }
    let infoChallenges = "";
    challenges.map((challenge: Flags) => {
        infoChallenges += challenge.idChall + ". ***Tên thử thách:*** " + challenge.nameChall +
            "***\n\tTác giả:*** " + challenge.nameAuthor +
            "***\n\tMô tả:*** " + challenge.description +
            "***\n\tĐiểm:*** " + challenge.point +
            "***\n\tĐộ khó:*** " + challenge.level +
            "***\n\tTrạng thái:*** " + (challenge.mode ? "Public" : "Private") +
            "***\n\tLink thử thách:*** " + challenge.url + "\n";
        if (admin) {
            infoChallenges += "***\tID Challenge:*** " + challenge.idChall + "\n";
        }
    });
    const embed = createEmbed("Danh sách thử thách", infoChallenges);
    await interaction.reply({ embeds: [embed] });
}


export const deleteChallenge = async (admin: Boolean, idChallenge: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        await FlagModel.findOneAndDelete({ idChall: idChallenge });
        await interaction.reply("Admin đã xóa thử thách có id là " + idChallenge);
    } else {
        await interaction.reply("Bạn không phải là admin để thực hiện chức năng này!");
    }
}

export const updateURLChall = async (admin: Boolean, idChallenge: String | null, url: String | null, interaction: ChatInputCommandInteraction<CacheType>) => {
    if (admin) {
        const challenge = await FlagModel.findOne({ idChall: idChallenge });

        if (challenge) {
            challenge.url = url;
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