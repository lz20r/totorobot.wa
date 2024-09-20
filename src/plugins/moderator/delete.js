const { sendError, help } = require("../../functions/messages");

module.exports = {
  name: "delete",
  description: "Eliminar un mensaje específico mediante respuesta (reply).",
  category: "moderator",
  subcategory: "utility",
  usage: `delete`,
  cooldown: 5,
  dev: true,

  execute: async (totoro, msg, args) => {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const message = msg.messages[0].message;

      // Verifica si el mensaje es una respuesta a otro mensaje
      if (
        !message ||
        !message.extendedTextMessage ||
        !message.extendedTextMessage.contextInfo
      ) {
        await help(
          totoro,
          msg,
          "Eliminar Mensaje",
          "Para eliminar un mensaje, responde al mensaje que deseas eliminar y escribe.",
          "delete"
        );
        return;
      }

      const replyMessageId = message.extendedTextMessage.contextInfo.stanzaId;
      const fromMeReply =
        message.extendedTextMessage.contextInfo.participant ===
        msg.messages[0].key.participant;
      const originalMessageId = msg.messages[0].key.id;
      const fromMeOriginal = msg.messages[0].key.fromMe;

      try {
        await totoro.sendMessage(remoteJid, {
          delete: {
            remoteJid: remoteJid,
            fromMe: fromMeReply,
            id: replyMessageId,
          },
        });

        // Elimina el mensaje original
        await totoro.sendMessage(remoteJid, {
          delete: {
            remoteJid: remoteJid,
            fromMe: fromMeOriginal,
            id: originalMessageId,
          },
        });
      } catch (error) {
        await sendError(
          totoro,
          msg,
          "No pude eliminar los mensajes. Asegúrate de que tengo los permisos necesarios."
        );
      }
    } catch (error) {
      console.error(error);
      await sendError(
        totoro,
        msg,
        "Ocurrió un error al intentar eliminar el mensaje. Por favor, inténtalo de nuevo."
      );
    }
  },
};
