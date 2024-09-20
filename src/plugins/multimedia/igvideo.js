const Scraper = require("@SumiFX/Scraper");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { sendWarning, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "igvideo",
  category: "multimedia",
  subcategory: "instagram",
  usage: "igvideo <enlace>",
  description: "Descarga video de Instagram.",
  example: "igvideo https://www.instagram.com/p/CS8X3v3L6WV/",

  cmdPrem: false,
  async execute(totoro, msg, args) {
    msg.react("⏳");
    let { dl_url } = await Scraper.igdl(args[0]);
    if (!dl_url) {
      totoroLog.info(
        "./logs/plugins/multimedia/igmp4.log",
        "Error al obtener el enlace de descarga."
      );
      help(
        totoro,
        msg,
        "igvideo",
        "Debes proporcionar un enlace de Instagram.",
        "igvideo https://www.instagram.com/p/1234567890/"
      );
    }

    if (dl_url.match(/.jpg|.jpeg|.png/gi)) {
      totoroLog.info(
        "./logs/plugins/multimedia/igmp4.log",
        "No se pudo obtener el enlace de descarga."
      );
      return sendWarning(totoro, msg, `No se pueden descargar imágenes.`);
    } else if (dl_url.match(/.mp4/gi)) {
      totoroLog.info(
        "./logs/plugins/multimedia/igmp4.log",
        "Enlace de descarga obtenido."
      );
    }

    const user = msg.messages[0]?.pushName || ".";
    const content = `Solicitada por ${user}`;

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: { url: "https://i.ibb.co/j9N5kj3/image.jpg" },
      },
      { upload: totoro.waUploadToServer }
    );

    const message = {
      interactiveMessage: {
        header: {
          hasMediaAttachment: true,
          imageMessage: imageMessage,
        },
        body: { text: content },
        footer: { text: `Descargado por Totoro` },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: `Download MP4`,
                id: `sendmp4+${dl_url}`,
              }),
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: `Open in instagram 📲`,
                url: args[0],
              }),
            },
          ],
          messageParamsJson: "",
        },
      },
    };

    await totoro.relayMessage(
      msg.messages[0].key.remoteJid,
      { viewOnceMessage: { message } },
      {
        quoted: msg.messages[0],
      }
    );

    await msg.react("📽️");
  },
};
