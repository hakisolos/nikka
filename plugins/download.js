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

command(
  {
    name: "insta",
    desc: "Download Instagram reels/posts",
    fromMe: isPrivate,
    react: true,
    type: "download",
  },
  async (msg, match) => {
    let q = match?.trim() || msg.quoted?.text || ""
    const urlRegex = /(https?:\/\/(?:www\.)?instagram\.com\/[^\s]+)/i
    const found = q.match(urlRegex)
    const url = found ? found[0] : null

    if (!url) return msg.reply("_send or reply with a valid Instagram link_")

    const r = await axios.get(`https://kord-api.vercel.app/insta?url=${encodeURIComponent(url)}`)
    const d = r.data

    if (!d?.url) return msg.reply("_no media found_")

    await msg.client.sendMessage(msg.jid, {
      video: { url: d.url },
      mimetype: "video/mp4",
      caption: `\n📹 Type: ${d.type || "video"}`,
      contextInfo: {
        externalAdReply: {
          title: "Instagram Download",
          body: `nikka`,
          thumbnailUrl: d.thumb,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: msg.raw })
  }
)

command(
  {
    name: "pindl",
    desc: "Download Pinterest images",
    fromMe: isPrivate,
    react: true,
    type: "download",
  },
  async (msg, match) => {
    let q = match?.trim() || msg.quoted?.text || ""
    const urlRegex = /(https?:\/\/(?:www\.)?(?:pin\.it|pinterest\.com)\/[^\s]+)/i
    const found = q.match(urlRegex)
    const url = found ? found[0] : null

    if (!url) return msg.reply("_send or reply with a valid Pinterest link_")

    const r = await axios.get(`https://kord-api.vercel.app/pinterest?url=${encodeURIComponent(url)}`)
    const d = r.data?.data?.data

    if (!d?.downloads?.[0]?.url) return msg.reply("_no media found_")

    await msg.client.sendMessage(msg.jid, {
      image: { url: d.downloads[0].url },
      caption: `📌 ${d.title || "Pinterest"}`
    }, { quoted: msg.raw })
  }
)
command(
  {
    name: "tiktok",
    desc: "Download TikTok videos or audio",
    fromMe: isPrivate,
    react: true,
    type: "download",
  },
  async (msg, match) => {
    const q = match?.trim() || ""
    const ref = msg.quoted?.text || ""
    const combined = q + " " + ref

    const urlRegex = /(https?:\/\/(?:vm\.)?tiktok\.com\/[^\s]+)/i
    const found = combined.match(urlRegex)
    const url = found ? found[0] : null
    const audioMode = /audio$/i.test(q)

    if (!url) return msg.reply("_send or reply with a valid TikTok link_")

    const r = await axios.get(`https://kord-api.vercel.app/tiktok?url=${encodeURIComponent(url)}`)
    const d = r.data?.data
    if (!d?.downloadLinks) return msg.reply("_no media found_")

    const audio = d.downloadLinks.find(x => /mp3/i.test(x.label))
    const video = d.downloadLinks.find(x => /mp4/i.test(x.label))

    if (audioMode && audio) {
      await msg.client.sendMessage(msg.jid, {
        audio: { url: audio.link },
        mimetype: "audio/mpeg",
        fileName: "tiktok_audio.mp3",
      }, { quoted: msg.raw })
    } else if (video) {
      await msg.client.sendMessage(msg.jid, {
        video: { url: video.link },
        mimetype: "video/mp4",
        caption: d.title || "TikTok",
      }, { quoted: msg.raw })
    } else {
      return msg.reply("_couldn’t fetch media_")
    }
  }
)
