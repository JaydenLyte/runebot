import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.token;
const clientId = process.env.cliendId;


// Grab all the command folders from the commands directory you created earlier
const foldersPath = './commands';
const commandFolders = readdirSync(foldersPath);

async function genCommands() {
	const commands = [];
	for (const folder of commandFolders) {

		// Grab all the command files from the commands directory you created earlier
		const commandsPath = join(foldersPath, folder);
		const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
		for (const file of commandFiles) {
			const filePath = join(commandsPath, file);
			const command = await import(`#home/${filePath}`);
			if ('data' in command && 'execute' in command) {
	
				if (command.data instanceof SlashCommandBuilder) {
					commands.push(command.data.toJSON());
				} else {
					commands.push(command.data);
				}
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
	return commands;
}


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {

		let commands = await genCommands();
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
