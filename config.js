import dotenv from "dotenv";
dotenv.config();

function toBool(value, defaultValue = false) {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
}


export default {
    OWNER: process.env.OWNER || "2349112171078",
    IMG: process.env.IMG || "http://cdn-haki.zone.id/files/H4Ouln.jpg",
    BOT: process.env.BOT || "994401499031",
    LOGGER: toBool(process.env.LOGGER, true),
    MODS: (process.env.MODS || "2349112171078,113439162822839").split(","),
    PREFIX: process.env.PREFIX || "?",
    SESSION_ID: process.env.SESSION_ID || "https://cdn-haki.zone.id/files/VziXi8.json",
    MODE: process.env.MODE || "private"
};
