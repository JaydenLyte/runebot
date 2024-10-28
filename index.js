import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { initUsers } from './util/tracker.js';
import { initQuests } from './util/quests.js';

import dotenv from 'dotenv';
dotenv.config();


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();


async function registerCommands() {
	const foldersPath = './commands';
	const commandFolders = readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandsPath = join(foldersPath, folder);
		const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = join(commandsPath, file);
			const command = await import(`#home/${filePath}`);
			// Set a new item in the Collection with the key as the command name and the value as the exported module
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

registerCommands();

// Load users
initUsers();

// Load quests
initQuests();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.token);


export { client as getClient };