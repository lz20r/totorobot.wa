const axios = require("axios");

module.exports = {
  id: "sendReview",

  async execute(totoro, msg, args) {
    const text = args.join(" ");

    const url = `https://discord.com/api/webhooks/1250553036753997954/Kg13t2B2KhkN_To1LRbi7CqGt6pNs51l2pMyvNhSy_MGKKoawqwBXZsVmvBBHQJeeUCE`;

    const payload = {
      content: "",
      embeds: [
        {
          author: { name: msg.messages[0]?.pushName || "" },
          title: "Reseñas",
          description: text,
        },
      ],
    };

    await axios.default.post(url, payload);

    totoro.sendMessage(
      msg.messages[0].key.remoteJid,
      { text: "✅ Nos agrada que compartas tu opinión, gracias por darnos tu mejor calificación 🌟" },
      { quoted: msg.messages[0] }
    );
  },
};
