const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "owner",
  category: "totoSupport",
  subcategory: "info",
  aliases: ["fenix", "nia", "naiara", "只摇"],
  description: "Muestra el contacto del dueño del bot",
  usage: `${prefix}owner`,
  cooldown: 5,
  
  execute: async (totoro, msg, args) => {
    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      "FN:fénix\n" +
      "ORG:fénix;\n" +
      "TEL;type=CELL;type=VOICE;waid=34638579630:+34 638 57 96 30\n" +
      "END:VCARD";

    msg.reply({
      contacts: {
        displayName: "fénix 🐦‍🔥🦤",
        contacts: [{ vcard }],
      },
    });
  },
};