import { command, isPrivate } from "../src/commands.js";
import { isUrl } from "../src/utils/util.js";
import axios from "axios";

command(
    {
        name: "ttimg",
        desc: "tiktok image download",
        fromMe: isPrivate,
        react: true,
        type: "download",
    },
    async (msg, match) => {
        let url = match?.trim();
        if (!url && msg.quoted?.text) {
            const found = msg.quoted.text.match(/https?:\/\/\S+/);
            url = found ? found[0] : null;
        }
        if (!url) {
            return msg.reply("_provide tiktok url_");
        }
        if (!isUrl.tiktok(url)) {
            return msg.reply("_need a valid tiktok url_");
        }
        const resp = await axios.get(`https://kord-api.vercel.app/tik-img?url=${url}`);
        const arr = resp.data.downloadableImages;
        for (const img of arr) {
            await msg.client.sendMessage(msg.jid, { image: { url: img }, quoted: msg.raw });
        }
    }
);

command(
  {
    name: "apk",
    desc: "Download apk by package or name",
    fromMe: isPrivate,
    react: true,
    type: "download",
  },
  async (msg, match) => {
    const q = match?.trim()
    if (!q) return msg.reply("_provide app name or package_")

    const r = await axios.get(`https://kord-api.vercel.app/apk?q=${encodeURIComponent(q)}`)
    const d = r.data

    if (!d?.download_url) return msg.reply("_no apk found_")

    await msg.client.sendMessage(msg.jid, {
      document: { url: d.download_url },
      mimetype: "application/vnd.android.package-archive",
      fileName: `${d.app_name} v${d.version}.apk`,
      contextInfo: {
        externalAdReply: {
          title: d.app_name || "APK Download",
          body: `Version: ${d.version || "unknown"}`,
          thumbnailUrl: d.icon || "https://telegra.ph/file/4c3d94d1d8c65b0e40f40.jpg", // fallback icon
          sourceUrl: d.download_url, 
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg.raw })
  }
)
