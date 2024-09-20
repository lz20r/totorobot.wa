const axios = require("axios"); // Asegúrate de tener axios instalado para hacer solicitudes HTTP
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "twitter",
  category: "multimedia",
  subcategory: "twitter",
  usage: "twitter <enlace_del_tweet>",
  description: "Descarga videos e imágenes de X (x.com)",

  cmdPrem: false,
  async execute(totoro, msg, args) {
    const message = msg.messages[0];
    const remoteJid = message.key.remoteJid;

    // Si no hay argumentos, mostrar la ayuda
    if (!args.length) {
      return help(
        totoro,
        msg,
        "twitter",
        "Descarga videos e imágenes de X (x.com)",
        `${prefix}twitter <enlace_del_tweet>`
      );
    }
    msg.react("⏳");

    // Extraer la URL del argumento o del mensaje citado
    let url =
      args[0] ||
      message.message.extendedTextMessage?.contextInfo?.quotedMessage
        ?.audioMessage?.url;

    // Expresión regular para admitir solo URLs válidas de x.com
    const twRegExp = /^https?:\/\/(www\.)?x\.com\/.+$/;

    // Validar que la URL sea de X.com
    if (!twRegExp.test(url)) {
      return sendWarning(
        totoro,
        msg,
        "*🚩 Asegúrate de ingresar una URL válida de X (x.com)*"
      );
    }

    try {
      // Realizar la solicitud a la API
      const response = await axios.get(
        `https://deliriusapi-official.vercel.app/download/twitterdl?url=${encodeURIComponent(
          url
        )}`
      );

      console.log("Respuesta de la API:", response.data); // Log para verificar la respuesta

      // Verificar la respuesta
      if (response.data.status === true) {
        const mediaType = response.data.type; // Tipo de medio (video o image)
        const dl_url = response.data.media.url; // URL del medio

        let txt = `> Solicitado por: @${
          message.key.participant.split("@")[0]
        }\n`;

        if (mediaType === "video") {
          // Enviar el mensaje de video
          await totoro.sendMessage(
            remoteJid,
            {
              video: { url: dl_url },
              caption: txt,
              mentions: [message.key.participant],
            },
            { quoted: message } // Permitir enviar por mensaje citado
          );
        } else if (mediaType === "image") {
          // Enviar el mensaje de imagen (o múltiples imágenes)
          if (Array.isArray(dl_url)) {
            for (let url of dl_url) {
              await totoro.sendMessage(
                remoteJid,
                {
                  image: { url: url },
                  caption: txt,
                  mentions: [message.key.participant],
                },
                { quoted: message }
              );
            }
          } else {
            await totoro.sendMessage(
              remoteJid,
              {
                image: { url: dl_url },
                caption: txt,
                mentions: [message.key.participant],
              },
              { quoted: message }
            );
          }
        } else {
          sendWarning(
            totoro,
            msg,
            "*🏮 No se pudo identificar el tipo de medio (video o imagen) :/*"
          );
        }
      } else {
        return sendWarning(
          totoro,
          msg,
          "*No se pudo descargar el medio de X. Por favor, vuelve a intentarlo.*"
        );
      }
    } catch (error) {
      console.error("Error de Axios:", error); // Log del error detallado
      totoroLog.error(
        "./logs/plugins/multimedia/twitter.js",
        `Error al descargar el medio de X: ${error}`
      );
      sendError(
        totoro,
        msg,
        "Error al descargar el medio de X. Por favor, vuelve a intentarlo."
      );
    }
  },
};
