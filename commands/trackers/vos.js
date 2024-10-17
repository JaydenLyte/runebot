import { EmbedBuilder } from 'discord.js';
import { getJson, sendWithTimeout } from '../../util/helper.js';

class Clan {
	constructor(icon, name, link, color, buffs) {
		this.icon = icon;
		this.name = name;
		this.link = link;
		this.color = color;
		this.buffs = buffs;
	}
}

const clans = [
	new Clan(
		'https://runescape.wiki/images/Amlodd_Clan.png',
		'Amlodd',
		'https://runescape.wiki/w/Amlodd_Clan',
		0x005eff,
		'- 20% extra base experience from pickpocketing Amlodd workers.\n- An increased chance to find golden rocks in the Amlodd Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Amlodd Clan (this can happen multiple times during the illumination).\n- 20% more base Summoning XP from making pouches and scrolls, as well as creating 20% more scrolls per pouch (12 for normal pouches and 24 total for a binding contract).\n- 20% more base Divination XP from converting shadow cores, as well as a chance to spawn a chronicle fragment upon killing a truthful, blissful, or manifest shadow.',
	),
	new Clan(
		'https://runescape.wiki/images/Cadarn_Clan.png',
		'Cadarn',
		'https://runescape.wiki/w/Cadarn_Clan',
		0x02b41f,
		'- 20% extra base experience from pickpocketing Cadarn workers.\n- An increased chance to find golden rocks in the Cadarn Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Cadarn Clan (this can happen multiple times during the illumination).\n- Upon defeating a Cadarn ranger or magus, 200 Ranged or Magic experience is gained respectively regardless of the combat style used.',
	),
	new Clan(
		'https://runescape.wiki/images/Crwys_Clan.png',
		'Crwys',
		'https://runescape.wiki/w/Crwys_Clan',
		0xf6f800,
		'- 20% extra base experience from pickpocketing Crwys workers.\n- An increased chance to find golden rocks in the Crwys Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Crwys Clan (this can happen multiple times during the illumination).\n- 20% more base Woodcutting XP from cutting ivy, magic logs, and yew logs. All bird\'s nest drops are replaced with crystal geode, though this does not require 94 woodcutting.\n- 20% more base Farming XP from planting, checking, and harvesting from the bush, herb and elder tree patches. Crops in the district also have a chance of skipping growth stages.\n- A chance to spawn a Guthixian butterfly when harvesting from or checking the health of crops in the district.',
	),
	new Clan(
		'https://runescape.wiki/images/Hefin_Clan.png',
		'Hefin',
		'https://runescape.wiki/w/Hefin_Clan',
		0x4e000d,
		'- 20% extra base experience from pickpocketing Hefin workers.\n- An increased chance to find golden rocks in the Hefin Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Hefin Clan (this can happen multiple times during the illumination).\n- 20% more base Agility XP whilst training agility on the Hefin Agility Course. The rate at which velocity is gained on the agility course is doubled.\n- While doing laps on the Hefin Agility Course, an additional 25% of base Agility experience is gained in the Prayer skill for each action performed. Experience boosts, such as bonus experience and the first age set do work. Hefin course multipliers also grant additional Prayer XP.\n- The collector\'s insignia will not lose charge and won\'t stack with the Voice.\n- 20% more base Prayer XP from cleansing the Corrupted Seren Stone.\n- Increased chance of the window and light creature shortcuts appearing on the Hefin Agility Course.',
	),
	new Clan(
		'https://runescape.wiki/images/Iorwerth_Clan.png',
		'Iorwerth',
		'https://runescape.wiki/w/Iorwerth_Clan',
		0xcb2d13,
		'- 20% extra base experience from pickpocketing Iorwerth workers.\n- An increased chance to find golden rocks in the Iorwerth Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Iorwerth Clan (this can happen multiple times during the illumination).\n- Upon defeating an Iorwerth guard or scout, 100 Attack and Strength experience is gained regardless of the combat style used.\n- When defeating monsters in the Rush of Blood D&D, you will gain some Slayer experience from all of the monsters.',
	),
	new Clan(
		'https://runescape.wiki/images/Ithell_Clan.png',
		'Ithell',
		'https://runescape.wiki/w/Ithell_Clan',
		0xffffff,
		'- 20% extra base experience from pickpocketing Ithell workers.\n- An increased chance to find golden rocks in the Ithell Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Ithell Clan (this can happen multiple times during the illumination).\n- 20% more base Crafting and Construction XP from training using the harps. The harps have a significantly lower chance of losing tune while playing.\n- 20% more base Crafting XP from crafting crystal flasks.\n- Construction Supplies (Prifddinas) stock doubles. It will replenish if it is empty when the voice takes effect.\n- 50% chance for each mined soft clay to be transported directly to the player\'s bank. This takes precedence over sign of the porter effects.',
	),
	new Clan(
		'https://runescape.wiki/images/Meilyr_Clan.png',
		'Meilyr',
		'https://runescape.wiki/w/Meilyr_Clan',
		0x16eae4,
		'- 20% extra base experience from pickpocketing Meilyr workers.\n- An increased chance to find golden rocks in the Meilyr Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Meilyr Clan (this can happen multiple times during the illumination).\n- 20% more base Farming XP from planting and checking the fruit tree patch, and from checking the harmony pillars. Trees planted in the district will have a chance of skipping growth stages.\n- 20% more Herblore XP from making combination potions.',
	),
	new Clan(
		'https://runescape.wiki/images/Trahaearn_Clan.png',
		'Trahaearn',
		'https://runescape.wiki/w/Trahaearn_Clan',
		0xa1004c,
		'20% extra base experience from pickpocketing Trahaearn workers.\n- An increased chance to find golden rocks in the Trahaearn Clan\'s skills.\n- A chance for a crystal impling to spawn at the herald of the Trahaearn Clan (this can happen multiple times during the illumination).\n- 20% more Smithing XP when smelting corrupted ore.\n- At the start of the hour, each ore rock, excluding gem rocks, has a 1/15 chance of being replaced by a dark or light animica rock. The replaced rock will remain in the world until the end of the hour.\n- 20% chance to award extra ore when mining rocks in the district.\n- 20% more base Farming XP from planting and checking the tree patch, as well as a chance of the tree skipping growth stages.',
	),
];

const getClan = (clanName) => {
	for (const clan of clans) {
		if (clan.name === clanName) {
			return clan;
		}
	}
};

const getTime = () => {
	const now = new Date();
	return new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours() + 1,
		0,
		0,
	);
};

const createEmbed = (clanName) => {
	const clan = getClan(clanName);
	const embed = new EmbedBuilder()
		.setColor(clan.color)
		.setTitle(clan.name)
		.setURL(clan.link)
		.setThumbnail(clan.icon)
		.setDescription(clan.buffs)
		.setFooter({ text: 'Resets' })
		.setTimestamp(getTime());
	return embed;
};

async function getClansJson() {
	const json = await getJson('https://api.weirdgloop.org/runescape/vos');
	return {
		district1: json.district1,
		district2: json.district2,
	};
}

export const data = {
	name: 'vos',
	description: 'Displays the current clans affected by the voice of seren',
	"integration_types": [1],
	"contexts": [0, 1, 2]
};

export async function execute(interaction) {
	await interaction.deferReply();
	const { district1, district2 } = await getClansJson();
	sendWithTimeout(
		interaction,
		{ embeds: [createEmbed(district1), createEmbed(district2)] },
		5,
		true,
	);
};
