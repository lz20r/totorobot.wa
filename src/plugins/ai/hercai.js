const { Hercai } = require("hercai");
const { help, sendError } = require("../../functions/messages");

module.exports = {
  name: "hercai",
  category: "inteligencia artificial",
  subcategory: "ia",
  description: "Hercai AI",
  usage: "hercai <message>",

  async execute(totoro, msg, args) {
    try {
      await msg.react("🧩");
      const message = args.join(" ");
      if (!message) {
        await help(
          totoro,
          msg,
          "Hercai AI",
          "Ingresa un mensaje",
          "+hercai <message>"
        );
        await msg.react("❓");
        return;
      }

      const hercai = new Hercai();
      const response = await hercai.question({
        content: message,
        model: "v3",
      });

      await msg.react("✅");
      // Enviar la respuesta usando msg.reply
      await msg.reply(response.reply);
    } catch (error) {
      await sendError(totoro, msg, error.message);
    }
  },
};
