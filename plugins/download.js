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
