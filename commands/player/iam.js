import { getPlayerEmbed } from '../../util/skills.js';
import { sendWithTimeout } from '../../util/helper.js';
import { addUser } from '../../util/tracker.js';
// failsafe to ensure that the user only assigns to a new profile

export const data = {
	name: 'iam',
	description: 'Allows a user to assign a Runescape 3 profile to their discord account.',
	"integration_types": [1],
	"contexts": [0, 1, 2],
	options: [
		{
			name: 'name',
			description: 'The RuneScape name of the player profile',
			type: 3,
			required: true,
		},
	],
};

export async function execute(interaction) {
	await interaction.deferReply();
	const name = interaction.options.getString('name');
	if (!name) {
		sendWithTimeout(
			interaction,
			{ content: 'Please provide a valid name' },
			0.5,
			true,
		);
		return;
	}
	const embed = await getPlayerEmbed(name, true);
	if (!embed) {
		await interaction.deleteReply();
		sendWithTimeout(
			interaction,
			{ content: 'No valid profile with the name `' + name + '` was found.' },
			0.5,
			true,
		);
		return;
	}
	sendWithTimeout(
		interaction,
		{
			content:
				`<@${interaction.user.id}>` +
				' has been assigned a profile with the name `' +
				name +
				'`.',
			embeds: [embed],
		},
		0.5,
		true,
	);
	addUser(interaction.user.id, name);
};
