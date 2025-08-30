import { command, isPrivate } from "../src/commands.js";
command(
    {
        name: "ping",
        desc: "shows ping of bot",
        fromMe: isPrivate,
        react: true
    },
    async (msg, match) => {
        const start = Date.now();
        const response = await msg.reply('Measuring ping...'); 
        const end = Date.now();
        await msg.client.sendMessage(msg.jid, {
            text: `Pong! ${end - start}ms`,
            edit: response.key,
        });
    } 
)

