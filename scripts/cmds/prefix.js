const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "2.0",
		author: "Ayan Islam",
		countDown: 5,
		role: 0,
		description: "Premium Prefix Management System",
		category: "System",
		guide: {
			en:
				"╭───『 ✦ PREFIX MENU ✦ 』\n" +
				"│\n" +
				"├─ {pn} <prefix>\n" +
				"│  └─ Change group prefix\n" +
				"│\n" +
				"├─ {pn} <prefix> -g\n" +
				"│  └─ Change global prefix (Admin)\n" +
				"│\n" +
				"├─ {pn} reset\n" +
				"│  └─ Reset group prefix\n" +
				"│\n" +
				"├─ prefix\n" +
				"│  └─ Show prefix information\n" +
				"│\n" +
				"╰───『 Ayan Islam 』"
		}
	},

	langs: {
		en: {
			reset:
				"╭━━━『 ✦ PREFIX RESET ✦ 』\n" +
				"│\n" +
				"├ ✅ Group prefix reset successfully!\n" +
				"├ ✦ Default Prefix: %1\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			onlyAdmin:
				"╭━━━『 ⚠️ ACCESS DENIED 』\n" +
				"│\n" +
				"├ Only Bot Admins can change\n" +
				"├ the Global Prefix.\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			confirmGlobal:
				"╭━━━『 🌐 GLOBAL PREFIX 』\n" +
				"│\n" +
				"├ New Prefix: %1\n" +
				"├ React to confirm this change.\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			confirmThisThread:
				"╭━━━『 🛸 GROUP PREFIX 』\n" +
				"│\n" +
				"├ New Prefix: %1\n" +
				"├ React to confirm this change.\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			successGlobal:
				"╭━━━『 ✅ GLOBAL UPDATED 』\n" +
				"│\n" +
				"├ Global Prefix: %1\n" +
				"├ Status: Successfully Changed\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			successThisThread:
				"╭━━━『 ✅ GROUP UPDATED 』\n" +
				"│\n" +
				"├ Group Prefix: %1\n" +
				"├ Status: Successfully Changed\n" +
				"│\n" +
				"╰━━━『 Ayan Islam 』",

			myPrefix:
				"╭━━━『 ✦ PREFIX INFORMATION ✦ 』\n" +
				"│\n" +
				"├ 🌐 Global Prefix: %1\n" +
				"├ 🛸 Group Prefix: %2\n" +
				"│\n" +
				"├ 👑 Developer: Ayan Islam\n" +
				"├ ⚡ Bot Status: Online\n" +
				"│\n" +
				"╰━━━『 REM X ST 』"
		}
	},

	onStart: async function ({
		message,
		role,
		args,
		commandName,
		event,
		threadsData,
		getLang
	}) {
		if (!args[0]) {
			return message.SyntaxError();
		}

		const input = args[0].toLowerCase();

		// Reset Group Prefix
		if (input === "reset") {
			await threadsData.set(
				event.threadID,
				null,
				"data.prefix"
			);

			console.log(
				`[PREFIX] Group reset | Thread: ${event.threadID}`
			);

			return message.reply(
				getLang("reset", global.GoatBot.config.prefix)
			);
		}

		const newPrefix = args[0];

		if (
			newPrefix.length > 10 ||
			/\s/.test(newPrefix)
		) {
			return message.reply(
				"⚠️ Prefix must be 1-10 characters without spaces."
			);
		}

		const setGlobal =
			args[1]?.toLowerCase() === "-g" ||
			args[1]?.toLowerCase() === "-ɢ";

		// Admin Security
		if (setGlobal && role < 2) {
			console.log(
				`[PREFIX] Unauthorized global change | User: ${event.senderID}`
			);

			return message.reply(getLang("onlyAdmin"));
		}

		const confirmationMsg = setGlobal
			? getLang("confirmGlobal", newPrefix)
			: getLang("confirmThisThread", newPrefix);

		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix,
			setGlobal
		};

		console.log(
			`[PREFIX] Change request | Prefix: ${newPrefix} | Type: ${
				setGlobal ? "Global" : "Group"
			}`
		);

		return message.reply(
			confirmationMsg,
			(err, info) => {
				if (err) return;

				formSet.messageID = info.messageID;

				global.GoatBot.onReaction.set(
					info.messageID,
					formSet
				);
			}
		);
	},

	onReaction: async function ({
		message,
		threadsData,
		event,
		Reaction,
		getLang
	}) {
		const {
			author,
			newPrefix,
			setGlobal
		} = Reaction;

		// Only the requester can confirm
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;

			fs.writeFileSync(
				global.client.dirConfig,
				JSON.stringify(
					global.GoatBot.config,
					null,
					2
				)
			);

			console.log(
				`[PREFIX] Global changed | Prefix: ${newPrefix}`
			);

			return message.reply(
				getLang("successGlobal", newPrefix)
			);
		}

		await threadsData.set(
			event.threadID,
			newPrefix,
			"data.prefix"
		);

		console.log(
			`[PREFIX] Group changed | Thread: ${event.threadID} | Prefix: ${newPrefix}`
		);

		return message.reply(
			getLang("successThisThread", newPrefix)
		);
	},

	onChat: async function ({
		event,
		message,
		getLang
	}) {
		if (
			event.body &&
			event.body.trim().toLowerCase() === "prefix"
		) {
			const threadPrefix = utils.getPrefix(
				event.threadID
			);

			console.log(
				`[PREFIX] Information requested | Thread: ${event.threadID}`
			);

			return () =>
				message.reply(
					getLang(
						"myPrefix",
						global.GoatBot.config.prefix,
						threadPrefix
					)
				);
		}
	}
};
