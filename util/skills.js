import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { formatter } from './helper.js';

function getSkillFromPlayerJson(skillvalues, skillId) {
	return skillvalues.find((skillvalue) => skillvalue.id === skillId);
}

async function getPlayer(_name) {
	// Main
	const player = await fetch(
		`https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(_name)}&activities=1`,
	).then((res) => res.json());
	if (!player) {
		return null;
	}

	console.log(player);
	if (player.error === 'NO_PROFILE') {
		console.log('No match was found for provided name. Aborting...');
		return 'NONE';
	}
	else if (player.error === 'PROFILE_PRIVATE') {
		console.log('Profile is private. Aborting...');
		return 'PRIVATE';
	}
	// Convert to new format
	const newPlayer = {
		name: _name,
	};

	for (const skill of Object.keys(list)) {
		if (skill === 'overall') continue;
		const currSkill = getSkillFromPlayerJson(
			player.skillvalues,
			list[skill].id,
		);
		if (currSkill) {
			newPlayer[skill] = {
				level: currSkill.level,
				xp: currSkill.xp,
				rank: currSkill.rank === 0 ? 'unranked' : currSkill.rank,
			};
		}
	}
	newPlayer.quests = {
		prog: player.questsstarted,
		comp: player.questscomplete,
		new: player.questsnotstarted,
	};

	newPlayer.overall = {
		level: player.totalskill,
		xp: player.totalxp,
		rank: player.rank,
	};

	newPlayer.icon = `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(_name)}/chat.png`;
	newPlayer.activity = player.activities[0];
	newPlayer.online = player.loggedIn === 'true';

	return newPlayer;
}

const list = {
	overall: {
		emoji: '1254941445069078579',
		name: 'Overall',
		id: -1,
	},
	attack: {
		emoji: '1254936288704991282',
		name: 'Attack',
		id: 0,
	},
	defense: {
		emoji: '1254941485707821188',
		name: 'Defense',
		id: 1,
	},
	strength: {
		emoji: '1254941537629114471',
		name: 'Strength',
		id: 2,
	},
	constitution: {
		emoji: '1254941580977115299',
		name: 'Constitution',
		id: 3,
	},
	ranged: {
		emoji: '1254941621573779497',
		name: 'Ranged',
		id: 4,
	},
	prayer: {
		emoji: '1254941644525146134',
		name: 'Prayer',
		id: 5,
	},
	magic: {
		emoji: '1254941673096613888',
		name: 'Magic',
		id: 6,
	},
	cooking: {
		emoji: '1254941707330650194',
		name: 'Cooking',
		id: 7,
	},
	woodcutting: {
		emoji: '1254941744735326229',
		name: 'Woodcutting',
		id: 8,
	},
	fletching: {
		emoji: '1254941779086540802',
		name: 'Fletching',
		id: 9,
	},
	fishing: {
		emoji: '1254941801022750801',
		name: 'Fishing',
		id: 10,
	},
	firemaking: {
		emoji: '1254941838062911498',
		name: 'Firemaking',
		id: 11,
	},
	crafting: {
		emoji: '1254941881628885082',
		name: 'Crafting',
		id: 12,
	},
	smithing: {
		emoji: '1254942037237567518',
		name: 'Smithing',
		id: 13,
	},
	mining: {
		emoji: '1254942063347368037',
		name: 'Mining',
		id: 14,
	},
	herblore: {
		emoji: '1254942086378295337',
		name: 'Herblore',
		id: 15,
	},
	agility: {
		emoji: '1254942114651967539',
		name: 'Agility',
		id: 16,
	},
	thieving: {
		emoji: '1254942146830532638',
		name: 'Thieving',
		id: 17,
	},
	slayer: {
		emoji: '1254942169429442591',
		name: 'Slayer',
		id: 18,
	},
	farming: {
		emoji: '1254942190342373516',
		name: 'Farming',
		id: 19,
	},
	runecrafting: {
		emoji: '1254942226794942534',
		name: 'Runecrafting',
		id: 20,
	},
	hunter: {
		emoji: '1254942264002613278',
		name: 'Hunter',
		id: 21,
	},
	construction: {
		emoji: '1254942291748192386',
		name: 'Construction',
		id: 22,
	},
	summoning: {
		emoji: '1254942315370512395',
		name: 'Summoning',
		id: 23,
	},
	dungeoneering: {
		emoji: '1254942336668930128',
		name: 'Dungeoneering',
		id: 24,
	},
	divination: {
		emoji: '1254942359817551922',
		name: 'Divination',
		id: 25,
	},
	invention: {
		emoji: '1254942390226256066',
		name: 'Invention',
		id: 26,
	},
	archaeology: {
		emoji: '1254942423717511319',
		name: 'Archaeology',
		id: 27,
	},
	necromancy: {
		emoji: '1254942443229544490',
		name: 'Necromancy',
		id: 28,
	},
};

