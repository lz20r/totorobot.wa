const axios = require("axios");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "emojiCombiner",
  category: "utilities",
  subcategory: "emoji",
  aliases: [
    "emoji",
    "combine",
    "emojicombiner",
    "emojicombine",
    "emojic",
    "mix",
  ],
  description: "Combina dos emojis usando Google Emoji Kitchen.",
  usage: `${prefix}emojiCombiner <emoji1> <emoji2>`,
  cooldown: 3,

  execute: async (totoro, msg, args) => {
    try {
      // Asegurarnos de que estamos extrayendo correctamente el remoteJid
      const message = msg?.messages?.[0];
      const remoteJid = message?.key?.remoteJid;

      if (!remoteJid) {
        console.error("remoteJid no está definido.");
        return;
      }

      if (args.length < 2) {
        await totoro.sendMessage(
          remoteJid,
          { text: "Debes proporcionar dos emojis para combinarlos." },
          { quoted: message }
        );
        return;
      }

      const emoji1 = args[0]; // Primer emoji
      const emoji2 = args[1]; // Segundo emoji

      // Convertir los emojis a sus representaciones Unicode
      const toUnicode = (emoji) => {
        return Array.from(emoji)
          .map((char) => char.codePointAt(0).toString(16))
          .join("_");
      };

      const emoji1Code = toUnicode(emoji1);
      const emoji2Code = toUnicode(emoji2);

      // Generar la URL de Google Emoji Kitchen
      const emojiMixURL = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${emoji1Code}/u${emoji1Code}_u${emoji2Code}.png`;

      console.log(`URL generada: ${emojiMixURL}`);

      // Verificar si la URL existe y descargar la imagen
      const response = await axios
        .get(emojiMixURL, { responseType: "arraybuffer" })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            throw new Error(
              "La combinación de emojis no está disponible en Emoji Kitchen."
            );
          }
          throw error;
        });

      console.log(
        "Imagen descargada correctamente desde Google Emoji Kitchen."
      );

      const imageBuffer = Buffer.from(response.data, "binary");

      // Enviar la imagen combinada a través de WhatsApp
      await totoro.sendMessage(
        remoteJid,
        {
          image: imageBuffer,
          caption: `Aquí tienes tu emoji combinado: ${emoji1} + ${emoji2}`,
        },
        { quoted: message }
      );

      console.log("Emoji combinado enviado con éxito.");
    } catch (error) {
      console.error("Error al combinar los emojis:", error.message);
      await totoro.sendMessage(
        msg?.messages?.[0]?.key?.remoteJid || "error",
        { text: `Ocurrió un error al combinar los emojis: ${error.message}` },
        { quoted: msg.messages[0] }
      );
    }
  },
};
