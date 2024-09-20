const path = require("path");
const fs = require("fs");
const totoroLog = require("../../functions/totoroLog");
const {
  sendError,
  sendWarning,
  sendSuccess,
} = require("../../functions/messages");

module.exports = {
  name: "deleteBackup",
  category: "developer",
  subcategory: "system",
  description: "Eliminar los archivos de respaldo de la base de datos.",
  usage: "<deleteBackup>",

  async execute(totoro, msg) {
    const remoteJid = msg?.messages?.[0]?.key?.remoteJid;
    if (!remoteJid) {
      return;
    }

    try {
      const backupDir = path.join(__dirname, "..", "..", "..", "database");

      if (!fs.existsSync(backupDir)) {
        sendWarning(totoro, msg, `No se encontraron respaldos para eliminar.`);
        return;
      }

      // Función para eliminar la carpeta y su contenido
      const deleteFolderRecursive = (directoryPath) => {
        if (fs.existsSync(directoryPath)) {
          fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              // Recursivamente eliminar subdirectorios
              deleteFolderRecursive(curPath);
            } else {
              // Eliminar archivo
              fs.unlinkSync(curPath);
            }
          });
          // Eliminar directorio
          fs.rmdirSync(directoryPath);
        }
      };

      // Eliminar la carpeta de backups
      deleteFolderRecursive(backupDir);

      totoroLog.info(
        "./logs/plugins/developer/deleteBackup.log",
        `Respaldos de la base de datos eliminados.`
      );

      sendSuccess(totoro, msg, `Respaldos de la base de datos eliminados.`);
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/developer/deleteBackup.log",
        `Error al eliminar los respaldos de la base de datos: ${error.message}`
      );
      sendError(
        totoro,
        msg,
        `Error al eliminar los respaldos de la base de datos: ${error.message}`
      );
    }
  },
};
