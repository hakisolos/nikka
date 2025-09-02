import { command, commands, isPrivate } from "../src/commands.js";
import config from "../config.js"
import { readMoreText } from "../src/utils/util.js";
command(
    {
        name: "ping",
        desc: "shows ping of bot",
        usage: `${config.PREFIX}ping`,
        fromMe: isPrivate,
        react: true,
        type: "info",
    },
    async (msg, match) => {
        const start = Date.now();
        const response = await msg.reply('Measuring ping...'); 
        const end = Date.now();
        await msg.client.sendMessage(msg.jid, {
            text: `Pong! ${end - start}ms`,
            edit: response.key,
        });
    } 
)




command(
  {
    name: "menu",
    desc: "Display all bot commands by categories",
    usage: `${config.PREFIX}menu [category/command]`,
    type: "info",
    fromMe: false,
    react: true
  },
  async (msg, match) => {
    const prefix = config.PREFIX
    const botName = "nikka md"
    const owner = "Nikka"
    const readMore = readMoreText()

    let [date, time] = new Date()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      .split(",")

    if (match) {
      const query = match.toLowerCase()

      const cmd = commands.find(c => c.name?.toLowerCase() === query)
      if (cmd) {
        return await msg.reply(
          `\`\`\`Command: ${prefix}${cmd.name}
Description: ${cmd.desc || "No description"}
Usage: ${cmd.usage || "No usage"}
Category: ${cmd.type || "misc"}\`\`\``
        )
      }

      const categoryCommands = commands
        .filter(c => (c.type || "misc").toLowerCase() === query && c.name)
        .map(c => c.name)

      if (categoryCommands.length > 0) {
        let menu = `\`\`\`╭─𖣘 ${botName} 𖣘
🌸 Prefix: ${prefix}
🌸 Owner: ${owner}
🌸 Date: ${date}
🌸 Category: ${query.toUpperCase()}
🌸 Commands: ${categoryCommands.length}
╰───────\`\`\`\n${readMore}`

        menu += `\n\`\`\`╭── ${query.toUpperCase()} ──\`\`\``
        categoryCommands
          .sort((a, b) => a.localeCompare(b))
          .forEach(cmdName => {
            menu += `\n│\`\`\`❀ ${cmdName.trim()}\`\`\``
          })
        menu += `\n╰───────\n\n`
        menu += `\n\n\`\`\`𝗡𝗶𝗸𝗸𝗮 𝘅 𝗺𝗱\`\`\``

        return await msg.client.sendMessage(msg.jid, {
          image: { url: config.IMG },
          caption: menu
        })
      }

      return await msg.reply(
        `"${query}" not found as a command or category. Use ${prefix}menu to see all categories.`
      )
    }

    let menu = `\`\`\`╭─𖣘 ${botName} 𖣘
🌸 Prefix: ${prefix}
🌸 Owner: ${owner}
🌸 Date: ${date}
🌸 Cmds: ${commands.filter(c => c.name).length}
╰───────\`\`\`\n${readMore}`

    const categories = [...new Set(commands.filter(c => c.name).map(c => c.type || "misc"))].sort()

    categories.forEach(cat => {
      menu += `\n\`\`\`╭── ${cat.toUpperCase()} ──\`\`\``
      commands
        .filter(c => (c.type || "misc") === cat && c.name)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(c => {
          menu += `\n│\`\`\`❀ ${c.name.trim()}\`\`\``
        })
      menu += `\n╰───────\n\n`
    })

    menu += `\n\n\`\`\`𝗡𝗶𝗸𝗸𝗮 𝘅 𝗺𝗱\`\`\``

    return await msg.client.sendMessage(
      msg.jid,
      {
        text: menu,
        contextInfo: {
          externalAdReply: {
            title: "NIKKA | MENU",
            body: "NIKKA SOCIETY",
            thumbnailUrl: "http://cdn-haki.zone.id/files/zhQhjM.png",
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: msg.raw }
    )
  }
)

command(
    {
        name: "restart",
        desc: "restart bot",
        usage: `${config.PREFIX}restart`,
        react: false,
        type: "system",
    },
    async(msg, match) => {
        await msg.reply("_Restarting Bot_")
        process.exit()
    }
)
