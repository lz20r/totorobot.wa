const googleIt = require("google-it");
const axios = require("axios");
const { Writable } = require("stream");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "google",
  category: "search",
  subcategory: "searchers",
  usage: "google <consulta>",
  description: "Realiza una búsqueda en Google o Delirius API",

  async execute(totoro, msg, args, text) {
    const consulta = args.join(" ");
    const message = msg.messages && msg.messages[0];

    const remoteJid = message.key && message.key.remoteJid;

    if (!consulta) {
      if (remoteJid) {
        return help(
          totoro,
          msg,
          "google",
          "Realiza una búsqueda en Google o Delirius API",
          `${prefix}google python`
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
      // Crear un stream de escritura para suprimir la salida
      const noOutput = new Writable({
        write(chunk, encoding, callback) {
          // No hacer nada con la salida
          callback();
        },
      });

      // Guardar las salidas originales
      const originalStdoutWrite = process.stdout.write.bind(process.stdout);
      const originalStderrWrite = process.stderr.write.bind(process.stderr);

      // Redirigir stdout y stderr a noOutput
      process.stdout.write = noOutput.write.bind(noOutput);
      process.stderr.write = noOutput.write.bind(noOutput);

      // Intentar usar la API de google-it
      const results = await googleIt({ query: consulta });

      // Restaurar las salidas originales
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;

      results.forEach((result, index) => {
        const title = limitLineLength(result.title);
        const snippet = limitLineLength(result.snippet);
        const link = limitLineLength(result.link);

        teks += `╭─⬣「 Google Search Result 」─⬣\n`;
        teks += `│ ≡◦ 🐥 Resultado ∙ ${index + 1}\n`;
        teks += `│ ≡◦ 🍭 Título ∙ ${title}\n`;
        teks += `│ ≡◦ 📚 Info ∙ ${snippet}\n`;
        teks += `│ ≡◦ ⛓ Url ∙ ${link}\n`;
        teks += `╰─⬣\n\n`;
      });

      totoro.sendMessage(remoteJid, { text: teks.trim() });
    } catch (error) {
      // Restaurar las salidas originales en caso de error
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;

      console.error("Error al realizar la búsqueda en Google:", error);
      // Si falla, usar Delirius API
      try {
        const apiUrl = `https://delirius-official.vercel.app/search/googlesearch?query=${encodeURIComponent(
          consulta
        )}`;
        const response = await axios.get(apiUrl);

        const results = response.data.results;

        results.forEach((result, index) => {
          if (result.title && result.link) {
            const title = limitLineLength(result.title);
            const snippet = limitLineLength(result.snippet || "");
            const link = limitLineLength(result.link);

            teks += `╭─⬣「 Delirius Search Result 」─⬣\n`;
            teks += `│ ≡◦ 🐥 Resultado ∙ ${index + 1}\n`;
            teks += `│ ≡◦ 🍭 Título ∙ ${title}\n`;
            teks += `│ ≡◦ 📚 Info ∙ ${snippet}\n`;
            teks += `│ ≡◦ ⛓ Url ∙ ${link}\n`;
            teks += `╰─⬣\n\n`;
          }
        });

        totoro.sendMessage(remoteJid, { text: teks.trim() });
      } catch (error) {
        console.error("Error al realizar la búsqueda en Delirius:", error);
        try {
          totoro.sendMessage(remoteJid, {
            text: `╭─⬣「 *Search Error* 」⬣\n╰─ ≡◦ *🍭 Totoro está experimentando un error*\n> *Error*: ${error.message}`,
          });
        } catch (sendError) {
          console.error("Error al enviar el mensaje de error:", sendError);
        }
      }
    }
  },
};
