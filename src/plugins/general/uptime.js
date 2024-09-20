const runtime = require("../../functions/runtime");
const moment = require("moment-timezone");

if (typeof global.lastRestartTime === "undefined") {
  global.lastRestartTime = new Date();
}

module.exports = {
  name: "uptime",
  category: "general",
  subcategory: "information",
  aliases: [
    "up",
    "tiempo",
    "conexión",
    "totoconexión",
    "totoconn",
    "totouptime",
  ],
  description: "Tiempo de conexión del bot.",
  onlyGroup: false,

  async execute(totoro, msg) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    await msg.react("⏳");
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    try {
      const uptimeString = await runtime(process.uptime());
      const lastRestartUserTime = formatDate(global.lastRestartTime);

      reply(
        `╭─⬣「 *Totoro Uptime* 」⬣\n` +
          `│ 🍭 Conexión: \`${uptimeString}\`\n` +
          `│ 🍭 Últ. reinicio: \`${lastRestartUserTime}\`\n` +
          `╰─⬣`
      );
      await msg.react("🪧");
    } catch (e) {
      reply(`Error: ${e.message}`);
    }
  },
};

function formatDate(timestamp) {
  return moment(timestamp).tz("Europe/Madrid").format("DD/MM/YYYY HH:mm:ss");
}
