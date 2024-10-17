import { SlashCommandBuilder } from 'discord.js';
import { sendWithTimeout } from '../../util/helper.js';
import { getPlayerEmbed } from '../../util/skills.js';
// TODO: whois rocks broke this

export const data = {
	name: 'whois',
	description: 'Provides information about a runescape player.',
	"integration_types": [1],
	"contexts": [0, 1, 2],
	options: [
		{
			name: 'name',
			description: 'The player to search for',
			type: 3,
			required: true,
		},
	],
};

export async function execute(interaction) {
	await interaction.deferReply();
	const name = interaction.options.getString('name');
	if (!name) {
		await interaction.deleteReply();
		sendWithTimeout(
			interaction,
			{ content: 'Please provide a name to search for' },
			0.25,
			false,
		);
		return;
	}
	const embed = await getPlayerEmbed(name, false);
	if (!embed) {
		await interaction.deleteReply();
		sendWithTimeout(
			interaction,
			{ content: 'No profile with the name `' + name + '` was found.' },
			0.25,
			false,
		);
		return;
	}
	sendWithTimeout(interaction, { embeds: [embed] }, 2, true);
};