const { sendError, help, sendWarning } = require("../../functions/messages");

module.exports = {
  name: "demote",
  category: "moderator",
  subcategory: "admin",
  description: "Degrada a un usuario a miembro regular.",
  usage: `demote <@usuario>`,
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
          await help(
            totoro,
            msg,
            `promote`,
            `Totoro necesita saber a quién degradar.`,
            `demote <@usuario>`
          );
          return;
        }

        const mentioned =
          msg.messages[0].message.extendedTextMessage.contextInfo
            .mentionedJid[0];

        if (!mentioned) {
          await help(
            totoro,
            msg,
            `promote`,
            `Totoro necesita saber a quién degradar.`,
            `demote <@usuario>`
          );
          return;
        }

        const isUserAdmin = groupInfo.participants.some(
          (participant) =>
            participant.id === mentioned &&
            (participant.admin ||
              participant.superAdmin ||
              participant.isCreator)
        );

        if (!isUserAdmin) {
          sendWarning(
            totoro,
            msg,
            "El usuario mencionado no es un administrador."
          );
        } else {
          try {
            await totoro.groupParticipantsUpdate(group, [mentioned], "demote");

            await totoro.sendMessage(group, {
              video: {
                url: "https://media.tenor.com/H4oO6lqStHYAAAPo/mushoku-tensei-anime.mp4",
              },
              caption: `@${mentioned.split("@")[0]} ha sido degradado.`,
              mentions: [mentioned],
            });
          } catch (updateError) {
            if (updateError.data === 403) {
              await sendError(
                totoro,
                msg,
                "No tengo permisos para degradar a este usuario."
              );
            } else {
              await sendError(
                totoro,
                msg,
                `No pude degradar a este usuario. Error: ${updateError.message}`
              );
            }
          }
        }
      } else {
        sendError(
          totoro,
          msg,
          "Este comando solo puede ser ejecutado en grupos."
        );
      }
      msg.react("😕");
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Totoro está cansado y no pudo degradar a este usuario. Error: ${error.message}`,
      });
    }
  },
};
