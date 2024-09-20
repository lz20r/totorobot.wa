const { sendMessage, sendError } = require("../../functions/messages");

module.exports = {
  name: "leave",
  description: "Salir del grupo actual.",
  category: "moderator",
  subcategory: "group",
  usage: `<leave>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "LEAVE_GROUP"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        await sendMessage(totoro, msg, "Totoro solo puede salir de un grupo.");
        return;
      }

      const group = msg.messages[0].key.remoteJid;
      const groupInfo = await totoro.groupMetadata(group);

      // Validar si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        await sendMessage(
          totoro,
          msg,
          "Totoro no puede salir del grupo si no eres administrador."
        );
        return;
      }

      await sendMessage(totoro, msg, "Totoro está saliendo del grupo, ¡adiós!");
      await totoro.groupLeave(group);
    } catch (error) {
      console.error(error);
      await sendError(
        totoro,
        msg,
        `Totoro está cansado y no pudo salir del grupo. Error: ${error.message}`
      );
    }
  },
};