const xpTable = [
	0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411,
	2746, 3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824,
	12031, 13363, 14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648,
	37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333,
	111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886,
	273742, 302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032,
	668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581,
	1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373, 3258594,
	3597792, 3972294, 4385776, 4842295, 5346332, 5902831, 6517253, 7195629,
	7944614, 8771558, 9684577, 10692629, 11805606, 13034431, 14391160, 15889109,
	17542976, 19368992, 21385073, 23611006, 26068632, 28782069, 31777943,
	35085654, 38737661, 42769801, 47221641, 52136869, 57563718, 63555443,
	70170840, 77474828, 85539082, 94442737, 104273167, 10853671, 127110260,
	140341028, 154948977, 171077457, 188884740,
];

function xpToLevel(xp) {
	xp = xp / 10;
	let low = 0;
	let high = xpTable.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		if (xp < xpTable[mid]) high = mid - 1;
		else if (xp > xpTable[mid]) low = mid + 1;
		else return mid;
	}
	return low;
}

// eslint-disable-next-line no-unused-vars
function skillFromId(id) {
	for (const skill of Object.keys(list)) {
		if (list[skill].id === id) return list[skill];
	}
}

function skillFromName(name) {
	for (const skill of Object.keys(list)) {
		if (list[skill].name === name) return list[skill];
	}
}

function icon(name) {
	if (name === 'Overall') return 'https://runescape.wiki/images/Statistics.png';
	if (name === 'Defense') {
		return 'https://runescape.wiki/images/Defence_detail.png';
	}
	return 'https://runescape.wiki/images/' + name + '_detail.png';
}

function emoji(_name) {
	return `<:${_name.substring(0, 2)}:${skillFromName(_name).emoji}>`;
}

function lvlF(xp) {
	const level = xpToLevel(xp);
	if (level === -1) return ' `???`';
	if (level < 10) return ' `  ' + level + '`';
	if (level < 100) return ' ` ' + level + '`';
	if (xp === 2000000000) return ' `MAX`';
	else return ' `' + level + '`';
}

function elvlF(xp, level) {
	if (xp === 2000000000) return ' `MAX`';
	if (level === -1) return ' `???`';
	if (level < 10) return ' `  ' + level + '`';
	if (level < 100) return ' ` ' + level + '`';
	else return ' `' + level + '`';
}

async function getUnvalidatedPlayerEmbed(player) {
	const data = await getPlayer(player);
	if (!data) return null;
	if (data === 'NONE') {
		return new EmbedBuilder()
			.setTitle(player)
			.setDescription('No match was found for provided name.')
			.setColor(0x4e000d);
	}
	if (data === 'PRIVATE') {
		return new EmbedBuilder()
			.setTitle(player)
			.setDescription('Profile is private.')
			.setColor(0x4e000d);
	}
	const embed = new EmbedBuilder()
		.setColor(data.online ? 0x32cd32 : 0x23272e)
		.setFooter({
			text: `In Progress: ${data.quests.prog} · Completed: ${data.quests.comp}\nNot Started: ${data.quests.new}`,
			iconURL: 'https://runescape.wiki/images/Quest_map_icon.png',
		})
		.setTitle(' ')
		.setAuthor({ name: `${data.name}`, iconURL: data.icon })
		.addFields({
			name: ' ',
			inline: false,
			value: `${emoji('Attack') + lvlF(data.attack.xp)}\u2001\u2001${emoji('Constitution') + lvlF(data.constitution.xp)}\u2001\u2001${emoji('Mining') + lvlF(data.mining.xp)}\n${emoji('Strength') + lvlF(data.strength.xp)}\u2001\u2001${emoji('Agility') + lvlF(data.agility.xp)}\u2001\u2001${emoji('Smithing') + lvlF(data.smithing.xp)}\n${emoji('Defense') + lvlF(data.defense.xp)}\u2001\u2001${emoji('Herblore') + lvlF(data.herblore.xp)}\u2001\u2001${emoji('Fishing') + lvlF(data.fishing.xp)}\n${emoji('Ranged') + lvlF(data.ranged.xp)}\u2001\u2001${emoji('Thieving') + lvlF(data.thieving.xp)}\u2001\u2001${emoji('Cooking') + lvlF(data.cooking.xp)}\n${emoji('Prayer') + lvlF(data.prayer.xp)}\u2001\u2001${emoji('Crafting') + lvlF(data.crafting.xp)}\u2001\u2001${emoji('Firemaking') + lvlF(data.firemaking.xp)}\n${emoji('Magic') + lvlF(data.magic.xp)}\u2001\u2001${emoji('Fletching') + lvlF(data.fletching.xp)}\u2001\u2001${emoji('Woodcutting') + lvlF(data.woodcutting.xp)}\n${emoji('Runecrafting') + lvlF(data.runecrafting.xp)}\u2001\u2001${emoji('Slayer') + lvlF(data.slayer.xp)}\u2001\u2001${emoji('Farming') + lvlF(data.farming.xp)}\n${emoji('Construction') + lvlF(data.construction.xp)}\u2001\u2001${emoji('Hunter') + lvlF(data.hunter.xp)}\u2001\u2001${emoji('Summoning') + lvlF(data.summoning.xp)}\n${emoji('Dungeoneering') + lvlF(data.dungeoneering.xp)}\u2001\u2001${emoji('Divination') + lvlF(data.divination.xp)}\u2001\u2001${emoji('Invention') + elvlF(data.invention.xp, data.invention.level)}\n${emoji('Archaeology') + lvlF(data.archaeology.xp)}\u2001\u2001${emoji('Necromancy') + lvlF(data.necromancy.xp)}`,
		})
		.addFields({
			name: ` ឵឵ \n${emoji('Overall')} Total Stats`,
			value: `**${data.overall.level}** levels · **${formatter(data.overall.xp, 1)}** xp`,
			inline: true,
		})
		.addFields({
			name: ' ឵឵ \n<:Hi:1255442591965646870> Rank',
			value: `${data.overall.rank === undefined || data.overall.rank === null ? '**N/A' : '**' + data.overall.rank}**`,
			inline: true,
		});
	return embed;
}

