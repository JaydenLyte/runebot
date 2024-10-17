import fetch from 'node-fetch';
import { unfurl } from 'unfurl.js';
import { Message, EmbedBuilder } from 'discord.js';

async function getJson(url) {
	return await fetch(url, { method: 'Get' }).then((res) => res.json());
}

function purgeMessage(msg) {
	if (msg instanceof Message && msg.deletable) msg.delete().catch(() => null);
}

async function sendWithTimeout(interaction, message, timeout, isFollowUp) {
	if (isFollowUp) {
		await interaction.followUp(message).then((repliedMessage) => {
			setTimeout(() => purgeMessage(repliedMessage), timeout * 60000);
		});
	} else {
		await interaction.channel.send(message).then((repliedMessage) => {
			setTimeout(() => purgeMessage(repliedMessage), timeout * 60000);
		});
	}
}

async function edit(interaction, message) {
	await interaction.editReply(message);
}

async function editWithTimeout(interaction, message, timeout) {
	await interaction.editReply(message).then((repliedMessage) => {
		setTimeout(() => purgeMessage(repliedMessage), timeout * 60000);
	});
}

async function parseOG(url) {
	return await unfurl(url).then((data) => data.open_graph);
}

function formatter(num, digits) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'B' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];
	const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
	const item = lookup.findLast((it) => num >= it.value);
	return item
		? (num / item.value).toFixed(digits).replace(regexp, '').concat(item.symbol)
		: '0';
}

function embed(
	name,
	color = 0x32cd32,
	desc = ' ',
	footer = undefined,
	author = undefined,
	time = undefined,
	thumb = undefined
) {
	const emb = new EmbedBuilder();
	if (time) emb.setTimestamp(time);
	if (author) emb.setAuthor(author);
	if (footer) emb.setFooter(footer);
	if (thumb) emb.setThumbnail(thumb);
	emb.setColor(color).setTitle(name).setDescription(desc);
	return emb;
}

export {
	getJson,
	sendWithTimeout,
	edit,
	editWithTimeout,
	parseOG,
	formatter,
	embed,
};
