const { sendError, help, sendWarning } = require("../../functions/messages");

module.exports = {
  name: "everyone",
  description: "Menciona a todos los miembros de un grupo.",
  category: "moderator",
  subcategory: "private",
  usage: `everyone <mensaje>`,
  cooldown: 5,

  execute: async (totoro, msg, args) => {
    try {
      const group = msg.messages[0].key.remoteJid;

      // Verificar si el mensaje proviene de un grupo
      if (!group.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "✨ Este comando solo funciona en grupos. ✨"
        );
        return;
      }

      // Obtener la metadata del grupo
      const groupMetadata = await totoro.groupMetadata(group);
      const groupParticipants = groupMetadata.participants
        ? groupMetadata.participants
        : [];

      // Verificar si el usuario es administrador
      const senderId = msg.messages[0].key.participant;
      const senderIsAdmin = groupParticipants.some(
        (participant) =>
          participant.id === senderId &&
          (participant.admin || participant.superAdmin || participant.isAdmin)
      );

      if (!senderIsAdmin) {
        await sendWarning(
          totoro,
          msg,
          "Solo los administradores pueden usar este comando."
        );
        return;
      }

      const participants = [];
      const text = args.length > 0 ? args.join(" ") : "@everyone";

      // Agregar todos los participantes a la lista de menciones
      for (const participant of groupParticipants) {
        participants.push(participant.id);
      }

      // Enviar el mensaje mencionando a todos los miembros
      await totoro.sendMessage(group, {
        text: text,
        mentions: participants,
      });

      // Enviar una reacción al mensaje original
      totoro.sendMessage(group, {
        react: { text: "🌍", key: msg.messages[0]?.key },
      });
    } catch (error) {
      console.error("Error:", error);
      await sendError(
        totoro,
        msg,
        "Ocurrió un error al mencionar a todos los miembros del grupo."
      );
    }
  },
};
