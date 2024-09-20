module.exports = {
  name: "prueba",
  category: "developer",
  description: "Prueba de importación de módulos.",
  dev: true,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;

    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    try {
      reply(
        "Hola, vamos a hacer una prueba de importación de módulos. Escribe 'empezar' para continuar o 'cancelar' para salir."
      );

      // Llamamos a awaitMessage y esperamos la respuesta del usuario
      let userResponse = await awaitMessage(
        {
          chatJid: from,
          sender: sender,
          expectedMessages: ["empezar", "cancelar"],
          timeout: 30000,
          filter: (message) => {
            const textMessage =
              message?.message?.conversation ||
              message?.message?.extendedTextMessage?.text ||
              message?.message?.ephemeralMessage?.message?.extendedTextMessage
                ?.text;
            console.log("Mensaje recibido:", textMessage); // Verifica el contenido del mensaje recibido
            return textMessage;
          },
        },
        totoro
      );

      // Normaliza la respuesta del usuario a minúsculas para compararla
      const userText = userResponse.message?.conversation.toLowerCase();
      console.log("Respuesta del usuario:", userText); // Imprimir la respuesta para depuración

      if (userText === "cancelar") {
        return reply(`El usuario ha cancelado la partida.`);
      }

      if (userText === "empezar") {
        return reply(`El usuario ha aceptado.`);
      }
    } catch (error) {
      if (error.message === "TIMEOUT") {
        reply(`Tiempo de espera agotado.`);
      } else {
        console.error("Error capturado:", error);
      }
    }
  },
};

// Función awaitMessage corregida
// Función awaitMessage corregida para la estructura JSON
async function awaitMessage(options = {}, totoro) {
  return new Promise((resolve, reject) => {
    if (typeof options !== "object")
      return reject(new Error("Options must be an object"));
    if (typeof options.sender !== "string")
      return reject(new Error("Sender must be a string"));
    if (typeof options.chatJid !== "string")
      return reject(new Error("ChatJid must be a string"));
    if (options.timeout && typeof options.timeout !== "number")
      return reject(new Error("Timeout must be a number"));
    if (options.filter && typeof options.filter !== "function")
      return reject(new Error("Filter must be a function"));

    const timeout = options.timeout || 60000;
    const expectedMessages = options.expectedMessages || [];

    const listener = (data) => {
      const { messages } = data;
      console.log("Evento de mensaje capturado:", data); // Verifica que el evento messages.upsert está siendo capturado

      for (let message of messages) {
        const fromMe = message.key.fromMe;
        const chatId = message.key.remoteJid;
        const isGroup = chatId.endsWith("@g.us");

        const sender = fromMe
          ? totoro.user.id.replace(/:.*@/g, "@")
          : isGroup
          ? message.key.participant.replace(/:.*@/g, "@")
          : chatId;

        // Extraer el texto del mensaje desde extendedTextMessage
        const messageText = (
          message.message?.extendedTextMessage?.text || // Extraemos el texto del mensaje extendido
          message.message?.conversation || // Si no está en extendedTextMessage, lo intentamos obtener del mensaje de conversación
          message.message?.ephemeralMessage?.message?.extendedTextMessage
            ?.text || // En caso de mensaje efímero
          ""
        ).toLowerCase();

        console.log("Mensaje procesado:", messageText); // Imprime el mensaje procesado

        if (
          sender === options.sender &&
          chatId === options.chatJid &&
          options.filter(message)
        ) {
          if (expectedMessages.includes(messageText)) {
            console.log("Mensaje esperado recibido:", messageText); // Imprime si se recibe el mensaje esperado
            totoro.ev.off("messages.upsert", listener);
            clearTimeout(timeoutInterval);
            resolve(message);
            return;
          }
        }
      }
    };

    totoro.ev.on("messages.upsert", listener);
    console.log("Escuchando mensajes...");

    const timeoutInterval = setTimeout(() => {
      totoro.ev.off("messages.upsert", listener);
      reject(new Error("TIMEOUT"));
    }, timeout);
  });
}
