/* eslint-disable no-empty-function */
import { mkdirSync, writeFileSync, readFileSync } from 'fs';

const users = [];

function addUser(id, name) {
	users.pop({ id });
	users.push({ id, name });
	writeUsers();
}

function writeUsers() {
	// Create directory if it doesn't exist
	mkdirSync('./data/', { recursive: true });
	// Create file if doesnt exist
	try {
		writeFileSync(
			'./data/data.json',
			JSON.stringify(users, null, 4),
			{ flag: 'w+' },
			() => {},
		);
	}
	catch (error) {
		console.log(error);
	}
}

function removeUser(id) {
	users.pop({ id });
	writeUsers();
}

let userCanInit = true;
function initUsers() {
	if (userCanInit) {
		userCanInit = false;
		// Read users from file
		try {
			const data = readFileSync('./data/data.json', 'utf-8', () => {});
			users.push(...JSON.parse(data));
			console.log('Loaded ' + users.length + ' users');
		}
		catch (error) {
			console.log('No users found');
		}
	}
}

function getUser(id) {
	return users.find((user) => user.id === id);
}

export { addUser, initUsers, removeUser, getUser };
