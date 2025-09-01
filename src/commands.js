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
    const pluginUrl = "file://" + pluginPath.replace(/\\/g, "/")
    import(pluginUrl).catch(err => {
      console.error(`Failed to load plugin ${file}:`, err)
    })
  }
}

export async function commandHandler(msg) {
  const text = msg.body || ""

  for (const cmd of commands.filter(c => c.on === "text")) {
    try {
      await cmd.execute(msg, text)
    } catch (err) {
      await msg.reply("an error occured")
      await msg.client.sendMessage(msg.client.user.id, { text: `Error in on:text command (${cmd.name}):\n\n${err.stack || err}` })
    }
  }

  if (!text.startsWith(prefix)) return

  const parts = text.slice(prefix.length).trim().split(" ")
  const cmdName = parts[0].toLowerCase()
  const match = parts.slice(1).join(" ")

  const cmd = commands.find(c => c.name === cmdName && !c.on)
  if (!cmd) return

  const isModerator = moderators.includes(msg.sender.split("@")[0]) || msg.fromMe
  if (cmd.fromMe && !isModerator) return

  if (cmd.react) await msg.react("⏳")

  try {
    await cmd.execute(msg, match)
  } catch (err) {
    await msg.reply("an error occured")
    await msg.client.sendMessage(msg.client.user.id, { text: `Error in command (${cmd.name}):\n\n${err.stack || err}` })
  } finally {
    if (cmd.react) await msg.react("")
  }
}

export function command(options, execute) {
  const cmdData = {
    usage: options.usage || null,
    on: options.on || null,
    ...options,
    execute
  }

  if (options.type) {
    commands.push(cmdData)
  }

  return cmdData
}

export const isPrivate = () => {
  return config.MODE === "private"
}
