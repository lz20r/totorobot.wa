require("dotenv").config();
const translate = require("@vitalets/google-translate-api");
const {
  sendWarning,
  sendError,
  sendMessage,
} = require("../../functions/messages");
const idiomas = require("../../../data/languages");

const cache = new Map();

module.exports = {
  name: "traductor",
  aliases: ["trd"], 
  description: "Traduce un mensaje citado a un idioma especificado.",
  category: "utilities",
  subcategory: "translate",
  usage: `trd <código_idioma>`,
  cooldown: 5, 
  cmdBlock: true,

  execute: async (totoro, msg, args) => {
    try {
      if (args.length < 1) {
        await help(
          totoro,
          msg,
          "translate",
          "Traduce un mensaje citado a un idioma especificado.",
          "trd es"
        );
        return;
      }

      const targetLang = args[0];

      // Validar si hay un mensaje citado
      const quotedMessage =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        await sendMessage(
          totoro,
          msg,
          `Por favor, cita el mensaje que deseas traducir.`
        );
        return;
      }

      const textToTranslate =
        quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;

      if (!textToTranslate) {
        await sendWarning(
          totoro,
          msg,
          "No se pudo determinar el texto a traducir. Asegúrate de citar el mensaje correctamente."
        );
        return;
      }

      // Verificar si el mensaje ya contiene una traducción
      const translationMarker = "> 🌐 Traducción a";
      if (textToTranslate.includes(translationMarker)) {
        await sendWarning(
          totoro,
          msg,
          "Este mensaje ya ha sido traducido anteriormente."
        );
        return;
      }

      // Verificar si la traducción está en caché
      const cacheKey = `${textToTranslate}_${targetLang}`;
      if (cache.has(cacheKey)) {
        const cachedTranslation = cache.get(cacheKey);
        cache.delete(cacheKey); // Borrar la caché después de usarla
        await msg.reply(
          `${cachedTranslation}\n\n> 🌐 Traducción a ${
            idiomas[targetLang.toLowerCase()] || targetLang
          }`
        );
        return;
      }

      // Llamar a la API de Google Translate con reintentos
      const translatedText = await translateWithRetry(
        textToTranslate,
        targetLang
      );

      const targetLangName = idiomas[targetLang.toLowerCase()] || targetLang;

      // Guardar la traducción en caché y luego borrarla
      cache.set(cacheKey, translatedText);
      cache.delete(cacheKey);

      await msg.reply(
        `${translatedText}\n\n> 🌐 Traducción a ${targetLangName}`
      );
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `No existe un idioma con el código ${args[0]}.`
      );
    }
  },
};

async function translateWithRetry(text, targetLang, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const translatedText = await translateText(text, targetLang);
      return translatedText;
    } catch (error) {
      if (error.message.includes("429")) {
        if (attempt < retries) {
          // Esperar 1 segundo antes de reintentar
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw new Error(
            "El servicio de traducción ha recibido demasiadas solicitudes. Por favor, intenta de nuevo más tarde."
          );
        }
      } else {
        throw error;
      }
    }
  }
}

async function translateText(text, targetLang) {
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    // Añadir más detalles sobre el error
    console.error(`Error en la traducción: ${error.message}`);
    throw new Error(`Hubo un problema al traducir al idioma ${targetLang}. Verifica si el código es correcto.`);
  }
}
