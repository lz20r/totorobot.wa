const { sendWarning, help, sendError } = require("../../functions/messages");

module.exports = {
  name: "promote",
  description: "Promueve a un usuario a administrador del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `promote <@usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "SEND_VIDEO"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );

      // Validar si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return;
      }

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;

        if (
          !msg.messages[0].message.extendedTextMessage ||
          !msg.messages[0].message.extendedTextMessage.contextInfo ||
          !msg.messages[0].message.extendedTextMessage.contextInfo.mentionedJid
        ) {
          sendWarning(totoro, msg, "Totoro necesita saber a quién promover.");
          return;
        }

        const mentioned =
          msg.messages[0].message.extendedTextMessage.contextInfo
            .mentionedJid[0];

        if (!mentioned) {
          sendWarning(totoro, msg, "Totoro necesita saber a quién promover.");
          return;
        }

        const isUserAdmin = groupInfo.participants.some(
          (participant) =>
            participant.id === mentioned &&
            (participant.admin ||
              participant.superAdmin ||
              participant.isCreator)
        );

        if (isUserAdmin) {
          sendWarning(
            totoro,
            msg,
            "No puedo promover a un administrador o creador del grupo."
          );
        } else {
          await totoro.groupParticipantsUpdate(group, [mentioned], "promote");
          await totoro.sendMessage(group, {
            video: {
              url: "https://media.tenor.com/wjmUY_58zAMAAAPo/akebi-chan-komichi.mp4",
            },
            caption: `¡Felicitaciones @${
              mentioned.split("@")[0]
            } por tu promoción!`,
            mentions: [mentioned],
          });
        }
      } else {
        sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }

      msg.react("🎉");
    } catch (error) {
      console.error(error);
      await sendError(
        totoro,
        msg,
        "Ocurrió un error al intentar promover al usuario. Por favor, inténtalo de nuevo más tarde."
      );
    }
  },
};
