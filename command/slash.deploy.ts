import { SlashCommandBuilder, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody, APIApplicationCommandOptionChoice } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();

const token = process.env.TOKEN_BOT ?? "", appID = process.env.APPLICATION_ID ?? "", guildID = process.env.guildID ?? "";

const rest = new REST({ version: '10' }).setToken(token);


const serverCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [
    new SlashCommandBuilder().setName("ping").setDescription("Check bot!"),
    new SlashCommandBuilder().setName("flag").setDescription("Check flag!")
        .addStringOption(option => option.setName('flag').setDescription("Check your flag").setRequired(true)),
    new SlashCommandBuilder().setName("listchall").setDescription("View all challenge (Normal or admin)")
        .addStringOption(option => option.setName("category").addChoices(
            { name: 'Binary Exploitation', value: 'Binary Exploitation' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Cryptography', value: 'Cryptography' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Forensics', value: 'Forensics' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Miscellaneous', value: 'Miscellaneous' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Reverse Engineering', value: 'Reverse Engineering' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Web Exploitation', value: 'Web Exploitation' } as APIApplicationCommandOptionChoice<string>,
        ).setDescription("Type category"))
        .addStringOption(option => option.setName("idcontest").setDescription("Type contest ID (No if not)"))
        .addStringOption(option => option.setName("passwordcontest").setDescription("Type contest password (No if not)"))
        .addStringOption(option => option.setName("password").setDescription("Type password to verify")),
    new SlashCommandBuilder().setName("challenge").setDescription("Add new flag!")
        .addStringOption(option => option.setName('id').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('author').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('chall').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('level').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('description').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('flag').setDescription("Add new flag!").setRequired(true))
        .addBooleanOption(option => option.setName('public').setDescription("Add new flag!").setRequired(true))
        .addNumberOption(option => option.setName('point').setDescription("Add new flag!").setRequired(true))
        .addStringOption(option => option.setName('category').setDescription("Add category").addChoices(
            { name: 'Binary Exploitation', value: 'Binary Exploitation' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Cryptography', value: 'Cryptography' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Forensics', value: 'Forensics' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Miscellaneous', value: 'Miscellaneous' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Reverse Engineering', value: 'Reverse Engineering' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Web Exploitation', value: 'Web Exploitation' } as APIApplicationCommandOptionChoice<string>,
        ).setRequired(true))
        .addStringOption(option => option.setName('password').setDescription("Admin password").setRequired(true))
        .addStringOption(option => option.setName('url').setDescription("Add category"))
        .addStringOption(option => option.setName('idcontest').setDescription("Contest Challenge (No if not)")),
    new SlashCommandBuilder().setName("rmchall").setDescription("Admin delete challenge")
        .addStringOption(option => option.setName("id").setDescription("Id challenge").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("updatechall").setDescription("Admin update challenge")
        .addStringOption(option => option.setName("id").setDescription("ID challenge").setRequired(true))
        .addStringOption(option => option.setName("url").setDescription("Url challenge").setRequired(true))
        .addBooleanOption(option => option.setName("status").setDescription("Status challenge").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("createcontest").setDescription("Admin create contest")
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true))
        .addStringOption(option => option.setName("name").setDescription("Contest name").setRequired(true))
        .addStringOption(option => option.setName("description").setDescription("Contest description").setRequired(true))
        .addStringOption(option => option.setName("start").setDescription("Contest start time").setRequired(true))
        .addStringOption(option => option.setName("endt").setDescription("Contest end time").setRequired(true))
        .addStringOption(option => option.setName("status").addChoices(
            { name: "Coming", value: 'Coming' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Running', value: 'Running' } as APIApplicationCommandOptionChoice<string>,
            { name: 'Ended', value: 'Ended' } as APIApplicationCommandOptionChoice<string>,
        ).setDescription("Contest status").setRequired(true))
        .addBooleanOption(option => option.setName("public").setDescription("Contest public").setRequired(true))
        .addStringOption(option => option.setName("passwordcontest").setDescription("Contest password (Pass it if contest is public)"))
        .addStringOption(option => option.setName("url").setDescription("Contest url")),
    new SlashCommandBuilder().setName("listcontest").setDescription("View all contest (Normal or admin)")
        .addStringOption(option => option.setName("password").setDescription("Type password to verify")),
    new SlashCommandBuilder().setName("rmcontest").setDescription("Admin delete contest")
        .addStringOption(option => option.setName("id").setDescription("Id contest").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("updatecontest").setDescription("Admin update contest")
        .addStringOption(option => option.setName("id").setDescription("ID contest").setRequired(true))
        .addStringOption(option => option.setName("name").setDescription("Contest name").setRequired(true))
        .addStringOption(option => option.setName("description").setDescription("Contest description").setRequired(true))
        .addStringOption(option => option.setName("start").setDescription("Contest start time").setRequired(true))
        .addStringOption(option => option.setName("endt").setDescription("Contest end time").setRequired(true))
        .addBooleanOption(option => option.setName("status").setDescription("Contest status").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("infocontest").setDescription("View contest information!")
        .addStringOption(option => option.setName("id").setDescription("Contest ID").setRequired(true)),
    new SlashCommandBuilder().setName("joincontest").setDescription("Join contest!")
        .addStringOption(option => option.setName("id").setDescription("Contest ID").setRequired(true))
        .addStringOption(option => option.setName("idteam").setDescription("Team ID").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Contest password (Pass it if contest is public)")),
    new SlashCommandBuilder().setName("leavecontest").setDescription("Leave contest!")
        .addStringOption(option => option.setName("id").setDescription("Contest ID").setRequired(true))
        .addStringOption(option => option.setName("idteam").setDescription("Team ID").setRequired(true)),
    new SlashCommandBuilder().setName("help").setDescription("View help!"),
    new SlashCommandBuilder().setName("scoreboardcontest").setDescription("View scoreboard contest!")
        .addStringOption(option => option.setName("id").setDescription("Contest ID").setRequired(true)),
    
    
].map(command => command.toJSON());

const UserCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [
    new SlashCommandBuilder().setName("infohacker").setDescription("Check hacker information!")
        .addUserOption(option => option.setName("hacker").setDescription("Select hacker to view")),
    new SlashCommandBuilder().setName("update").setDescription("Admin update system!")
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("scoreboard").setDescription("View scoreboard!"),
    new SlashCommandBuilder().setName("jointeam").setDescription("Join team!")
        .addStringOption(option => option.setName("idteam").setDescription("Team ID").setRequired(true)),
    new SlashCommandBuilder().setName("createteam").setDescription("Create team!")
        .addStringOption(option => option.setName("name").setDescription("Team name").setRequired(true))
        .addStringOption(option => option.setName("description").setDescription("Team description").setRequired(true)),
    new SlashCommandBuilder().setName("leaveteam").setDescription("Leave team!")
        .addStringOption(option => option.setName("idteam").setDescription("Team ID").setRequired(true)),
    new SlashCommandBuilder().setName("contest").setDescription("View participating competitions!"),
    
].map(command => command.toJSON());

export const registerSlashCommand = (guildId: string) => {
    rest.put(Routes.applicationGuildCommands(appID, guildId), { body: serverCommands.concat(UserCommands) })
        .then(() => console.log(colors.green(`[+] Successfully registered ${serverCommands.length} application commands.`)))
        .catch(error => {
            console.log(colors.yellow("[!] There was a problem trying to register the command"));
            console.log(error);
            throw new Error("Error when register command");
        });
}
