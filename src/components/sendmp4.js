const { sendWarning, sendError, help } = require("../functions/messages");
const totoroLog = require("../functions/totoroLog");

module.exports = {
  id: "sendmp4",

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
        // Enviar el mensaje de video
        await totoro.sendMessage(
          remoteJid,
          {
            video: { url: url },
          },
          { quoted: message }
        );

        await msg.react("📽️");
      }
    } catch (error) {
      // Log del error con más detalles
      totoroLog.error(
        "./logs/plugins/multimedia/sendmp4.log",
        `Error al descargar el video de Instagram: ${error.message}, Stack: ${error.stack}`
      );
      sendError(
        totoro,
        msg,
        "Error al descargar el video de Instagram. Por favor, vuelve a intentarlo."
      );
    }
  },
};
