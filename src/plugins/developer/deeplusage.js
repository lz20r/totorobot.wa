require("dotenv").config();
const https = require("https");
const { sendError, sendMessage } = require("../../functions/messages");

module.exports = {
  name: "usage",
  aliases: ["usg"],
  description: "Muestra el uso actual de la API de DeepL.",
  category: "developer",
  subcategory: "deepl",
  usage: "usage",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  dev: true,

  execute: async (totoro, msg) => {
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      return sendError(
        msg,
        "Por favor, añade tu clave de API en el archivo .env"
      );
    }

    const options = {
      hostname: "api.deepl.com",
      path: "/v2/usage",
      method: "GET",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          const usageInfo = JSON.parse(data);
          const characterCount = usageInfo.character_count;
          const characterLimit = usageInfo.character_limit;

          msg.reply(
            `╭─⬣「 API de DeepL en Totoro 」⬣\n` +
              `│  ≡◦ 🍭 Uso actual de la API de DeepL:\n` +
              `╰─⬣\n` +
              `> ${characterCount} caracteres de ${characterLimit} permitidos.`
          );
        } else {
          sendError(
            totoro,
            msg,
            `Error al obtener el uso de la API: ${res.statusCode} - ${res.statusMessage}`
          );
        }
      });
    });

    req.on("error", (error) => {
      sendError(msg, `Error al realizar la solicitud: ${error.message}`);
    });

    req.end();
  },
};
