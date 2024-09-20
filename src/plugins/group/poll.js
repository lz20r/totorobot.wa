const { help, sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "poll",
  category: "group",
  subcategory: "encuestas",
  description: "Crea una encuesta en el grupo",
  usage: `poll Pregunta opción1 opción2 opción3`,
  aliases: ["encuesta", "votación"],

  async execute(totoro, msg, args) {
    try {
      // Log del mensaje completo para ver su estructura
      console.log("Mensaje recibido:", JSON.stringify(msg, null, 2));

      // Verificar si el mensaje contiene las propiedades necesarias
      const remoteJid = msg.key?.remoteJid || msg.messages?.[0]?.key?.remoteJid;
      const messageContent = msg.message || msg.messages?.[0]?.message;
      const messageText =
        messageContent?.extendedTextMessage?.text ||
        messageContent?.conversation;

      if (!remoteJid || !messageText) {
        throw new Error("El mensaje no contiene remoteJid o texto.");
      }

      // Extraer el comando y argumentos del texto del mensaje
      const commandAndArgs = messageText.split(" ");
      const command = commandAndArgs[0]; // +poll
      const pollArgs = commandAndArgs.slice(1);

      // Verificar si hay suficientes argumentos
      if (pollArgs.length < 3) {
        return help(
          totoro,
          msg,
          "Encuesta",
          "Crea una encuesta en el grupo",
          `+encuesta Pregunta opción1 opción2 opción3`
        );
      }

      // Asumir que la pregunta termina cuando empieza la primera opción
      let question = "";
      let options = [];
      let foundOption = false;
      for (let i = 0; i < pollArgs.length; i++) {
        if (pollArgs[i][0] === pollArgs[i][0].toUpperCase() && i !== 0) {
          foundOption = true;
          options = pollArgs.slice(i);
          break;
        }
        question += pollArgs[i] + " ";
      }

      if (!foundOption || options.length < 2) {
        return help(
          totoro,
          msg,
          "Encuesta",
          "Crea una encuesta en el grupo",
          `+encuesta Pregunta opción1 opción2 opción3`
        );
      }

      // Eliminar el espacio adicional al final de la pregunta
      question = question.trim();

      // Crear la encuesta
      const pollOptions = options.map((option, index) => ({
        buttonId: `option_${index + 1}`,
        buttonText: { displayText: option },
        type: 1,
      }));

      const pollMessage = {
        text: `📊 *${question}*`,
        footer: "Selecciona una opción.",
        buttons: pollOptions,
        headerType: 1,
      };

      await msg.react("📊");
      await totoro.sendMessage(remoteJid, pollMessage);
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/group/poll.log",
        `Error en el comando 'poll': ${error.message}`
      );
      return sendError(
        totoro,
        msg,
        "Hubo un error al crear la encuesta. Inténtalo de nuevo."
      );
    }
  },
};
