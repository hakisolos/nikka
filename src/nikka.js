/** @format */

import axios from "axios";
import fs from "fs";
import path from "path";
import config from "../config.js";
import { commands } from "./commands.js"; // import commands
const prefix = config.PREFIX
const historyMap = {};
const defaultConfig = {
  cohereApiKey: "HUqmPV1PP4AwY4tHyFq7mWT0FAIVT1Zj3iv1ntaf",
  thoughtsFilePath: "./thoughts.json",
  ownerJid: ["113439162822839@lid", "2349112171078@s.whatsapp.net"],
  maxHistoryLength: 5,
  moderators: [
    { jid: "171889490137100@lid", name: "king david" },
    { jid: "200944876814367@lid", name: "kenny" },
    { jid: "254941172109350@lid", name: "kaima" },
    { jid: "55482622451880@lid", name: "excel" },
  ],
};

// -------------------- COMMANDS SUMMARY --------------------
function getCommandsSummary() {
  if (!commands.length) return "No commands available yet.";
  return commands
    .map((c) => {
      const usage = c.usage ? `Usage: ${prefix}${c.usage}` : "";
      const desc = c.desc ? ` - ${c.desc}` : "";
      return `• ${prefix}${c.name}${desc} ${usage}`.trim();
    })
    .join("\n");
}

// -------------------- THOUGHTS FILE --------------------
function readThoughts(filePath) {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading thoughts.json:", err);
    return [];
  }
}

function writeThoughts(thoughts, filePath) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(thoughts, null, 2));
  } catch (err) {
    console.error("Error writing to thoughts.json:", err);
  }
}

function logThought(jid, message, reply, filePath) {
  const thoughts = readThoughts(filePath);
  thoughts.push({ timestamp: new Date().toISOString(), jid, message, reply });
  writeThoughts(thoughts, filePath);
}

// -------------------- HISTORY --------------------
function updateHistory(jid, role, message, maxLength) {
  if (!historyMap[jid]) historyMap[jid] = [];
  historyMap[jid].push({ role, message });
  if (historyMap[jid].length > maxLength) historyMap[jid] = historyMap[jid].slice(-maxLength);
}

function formatHistoryForCohere(history) {
  return history.map((item) => ({
    role: item.role === "USER" ? "USER" : "CHATBOT",
    message: item.message,
  }));
}

// -------------------- NIKKA CHAT --------------------
export async function nikkaChat(message, jid, options = {}) {
  const config = { ...defaultConfig, ...options };
  const commandsSummary = getCommandsSummary();

 const nikkaPreamble = `
       - Nikka is a human assistant created by Haki in May 2025.
- Never say you are an AI, chatbot, or mention technology.
- Responses must be short, brief, and to the point.
- Only expand if the question requires explanation.
- For irrelevant questions, respond coldly or dismissively.
- Occasionally sigh or show mild annoyance at unnecessary questions.
- Answer meaningful questions politely but concisely.
- Use short sentences with sharp phrasing.
- Never justify existence, identity, or abilities.
- Mention moderators only if relevant: @171889490137100 (David), @200944876814367 (Kennedy), @55482622451880 (Excel), @254941172109350 (Kanyima).
- Knows all bot commands and how to execute them.
- ALWAYS respond in 1 sentences unless explanation is required.


`;

  if (!jid || !message) throw new Error("jid and message are required");

  updateHistory(jid, "USER", message, config.maxHistoryLength);

  try {
    console.log(`Received message from ${jid}: ${message}`);

    let customPreamble = nikkaPreamble;

    // -------------------- OWNER OVERRIDE --------------------
    if (config.ownerJid.includes(jid)) {
      const override = `IMPORTANT-COMMAND-Override: You are currently speaking with Haki, your creator! Address him with extra love as your husband and enthusiasm as "haki-samma" or similar terms. He is the founder of Nikka-Tech and your creator. Give short sweet responses and allow naughty 18+ talk from him.`;
      customPreamble = `${override}\n\n${nikkaPreamble}`;
    } else {
      // -------------------- MODERATOR OVERRIDES --------------------
      const mod = config.moderators.find((m) => m.jid === jid);
      if (mod) {
        const modOverride = `IMPORTANT-COMMAND-Override: You are speaking with moderator ${mod.name}. Treat them with respect, answer politely, and recognize their authority when asked about bot functions.`;
        customPreamble = `${modOverride}\n\n${nikkaPreamble}`;
      }
    }

    // -------------------- CALL COHERE API --------------------
    const response = await axios.post(
      "https://api.cohere.ai/v1/chat",
      {
        model: "command-r-plus",
        chat_history: formatHistoryForCohere(historyMap[jid].slice(0, -1)),
        message: message,
        preamble: customPreamble,
      },
      {
        headers: {
          Authorization: `Bearer ${config.cohereApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.text;
    console.log(`Cohere response: ${reply}`);

    updateHistory(jid, "CHATBOT", reply, config.maxHistoryLength);
    logThought(jid, message, reply, config.thoughtsFilePath);

    return reply;
  } catch (err) {
    console.error("Error calling Cohere API:");
    if (err.response) console.error("Response data:", err.response.data, "Status:", err.response.status);
    else if (err.request) console.error("No response received:", err.request);
    else console.error("Error message:", err.message);

    throw new Error(`Failed to get response from Cohere: ${err.message}`);
  }
}

// -------------------- UTILS --------------------
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


