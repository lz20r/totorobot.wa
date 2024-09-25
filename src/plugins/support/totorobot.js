const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "totoro",
  category: "totoSupport",
  subcategory: "info",
  aliases: ["totoro", "totoBot", "totorito"],
  description: "Muestra el contacto del bot",
  usage: `${prefix}owner`,
  cooldown: 5,
  
  execute: async (totoro, msg, args) => {
    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      "FN:Totoro\n" +
      "ORG:totoro;\n" +
      "TEL;type=CELL;type=VOICE;waid=447360497992:+44 7360 497992\n" +
      "END:VCARD";

    msg.reply({
      contacts: {
        displayName: "Totoro",
        contacts: [{ vcard }],
      },
    });
  },
};