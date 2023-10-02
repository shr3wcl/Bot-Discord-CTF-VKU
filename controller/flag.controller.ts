import { CacheType, ChatInputCommandInteraction, Interaction, User } from "discord.js";
import { Flags } from "../interface/model.interface";
import FlagModel from "../model/flag.model";
import scoreModel from "../model/score.model";
import playerModel from "../model/player.model";

export const saveFlag = async (
    idChall: String | null,
    nameAuthor: String | null,
    nameChall: String | null,
    point: Number | null,
    level: String | null,
    description: String | null,
    flag: String | null,
    mode: Boolean | null,
    interaction: ChatInputCommandInteraction<CacheType>) =>
{
    try {
        const newFlag = new FlagModel({ idChall, nameAuthor, nameChall, point, level, description, flag, mode });
        await newFlag.save();
        await interaction.reply("Thêm thành công!");
    } catch (error) {
        await interaction.reply("Không thể thêm flag vào lúc này!");
    }
}

export const checkFlag = async (flag: String | null, players: User, interaction: ChatInputCommandInteraction<CacheType>) => {
    const checkFlag = await FlagModel.findOne({ flag: flag });
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