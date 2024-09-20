const wiki = require("wikipedia");
const { sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;
module.exports = {
  name: "wikipedia",
  aliases: ["wiki", "w"],
  category: "information",
  subcategory: "search",
  description: "Busca información en Wikipedia.",
  usage: `${prefix}w <idioma> <artículo>`,
  cmdPrem: false,

  async execute(totoro, msg, args) {
    try {
      if (args.length < 2) {
        await help(
          totoro,
          msg,
          "wikipedia",
          "Busca en Wikipedia.",
          "wikipedia <idioma> <artículo>"
        );
        return;
      }

      const language = args[0];
      const article = args.slice(1).join(" ");

      wiki.setLang(language);

      const page = await wiki.page(article);
      const summary = await page.summary();
      const { title, extract } = summary;

      const message = `*${title}*\n\n${extract}`;
      await msg.reply(message);
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/information/wikipedia.js",
        `Error buscando en Wikipedia: ${error}`
      );
      await sendError(totoro, msg, "Artículo no encontrado.");
    }
  },
};
