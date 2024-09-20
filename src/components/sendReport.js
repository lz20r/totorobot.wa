const axios = require("axios");

module.exports = {
  id: "sendReport",

  async execute(totoro, msg, args) {
    const text = args.join(" ");

    const url = `https://discord.com/api/webhooks/1253093610950496408/Yoy1BRI2wO6uVWejDavRb7fU0vvoGZTELMEXNd7eqJlcjxum6T_9Dxk1XYdaLVFFIgyI`;

    const payload = {
      content: "",
      embeds: [
        {
          author: { name: msg.messages[0]?.pushName || "" },
          title: "Reporte",
          description: text,
        },
      ],
    };

    await axios.default.post(url, payload);

    totoro.sendMessage(
      msg.messages[0].key.remoteJid,
      { text: "✅ Gracias por tu reporte, siempre intentamos para lograr que Totoro pueda prosperar y poder brindarte un mejor servicio" },
      { quoted: msg.messages[0] }
    );
  },
};