async function getValidatedPlayerEmbed(player) {
	const data = await getPlayer(player);
	if (!data || data === 'NONE' || data === 'PRIVATE') {
		return undefined;
	}
	const embed = new EmbedBuilder()
		.setColor(data.online ? 0x32cd32 : 0x23272e)
		.setFooter({
			text: `In Progress: ${data.quests.prog} · Completed: ${data.quests.comp}\nNot Started: ${data.quests.new}`,
			iconURL: 'https://runescape.wiki/images/Quest_map_icon.png',
		})
		.setTitle(' ')
		.setAuthor({ name: `${data.name}`, iconURL: data.icon })
		.addFields({
			name: ' ',
			inline: false,
			value: `${emoji('Attack') + lvlF(data.attack.xp)}\u2001\u2001${emoji('Constitution') + lvlF(data.constitution.xp)}\u2001\u2001${emoji('Mining') + lvlF(data.mining.xp)}\n${emoji('Strength') + lvlF(data.strength.xp)}\u2001\u2001${emoji('Agility') + lvlF(data.agility.xp)}\u2001\u2001${emoji('Smithing') + lvlF(data.smithing.xp)}\n${emoji('Defense') + lvlF(data.defense.xp)}\u2001\u2001${emoji('Herblore') + lvlF(data.herblore.xp)}\u2001\u2001${emoji('Fishing') + lvlF(data.fishing.xp)}\n${emoji('Ranged') + lvlF(data.ranged.xp)}\u2001\u2001${emoji('Thieving') + lvlF(data.thieving.xp)}\u2001\u2001${emoji('Cooking') + lvlF(data.cooking.xp)}\n${emoji('Prayer') + lvlF(data.prayer.xp)}\u2001\u2001${emoji('Crafting') + lvlF(data.crafting.xp)}\u2001\u2001${emoji('Firemaking') + lvlF(data.firemaking.xp)}\n${emoji('Magic') + lvlF(data.magic.xp)}\u2001\u2001${emoji('Fletching') + lvlF(data.fletching.xp)}\u2001\u2001${emoji('Woodcutting') + lvlF(data.woodcutting.xp)}\n${emoji('Runecrafting') + lvlF(data.runecrafting.xp)}\u2001\u2001${emoji('Slayer') + lvlF(data.slayer.xp)}\u2001\u2001${emoji('Farming') + lvlF(data.farming.xp)}\n${emoji('Construction') + lvlF(data.construction.xp)}\u2001\u2001${emoji('Hunter') + lvlF(data.hunter.xp)}\u2001\u2001${emoji('Summoning') + lvlF(data.summoning.xp)}\n${emoji('Dungeoneering') + lvlF(data.dungeoneering.xp)}\u2001\u2001${emoji('Divination') + lvlF(data.divination.xp)}\u2001\u2001${emoji('Invention') + elvlF(data.invention.xp, data.invention.level)}\n${emoji('Archaeology') + lvlF(data.archaeology.xp)}\u2001\u2001${emoji('Necromancy') + lvlF(data.necromancy.xp)}`,
		})
		.addFields({
			name: ` ឵឵ \n${emoji('Overall')} Total Stats`,
			value: `**${data.overall.level}** levels · **${formatter(data.overall.xp, 1)}** xp`,
			inline: true,
		})
		.addFields({
			name: ' ឵឵ \n<:Hi:1255442591965646870> Rank',
			value: `${data.overall.rank === undefined || data.overall.rank === null ? '**N/A' : '**' + data.overall.rank}**`,
			inline: true,
		});
	return embed;
}

async function getPlayerEmbed(player, validated) {
	if (validated) {
		return await getValidatedPlayerEmbed(player);
	}
	else {
		return await getUnvalidatedPlayerEmbed(player);
	}
}

export { getPlayerEmbed, emoji, icon };
