import { command } from "../src/commands.js";
import config from "../config.js";
import axios from "axios";

const prefix = config.PREFIX;

command(
  {
    name: "tts",
    desc: "Convert text to speech using Google TTS",
    usage: `${prefix}tts <text>`,
    fromMe: true,
    type: "internet",
  },
  async (msg, match) => {
    const text = match?.trim();
    if (!text) return await msg.reply("Please provide text to convert to speech.");

    try {
      const lang = "en"; // You can make this dynamic if needed
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=${lang}&client=tw-ob`;

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/89.0.4389.82 Safari/537.36",
        },
      });

      await msg.client.sendMessage(msg.jid, {
        audio: Buffer.from(response.data),
        mimetype: "audio/mp4",
        ptt: true, // sends as voice note
      });
    } catch (error) {
      console.error("TTS error:", error);
      await msg.reply("Failed to generate speech. Try again later.");
    }
  }
);
