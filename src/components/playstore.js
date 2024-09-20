const PlayStore = require("google-play-scraper");
const { convert } = require("html-to-text");

module.exports = {
  id: "playstore",
  async execute(totoro, msg, args) {
    const appName = args.join(" ");

    try {
      const searchResults = await PlayStore.search({
        term: appName,
        num: 1,
      });

      if (!searchResults || searchResults.length === 0) {
        return sendWarning(
          totoro,
          msg,
          `No se encontraron resultados para "${appName}".`
        );
      }

      let AppInfo = searchResults[0];

      let descriptionHtml = AppInfo.summary
        ? AppInfo.summary
        : "Descripción no disponible";
      let descriptionText = convert(descriptionHtml, {
        wordwrap: 130,
        selectors: [
          { selector: "h1", options: { uppercase: false } },
          { selector: "h2", options: { uppercase: false } },
          { selector: "h3", options: { uppercase: false } },
          { selector: "h4", options: { uppercase: false } },
          { selector: "h5", options: { uppercase: false } },
          { selector: "h6", options: { uppercase: false } },
          { selector: "a", format: "inline" },
          { selector: "img", format: "skip" },
        ],
      });

      totoro.sendMessage(
        msg.messages[0].key.remoteJid,
        { text: `*📝 Descripción de "${appName}*":\n\n${descriptionText}` },
        { quoted: msg.messages[0] }
      );
    } catch (error) {
      return sendError(
        totoro,
        msg,
        `Ocurrió un error al buscar "${appName}": ${error.message}`
      );
    }
  },
};
