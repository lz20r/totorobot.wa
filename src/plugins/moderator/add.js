const { sendWarning, help, sendError } = require("../../functions/messages");

module.exports = {
  name: "addd",
  description: "Agrega a un usuario al grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `addd <usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
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

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;
        let userToAdd = null;

        // Verificar si hay un usuario citado
        if (
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          userToAdd =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        if (!userToAdd && args.length > 0) {
          const phone = args[0].replace(/\D/g, ""); // Eliminar cualquier carácter no numérico
          userToAdd = `${phone}@s.whatsapp.net`;
        }

        if (!userToAdd) {
          await help(
            totoro,
            msg,
            "Agregar Usuario",
            "No se pudo determinar el usuario a agregar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "add <usuario> | add <número de teléfono> | add <mensaje citado>"
          );
          return;
        }

        await totoro.groupParticipantsUpdate(group, [userToAdd], "add");

        // Enviar mensaje de bienvenida interactivo
        const message = {
          interactiveMessage: {
            header: {
              hasMediaAttachment: false,
            },
            body: {
              text:
                `╭─⬣「 Mensaje de Bienvenida 」⬣\n` +
                `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
                `╰─⬣\n` +
                `>  ¡Bienvenido/a @${userToAdd.split("@")[0]}! @${
                  sender.split("@")[0]
                } te ha agregado al grupo.\n`,
              mentions: [userToAdd, sender],
            },
            footer: { text: "Agregado por Totoro" },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: `Expulsar Usuario`,
                    id: `kick+${userToAdd.split("@")[0]}`,
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
          mentions: [userToAdd, sender],
        };

        try {
          await totoro.relayMessage(
            group,
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
      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `No se pudo agregar al participante: ${error.message}`
      );
    }
  },
};
