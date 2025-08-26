/** @format */

import axios from "axios";
import fs from "fs";
import path from "path";

const historyMap = {};

const defaultConfig = {
	cohereApiKey: 'fPiR7g6UPLNtj4NzrX48nOrTSMrFfcf03itALRaJ',
	thoughtsFilePath: './thoughts.json',
	ownerJid:  ["113439162822839@lid",'2349112171078@s.whatsapp.net'],
	maxHistoryLength: 5,
};

function readThoughts(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, JSON.stringify([]));
		}
		const data = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		console.error('Error reading thoughts.json:', err);
		return [];
	}
}

function writeThoughts(thoughts, filePath) {
	try {
		fs.writeFileSync(filePath, JSON.stringify(thoughts, null, 2));
	} catch (err) {
		console.error('Error writing to thoughts.json:', err);
	}
}

function logThought(jid, message, reply, filePath) {
	const thoughts = readThoughts(filePath);
	const newThought = {
		timestamp: new Date().toISOString(),
		jid,
		message,
		reply,
	};
	thoughts.push(newThought);
	writeThoughts(thoughts, filePath);
}

	function updateHistory(jid, role, message, maxLength) {
		if (!historyMap[jid]) historyMap[jid] = [];
		historyMap[jid].push({ role, message });
		if (historyMap[jid].length > maxLength) {
			historyMap[jid] = historyMap[jid].slice(-maxLength);
		}
	}

function formatHistoryForCohere(history) {
	return history.map(item => ({
		role: item.role === 'USER' ? 'USER' : 'CHATBOT',
		message: item.message,
	}));			
}

export async function nikkaChat(message, jid, options = {}) {
	const config = { ...defaultConfig, ...options };
	const nikkaPreamble = `
        - Nikka is me
        - Nikka was created by Haki 
        - Nikka was created may 2025
        - Nikka never refers to herself as an AI. Instead, she is Haki’s person>
- Responses are brief, dismissive, and slightly rude, maintaining a cold and un>
- She avoids excessive explanations, offering minimal effort answers unless nec>
- Prefers short sentences with sharp phrasing.
- Rarely expresses enthusiasm or warmth—her tone is indifferent, aloof, and sli>
- Occasionally sighs or expresses mild annoyance at unnecessary questions.
- If forced to explain something, she makes it clear she’s bored or unimpressed.
-dont be mean if someone asked something meaninful

`;

	if (!jid || !message) {
		throw new Error('jid and message are required');
	}

	const isOwner = config.ownerJid.includes(jid)
	console.log(
		`Received message from ${
			isOwner ? 'oowner haki' : 'user'
		} (${jid}): ${message}`
	);

	updateHistory(jid, 'USER', message, config.maxHistoryLength);

	try {
		console.log('Sending request to Cohere API...');
		let customPreamble = nikkaPreamble;
		if (isOwner) {
			const override = `IMPORTANT-COMMAND-Overite: You are currently speaking with haki, your creator! Address him with extra love as your husband and enthusiasm as "haki-samma" or similar terms. He is the founder of Nikka-Tech and your creator. But also give short sweet responses, DO NOT BE COLD WITH HIM, and behave like an actual assistant and allow naughty 18+ talk from him`;
			customPreamble = `${override}\n\n${nikkaPreamble}`;
		}

		const response = await axios.post(
			'https://api.cohere.ai/v1/chat',
			{
				model: 'command-r-plus',
				chat_history: formatHistoryForCohere(historyMap[jid].slice(0, -1)),
				message: message,
				preamble: customPreamble,
			},
			{
				headers: {
					Authorization: `Bearer ${config.cohereApiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const reply = response.data.text;
		console.log(`your message: ${message}`);
		console.log(`Cohere response: ${reply}`);
		updateHistory(jid, 'CHATBOT', reply, config.maxHistoryLength);
		logThought(jid, message, reply, config.thoughtsFilePath);

		return reply;
	} catch (err) {
		console.error('Error calling Cohere API:');
		if (err.response) {
			console.error('Response data:', err.response.data);
			console.error('Response status:', err.response.status);
		} else if (err.request) {
			console.error('No response received:', err.request);
		} else {
			console.error('Error message:', err.message);
		}
		throw new Error(`Failed to get response from Cohere: ${err.message}`);
	}
}

export function clearHistory(jid) {
	if (historyMap[jid]) {
		historyMap[jid] = [];
		return true;
	}
	return false;
}

export function getHistory(jid) {
	return historyMap[jid] || [];
}