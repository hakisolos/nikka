import dotenv from "dotenv";
dotenv.config();

function toBool(value, defaultValue = false) {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
}


export default {
    OWNER: process.env.OWNER || "2349112171078",
    IMG: "http://cdn-haki.zone.id/files/H4Ouln.jpg",
    LOGGER: toBool(process.env.LOGGER, true),
    MODS: process.env.MODS ? process.env.MODS.split(",").map(m => m.trim()) : [],
    PREFIX: process.env.PREFIX,
    SESSION_URL: process.env.SESSION_URL ,
    MODE: process.env.MODE
};
