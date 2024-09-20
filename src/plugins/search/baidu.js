const axios = require("axios");
const cheerio = require("cheerio");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "baidu",
  category: "search",
  subcategory: "searchers",
  usage: "baidu <consulta>",
  description: "Realiza una búsqueda en Baidu",

  async execute(totoro, msg, args, text) {
    const consulta = args.join(" ");
    const message = msg.messages && msg.messages[0];

    if (!message) {
      return; // Termina si no se puede obtener el mensaje
    }

    const remoteJid = message.key && message.key.remoteJid;

    if (!consulta) {
      if (remoteJid) {
        return help(
          totoro,
          msg,
          "baidu",
          "Realiza una búsqueda en Baidu",
          `${prefix}baidu python`
        );
      } else {
        return; // Termina si no se puede obtener remoteJid
      }
    }

    if (!remoteJid) {
      return; // Termina si no se puede obtener remoteJid
    }

    try {
      const response = await axios.get("https://www.baidu.com/s", {
        params: {
          wd: consulta,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const results = [];
      $(".result").each((index, element) => {
        const title = $(element).find("h3 a").text();
        const link = $(element).find("h3 a").attr("href");
        const snippet =
          $(element).find(".c-abstract").text() ||
          $(element).find(".c-span18").text();
        results.push({ title, snippet, link });
      });

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
      results.forEach((result, index) => {
        const title = limitLineLength(result.title);
        const snippet = limitLineLength(result.snippet);
        const link = limitLineLength(result.link);

        teks += `╭─⬣「 Baidu Search Result 」─⬣\n`;
        teks += `│ ≡◦ 🐥 Resultado ∙ ${index + 1}\n`;
        teks += `│ ≡◦ 🍭 Título ∙ ${title}\n`;
        teks += `│ ≡◦ 📚 Info ∙ ${snippet}\n`;
        teks += `│ ≡◦ ⛓ Url ∙ ${link}\n`;
        teks += `╰─⬣\n\n`;
      });

      totoro.sendMessage(remoteJid, { text: teks.trim() });
    } catch (error) {
      try {
        totoro.sendMessage(remoteJid, {
          text: `╭─⬣「 *Baidu Search Error* 」⬣\n╰─ ≡◦ *🍭 Totoro está experimentando un error*\n> *Error*: ${error.message}`,
        });
      } catch (sendError) {
        console.error("Error al enviar mensaje de error:", sendError);
      }
    }
  },
};
