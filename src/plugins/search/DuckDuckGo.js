const axios = require("axios");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "duckduckgo",
  category: "search",
  subcategory: "searchers",
  usage: "duckduckgo <consulta>",
  description: "Realiza una búsqueda en DuckDuckGo",

  async execute(totoro, msg, args, text) {
    const consulta = args.join(" ");
    const message = msg.messages && msg.messages[0];

    const remoteJid = message.key && message.key.remoteJid;

    if (!consulta) {
      if (remoteJid) {
        return help(
          totoro,
          msg,
          "duckduckgo",
          "Realiza una búsqueda en DuckDuckGo",
          `${prefix}duckduckgo python`
        );
      } else {
        console.error(
          "La estructura del mensaje no es correcta. No se puede obtener remoteJid.",
          msg
        );
        return;
      }
    }

    if (!remoteJid) {
      console.error(
        "La estructura del mensaje no es correcta. No se puede obtener remoteJid.",
        msg
      );
      return;
    }

    const limitLineLength = (text, limit = 60) => {
      const words = text.split(" ");
      let lines = [];
      let currentLine = "";

      for (let word of words) {
        if (currentLine.length + word.length + 1 <= limit) {
          currentLine += word + " ";
        } else {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        }
      }

      if (currentLine) {
        lines.push(currentLine.trim());
      }

      return lines.join("\n");
    };

    let teks = `*🔎 Resultado de* : ${consulta}\n\n`;

    try {
      // Usar DuckDuckGo para la búsqueda
      const response = await axios.get("https://api.duckduckgo.com/", {
        params: {
          q: consulta,
          format: "json",
          no_redirect: 1,
          no_html: 1,
          skip_disambig: 1,
          kl: "es-es", // Parametro para idioma español
        },
      });

      const results = response.data.RelatedTopics;

      results.forEach((result, index) => {
        if (result.Text && result.FirstURL) {
          const title = limitLineLength(result.Text);
          const link = limitLineLength(result.FirstURL);

          teks += `╭─⬣「 DuckDuckGo Search Result 」─⬣\n`;
          teks += `│ ≡◦ 🐥 Resultado ∙ ${index + 1}\n`;
          teks += `│ ≡◦ 🍭 Título ∙ ${title}\n`;
          teks += `│ ≡◦ ⛓ Url ∙ ${link}\n`;
          teks += `╰─⬣\n\n`;
        }
      });

      totoro.sendMessage(remoteJid, { text: teks.trim() });
    } catch (error) {
      console.error("Error al realizar la búsqueda en DuckDuckGo:", error);
      try {
        totoro.sendMessage(remoteJid, {
          text: `╭─⬣「 *Search Error* 」⬣\n╰─ ≡◦ *🍭 Totoro está experimentando un error*\n> *Error*: ${error.message}`,
        });
      } catch (sendError) {
        console.error("Error al enviar el mensaje de error:", sendError);
      }
    }
  },
};
