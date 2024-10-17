/* eslint-disable no-empty-function */
import { CronJob, sendAt } from 'cron';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { toChannelWithTimeout, embed } from './helper.js';

const events = [];

function cron(
	warn,
	interval,
	name,
	type,
	url = 'https://runescape.wiki/images/thumb/D%26D_icon.png/100px-D%26D_icon.png',
	footerText = undefined,
) {
	return new CronJob(
		warn ? warn : interval,
		() => {
			toChannelWithTimeout(
				{
					embeds: [
						warn
							? embed(
								`${name} will be starting soon!`,
								0xffcc55,
								`**Starting:** <t:${sendAt(interval).toSeconds()}:R>`,
								undefined,
								{ name: 'Distraction and Diversion' },
								sendAt(interval).toJSDate(),
								url,
							)
							: embed(
								`${name} has started!`,
								0x00aaaa,
								' ',
								{
									text: `${getType(type)}${footerText ? ` · ${footerText}` : ''}`,
									iconURL:
											'https://runescape.wiki/images/thumb/D%26D_icon.png/100px-D%26D_icon.png',
								},
								{ name: 'Distraction and Diversion' },
								undefined,
								url,
							),
					],
				},
				warn ? 5 : 1,
			);
		},
		null,
		false,
		'Europe/London',
	);
}

// TODO: Custom code for events that reset instead of start.

// Type defines the type of event.
// 0 = Hourly
// 1 = Daily
// 2 = Weekly
// 3 = Monthly
function getType(type) {
	if (type === 0) {
		return 'Hourly';
	}
	else if (type === 1) {
		return 'Daily';
	}
	else if (type === 2) {
		return 'Weekly';
	}
	else if (type === 3) {
		return 'Monthly';
	}
}

function initEvent(name, int, warn, type, frequencyText, url) {
	const event = {
		event: name,
		warn: cron(warn, int, name, type, frequencyText, url),
		int: cron(undefined, int, name, type, frequencyText, url),
	};
	return event;
}

// Interval defines how often the event should fire in a Cron format.
const eventsInternal = [
	initEvent(
		'TestEvent',
		'2-59/2 * * * *',
		'1-59/2 * * * *',
		0,
		'https://runescape.wiki/images/thumb/Penguin_%28Cold_War%29_chathead.png/33px-Penguin_%28Cold_War%29_chathead.png',
		'Short frequency information',
	),
];

const eventNames = [];

function write() {
	// Create directory if it doesn't exist
	mkdirSync('./data/', { recursive: true });
	// Create file if doesnt exist
	try {
		writeFileSync(
			'./data/events.json',
			JSON.stringify(events, null, 4),
			{ flag: 'w+' },
			() => {},
		);
	}
	catch (error) {
		console.log(error);
	}
}

function changeEvent(event, active) {
	const e = eventsInternal.find((it) => it.event === event);
	console.log(e);
	if (!e) {
		return 'ERR';
	}
	else {
		if (active) {
			if (events.includes(event)) {
				return 'SET';
			}
			// Set Interval Event

			e.int.start();
			e.warn.start();
		}
		else {
			if (!events.includes(event)) {
				return 'SET';
			}
			events.pop(event);
		}
		write();
		return 'DONE';
	}
}

let eventCanInit = true;
function initEvents() {
	if (eventCanInit) {
		eventCanInit = false;
		// Read users from file
		try {
			const data = readFileSync('./data/events.json', 'utf-8', () => {});
			events.push(...JSON.parse(data));
			console.log('Loaded ' + events.length + ' events');
		}
		catch (error) {
			console.log('No events found');
		}
	}
	eventsInternal.forEach((event) => eventNames.push(event.event));
}

function getEventsFiltered(input) {
	return eventNames.filter((choice) => choice.startsWith(input));
}

export { initEvents, changeEvent, getEventsFiltered };
