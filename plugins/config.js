import config from "../config.js";
import { command, isPrivate } from "../src/commands.js";
import { CHATBOT } from "../src/database/nikka.js";
import { editEnv } from "../src/utils/util.js";


command(
    {
        name: "setprefix",
        desc: "changes bot prefix",
        fromMe: true,
        react: true,
        usage: `${config.PREFIX}setprefix [new prefix]`,
        type: "config",
    },
    async(msg, match) => {
        if(!match) return await msg.reply(`_provide new prefix_`)
        if(match.length > 1) return msg.reply(`invalid string value`)
        const arg = match.trim()
        await editEnv("PREFIX", arg)
        config.PREFIX = process.env.PREFIX;
        await msg.reply(`_prefix set to "${arg}"_`)
        await msg.react("")
        process.exit()
       
    }
)


command(
    {
        name: "setowner",
        desc: "changes bot owner",
        fromMe: true,
        usage: `${config.PREFIX}setworner [new owner]`,
        react: true,
        type: "config",
    },
    async(msg, match) => {
        const arg = match.trim() || msg.quoted.sender.split("@")[0]
        if(!arg) return await msg.reply(`_provide new owner number or reply to someone`)
        if(arg.length < 1) return msg.reply(`invalid string value`)
        const formerOwner = config.OWNER
        if(arg === formerOwner) {
            return await msg.reply(`${arg}, is already owner`)
        }
        await editEnv("OWNER", arg)
        await msg.reply(`_new owner:"${arg}"_`)
        await msg.react("")
        process.exit()
        
    }
)

command(
    {
        name: "addmod",
        desc: "adds a new moderator",
        fromMe: true,
        react: true,
        usage: `${config.PREFIX}addmod [new mod]`,
        type: "config",
    },
    async (msg, match) => {
        let arg = (match?.trim()) || msg.quoted?.sender?.split("@")[0];
        if (!arg && msg.mentionedJid && msg.mentionedJid.length > 0) arg = msg.mentionedJid[0].split("@")[0];
        if (!arg) return await msg.reply(`_provide number, reply to someone, or mention someone_`);
        if (arg.length < 1) return msg.reply(`invalid string value`);

        let currentMods = config.MODS || [];
        if (!Array.isArray(currentMods)) currentMods = currentMods.split(",");
        if (currentMods.includes(arg)) return await msg.reply(`${arg} is already a moderator`);

        currentMods.push(arg);
        await editEnv("MODS", currentMods.join(","));

        await msg.reply(`_added new mod: "${arg}"_`);
        await msg.react("✅");
    }
);

command(
    {
        name: "delmod",
        desc: "removes a moderator",
        fromMe: true,
        react: true,
        usage: `${config.PREFIX}delmod [mod]`,
        type: "config",
    },
    async (msg, match) => {
        let arg = (match?.trim()) || msg.quoted?.sender?.split("@")[0];
        if (!arg && msg.mentionedJid && msg.mentionedJid.length > 0) arg = msg.mentionedJid[0].split("@")[0];
        if (!arg) return await msg.reply(`_provide number, reply to someone, or mention someone_`);
        if (arg.length < 1) return msg.reply(`invalid string value`);

        let currentMods = config.MODS || [];
        if (!Array.isArray(currentMods)) currentMods = currentMods.split(",");
        if (!currentMods.includes(arg)) return await msg.reply(`${arg} is not a moderator`);

        currentMods = currentMods.filter(mod => mod !== arg);
        await editEnv("MODS", currentMods.join(","));

        await msg.reply(`_removed mod: "${arg}"_`);
        await msg.react("✅");
    }
);

command(
    {
        name: "mode",
        desc: "changes bot mode (private/public)",
        fromMe: true,
        react: true,
        usage: `${config.PREFIX}mode [private/public]`,
        type: "config",
    },
    async (msg, match) => {
        const arg = match?.trim()?.toLowerCase();
        if (!arg || !["private", "public"].includes(arg)) 
            return await msg.reply(`_provide mode: private or public_`);

        if (config.MODE === arg) 
            return await msg.reply(`_mode is already ${arg}_`);

        await editEnv("MODE", arg);
        await msg.reply(`_mode changed to "${arg}"_`);
        await msg.react("");
        process.exit()
    }
);





command(
    {
        name: "nikka",
        desc: "changes nikka mode (on/off)",
        fromMe: true,
        react: true,
        type: "config",
    },
    async (msg, match) => {
        const arg = match?.trim()?.toLowerCase();
        if (!arg || !["on", "off"].includes(arg)) 
            return await msg.reply(`_Provide mode: on or off_`);

        const isEnabled = await CHATBOT.isEnabled(msg.jid);

        if (arg === "on") {
            if (isEnabled) return await msg.reply(`_Nikka is already on_`);
            await CHATBOT.enable(msg.jid);
            await msg.reply("Nikka enabled");
        }

        if (arg === "off") {
            if (!isEnabled) return await msg.reply(`_Nikka is already off_`);
            await CHATBOT.disable(msg.jid);
            await msg.reply("Nikka disabled");
        }

        if (msg.react) await msg.react("");
    }
);
