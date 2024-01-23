import { client } from "./config/config";
import { registerSlashCommand } from "./command/slash.deploy";
import { connectDB } from "./connect.db";
import ctfCommand from "./command/ctf.command";
import colors from 'colors';

require('dotenv').config();

try {
    connectDB();

    client.on("guildCreate", guild => {
        const idGuild = guild.id;
        registerSlashCommand(idGuild);
        console.log(colors.green(`[+] Bot joined guild: ${guild.name}, with ID: ${idGuild}`));
    })

    client.once('ready', () => {
        client.guilds.cache.forEach(guild => {
            registerSlashCommand(guild.id)
        });
        console.log(colors.green('[+] Bot is Ready!'));
    });

    ctfCommand.command(client);

    client.login(process.env.TOKEN_BOT).then((data: string) => console.log(colors.green("[+] Server is Connected!"))).catch((err: string) => { console.log(colors.red("[-] Cannot connect to server")); console.log(err); });
} catch (error) {
    console.log(colors.red("[-] Error: " + error));
}