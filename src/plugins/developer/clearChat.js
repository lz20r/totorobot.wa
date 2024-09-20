const totoroLog = require("../../functions/totoroLog");
const {
  sendWarning,
  sendError,
  sendSuccess,
} = require("../../functions/messages");

module.exports = {
  name: "clear",
  aliases: ["cc", "vaciar"],
  category: "developer",
  subcategory: "owner",
  description: "Vacía el chat actual.",
  usage: "clearChat",
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: ["ADMIN"],
  cooldown: 10,
  dev: true,

  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!participant && !remoteJid) {
      return sendError(
        totoro,
        msg,
        "No se pudo obtener el número del usuario o el chat."
      );
    }

    try {
      const messages = await totoro.loadMessages(remoteJid || participant, 100);
      if (!messages || messages.length === 0) {
        return sendWarning(totoro, msg, "No hay mensajes para eliminar.");
      } else if (messages.length === 1) {
        return sendWarning(
          totoro,
          msg,
          "No se pueden eliminar mensajes de un chat vacío."
        );
      }

      // Eliminamos todos los mensajes
      for (let message of messages) {
        await totoro.deleteMessage(remoteJid || participant, {
          id: message.key.id,
          fromMe: message.key.fromMe,
        });
      }

      await sendSuccess(totoro, msg, "Chat vaciado exitosamente.");
    } catch (error) {
      totoroLog.error(
        "./logs/clearChat.log",
        `Error al vaciar el chat: ${error}`
      );
      await sendError(totoro, msg, "Hubo un error al intentar vaciar el chat.");
    }
  },
};
