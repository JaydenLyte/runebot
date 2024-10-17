import { sendWithTimeout } from '../../util/helper.js';
import { getPlayerEmbed } from '../../util/skills.js';

import { getUser, removeUser } from '../../util/tracker.js';

export const data = {
	name: 'whoami',
	description: 'Provides information about the runescape player associated with your discord account.',
	"integration_types": [1],
	"contexts": [0, 1, 2]
};
export async function execute(interaction) {
	await interaction.deferReply();
	// Get user id;
	const user = getUser(interaction.user.id);
	if (!user) {
		await interaction.deleteReply();
		sendWithTimeout(
			interaction,
			{
				content:
					'You don\'t have a profile set up. Please use `/iam <name>` to set up a profile.',
			},
			0.25,
			false,
		);
		return;
	}

	const embed = await getPlayerEmbed(user.name, true);
	if (!embed) {
		await interaction.deleteReply();
		sendWithTimeout(
			interaction,
			{
				content:
					'The username `' +
					user.name +
					'` is no longer valid. Please use `/iam <name>` to set up a valid profile.',
			},
			0.25,
			false,
		);
		removeUser(interaction.user.id);
		return;
	}
	sendWithTimeout(interaction, { embeds: [embed] }, 2, true);
};
