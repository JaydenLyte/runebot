import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import { getJson, sendWithTimeout, parseOG } from '../../util/helper.js';

async function getWikiJson(query) {
	const json = await getJson(
		`https://runescape.wiki/api.php?action=query&list=search&format=json&srsearch=${query}`,
	);
	return json.query.search;
}

const getTime = () => {
	const now = new Date();
	return new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		now.getMinutes() + 5,
		0,
	);
};

const createEmbed = async (pageid) => {
	const og = await parseOG(`https://runescape.wiki/?curid=${pageid}`);
	const embed = new EmbedBuilder()
		.setColor(0x32cd32)
		.setTitle(og.title)
		.setURL(og.url)
		.setThumbnail(og.images[0].url)
		.setDescription(og.description)
		.setFooter({
			text: 'Message will be removed',
			iconURL: 'https://runescape.wiki/images/Wiki.png',
		})
		.setTimestamp(getTime());
	return embed;
};

const getFields = (searchList, index) => {
	const fields = [];
	for (let i = 0; i < searchList.length; i++) {
		if (i != index) {
			fields.push({
				name: i + 1 + '',
				value: searchList[i].title,
				inline: true,
			});
		}
	}
	return fields;
};
const createEmbedList = async (searchList, index) => {
	const og = await parseOG(
		`https://runescape.wiki/?curid=${searchList[index].pageid}`,
	);
	const embed = new EmbedBuilder()
		.setColor(0x800080)
		.setTitle(og.ogTitle)
		.setAuthor({ name: 'Choose an option' })
		.setURL(og.ogUrl)
		.setThumbnail(og.ogImage[0].url)
		.setDescription(og.ogDescription)
		.addFields({ name: '\u200b', value: '\u200b', inline: false })
		.addFields(getFields(searchList, index))
		.addFields({ name: '\u200b', value: '\u200b', inline: false })
		.setFooter({
			text: `Current Option: ${index + 1} - ${searchList[index].title}`,
		});
	return embed;
};

const buildButtons = (size, index) => {
	const row1 = new ActionRowBuilder(),
		row2 = new ActionRowBuilder();

	for (let i = 0; i < size; i++) {
		const button = new ButtonBuilder()
			.setCustomId(i + '')
			.setStyle(i === index ? ButtonStyle.Primary : ButtonStyle.Secondary)
			.setDisabled(i === index)
			.setLabel(i + 1 + '');
		if (i < 5) {
			row1.addComponents(button);
		}
		else {
			row2.addComponents(button);
		}
	}

	return [row1, row2];
};

export const data = {
	name: 'wiki',
	description: 'Searches the RuneScape Wiki for a query',
	"integration_types": [1],
	"contexts": [0, 1, 2],
	options: [
		{
			name: 'query',
			description: 'The query to search for',
			type: 3,
			required: true,
		},
	]
}

export async function execute(interaction) {
	await interaction.deferReply({ ephemeral: true });
	const query = interaction.options.getString('query');
	if (!query) {
		sendWithTimeout(
			interaction,
			{ content: 'Please provide a query to search for', ephemeral: true },
			1,
			true,
		);
		return;
	}
	const searchList = await getWikiJson(query);
	if (!searchList || searchList.length === 0) {
		sendWithTimeout(
			interaction,
			{ content: 'No results found', ephemeral: true },
			1,
			true,
		);
		return;
	}
	if (
		searchList[0].title.toLowerCase() === query.toLowerCase() ||
		searchList.length === 1
	) {
		// Delete original message
		interaction.deleteReply();
		// Send new message with set reply
		sendWithTimeout(
			interaction,
			{ embeds: [await createEmbed(searchList[0].pageid)] },
			5,
			false,
		);
	}
	else {
		// Send embed list
		let [row1, row2] = buildButtons(searchList.length, 0);
		const response = await interaction.editReply({
			embeds: [await createEmbedList(searchList, 0)],
			components: [
				row1,
				row2,
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('a')
						.setLabel('✅')
						.setStyle(ButtonStyle.Success),
				),
			],
		});

		// Create collector
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000,
		});

		let currentId = 0;
		collector.on('collect', async (i) => {
			if (i.customId === 'a') {
				// Delete original message
				await interaction.deleteReply();
				// Send new message with set reply
				sendWithTimeout(
					interaction,
					{ embeds: [await createEmbed(searchList[currentId].pageid)] },
					5,
					false,
				);
				return;
			}
			currentId = parseInt(i.customId);
			[row1, row2] = buildButtons(searchList.length, currentId);
			await i.update({
				embeds: [await createEmbedList(searchList, currentId)],
				components: [
					row1,
					row2,
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('a')
							.setLabel('✅')
							.setStyle(ButtonStyle.Success),
					),
				],
			});
		});
	}
};

