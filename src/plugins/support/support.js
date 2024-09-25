const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "support",
  category: "totoSupport",
  subcategory: "report",
  aliases: ["report", "sugerencia", "reporte", "review", "suggest"],
  description: "Enviar reportes, sugerencias, revisiones o ver FAQ.",
  usage: `${prefix}support`,
  cooldown: 5,
  execute: async (totoro, msg, args) => {
    try {
      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      // Verificar si el comando se usa en un grupo y cancelar si es así
      if (remoteJid.endsWith("@g.us")) {
        return msg.reply({
          text: "⚠️ *Este comando no está disponible en grupos.*",
        });
      }

      const sender = message.key.participant;

      // Mostrar el menú interactivo con botones
      await totoro.sendMessage(remoteJid, {
        text: "*🎯 Centro de Soporte*\n1. 📝 Enviar Reporte\n2. 💡 Enviar Sugerencia\n3. 🧐 Enviar Reseña",
      });

      const seleccion = await waitForUserResponse(totoro, remoteJid, sender);

      switch (seleccion.trim()) {
        case "1":
          await handleReportFlow(totoro, remoteJid, sender, message);
          break;
        case "2":
          await handleSuggestionFlow(totoro, remoteJid, sender, message);
          break;
        case "3":
          await handleReviewFlow(totoro, remoteJid, sender, message);
          break;
        default:
          return msg.reply({
            text: "⚠️ *Selección inválida. Por favor, intenta de nuevo.*",
          });
      }
    } catch (error) {
      console.error(`Error en el comando 'support': ${error.message}`);
      return msg.reply({
        text: "⚠️ *Hubo un error en el centro de soporte. Inténtalo más tarde.*",
      });
    }
  },
};

// Función para manejar reportes
async function handleReportFlow(totoro, remoteJid, sender, message) {
  try {
    const reporteRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "📝 *Describe el problema o error que has encontrado:*"
    );
    if (!reporteRespuesta) throw new Error("Reporte inválido.");

    const user = message.pushName || "Usuario";

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: "https://tinyurl.com/2bsa7kmz" },  
      },
      { upload: totoro.waUploadToServer }
    );

    const content = `*📝 Reporte de ${user}*\n${reporteRespuesta}`;
    const interactiveMessage = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: "Totoro Reports" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Enviar",
                id: `sendReport+${reporteRespuesta}`,
              }),
            },
          ],
        },
      },
    };

    await totoro.relayMessage(
      remoteJid,
      { viewOnceMessage: { message: interactiveMessage } },
      { quoted: message }
    );
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `⚠️ *Error al enviar el reporte:* ${error.message}`,
    });
  }
}

// Función para manejar sugerencias
async function handleSuggestionFlow(totoro, remoteJid, sender, message) {
  try {
    const sugerenciaRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "💡 *Ingresa tu sugerencia para mejorar el sistema o el bot:*"
    );
    if (!sugerenciaRespuesta) throw new Error("No se ingresó una sugerencia.");

    const user = message.pushName || "Usuario";

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: "https://tinyurl.com/2bsa7kmz" },
      },
      { upload: totoro.waUploadToServer }
    );

    const content = `*💡 Sugerencia de ${user}*\n${sugerenciaRespuesta}`;
    const interactiveMessage = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: "Totoro Suggestions" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Enviar",
                id: `sendSuggest+${sugerenciaRespuesta}`,
              }),
            },
          ],
        },
      },
    };

    await totoro.relayMessage(
      remoteJid,
      { viewOnceMessage: { message: interactiveMessage } },
      { quoted: message }
    );
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `⚠️ *Error al enviar la sugerencia*.\n\n${error.message}`,
    });
  }
}

