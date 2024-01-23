import { CacheType, Client, GuildMember, Interaction } from "discord.js"
import { checkFlag, deleteChallenge, getAllChallenge, saveFlag, scoreBoard, updateURLChall } from "../controller/flag.controller";
import { createTeam, getInfoHacker, leaveTeam, listParticipatedContest, updateLevelAllUser } from "../controller/player.controller";
import { addChallengeContest, createContest, joinContest, leaveContest, listContests, scoreBoardContest } from "../controller/contest.controller";
import { joinTeam } from "../controller/player.controller";
import { createEmbed } from "../feature/component";

const adminPassword = process.env.ADMIN_PASSWORD;

const CTFCommand = {
    command: (bot: Client) => {
        bot.on("interactionCreate", async (interaction: Interaction<CacheType>) => {
            if (!interaction.isChatInputCommand()) return;

            const { commandName, user, options } = interaction;


            switch (commandName) {
                case "ping":
                    await interaction.reply("Pong !!!");
                    break;
                case "flag":
                    await checkFlag(options.getString("flag"), user, interaction);
                    break;
                case "challenge":
                    const idChall = Math.random().toString(36).substring(2, 10);
                    const password = options.getString("password");
                    if (password === adminPassword) {
                        await saveFlag(idChall,
                            options.getString("author"),
                            options.getString("chall"),
                            options.getNumber("point"),
                            options.getString("level"),
                            options.getString("description"),
                            options.getString("flag"),
                            options.getBoolean("public"),
                            options.getString("url"),
                            options.getString("category"),
                            interaction
                        );
                        if (options.getString("idContest")) {
                            await addChallengeContest(options.getString("idcontest"), options.getString("id"), interaction);   
                        }
                    } else {
                        await interaction.reply("[!] Bạn không phải là admin để thực hiện tính năng này!!");
                    }
                    break;
                case "infohacker":
                    const hacker = options.getUser("hacker");
                    await getInfoHacker(hacker ?? user, interaction);
                    break;
                case "listchall":
                    await getAllChallenge(options.getString("password") == adminPassword, options.getString("category"), options.getString("idcontest"), options.getString("passwordcontest"), interaction);
                    break;
                case "rmchall":
                    await deleteChallenge(options.getString("password") == adminPassword,
                        options.getString("id"), interaction);
                    break;
                case "updatechall":
                    await updateURLChall(options.getString("password") == adminPassword,
                        options.getString("id"), options.getString("url"), options.getBoolean("status"), interaction);
                    break;
                case "update":
                    await updateLevelAllUser(options.getString("password") == adminPassword, interaction);
                    break;
                case "scoreboard":
                    await scoreBoard(interaction);
                    break;
                case "createcontest":
                    const idContest = Math.random().toString(36).substring(2, 10);
                    await createContest(idContest,
                        options.getString("name"),
                        options.getString("description"),
                        options.getString("status"),
                        options.getString("start"),
                        options.getString("endt"),
                        options.getBoolean("public"),
                        options.getString("passwordcontest"),
                        options.getString("url"),
                        interaction);
                    break;
                case "leavecontest":
                    await leaveContest(options.getString("id"), user, options.getString("idteam"), interaction);
                    break;
                case "listcontest":
                    await listContests(interaction);
                    break;
                case "joincontest":
                    await joinContest(options.getString("id"),
                        user,
                        options.getString("idteam"),
                        options.getString("password"),
                        interaction
                    );
                    break;
                case "scoreboardcontest":
                    await scoreBoardContest(options.getString("id"), interaction);
                    break;
                case "jointeam":
                    await joinTeam(user, options.getString("idteam"), interaction);
                    break;
                case "createteam":
                    const nameTeam = options.getString("name");
                    if (nameTeam) {
                        await createTeam(user, nameTeam, options.getString("description") ?? "", interaction);
                    } else {
                        await interaction.reply("Bạn chưa nhập tên team!");
                    }
                    break;
                case "leaveteam":
                    await leaveTeam(user, options.getString("idteam"), interaction);
                    break;
                case "contest":
                    await listParticipatedContest(user, interaction);
                    break;
                case "help":
                    const embed = createEmbed("Help", "```" +
                        "***Feature:***\n" +
                        "1. /ping: Kiểm tra bot có hoạt động hay không\n" +
                        "2. /flag: Kiểm tra flag\n" +
                        "3. /infohacker: Xem thông tin hacker\n" +
                        "4. /listchall: Xem danh sách thử thách\n" +
                        "5. /rmchall: Xóa thử thách\n" +
                        "6. /updatechall: Cập nhật thử thách\n" +
                        "7. /update: Cập nhật level cho tất cả người chơi\n" +
                        "8. /scoreboard: Xem bảng xếp hạng\n" +
                        "9. /createcontest: Tạo contest\n" +
                        "10. /leavecontest: Rời contest\n" +
                        "11. /listcontest: Xem danh sách contest\n" +
                        "12. /joincontest: Tham gia contest\n" +
                        "13. /scoreboardcontest: Xem bảng xếp hạng contest\n" +
                        "14. /jointeam: Tham gia team\n" +
                        "15. /createteam: Tạo team\n" +
                        "16. /leaveteam: Rời team\n" +
                        "```");
                    await interaction.reply({ embeds: [embed] });
                    break;
            }
        })
    } 
}

export default CTFCommand;