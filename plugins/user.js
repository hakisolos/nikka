import {command,isPrivate} from "./commands.js"

command(
  {
    name: "getpp",
    desc: "Get profile picture",
    fromMe: isPrivate,
    react: true,
    type: "user",
  },
  async (msg) => {
    let target = msg.quoted?.sender || msg.jid;

    try {
      const ppUrl = await msg.client.profilePictureUrl(target, "image");
      await msg.client.sendMessage(
        msg.jid,
        { image: { url: ppUrl } },
        { quoted: msg.raw }
      );
    } catch {
      await msg.reply("No profile picture found.");
    }
  }
);
