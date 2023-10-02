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
        .addStringOption(option => option.setName('password').setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("rmchall").setDescription("Admin delete challenge")
        .addStringOption(option => option.setName("id").setDescription("Id challenge").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true)),
    new SlashCommandBuilder().setName("updatechall").setDescription("Admin update challenge")
        .addStringOption(option => option.setName("id").setDescription("ID challenge").setRequired(true))
        .addStringOption(option => option.setName("url").setDescription("Url challenge").setRequired(true))
        .addStringOption(option => option.setName("password").setDescription("Admin password").setRequired(true))
    
].map(command => command.toJSON());

const UserCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [
    new SlashCommandBuilder().setName("infohacker").setDescription("Check hacker information!")
        .addUserOption(option => option.setName("hacker").setDescription("Select hacker to view")),
    new SlashCommandBuilder().setName("update").setDescription("Admin update system!"),
].map(command => command.toJSON());

export const registerSlashCommand = (guildId: string) => {
    rest.put(Routes.applicationGuildCommands(appID, guildId), { body: serverCommands.concat(UserCommands) })
        .then(() => console.log(colors.green(`[+] Successfully registered ${serverCommands.length} application commands.`)))
        .catch(error => {
            console.log(colors.yellow("[!] There was a problem trying to register the command"));
            console.log(error);
        });
}