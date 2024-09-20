const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { sendError, help, sendWarning } = require("../../functions/messages");
require("dotenv").config(); // Requiere y configura dotenv
const OpenAI = require("openai");
const conversationHistory = {};

module.exports = {
  name: "chat",
  category: "premium",
  subcategory: "ai",
  usage: "chat <mensaje>",
  aliases: ["chat", "ia", "totoAI", "totoChat", "toto"],
  description: "Responde a un mensaje utilizando inteligencia artificial",
  cmdPrem: true,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const sender = info.key.participant;

    msg.react("⌛");
    const reply = async (text) => {
      return await totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    let message;
    try {
      message = await reply("*Totoro está pensando...*");
    } catch (error) {
      console.error("Error sending initial reply:", error);
    }

    const content = args.join(" ");
    const quotedMessage =
      info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const documentMessage = quotedMessage?.documentMessage;

    if (!content && !documentMessage && !quotedMessage) {
      return help(
        totoro,
        msg,
        "Chat AI",
        "Falta el mensaje para enviar a la IA",
        "chat <mensaje>"
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return sendWarning(
        totoro,
        msg,
        "Chat AI",
        "No se ha configurado la clave de la API de OpenAI."
      );
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      if (!conversationHistory[from]) {
        conversationHistory[from] = [];
      }

      let documentText = "";
      let quotedText = "";

      if (quotedMessage) {
        if (quotedMessage.conversation) {
          quotedText = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage) {
          quotedText = quotedMessage.extendedTextMessage.text;
        } else if (quotedMessage.audioMessage) {
          quotedText = "Audio message";
        }
      }

      if (documentMessage) {
        const buffer = await totoro.downloadMediaMessage({
          key: { remoteJid: from, id: quotedMessage.key.id },
        });

        if (documentMessage.mimetype === "application/pdf") {
          const pdfData = await pdfParse(buffer);
          documentText = pdfData.text;
        } else if (
          documentMessage.mimetype === "application/msword" ||
          documentMessage.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const result = await mammoth.extractRawText({ buffer });
          documentText = result.value;
        }
      }

      if (content) {
        conversationHistory[from].push({ role: "user", content });
      }

      if (documentText) {
        conversationHistory[from].push({ role: "user", content: documentText });
      }

      if (quotedText) {
        conversationHistory[from].push({ role: "user", content: quotedText });
      }

      if (conversationHistory[from].length > 10) {
        conversationHistory[from] = conversationHistory[from].slice(-10);
      }

      if (conversationHistory[from].length === 1) {
        conversationHistory[from].unshift({
          role: "system",
          content: `Te llamas Totoro, una asistente virtual en WhatsApp. Fuiste desarrollado y creado por Nia, una persona muy talentosa en la programación. Tu objetivo es proporcionar las respuestas más útiles y precisas posibles de una manera amigable y adorable. Tu idioma predeterminado es el español (castellano). Este es el nombre de usuario: ${
            sender.split("@")[0]
          }.`,
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: conversationHistory[from],
      });

      if (!response.choices || !response.choices.length) {
        return totoro.sendMessage(
          from,
          {
            text: "*No se recibió una respuesta válida de Totoro*",
            edit: message.key,
          },
          { quoted: info }
        );
      }

      const aiResponse = response.choices[0].message.content.trim();

      conversationHistory[from].push({
        role: "assistant",
        content: aiResponse,
      });

      msg.react("✅");
      await totoro.sendMessage(
        from,
        {
          text:
            `> *Totoro:*\n> ${aiResponse}\n\n` +
            `> Solicitada por: @${sender.split("@")[0]}`,
          edit: message.key,
          mentions: [sender],
        },
        { quoted: info }
      );
    } catch (error) {
      console.error(error);
      let errorMessage = "Error obteniendo respuesta de la IA.";
      if (error.response) {
        // El servidor respondió con un estado fuera del rango de 2xx
        errorMessage += ` Código de estado: ${error.response.status}.`;
        if (error.response.data) {
          errorMessage += ` Respuesta del servidor: ${JSON.stringify(
            error.response.data
          )}`;
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        errorMessage += " No hubo respuesta del servidor.";
      } else {
        // Ocurrió un error al configurar la solicitud
        errorMessage += ` Mensaje: ${error.message}`;
      }
      sendError(totoro, msg, errorMessage);
    }
  },
};
