import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { emoji, lvlQ, lvlReq } from './skills.js';
import { lDist } from './helper.js';

const questHolder = [];
const questNames = [];

async function getPlayerQuestData(_name) {
	const questData = await fetch(
		`https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(_name)}`,
	).then((res) => res.json());
	if (!questData) {
		return null;
	}
	//Convert to new format
	const newQuestData = new Map();

    for (const quest of questData.quests) {
        newQuestData.set(quest.title, quest);
        //quest Hierarchy
        //title: 'A Fairy Tale I - Growing Pains',
        //status: 'COMPLETED',
        //difficulty: 2,
        //members: true,
        //questPoints: 2,
        //userEligible: true
    }
    return newQuestData;
	
}

function getQuestFromData(data, name) {
    //Find closest matching quest in data map based on levenshtein distance
    name = name.toLowerCase();
    let min = Infinity;
    let quest = undefined;
    for (let [key, value] of data) {
        if (key === name) {
            return value;
        }
        const dist = lDist(key, name);
        if (dist < min) {
            min = dist;
            quest = value;
        }
    }
    if (quest === undefined) {
        console.log('No match was found for provided name. Aborting...');
        return undefined;
    }
    return quest;
}

class Quest {
    constructor(line) {
        let array = line.split(';');
        this.id = Number(array[0]);
        this.name = array[1];
        this.thumb = array[array.length - 1];
        this.notes = array[array.length - 2];
        this.questPre = array[array.length - 4];
        this.info = array[array.length - 3];
        this.questpts = array[array.length - 5];
        this.skills = parseSkills(array.slice(2, array.length - 5));

        if (this.notes === '' || this.notes === '\r') {
            this.notes = undefined;
        }

        if (this.questpts === '') {
            this.questpts = 0;
        }
        questNames.push(this.name);

        questHolder.push(this);
    }

    generateMap() {
        this.quests = parseQuests(this.questPre);
        const { texts, skills, ironskills } = getQuestReqs(this);
        //Make questMap undefined if texts is empty
        if (texts.length === 0) {
            this.questMap = undefined;
        } else {
            this.questMap = texts.join('\n');
        }
        //fullSkillReqs will be defined if skills is not undefined
        if (skills.size === 0) {
            this.fullSkillReqs = undefined;
        } else {
            this.fullSkillReqs = skills;
        }

        if (ironskills.size === 0) {
            this.fullIronReqs = undefined;
        } else {
            this.fullIronReqs = ironskills;
        }
    }
    getSkillsString() {
        //Return a string with defined skills and levels from the given map of SkillReq objects
        let skillsString = '';
        let ironsString = '';
        //Iterate over map
        //if fullSkillReqs is empty or undefined, return undefined
        if (!this.fullSkillReqs || this.fullSkillReqs.size === 0) {
            skillsString = undefined;
        } else {
            let newLine = 0;
            for (let [id, req] of this.fullSkillReqs) {
                let skillName = getSkill(id);
                newLine++;
                if (newLine > 4) {
                    newLine = 0;
                    skillsString += `${emoji(skillName) + lvlQ(req.level)}\n`;
                } else {
                    skillsString += `${emoji(skillName) + lvlQ(req.level)}\u2001`;
                }
            }
        }

        if (!this.fullIronReqs || this.fullIronReqs.size === 0) {
            ironsString = undefined;
        } else {
            let newIronLine = 0;
            for (let [id, req] of this.fullIronReqs) {
                let skillName = getSkill(id);
                newIronLine++;
                if (newIronLine > 4) {
                    newIronLine = 0;
                    ironsString += `${emoji(skillName) + lvlQ(req.level)}\n`;
                } else {
                    ironsString += `${emoji(skillName) + lvlQ(req.level)}\u2001`;
                }
            }
        }
        return {skillsString, ironsString};
    }

