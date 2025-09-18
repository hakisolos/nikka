import { command, isPrivate } from "../src/commands.js";


import { Sticker, StickerTypes }  from"wa-sticker-formatter";

async function toSticker(msg, buffer, type) {
  const sticker = new Sticker(buffer, {
    pack: "Haki",
    author: "Nikka",
    type,
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
    name: "stk",
    desc: "Convert image/video to sticker",
    fromMe: isPrivate,
    react: true,
    type: "converter",
  },
  async (msg, match) => {
    if (!msg.quoted || !["imageMessage", "videoMessage"].includes(msg.quoted.type)) {
      return msg.reply("Reply to an image or video to make a sticker");
    }

    let option = match?.trim().toLowerCase();
    let type = StickerTypes.FULL;

    if (option === "crop") type = StickerTypes.CROP;
    else if (option === "round") type = StickerTypes.CIRCLE;
    else if (option && option !== "full") {
      return msg.reply("Invalid option. Use: stk | stk crop | stk round");
    }

    const buffer = await msg.quoted.download();
    if (!buffer) return msg.reply("Failed to download media");

    await toSticker(msg, buffer, type);
  }
);
