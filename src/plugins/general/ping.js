const axios = require("axios");
const { getCpuUsage, getDiskUsage, getRamUsage } = require("../../functions/systemUtils");
const runtime = require("../../functions/runtime");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "ping",
  category: "general",
  subcategory: "information",
  description: "Mide latencia y muestra uso del sistema con un video.",
  usage: `${prefix}ping`,
  aliases: ["ping", "lat", "latency"],
  cooldown: 5,

  async execute(totoro, msg) {
    try {
      const start = Date.now();
      const remoteJid = msg.messages[0].key.remoteJid;

      await totoro.sendMessage(remoteJid, { text: "🏓 Midiendo latencia..." });

      const { model, percentageUsed, totalTime } = getCpuUsage(); // Obtenemos también el modelo de la CPU
      const diskUsage = await getDiskUsage();
      const ramUsage = getRamUsage();
      const end = Date.now();

      const videoUrl = "https://media.tenor.com/416yYlmtf8gAAAPo/ping.mp4";
      const videoResponse = await axios.get(videoUrl, {
        responseType: "arraybuffer",
      });
      const videoBuffer = Buffer.from(videoResponse.data, "binary");
      const uptimeString = await runtime(process.uptime());

      await totoro.sendMessage(remoteJid, {
        video: videoBuffer,
        caption:
          `- 💻 CPU: ${model} - ${percentageUsed}%\n` +
          `- 💾 Disco: ${diskUsage.available} GB de ${diskUsage.total} GB\n` +
          `- 📊 RAM: ${ramUsage.used} GB de ${ramUsage.total} GB\n` +
          `- ⌚ Actividad: ${uptimeString}\n\n` +
          `> 📡 Latencia: ${end - start}ms`,
      });
    } catch (error) {
      msg.reply("⚠️ Error en el comando ping.");
    }
  },
};
