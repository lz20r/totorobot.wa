const PlayStore = require("google-play-scraper");
const axios = require("axios");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "apkdownload",
  aliases: ["apkdownload", "apkinfo", "searchapk", "apk", "apkstore"],
  category: "information",
  subcategory: "apps",
  usage: `${prefix}apkdownload <app>`,
  example: `${prefix}apkdownload whatsapp`,
  description:
    "Busca una aplicación en Google Play Store y obtén su información y enlace de descarga de APK",
  cmdBlock: true,

  async execute(totoro, msg, args) {
    const {
      sendError,
      sendWarning,
      help,
    } = require("../../functions/messages");
    const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

    if (!msg.messages || !msg.messages[0]) {
      return sendError(
        totoro,
        msg,
        "APK Download",
        "No se encontró el mensaje."
      );
    }
    const info = msg.messages[0];
    const isGroup = info.key.remoteJid.endsWith("@g.us");
    const sender = isGroup ? info.key.participant : info.key.remoteJid;
    const from = info?.key?.remoteJid;
    const appName = args.join(" ");

    if (!appName) {
      return help(
        totoro,
        msg,
        "APK Download",
        "Busca una aplicación en Google Play Store y obtén su información y enlace de descarga de APK.",
        `${prefix}apkdownload WhatsApp`
      );
    }

    try {
      // Buscar la aplicación en Google Play Store
      const searchResults = await PlayStore.search({
        term: appName,
        num: 1,
      });

      if (!searchResults || searchResults.length === 0) {
        return sendWarning(
          totoro,
          msg,
          "APK Download",
          `No se encontraron resultados para "${appName}".`
        );
      }

      let AppInfo = searchResults[0];
      let name = AppInfo.title || "Nombre no disponible";
      let developer = AppInfo.developer || "Desarrollador no disponible";
      let icon = AppInfo.icon || null;

      // Generar enlace de descarga de APK
      let apkDownloadLink = `https://apkcombo.com/es-es/apk-downloader/?device=&arch=&q=${encodeURIComponent(
        AppInfo.appId
      )}`;

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

      const embed =
        `╭─⬣「 *APKCombo Search* 」⬣\n` +
        `│  ≡◦ *📱 ${name}\n` +
        `│  ≡◦ *👨‍💻 ${developer}\n` +
        `│  ≡◦ *🔗 [Descargar APK](${apkDownloadLink})\n` +
        `╰─⬣\n` +
        `> Solicitado por:  @${sender.split("@")[0]}\n\n`;

      const messageOptions = {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            imageMessage: media.imageMessage,
          },
          body: { text: embed },
          footer: { text: "Powered by Totoro 🪧" },
        },
        mentions: [sender],
      };

      await totoro.relayMessage(
        from,
        { viewOnceMessage: { message: messageOptions } },
        { quoted: info }
      );

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
