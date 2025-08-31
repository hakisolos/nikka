import fs from 'fs';
import pino from 'pino';
import NodeCache from 'node-cache';
import {
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    makeWASocket,
} from 'baileys';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import qrcode from 'qrcode-terminal';
import {messageHandler} from './src/events.js';
import {logger} from "./src/events.js"
import { loadCommands } from './src/commands.js';
import { cmdevent } from './src/events.js';
import LOG from './src/utils/logger.js';
import config from './config.js';
import  savesess  from './src/session.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let nikka;

const msgRetryCounterCache = new NodeCache();

async function connector() {
    const sessionDir = './session';
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir);
    }
    await savesess(config.SESSION_ID);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    nikka = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
        },
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true,
        msgRetryCounterCache
    });

    //sessiion retrieval 
   
    

    nikka.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

       /* if (qr) {
            qrcode.generate(qr, { small: true });
        }
            */
        

        if (connection === 'open') {
            console.log('Connected successfully');
            await delay(3000);

            try {
                await nikka.sendMessage(nikka.user.id, {
                    text: "nikka connected successfull"
                });
            } catch (error) {
                console.error('Upload error:', error);
            } finally {
                console.log("established connection");
            }
        } else if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            reconn(reason);
        }
    });

        nikka.ev.on('creds.update', saveCreds);

        LOG.process("installing commands")
        loadCommands()

        LOG.success("commands installed")
        messageHandler(nikka)

        cmdevent(nikka)

        if(config.LOGGER) {
            logger(nikka)
        }



}

function reconn(reason) {
    if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired].includes(reason)) {
        console.log('Connection lost, reconnecting...');
        connector();
    } else {
        console.log(`Disconnected! reason: ${reason}`);
        nikka?.end?.();
    }
}

connector();
