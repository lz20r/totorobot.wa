const { exec } = require("child_process");
const totoroLog = require("../../functions/totoroLog");
const { sendError } = require("../../functions/messages");
const runtime = require("../../functions/runtime");

module.exports = {
  name: "cls",
  category: "developer",
  subcategory: "system",
  description: "Limpiar la consola.",
  usage: "<cls>",
  dev: true,

  async execute(totoro, msg) {
    try {
      // Limpiar la consola
      console.clear();

      msg.react("⏳");
      const remoteJid = msg?.messages?.[0]?.key?.remoteJid;

      totoroLog.info(
        "./logs/plugins/developer/cls.log",
        `Totoro ha limpiado la consola.`
      );
      await totoro.sendMessage(remoteJid, {
        text:
          `╭─⬣「 Totoro 」⬣\n` +
          `│  ≡◦  🍭 Consola limpiada...\n` +
          `╰─⬣\n` +
          `> Totoro ha limpiado la consola.`,
      });
      await msg.react("🪼");
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/developer/cls.log",
        `Error al limpiar la consola: ${error.message}`
      );
      if (msg && msg.key && msg.key.remoteJid) {
        sendError(totoro, msg, `Error al limpiar la consola: ${error.message}`);
      }
    }
  },
};
