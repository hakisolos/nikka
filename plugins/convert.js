import { command, isPrivate } from "../src/commands.js";


import { Sticker, StickerTypes }  from"wa-sticker-formatter";

async function toSticker(msg, buffer) {
  const sticker = new Sticker(buffer, {
    pack: "Haki",
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
}

command(
  {
    name: "sticker",
    desc: "Convert image/video to sticker",
    fromMe: isPrivate,
    react: true,
    type: "converter",
  },
  async (msg, match) => {
    if (
      !msg.quoted ||
      !["imageMessage", "videoMessage"].includes(msg.quoted.type)
    ) {
      return msg.reply("_Reply to an image or video to make a sticker _");
    }

    const buffer = await msg.quoted.download();
    if (!buffer) return msg.reply("_Failed to download media _");

    await toSticker(msg, buffer);
  }
);
