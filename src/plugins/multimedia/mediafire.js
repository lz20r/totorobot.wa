const { scrapeMediafire } = require("../../modules/scrapeMediaFire");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");
const axios = require("axios");
const AdmZip = require("adm-zip");

module.exports = {
  name: "mediafire",
  aliases: ["mf"],
  category: "multimedia",
  subcategory: "mediafire",
  description: "Descarga archivos de Mediafire.",
  usage: "mediafire <mediafire url>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  cmdPrem: false,
  async execute(totoro, msg, args) {
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    if (!args[0] || !args[0].match(/mediafire/gi)) {
      return help(
        totoro,
        msg,
        "mediafire",
        "Descarga archivos de Mediafire.",
        "mediafire <mediafire url>"
      );
    }

    try {
      const [error, { title, uploadDate, ext, size, dl_url }] =
        await scrapeMediafire(args[0]);
      if (error) {
        return sendError(
          totoro,
          msg,
          "Hubo un error al intentar obtener los detalles del archivo de Mediafire."
        );
      }

      if (size.includes("GB") || parseFloat(size.replace(" MB", "")) > 400) {
        return sendWarning(
          totoro,
          msg,
          "El archivo pesa más de 400 MB, se canceló la descarga."
        );
      }

      await msg.react("🔍"); // Reacción al iniciar la descarga

      const response = await axios({
        url: dl_url,
        method: "GET",
        responseType: "arraybuffer",
      });

      const zip = new AdmZip();
      zip.addFile(`${title}.${ext}`, Buffer.from(response.data));
      const zipBuffer = zip.toBuffer();

      // Verificación del tamaño del archivo zip para que no exceda los 2 GB
      if (zipBuffer.length > 2 * 1024 * 1024 * 1024) {
        return sendWarning(
          totoro,
          msg,
          "El archivo comprimido pesa más de 2 GB, se canceló la descarga."
        );
      }

      let txt = `╭─⬣「 *Mediafire Download* 」⬣\n`;
      txt += `│  ≡◦ *🍭 Título ∙* ${title}\n`;
      txt += `│  ≡◦ *🪴 Subido el ∙* ${uploadDate}\n`;
      txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
      txt += `╰─⬣`;

      await totoro.sendMessage(
        remoteJid || participant,
        {
          document: zipBuffer,
          mimetype: "application/zip",
          fileName: `${title}.zip`,
          caption: txt,
        },
        { quoted: msg.messages[0], asDocument: true } // Supuse que `user.useDocument` era `true`
      );

      await msg.react("🍭"); // Reacción al finalizar la descarga
    } catch (error) {
      totoroLog.error(
        "./logs/mediafire.log",
        `Error al descargar archivo de Mediafire: ${error}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al intentar descargar el archivo."
      );
    }
  },
};
