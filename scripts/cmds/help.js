const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const mediaUrls = [
  "https://i.imgur.com/OrRKAkP.gif"
];

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "use", "cmd"],
    version: "3.0",
    author: "Ayan Islam",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "👑 Premium Command Center"
    },

    longDescription: {
      en: "Luxury dark themed command menu with advanced search and category navigation."
    },

    category: "system",

    guide: {
      en: "{pn}\n{pn} [page]\n{pn} [command]\n{pn} -c [category]"
    },

    priority: 1
  },

  onStart: async function ({ message, args, event }) {
    try {
      const prefix = getPrefix(event.threadID) || "!";

      const getAttachment = async () => {
        try {
          const validUrls = mediaUrls.filter(Boolean);

          if (!validUrls.length) return null;

          const randomUrl =
            validUrls[Math.floor(Math.random() * validUrls.length)];

          const response = await axios.get(randomUrl, {
            responseType: "stream",
            timeout: 15000
          });

          return response.data;
        } catch (error) {
          console.error("GIF Error:", error.message);
          return null;
        }
      };

      const brand = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃   👑 𝐀𝐘𝐀𝐍 𝐈𝐒𝐋𝐀𝐌 👑
┃   𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

      // MAIN HELP MENU
      if (!args.length || !isNaN(args[0])) {
        const categories = {};

        for (const [name, cmd] of commands) {
          const category =
            (cmd.config.category || "uncategorized").toLowerCase();

          if (!categories[category]) {
            categories[category] = [];
          }

          categories[category].push(name);
        }

        const categoryList = Object.keys(categories).sort();
        const itemsPerPage = 8;
        const totalPages = Math.max(
          1,
          Math.ceil(categoryList.length / itemsPerPage)
        );

        const page = parseInt(args[0]) || 1;

        if (page < 1 || page > totalPages) {
          return message.reply(
            `╭─ ⚠️ INVALID PAGE\n┃ Available: 1 - ${totalPages}\n╰━━━━━━━━━━━━━━━━━━`
          );
        }

        const currentCategories = categoryList.slice(
          (page - 1) * itemsPerPage,
          page * itemsPerPage
        );

        let msg = `${brand}

╭━━━『 ✦ 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 ✦ 』
┃
┃ ✧ Total Commands: ${commands.size}
┃ ✧ Categories: ${categoryList.length}
┃ ✧ Current Page: ${page}/${totalPages}
┃ ✧ Bot Prefix: ${prefix}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

        for (const category of currentCategories) {
          const names = categories[category].sort();

          msg += `╭━━『 ${category.toUpperCase()} 』
┃
┃ ✦ ${names.join(" ⟡ ")}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;
        }

        msg += `╭━━━『 📖 𝐔𝐒𝐀𝐆𝐄 』
┃
┃ ✧ ${prefix}help
┃ ✧ ${prefix}help 2
┃ ✧ ${prefix}help command
┃ ✧ ${prefix}help -c info
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━『 👑 𝐎𝐖𝐍𝐄𝐑 』
┃ ✦ Ayan Islam
┃ ✦ Premium Messenger Bot
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

        return message.reply({
          body: msg,
          attachment: await getAttachment()
        });
      }

      // CATEGORY SEARCH
      if (args[0].toLowerCase() === "-c") {
        const categoryName = args.slice(1).join(" ").toLowerCase();

        if (!categoryName) {
          return message.reply(
            `⚠️ Enter a category name!\nExample: ${prefix}help -c info`
          );
        }

        const filtered = Array.from(commands.values()).filter(cmd =>
          (cmd.config.category || "uncategorized").toLowerCase() === categoryName
        );

        if (!filtered.length) {
          return message.reply(
            `╭─ ❌ CATEGORY NOT FOUND\n┃ ${categoryName}\n╰━━━━━━━━━━━━━━━━━━`
          );
        }

        const names = filtered
          .map(cmd => cmd.config.name)
          .sort();

        let msg = `${brand}

╭━━『 ✦ ${categoryName.toUpperCase()} ✦ 』
┃
┃ Total Commands: ${names.length}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

        names.forEach((name, index) => {
          msg += `┃ ${String(index + 1).padStart(2, "0")} ⟡ ${name}\n`;
        });

        msg += `
╰━━━━━━━━━━━━━━━━━━━━━━╯

${brand}`;

        return message.reply({
          body: msg,
          attachment: await getAttachment()
        });
      }

      // COMMAND INFORMATION
      const commandName = args[0].toLowerCase();

      const aliasTarget = aliases.get(commandName);

      const command =
        commands.get(commandName) ||
        (aliasTarget ? commands.get(aliasTarget) : null);

      if (!command) {
        return message.reply(
          `╭━━『 ❌ NOT FOUND 』
┃ Command: ${commandName}
┃
┃ Use ${prefix}help
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      const cfg = command.config;

      const description =
        cfg.longDescription?.en ||
        cfg.shortDescription?.en ||
        "No description available.";

      const guide = cfg.guide?.en || "No guide available.";

      const usage = guide
        .replace(/{pn}/g, prefix)
        .replace(/{n}/g, cfg.name);

      let msg = `${brand}

╭━━『 ✦ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎 ✦ 』
┃
┃ 👑 Name: ${cfg.name}
┃ ✍ Author: ${cfg.author || "Unknown"}
┃ 📦 Version: ${cfg.version || "1.0"}
┃ 📂 Category: ${cfg.category || "Uncategorized"}
┃ ⏳ Cooldown: ${cfg.countDown || 1}s
┃ 🔐 Permission: ${cfg.role ?? 0}
┃ 🔗 Aliases: ${(cfg.aliases || []).join(", ") || "None"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━『 📝 DESCRIPTION 』
┃
┃ ${description}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━『 📚 COMMAND USAGE 』
┃
┃ ${usage}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━『 💎 BOT STATISTICS 』
┃
┃ Total Commands: ${commands.size}
┃ Owner: Ayan Islam
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

${brand}`;

      return message.reply({
        body: msg,
        attachment: await getAttachment()
      });

    } catch (error) {
      console.error("Help Command Error:", error);

      return message.reply(
        "╭━━『 ⚠️ SYSTEM ERROR 』\n┃ Help menu failed to load.\n┃ Please try again later.\n╰━━━━━━━━━━━━━━━━━━╯"
      );
    }
  }
};
