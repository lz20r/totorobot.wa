const { sendError, sendWarning, help } = require("../functions/messages");

module.exports = {
  id: "kick",
  async execute(totoro, msg, args) {
    try {
      if (args.length !== 1) {
        await help(
          totoro,
          msg,
          "Expulsar Participante",
          "Falta el número de teléfono",
          `${totoro.prefix}kick <número de teléfono>`
        );
        return;
      }

      const phoneNumber = args[0];
      if (!/^\d{10,15}$/.test(phoneNumber)) {
        await sendWarning(
          totoro,
          msg,
          "El número de teléfono debe tener entre 10 y 15 dígitos."
        );
        return;
      }

      const sender = msg.messages[0].key.participant;
      const groupId = msg.messages[0].key.remoteJid;
      const groupInfo = await totoro.groupMetadata(groupId);

      if (groupId.endsWith("@g.us")) {
        const participantId = `${phoneNumber}@s.whatsapp.net`;

        const userExists = groupInfo.participants.some(
          (p) => p.id === participantId
        );
        if (!userExists) {
          await sendWarning(
            totoro,
            msg,
            "El participante no está en el grupo."
          );
          return;
        }

        const participant = groupInfo.participants.find((x) => x.id === sender);
        if (!participant || !participant.admin) {
          msg.react("⚠️");
          msg.reply({
            text: `> @${sender.split("@")[0]} no puedes expulsar a @${phoneNumber.split("@")[0]}. \n> Solo los administradores pueden hacerlo.`,
            mentions: [participantId, sender],
          });
          return;
        }

        await totoro.groupParticipantsUpdate(
          groupId,
          [participantId],
          "remove"
        );

        await totoro.sendMessage(
          groupId,
          {
            text: `> @${phoneNumber} ha sido expulsado del grupo por @${sender.split("@")[0]}.`,
            mentions: [participantId, sender],
          },
          { quoted: msg }
        );
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `Error al expulsar el participante: ${error.message}`
      );
    }
  },
};