    getUserSkillsString(data) {

        let skillsString = '';
        let ironsString = '';
        //Iterate over map
        //if fullSkillReqs is empty or undefined, return undefined
        if (!this.fullSkillReqs || this.fullSkillReqs.size === 0) {
            skillsString = undefined;
        } else {
            let newLine = 0;
            for (let [id, req] of this.fullSkillReqs) {
                let skillName = getSkill(id);
                newLine++;
                if (newLine > 2) {
                    newLine = 0;
                    skillsString += `${emoji(skillName) + lvlReq(data, skillName, req.level)}\n`;
                } else {
                    skillsString += `${emoji(skillName) + lvlReq(data, skillName, req.level)}\u2001`;
                }
            }
        }

        if (!this.fullIronReqs || this.fullIronReqs.size === 0) {
            ironsString = undefined;
        } else {
            let newIronLine = 0;
            for (let [id, req] of this.fullIronReqs) {
                let skillName = getSkill(id);
                newIronLine++;
                if (newIronLine > 2) {
                    newIronLine = 0;
                    ironsString += `${emoji(skillName) + lvlReq(data, skillName, req.level)}\n`;
                } else {
                    ironsString += `${emoji(skillName) + lvlReq(data, skillName, req.level)}\u2001`;
                }
            }
        }
        return {skillsString, ironsString};
    }
}

class SkillReq {
    constructor(value) {
        //Check if value contains a -
        this.iron = value.includes('-')
        //Remove - from the value and turn it into a number
        this.level = Number(value.replace(/-/g, ''));
    }
}

async function getQuestUserMap(quest, name) {
    let data = await getPlayerQuestData(name);
    let texts = getQuestUserReqs(quest, data);
    if (texts.length === 0) {
       return undefined;
    } else {
        return texts.join('\n');
    }
}



function parseQuests(line) {
    if (line === '') {
        return undefined;
    }
    let array = line.split(',');
    let quests = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== '') {
            quests.push(questHolder[Number(array[i])-1]);
        }
    }
    return quests;
}

function parseSkills(array) {
    if (!array) {
        return undefined;
    }
    let skills = new Map();
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== '') {
            skills.set(i, new SkillReq(array[i]));
        }
    }
    if (skills.size === 0) {
        return undefined;
    }
    return skills;
}
function getQuestId(name) {
    //Return the quest id of the quest with the closest match to the name from the questNames array based on levenshtein distance
    let min = Infinity;
    let id = 0;
    for (let i = 0; i < questNames.length; i++) {
        let distance = lDist(name, questNames[i]);
        if (distance < min) {
            min = distance;
            id = i;
        }
    }
    return id;

}

function getQuestData(id) {
    return questHolder[id];
}

function getQuestReqs(quest) {
    let texts = [];
    let skills = new Map();
    let ironskills = new Map();
    let trimReqs = (quest.id != 190 && quest.id != 193) ? true : false;
    console.log(quest.id + ' ' + quest.name);
    getReqsRecursively(quest, 0, true, texts, skills, ironskills, true, trimReqs);
    //remove ironskills if it exists in regular skills map
    for (let [key, value] of ironskills) {
        if (skills.has(key)) {
            //remove ironskills only if the value in skills map is higher than in iron
            if (skills.get(key).level > value.level) {
                ironskills.delete(key);
            }
        }
    }
    return {texts, skills, ironskills};
}

function getQuestUserReqs(quest, questData) {
    let texts = [];
    let trimReqs = (quest.id != 190 && quest.id != 193) ? true : false;
    getUserReqsRecursively(questData, quest, 0, true, texts, true, trimReqs);
    //remove ironskills if it exists in regular skills map
    return texts;
}

function getUserReqsRecursively(questData, curQuest, spacing, isLeaf, questMap, isStart, trimReqs) {
    const {state, icon} = questState(curQuest.name, questData);
    if (isStart) {
        questMap.push(state + ' ' + icon +  curQuest.name);
    } else {
        questMap.push(state + getSpaceChar(spacing, isLeaf) + icon + curQuest.name);
    }
    if (trimReqs && (curQuest.id == 190 || curQuest.id == 193)) {
        //Do stuff later
    } else {
        if (curQuest.quests) {
            let newSpace = spacing + 1;
            for (let i = 0; i < curQuest.quests.length-1; i++) {
                getUserReqsRecursively(questData, curQuest.quests[i], newSpace, false, questMap, false, trimReqs);
            }
            getUserReqsRecursively(questData, curQuest.quests[curQuest.quests.length-1], newSpace, true, questMap, false, trimReqs);
        }
    }
    
    //Also print quest points
    if (curQuest.questpts) {
        let newSpace = spacing + 1;
        questMap.push(state + getSpaceChar(newSpace, true) + curQuest.questpts + ' quest points');
    }
}

