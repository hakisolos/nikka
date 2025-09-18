import { Sticker, StickerTypes } from "wa-sticker-formatter";
import config from "../config.js"
export async function toSticker(msg, buffer) {
  try {
    const sticker = new Sticker(buffer, {
      pack: config.stickerPack,
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
    });

    const stickerBuffer = await sticker.toBuffer();

    await msg.client.sendMessage(
      msg.jid,
      { sticker: stickerBuffer },
      { quoted: msg.raw }
    );
  } catch (err) {
    console.error("Sticker creation failed:", err);
    await msg.reply("Something went wrong >_<");
  }
}
export function isAdmin(metadata, userId) {
  if (!metadata || !metadata.participants || !userId) return false;

  const participant = metadata.participants.find(
    p => p.jid === userId || p.lid === userId
  );

  if (!participant) return false;

  return participant.admin === "admin" || participant.admin === "superadmin";
}