// Función para manejar reseñas
async function handleReviewFlow(totoro, remoteJid, sender, message) {
  try {
    const reseñaRespuesta = await promptUser(
      totoro,
      remoteJid,
      sender,
      message,
      "🧐 *Ingresa tu revisión o comentario sobre el sistema o el bot:*"
    );
    if (!reseñaRespuesta) throw new Error("Revisión inválida.");

    const user = message.pushName || "Usuario";

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: "https://tinyurl.com/2bsa7kmz" },
      },
      { upload: totoro.waUploadToServer }
    );

    const content = `*🧐 Revisión de ${user}*\n${reseñaRespuesta}`;
    const interactiveMessage = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: "Totoro Reviews" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "Enviar",
                id: `sendReview+${reseñaRespuesta}`,
              }),
            },
          ],
        },
      },
    };

    await totoro.relayMessage(
      remoteJid,
      { viewOnceMessage: { message: interactiveMessage } },
      { quoted: message }
    );
  } catch (error) {
    return totoro.sendMessage(remoteJid, {
      text: `⚠️ *Error al enviar la revisión:* ${error.message}`,
    });
  }
}

// Función para esperar la respuesta del usuario mejorada
async function waitForUserResponse(totoro, remoteJid, sender) {
  return new Promise((resolve, reject) => {
    const onMessage = async (msg) => {
      const newMessage = msg.messages[0];

      if (
        newMessage.key.remoteJid === remoteJid &&
        newMessage.key.participant === sender
      ) {
        let messageText = null;

        try {
          let actualMessage = newMessage.message;

          // Verificar si el mensaje es efímero y acceder al mensaje real
          if (newMessage.message?.ephemeralMessage) {
            actualMessage = newMessage.message.ephemeralMessage.message;
          }

          // Captura diferentes tipos de mensajes que pueden contener texto
          if (actualMessage?.conversation) {
            messageText = actualMessage.conversation;
          } else if (actualMessage?.extendedTextMessage?.text) {
            messageText = actualMessage.extendedTextMessage.text;
          } else if (actualMessage?.buttonsResponseMessage?.selectedButtonId) {
            messageText = actualMessage.buttonsResponseMessage.selectedButtonId;
          } else if (
            actualMessage?.listResponseMessage?.singleSelectReply?.selectedRowId
          ) {
            messageText =
              actualMessage.listResponseMessage.singleSelectReply.selectedRowId;
          } else if (actualMessage?.imageMessage?.caption) {
            messageText = actualMessage.imageMessage.caption;
          } else if (actualMessage?.videoMessage?.caption) {
            messageText = actualMessage.videoMessage.caption;
          } else if (actualMessage?.audioMessage?.caption) {
            messageText = actualMessage.audioMessage.caption;
          } else if (actualMessage?.documentMessage?.caption) {
            messageText = actualMessage.documentMessage.caption;
          } else if (actualMessage?.stickerMessage?.caption) {
            messageText = actualMessage.stickerMessage.caption;
          } else if (actualMessage?.contactMessage?.displayName) {
            messageText = actualMessage.contactMessage.displayName;
          }

          // Si el texto fue capturado correctamente, resolvemos la promesa
          if (messageText) {
            totoro.ev.off("messages.upsert", onMessage); // Remover listener
            clearTimeout(timeout); // Limpiar timeout
            resolve(messageText);
          } else {
            throw new Error("El mensaje no contiene texto válido.");
          }
        } catch (error) {
          totoro.ev.off("messages.upsert", onMessage); // Remover listener en caso de error
          clearTimeout(timeout); // Limpiar timeout
          reject(
            new Error(`Error capturando texto del mensaje: ${error.message}`)
          );
        }
      }
    };

    // Timeout para evitar que la espera dure indefinidamente
    const timeout = setTimeout(() => {
      totoro.ev.off("messages.upsert", onMessage); // Remover listener cuando el tiempo expira
      reject(
        new Error("⏳ Tiempo de espera agotado para la respuesta del usuario.")
      );
    }, 30000); // 30 segundos

    totoro.ev.on("messages.upsert", onMessage); // Registrar listener de mensajes entrantes
  });
}

// Función para esperar la respuesta del usuario
async function promptUser(totoro, remoteJid, sender, message, promptText) {
  await totoro.sendMessage(
    remoteJid,
    { text: promptText },
    { quoted: message }
  );
  return await waitForUserResponse(totoro, remoteJid, sender);
}
