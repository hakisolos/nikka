import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");

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
