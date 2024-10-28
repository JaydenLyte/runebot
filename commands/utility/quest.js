import { sendWithTimeout } from '../../util/helper.js';
import { getQuestData, getQuestId, getQuestUserMap } from '../../util/quests.js';
import { EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../util/skills.js';

async function getQuestEmbed(name) {
    const embedList = [];
    const id = getQuestId(name);
    const questData = getQuestData(id);
    if (!questData) {
        return null;
    }
    const embed = new EmbedBuilder();

    //Get information description
    if (!questData.quests) {
        embed.setDescription("This quest has no quest prerequisites.");
    } else {
        let desc = questData.questMap;
        if (desc.length > 3500) {
            splitDescription(questData.name, desc, 3500, embedList, false);
        } else {
            embed.setDescription("<:map:1297818422008221727> **Quest Map:**\n```\n" + desc + "```");
        }
    }

    //Get Skills String
    let {skillsString, ironsString} = questData.getSkillsString();

    //Add field if the quest has skill requirements
    if (skillsString) {
        embed.addFields(
        {
            name: "<:total:1297809603790372864> Skill Requirements",
            value: skillsString + "\n\u200b",
            inline: false
        }
        );
    }
    if (ironsString) {
        embed.addFields(
        {
            name: "<:im:1297810928078815232> Ironman Requirements",
            value: ironsString + "\n\u200b",
            inline: false
        }
        );
    }
    //Add field if the quest has a note
    if (questData.notes) {
        embed.addFields(
        {
            name: "<:note:1297816895143018516> Notes",
            value: questData.notes + "\n\u200b",
            inline: false
        }
        );
    }
    embed.setColor("#00b0f4");
    embed.setFooter({
        text: `❛❛${questData.info}❜❜\n\n#${getRealQuestNumber(id)}`,
        });
        embed.setTitle(questData.name);
    embed.setAuthor({
        name: "Quest Requirements",
        iconURL: "https://runescape.wiki/images/Quest_map_icon.png",
    });
    embed.setImage(questData.thumb);
    embedList.push(embed);
    return embedList;
}

function splitDescription(name, desc, limit, embedList, hasUser) {
    let descList = desc.split('\n');
    let embed = new EmbedBuilder();
    let prefix = hasUser ? "md" : "";
    let descString = "";
    let pages = Math.ceil(desc.length / 3500);
    for (let i = 0; i < descList.length; i++) {
        descString += descList[i] + "\n";
        if (descString.length > limit) {
            descString = (embedList.length > 0 ? " • • •\n" : "") + descString + "\n • • •"
            embed.setDescription("```" + prefix + "\n" + descString + "```");
            embed.setAuthor({
                name: "Quest Map",
                iconURL: "https://runescape.wiki/images/thumb/World_map_artwork.png/60px-World_map_artwork.png",
            });
            embed.setTitle(name);
            embed.setColor("#00b0f4");
            embed.setFooter({
                text: `Quest Map: ${embedList.length + 1} of ${pages}`,
            });
            embedList.push(embed);
            embed = new EmbedBuilder();
            descString = "";
        }
    }
    descString = (embedList.length > 0 ? " • • •\n" : "") + descString;
    embed.setDescription("```" + prefix + "\n" + descString + "```");
    embed.setAuthor({
        name: "Quest Map",
        iconURL: "https://runescape.wiki/images/thumb/World_map_artwork.png/60px-World_map_artwork.png",
    });
    embed.setTitle(name);
    embed.setColor("#00b0f4");
    embed.setFooter({
        text: `Quest Map: ${pages} of ${pages}`,
    });
    embedList.push(embed);
    descString = "";
}

async function getPlayerQuestEmbed(name, playerData) {
    const embedList = [];
    const id = getQuestId(name);
    const questData = getQuestData(id);
    if (!questData) {
        return null;
    }
    const embed = new EmbedBuilder();
    embed.setAuthor({
        name: questData.name,
        iconURL: "https://runescape.wiki/images/Quest_map_icon.png",
    });
    if (!questData.quests) {
        embed.setDescription("This quest has no quest prerequisites.");
    } else {
        let desc = await getQuestUserMap(questData, playerData.name);
        if (desc.length > 3500) {
            splitDescription(questData.name, desc, 3500, embedList, true);
        } else {
            embed.setDescription("<:map:1297818422008221727> **Quest Map:**\n```md\n" + desc + "```");
        }

    }

    //Get Skills String
    let {skillsString, ironsString} = questData.getUserSkillsString(playerData);

    //Add field if the quest has skill requirements
    if (skillsString) {
        embed.addFields(
        {
            name: "<:total:1297809603790372864> Skill Requirements",
            value: skillsString + "\n\u200b",
            inline: false
        }
        );
    }
    if (ironsString) {
        embed.addFields(
        {
            name: "<:im:1297810928078815232> Ironman Requirements",
            value: ironsString + "\n\u200b",
            inline: false
        }
        );
    }
    //Add field if the quest has a note
    if (questData.notes) {
        embed.addFields(
        {
            name: "<:note:1297816895143018516> Notes",
            value: questData.notes + "\n\u200b",
            inline: false
        }
        );
    }
    embed.setAuthor({
        name: `Quest Requirements for ${playerData.name}`,
        iconURL: playerData.icon,
    })
    embed.setColor("#00b0f4");
    embed.setFooter({
    text: `❛❛${questData.info}❜❜\n\n#${getRealQuestNumber(id)}`,
    });
    embed.setTitle(questData.name);
    embed.setImage(questData.thumb);
    embedList.push(embed);
    return embedList;

}

function getRealQuestNumber(id) {
    let questNum = id + 1;
    if (questNum < 166) {
        return questNum;
    } else if (questNum < 168) {
        return questNum - 1;
    } else {
        return questNum - 2;
    }
}

export const data = {
	name: 'quest',
	description: 'Provides a summary of quest requirements for a specific quest.',
	"integration_types": [1],
	"contexts": [0, 1, 2],
	options: [
		{
			name: 'name',
			description: 'The quest to search for',
			type: 3,
			required: true,
		},
        {
			name: 'player',
			description: 'The player to check against',
			type: 3,
			required: false,
		},
	],
};
function sendStandardQuestEmbed(interaction, name) {
    getQuestEmbed(name).then((embedList) => {
        for (let e of embedList) {
            sendWithTimeout(
                interaction,
                { embeds: [e] },
                5,
                true,
            );
        }
    });
}

function sendPlayerQuestEmbed(interaction, name, playerData) {
    getPlayerQuestEmbed(name, playerData).then((embedList) => {
        for (let e of embedList) {
            sendWithTimeout(
                interaction,
                { embeds: [e] },
                5,
                true,
            );
        }
    });
}

export async function execute(interaction) {
    await interaction.deferReply();
    const name = interaction.options.getString('name');
    if (!name) {
        await interaction.deleteReply();
        sendWithTimeout(
            interaction,
            { content: 'Please provide a name to search for.' },
            0.25,
            false,
        );
        return;
    }
    const player = interaction.options.getString('player');
	if (player) {
        const playerData = await getPlayer(player);
        if (!playerData || playerData === 'NONE' || playerData === 'PRIVATE') {
            sendStandardQuestEmbed(interaction, name);
            return;
        }
        sendPlayerQuestEmbed(interaction, name, playerData);
        return;
	} else {
        sendStandardQuestEmbed(interaction, name);
        return;
    }

};
