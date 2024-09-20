const { sendError, sendWarning, help } = require("../functions/messages");

module.exports = {
  id: "add",
  async execute(totoro, msg, args) {
    try {
      if (args.length !== 1) {
        await help(
          totoro,
          msg,
          "Agregar Participante",
          "Falta el número de teléfono",
          `${totoro.prefix}add <número de teléfono>`
        );
        return;
      }

      const phoneNumber = args[0];
      if (!/^\d{10,15}$/.test(phoneNumber)) {
        // Asegúrate de ajustar el patrón según el formato esperado
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
      let userToAdd = null;

      // Verificar si hay un usuario citado
      const extendedTextMessage = msg.messages[0].message.extendedTextMessage;
      if (
        extendedTextMessage &&
        extendedTextMessage.contextInfo &&
        extendedTextMessage.contextInfo.participant
      ) {
        userToAdd = extendedTextMessage.contextInfo.participant;
      }

      if (groupId.endsWith("@g.us")) {
        // Formatear el número de teléfono al formato de ID
        const participantId = `${phoneNumber}@s.whatsapp.net`;

        // Verificar si el usuario ya está en el grupo
        const userExists = groupInfo.participants.some(
          (p) => p.id === participantId
        );
        if (userExists) {
          await sendWarning(
            totoro,
            msg,
            "El participante ya está en el grupo."
          );
          return;
        }

        // Validar si el usuario que ejecuta el comando es administrador
        const participant = groupInfo.participants.find((x) => x.id === sender);
        if (!participant || !participant.admin) {
          msg.react("⚠️");
          msg.reply({
            text: `> @${sender.split("@")[0]} no puedes agregarlo. \n> Solo los administradores pueden hacerlo.`,
            mentions: [userToAdd, sender],
          });
          return;
        }

        // Agregar al usuario al grupo
        await totoro.groupParticipantsUpdate(groupId, [participantId], "add");
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `Error al agregar el participante: ${error.message}`
      );
    }
  },
};
