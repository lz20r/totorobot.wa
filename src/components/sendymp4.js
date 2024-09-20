const axios = require("axios");
const { sendError } = require("../functions/messages");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  id: "sendymp4",

  async execute(totoro, msg, args) {
    try {
      msg.react("⏳");
      const url = args[0];
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;
      const fromMe = message.key.fromMe;
      const participant = message.key.participant;
      const messageTimestamp = message.messageTimestamp;

      if (
        remoteJid &&
        typeof fromMe !== "undefined" &&
        participant &&
        messageTimestamp
      ) {
        try {
          // Realiza una solicitud GET para obtener el stream del video
          const response = await axios.get(url, { responseType: "stream" });
          if (response.status === 200) {
            const title = "Video"; // Asigna un título genérico o extrae uno si es posible
            const user = msg.participant || "Usuario"; // Asigna un nombre genérico o extrae uno si es posible

            // Enviar el video
            await totoro.sendMessage(
              remoteJid,
              {
                video: response.data,
                mimetype: "video/mp4",
                fileName: `${title}.mp4`,
                caption: `Solicitada por ${user}`,
              },
              { quoted: msg.messages[0], asDocument: true }
            );
            await msg.react("📼");
          } else {
            throw new Error(
              `Failed to fetch video, status code: ${response.status}`
            );
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            sendError(
              totoro,
              msg,
              `Error 403: Acceso denegado al verificar/descargar el video. Verifica los permisos o la URL.`
            );
          } else {
            sendError(
              totoro,
              msg,
              `Error al verificar/descargar el video: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      sendError(totoro, msg, `Error al ejecutar el comando: ${error.message}`);
    }
  },
};
