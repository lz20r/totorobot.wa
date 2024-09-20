const AppleStore = require("app-store-scraper");

module.exports = {
  id: "appstore",
  async execute(totoro, msg, args) {
    const appName = args.join(" ");

    try {
      const searchResults = await AppleStore.search({
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

      let description = AppInfo.description
        ? AppInfo.description
        : "Descripción no disponible";

      totoro.sendMessage(
        msg.messages[0].key.remoteJid,
        { text: `*📝 Descripción de "${appName}*": \n ${description}` },
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