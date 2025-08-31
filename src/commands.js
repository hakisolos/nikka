import fs from "fs"
import path from "path"
import config from "../config.js"
let moderators = config.MODS

export const commands = []
const prefix = config.PREFIX
export function loadCommands() {
  const pluginsDir = path.join(process.cwd(), "plugins")
  if (!fs.existsSync(pluginsDir)) return

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"))
  for (const file of files) {
    const pluginPath = path.join(pluginsDir, file)
    const pluginUrl = 'file://' + pluginPath.replace(/\\/g, '/')
    import(pluginUrl).catch(err => {
      console.error(`Failed to load plugin ${file}:`, err)
    })
  }
}

export async function commandHandler(msg) {
  const text = msg.body || ""
  if (!text.startsWith(prefix)) return

  const parts = text.slice(prefix.length).trim().split(" ")
  const cmdName = parts[0].toLowerCase()
  const match = parts.slice(1).join(" ")

  const cmd = commands.find(c => c.name === cmdName)
  if (!cmd) return

  const isModerator = moderators.includes(msg.sender.split("@")[0]) || msg.fromMe
  if (cmd.fromMe && !isModerator) return

  if (cmd.react) await msg.react("⏳")

  try {
    await cmd.execute(msg, match)
  } finally {
    if (cmd.react) await msg.react("")
  }
}

export function command(options, execute) {
  commands.push({
    ...options,
    execute
  })
}

export const isPrivate = () => {
    if(config.MODE === "private") {
        return true
    }
    else return false
}