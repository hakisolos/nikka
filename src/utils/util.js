import fs from "fs";
import path from "path";
import { commands } from "../commands.js";
import config from "../../config.js";
const prefix = config.PREFIX
const envPath = path.resolve(process.cwd(), "config.env");

export function editEnv(key, value) {
  let envConfig = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  const newLine = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (envConfig.match(regex)) {
    envConfig = envConfig.replace(regex, newLine);
  } else {
    envConfig += (envConfig ? "\n" : "") + newLine;
  }

  fs.writeFileSync(envPath, envConfig, "utf8");
  process.env[key] = value.toString();
}

// ================================
// File watcher to auto-reload .env
// ================================
fs.watch(envPath, (eventType) => {
  if (eventType === "change") {
    console.log(".env changed! Reloading...");
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach(line => {
      const [k, v] = line.split("=");
      if (k) process.env[k] = v;
    });
    console.log("Updated process.env:", process.env);
  }
});


export function readMoreText() {
  return String.fromCharCode(8206).repeat(4001)
}



function getCommandsSummary() {
    if (!commands.length) return "No commands available yet.";
    
    return commands.map(c => {
        const usage = c.usage ? `Usage: ${prefix}${c.usage}` : '';
        const desc = c.desc ? ` - ${c.desc}` : '';
        return `• ${prefix}${c.name}${desc} ${usage}`.trim();
    }).join('\n');
}



export function getUptime() {
  let totalSeconds = Math.floor(process.uptime());
  let days = Math.floor(totalSeconds / (24 * 60 * 60));
  let hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  let result = [];
  if (days) result.push(`${days}d`);
  if (hours) result.push(`${hours}h`);
  if (minutes) result.push(`${minutes}m`);
  if (seconds) result.push(`${seconds}s`);

  return result.join(" ");
}
