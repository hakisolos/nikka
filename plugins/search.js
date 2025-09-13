import { command, isPrivate } from "../src/commands.js";
import { isUrl } from "../src/utils/util.js";
import axios from "axios";

command(
  {
    name: "ss",
    desc: "Take webpage screenshot",
    fromMe: isPrivate,
    react: true,
    type: "download",
  },
  async (msg, match) => {
    let q = match?.trim() || ""
    const parts = q.split(/\s+/)
    let url = parts.find(x => x.startsWith("http"))
    let size = parts.find(x => /^(phone|tablet|pc)$/i.test(x))

    if (!url && msg.quoted?.text) {
      const found = msg.quoted.text.match(/https?:\/\/\S+/)
      url = found ? found[0] : null
      if (!size && q) size = q
    }

    if (!url) return msg.reply("_send or reply with a valid url_")

    const api = `https://ss.haki.top/screenshot?url=${encodeURIComponent(url)}${size ? `&size=${size.toLowerCase()}` : ""}`

    await msg.client.sendMessage(msg.jid, {
      image: { url: api },
      caption: `Screenshot of ${url}`
    }, { quoted: msg.raw })
  }
)
