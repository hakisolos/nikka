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


