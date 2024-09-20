const igdl = require("@sasmeee/igdl");
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const { mediaFromUrl } = require("../../functions/mediaFromUrl"); // donde usas Cheerio?

module.exports = {
  name: "instagram",
  category: "multimedia",
  subcategory: "instagram",
  description: "Descarga imágenes o videos de Instagram",
  aliases: ["igm", "instagram"],
  usage: "ig <enlace>",
  cmdBlock: true,

  async execute(totoro, msg, args) {
    try {
      const url = args.join(" ");
      const regexp = /^(https?:\/\/(www\.)?instagram\.com)/;

      if (!url || !regexp.test(url)) {
        help(
          totoro,
          msg,
          "igmedia",
          "Debes proporcionar un enlace de Instagram.",
          "igmedia https://www.instagram.com/p/1234567890/"
        );

        return;
      }

      totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "⏳", key: msg.messages[0]?.key },
      });
      const request = await igdl(url);

      for (const value of request) {
        const response = await mediaFromUrl(value.download_link);

        if (response === "limit exceeded") {
          sendWarning(
            totoro,
            msg,
            "El archivo excede el límite de 100 MB. No se puede descargar."
          );
          continue;
        } else {
          await totoro.sendMessage(msg.messages[0].key.remoteJid, {
            [response.mimetype.split("/")[0] || "document"]: response.data,
          });
        }
      }

      totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
        react: { text: "✅", key: msg.messages[0]?.key },
      });
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/multimedia/igmedia.log",
        `Error en igmedia: ${error}`
      );
      console.error(error);
      sendError(totoro, msg, error);
    }
  },
};
