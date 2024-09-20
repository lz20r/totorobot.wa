const fs = require("fs");
const path = require("path");
const totoroLog = require("../../functions/totoroLog");
const { sendSuccess } = require("../../functions/messages");

module.exports = {
  name: "logs",
  category: "developer",
  subcategory: "owner",
  usage: "<logs>",
  description:
    "Muestra los archivos de logs generados en el bot y el total de archivos de logs en la carpeta logs",
  dev: true,

  async execute(totoro, msg, _) {
    try {
      const logsPath = path.join(__dirname, "../../../logs");
      const directory = await fs.promises.readdir(logsPath);
      let totalFiles = 0;

      let filesList = "╭──⬣「 Archivos de logs generados 」⬣\n";
      for (const folder of directory) {
        const folderPath = path.join(logsPath, folder);
        const files = await fs.promises.readdir(folderPath);
        totalFiles += files.length;
        filesList += `│  ≡◦ *🍭* ${folder}\n`;
        filesList +=
          files.map((file) => `│  ≡◦ *🐥* ${file}`).join("\n") + "\n";
      }
      filesList += `╰──⬣\n> Total de archivos de logs: ${totalFiles}\n`;

      if (totalFiles === 0) {
        filesList =
          `╭──⬣「 Archivos de logs generados 」⬣\n` +
          `│  ≡◦ 🐥 No se han generado archivos de logs.\n` +
          `╰──⬣\n> Total de archivos de logs: ${totalFiles}\n`;
      }
      msg.reply(filesList);
    } catch (error) {
      sendSuccess(totoro, msg, "La carpeta de logs no existe o ya está vacía.");
    }
  },
};
