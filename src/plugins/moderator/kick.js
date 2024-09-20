const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "kick",
  description: "Expulsa a un usuario del grupo con un mensaje interactivo.",
  category: "moderator",
  subcategory: "admin",
  usage: `kick <usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupId = msg.messages[0].key.remoteJid;

      // Validar si el comando se ejecuta en un grupo
      if (!groupId.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
        return;
      }

      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

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

      let targetUser;

      // Validar si se citó a un usuario
      if (
        msg.messages[0].message.extendedTextMessage &&
        msg.messages[0].message.extendedTextMessage.contextInfo
      ) {
        targetUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;
      }

      // Validar si se mencionó a un usuario
      if (!targetUser && args[0]) {
        targetUser = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      }

      // Verificar si se pudo determinar al usuario
      if (!targetUser) {
        await help(
          totoro,
          msg,
          "Expulsar Usuario",
          "No se pudo determinar el usuario a expulsar. Asegúrate de citar el mensaje correctamente o proporcionar el número de teléfono.",
          "kick <usuario>"
        );
        return;
      }

      // Expulsar al usuario del grupo
      await totoro.groupParticipantsUpdate(groupId, [targetUser], "remove");

      // Enviar mensaje de expulsión interactivo
      const message = {
        interactiveMessage: {
          header: {
            hasMediaAttachment: false,
          },
          body: {
            text:
              `╭─⬣「 Expulsar Usuario 」⬣\n` +
              `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
              `╰─⬣\n` +
              `> Usuario expulsado: @${targetUser.split("@")[0]}\n` +
              `> Moderador: @${sender.split("@")[0]}\n` +
              `> ⏰ Fecha y hora: ${new Date().toLocaleString()}\n` +
              `> 🪼 Actualmente en *${groupName}* hay ${groupInfo.participants.length} miembros.`,
            mentions: [targetUser, sender],
          },
          footer: { text: "Expulsado por Totoro" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: `Añadir Usuario`,
                  id: `add+${targetUser.split("@")[0]}`,
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: `Ver Política del Grupo`,
                  url: "https://example.com/group-policy", // Reemplaza con la URL de la política del grupo
                }),
              },
            ],
            messageParamsJson: "",
          },
        },
        mentions: [targetUser, sender],
      };

      try {
        await totoro.relayMessage(
          groupId,
          { viewOnceMessage: { message } },
          { quoted: msg.messages[0] }
        );
      } catch (relayError) {
        console.error("Error al enviar el mensaje interactivo:", relayError);
        return sendWarning(
          totoro,
          msg,
          `Error al enviar el mensaje interactivo.`
        );
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `No pude expulsar a este usuario. Error: ${error.message}`
      );
    }
  },
};