function questState(name, questData) {
    //Quest finding example
    let quest = getQuestFromData(questData, name);
    if (!quest) {
        console.log('No match was found for provided name.');
        return {state: '-', icon: '✘ '};
    } else {
        //return a checkmark
        if (quest.status === 'COMPLETED') {
            return {state: '>', icon: '✔ '};
        }
        if (quest.status === 'STARTED') {
            return {state: '#', icon: '• '};
        }
        return {state: '-', icon: '✘ '};
    }
}


function getReqsRecursively(curQuest, spacing, isLeaf, questMap, skillReqs, ironReqs, isStart, trimReqs) {
    if (isStart) {
        questMap.push("   ".repeat(spacing) + "  " +  curQuest.name);
    } else {
        questMap.push(getSpaceChar(spacing, isLeaf) + curQuest.name);
    }
    //get skill requirements and added to skill map
    if (curQuest.skills) {
        for (let [key, value] of curQuest.skills) {
            //check if skill is ironman
            if (value.iron) {
                if (!ironReqs.has(key)) {
                    ironReqs.set(key, value);
                } else {
                    //add skill requirement with higher value
                    if (ironReqs.get(key).level < value.level) {
                        ironReqs.set(key, value);
                    }
                }
            } else {
                if (!skillReqs.has(key)) {
                    skillReqs.set(key, value);
                } else {
                    //add skill requirement with higher value
                    if (skillReqs.get(key).level < value.level) {
                        skillReqs.set(key, value);
                    }
                }
            }
        }
    }
    if (trimReqs && (curQuest.id == 190 || curQuest.id == 193)) {
        //Do stuff later
    } else {
        if (curQuest.quests) {
            let newSpace = spacing + 1;
            for (let i = 0; i < curQuest.quests.length-1; i++) {
                getReqsRecursively(curQuest.quests[i], newSpace, false, questMap, skillReqs, ironReqs, false, trimReqs);
            }
            getReqsRecursively(curQuest.quests[curQuest.quests.length-1], newSpace, true, questMap, skillReqs, ironReqs, false, trimReqs);
        }
    }

    //Also print quest points
    if (curQuest.questpts) {
        let newSpace = spacing + 1;
        questMap.push(getSpaceChar(newSpace, true) + curQuest.questpts + ' quest points');
    }
}

function getSpaceChar(spacing, isBottom) {
    if (isBottom) {
        return "   ".repeat(spacing) + "└ ";
    }
    return "   ".repeat(spacing) + "├ ";
}
    

const fullSkillNames = ["Total", "Attack", "Strength", "Ranged", "Magic", "Defense", "Constitution", "Prayer", "Summoning", "Dungeoneering", "Agility", "Thieving", "Slayer", "Hunter", "Smithing", "Crafting", "Fletching", "Herblore", "Runecrafting", "Cooking", "Construction", "Firemaking", "Woodcutting", "Farming", "Fishing", "Mining", "Divination", "Invention", "Archaeology", "Necromancy", "Combat", "Quest"];

function getSkill(id) {
    return fullSkillNames[id+1];
}
function initQuests() {
    const quests = readFileSync('./data/quests.txt', 'utf-8', () => {}).split('\n');
    // Parse quests
    for (let i = 0; i < quests.length; i++) {
        new Quest(quests[i]);
    }
    //Generate maps
    for (let i = 0; i < questHolder.length; i++) {
        questHolder[i].generateMap();
    }
    console.log('Loaded ' + questHolder.length + ' quests');
}

export { initQuests, getQuestId, getQuestData, getPlayerQuestData, getQuestUserMap };