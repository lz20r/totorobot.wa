const { sendWarning, sendError, sendMessage } =  require("../functions/messages");

module.exports = {
  id: "reactivate",
  async execute(totoro, msg, args) {
    try {
      const quotedMessage =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return sendWarning(
          totoro,
          msg,
          "Por favor, cita el mensaje del usuario que deseas reactivar."
        );
      }

      const quotedUser =
        msg.messages[0].message.extendedTextMessage.contextInfo.participant;
      const group = msg.messages[0].key.remoteJid;

      if (!quotedUser) {
        return sendWarning(
          totoro,
          msg,
          "No se pudo determinar el usuario a reactivar. Asegúrate de citar el mensaje correctamente."
        );
      }

      // Aquí se debería tener un mecanismo para volver a añadir al usuario si se ha eliminado,
      // pero la API de WhatsApp puede no soportar directamente esta operación si el usuario ha sido eliminado.
      // Este ejemplo asume que el usuario puede ser reactivado de alguna manera:
      await totoro.groupParticipantsUpdate(group, [quotedUser], "add");

      await sendMessage(
        totoro,
        msg,
        `@${quotedUser.split("@")[0]} ha sido reactivado en el grupo.`,
        [quotedUser]
      );
    } catch (error) {
      return sendError(
        totoro,
        msg,
        `No pude reactivar al usuario. Error: ${error.message}`
      );
    }
  },
};
