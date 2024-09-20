const axios = require("axios");

module.exports = {
  id: "sendSuggest",

  async execute(totoro, msg, args) {
    const text = args.join(" ");

    const url = `https://discord.com/api/webhooks/1253100204459167896/leEJYfmnHY0_Yd25d7FCJMusYb_YI6jC8xQTr3_F_ToB--2ZRNPqkeTflUIyishQ8hjr`;

    const payload = {
      content: "",
      embeds: [
        {
          author: { name: msg.messages[0]?.pushName || "" },
          title: "Sugerencia",
          description: text,
        },
      ],
    };

    await axios.default.post(url, payload);

    totoro.sendMessage(
      msg.messages[0].key.remoteJid,
      { text: "✅ Gracias por tu sugerencia, siempre valoramos tu opinión" },
      { quoted: msg.messages[0] }
    );
  },
};
