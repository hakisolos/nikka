import config from "../config.js"
import { nikkaChat } from "./nikka.js"
import { serializeMessage } from "./serialize.js"
import util from 'util'
import { jidNormalizedUser } from "baileys"
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
        if (msg.body && msg.body.startsWith('?')) {
            if (!(msg.key && msg.fromMe) && config.OWNER === msg.sender) {
                return;
            }

            const code = msg.body.slice(1).trim();
            const result = await eval(`(async () => { ${code} })()`);
            const response = typeof result === 'string' ? result : util.inspect(result);
            await msg.reply(response)
            console.log(response)
            return;
        }
        
        if (msg.quoted && msg.quoted.sender === "165846454407227@lid") {
            if(text.startsWith("?")) return
            const res = await nikkaChat(text, msg.sender)
            await msg.reply(res)
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


