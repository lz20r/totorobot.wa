const { OpenAI } = require("openai");
const { sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;
module.exports = {
  name: "dalle",
  aliases: [],
  category: "premium",
  subcategory: "ai",
  description: "Genera imagenes con AI.",
  cmdPrem: true,

  async execute(totoro, msg, args) {
    await msg.react("⏳");
    const content = args.join(" ");

    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    try {
      if (!content) {
        help(
          totoro,
          msg,
          "dalle",
          "Genera imagenes con AI.",
          `${prefix}dalle crea una imagen de un gato`
        );
        return;
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const dallE = await openai.images.generate({
        prompt: content,
        model: "dall-e-2",
        quality: "standard",
        response_format: "url",
      });

      await msg.react("🪼");
      totoro.sendMessage(from, {
        image: { url: dallE.data[0].url },
        caption: `Totoro AI - DALL-E\n\nPrompt: ${content}`,
        quoted: info,
      });
    } catch (e) {
      totoroLog.error("./logs/plugins/premium/dallE.log", `${e.message}`);
      sendError(totoro, msg, `Error al generar imagen: ${e.message}`);
    }
  },
};
