import { CacheType, Client, GuildMember, Interaction } from "discord.js"
import { checkFlag, getAllChallenge, saveFlag } from "../controller/flag.controller";
import { getInfoHacker } from "../controller/player.controller";

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
                case "chall":
                    const password = options.getString("password");
                    if (password == adminPassword) {
                        await saveFlag(options.getString("id"),
                            options.getString("author"),
                            options.getString("chall"),
                            options.getNumber("point"),
                            options.getString("level"),
                            options.getString("description"),
                            options.getString("flag"),
                            options.getBoolean("public"),
                            interaction
                        );
                    } else {
                        await interaction.reply("[!] Bạn không phải là admin để thực hiện tính năng này!!");
                    }
                    break;
                case "infohacker":
                    const hacker = options.getUser("hacker");
                    await getInfoHacker(hacker ?? user, interaction);
                    break;
                case "listchall":
                    await getAllChallenge(options.getString("password") == adminPassword, interaction);
                    break;
            }
        })
    } 
}

export default CTFCommand;