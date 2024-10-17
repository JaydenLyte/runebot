import { getJson, sendWithTimeout } from '../../util/helper.js';
import { EmbedBuilder } from 'discord.js';

const createEmbed = (text, text2) => {
    text = text.split('¦');
    text2 = text2.split('¦');
	const embed = new EmbedBuilder()
		.setColor(0x32cd32)
		.setTitle("Travelling Merchant")
		.setURL('https://runescape.wiki/w/Travelling_Merchant%27s_Shop')
		.setThumbnail('https://runescape.wiki/images/Travelling_Merchant%27s_Shop.png')
		.setDescription(`**Today**\n1. ${text[0]}\n2. ${text[1]}\n3. ${text[2]}\n\n**Tomorrow**\n1. ${text2[0]}\n2. ${text2[1]}\n3. ${text2[2]}\n\n[Next 365 Days](https://runescape.wiki/w/Travelling_Merchant%27s_Shop/Future)`)
	return embed;
};


async function getTMData() {
	const json1 = await getJson('https://runescape.wiki/api.php?format=json&action=parse&prop=text&disablelimitreport=1&text={{Travelling Merchant/api|format=simple}}');
    const json2 = await getJson('https://runescape.wiki/api.php?format=json&action=parse&prop=text&disablelimitreport=1&text={{Travelling Merchant/api|offset=1|format=simple}}');
	
    
    return {
		today: json1.parse.text['*'].split('@')[1],
		tomorrow: json2.parse.text['*'].split('@')[1],
	};
}

export const data = {
	name: 'tm',
	description: 'Displays travelling merchant stock for the current day along with the rest of the week.',
	"integration_types": [1],
	"contexts": [0, 1, 2]
};

export async function execute(interaction) {
	await interaction.deferReply();
	const { today, tomorrow } = await getTMData();
	sendWithTimeout(
		interaction,
		{ embeds: [createEmbed(today, tomorrow)] },
		5,
		true,
	);
};
