const prefix = require("../../../settings.json").prefix;
module.exports = {
  name: "playstore",
  aliases: ["playsearch", "playstore"],
  category: "information",
  subcategory: "apps",
  usage: `${prefix}playstore <app>`,
  example: `${prefix}playstore whatsapp`,
  description:
    "Busca una aplicación en Google Play Store y obtén su información",

  async execute(totoro, msg, args) {
    const {
      sendError,
      sendWarning,
      help,
    } = require("../../functions/messages");
    const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
    const PlayStore = require("google-play-scraper");

    if (!msg.messages || !msg.messages[0]) {
      return sendError(totoro, msg, "Play Store", "No se encontró el mensaje.");
    }
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const from = info?.key?.remoteJid;
    const appName = args.join(" ");

    (await msg.react) ? msg.react("🔍") : null;
    if (!appName) {
      return help(
        totoro,
        msg,
        "Play Store",
        "Busca una aplicación en Google Play Store y obtén su información.",
        `${prefix}playstore WhatsApp`
      );
    }

    try {
      const searchResults = await PlayStore.search({
        term: appName,
        num: 1,
      });

      if (!searchResults || searchResults.length === 0) {
        return sendWarning(
          totoro,
          msg,
          "Play Store",
          `No se encontraron resultados para "${appName}".`
        );
      }

      let AppInfo = searchResults[0];

      let name = AppInfo.title ? AppInfo.title : "Nombre no disponible";
      let price = AppInfo.priceText ? AppInfo.priceText : "Gratis";
      let rating = AppInfo.score ? AppInfo.score : "Sin puntuación";
      let review = AppInfo.reviews ? AppInfo.reviews : "Sin reseñas";
      let developer = AppInfo.developer
        ? `Desarrollador: ${AppInfo.developer}`
        : "Desarrollador no disponible";
      let icon = AppInfo.icon ? AppInfo.icon : null;

      const embed =
        `╭─⬣「 *Play Store Search* 」⬣\n` +
        `│  ≡◦ *📱 ${name}\n` +
        `│  ≡◦ *👨‍💻 ${developer}\n` +
        `│  ≡◦ *💰 ${price}\n` +
        `│  ≡◦ *⭐ ${rating}\n` +
        `│  ≡◦ *📊 ${review}\n` +
        `╰─⬣\n` +
        `> Solicitado por:  @${sender.split("@")[0]}\n\n`;

      let media;
      try {
        media = await prepareWAMessageMedia(
          {
            image: { url: icon },
            mentions: [sender],
          },
          { upload: totoro.waUploadToServer }
        );
      } catch (mediaError) {
        return sendWarning(totoro, msg, `${mediaError.message}`);
      }

      const messageOptions = {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            imageMessage: media.imageMessage,
          },
          body: { text: embed },
          footer: { text: "Powered by Totoro 🪧" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: `${name}`,
                  id: `playstore+${name}`,
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: `🌐 ${name} en Play Store`,
                  url: AppInfo.url,
                }),
              },
            ],
            messageParamsJson: "",
          },
        },
        mentions: [sender],
      };

      try {
        await totoro.relayMessage(
          from,
          { viewOnceMessage: { message: messageOptions } },
          { quoted: info }
        );
      } catch (err) {
        return;
      }

      await msg.react("🪼");
    } catch (error) {
      return sendError(
        totoro,
        msg,
        `Ocurrió un error al buscar "${appName}": ${error.message}`
      );
    }
  },
};
