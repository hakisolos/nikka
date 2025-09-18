import { nikkaChat } from "./nikka.js"
import axios from "axios"
import {toSticker} from "./index.js"
import { serializeMessage } from "./serialize.js"
import util from 'util'
import { jidNormalizedUser } from "baileys"
import { commandHandler } from "./commands.js"
import {tts, isUrl} from "./utils/util.js"
import config from "../config.js"
import { command, commands, isPrivate} from "./commands.js"
import { CHATBOT } from "./database/nikka.js"
export function messageHandler(nikka) {
    nikka.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message) return

        const text =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ''

        if (text.toLowerCase() === 'nikka') {
            await nikka.sendMessage(m.key.remoteJid, { text: 'hi' }, { quoted: m })
        }

        const msg = await serializeMessage(m, nikka);
        let moderators = config.MODS
        const isModerator = moderators.includes(msg.sender.split("@")[0]) || msg.fromMe
        if (msg.body && msg.body.startsWith('$')) {
            if (!isModerator) {
                return;
            }

            const code = msg.body.slice(1).trim();  
            const result = await eval(`(async () => { ${code} })()`);
            const response = typeof result === 'string' ? result : util.inspect(result);
            await msg.reply(response)
            console.log(response)
            return;
        }

        const conds = ["165846454407227@lid", jidNormalizedUser(nikka.user.id)]

        if (msg.quoted && conds.includes(msg.quoted.sender)) {
            if(text.startsWith("?")) return
            const isEnabled = await CHATBOT.isEnabled(msg.jid);
            if(isEnabled) {
                try {
                    const res = await nikkaChat(text, msg.sender)
                    await msg.reply(res.trim())
                } catch (error) {
                    console.log(error)
                    return msg.reply("Something wrong happened >_<");
                }
            }
        }
    })
}
 

// /165846454407227@lid
export function logger(nikka) {
    nikka.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message) return

        const msgId = m.key.id
        const chatJid = m.key.remoteJid
        const senderJid = m.key.participant || m.key.remoteJid
        const type = Object.keys(m.message)[0]
        const content =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            ''

        console.log(
            `Message ID   : ${msgId}\n` +
            `Chat JID     : ${chatJid}\n` +
            `Sender JID   : ${senderJid}\n` +
            `Type         : ${type}\n` +
            `Content      : ${content}\n`
        )
    })
}
export function cmdevent(nikka) {
  nikka.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return

    const msg = await serializeMessage(m, nikka)
    if (!msg || !msg.body) return

    await commandHandler(msg)
  })
}















