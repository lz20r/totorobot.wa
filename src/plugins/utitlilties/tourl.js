require("dotenv").config();
const { help, sendError, sendWarning } = require("../../functions/messages");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  name: "tourl",
  category: "utilities",
  subcategory: "to url",
  aliases: ["aurl"],
  description: "Pasar un archivo a URL.",

  async execute(totoro, msg, args) {
    try {
      msg.react("🔍");

      // Verificar si hay un mensaje citado o si es un mensaje directo
      const message =
        msg.messages[0].message.ephemeralMessage.message.extendedTextMessage
          .contextInfo.quotedMessage.ephemeralMessage.message.imageMessage;
      if (!message)
        return sendWarning(
          totoro,
          msg,
          "Necesitas citar o enviar algún archivo."
        );

      // Obtener jpegThumbnail y mediaKey
      const jpegThumbnail = message.jpegThumbnail;
      const mediaKey = message.mediaKey;

      if (!jpegThumbnail || !mediaKey) {
        return sendWarning(
          totoro,
          msg,
          "No se encontró jpegThumbnail o mediaKey."
        );
      }

      // Descargar el contenido de la imagen
      const contentStream = await downloadContentFromMessage(
        message,
        "image"
      ).catch((e) => {
        return sendWarning(totoro, msg, "Necesitas enviar algún archivo.");
      });

      const buffer = await streamToBuffer(contentStream); // Convertir el stream a buffer

      msg.react("⬆️");

      // Subir la imagen a Cloudinary
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, async (error, result) => {
          if (error) {
            sendError(totoro, msg, "Error al subir la imagen: " + error);
            return;
          }

          const shortenedUrl = await shortenUrl(result.secure_url);
          const fileSizeKB = (result.bytes / 1024).toFixed(2);

          const participant =
            msg.messages[0].key.participant || msg.messages[0].key.remoteJid;

          const userMention = participant
            ? `@${participant.split("@")[0]}`
            : "";

          msg.react("🔗");

          const responseText =
            `╭─⬣「 *URL del archivo* 」\n` +
            `│  ≡◦ *📂 Nombre*: ${result.original_filename}\n` +
            `│  ≡◦ *🔗 URL*: ${result.secure_url}\n` +
            `│  ≡◦ *🔗 URL acortada*: ${shortenedUrl}\n` +
            `│  ≡◦ *⚖ Peso*: ${fileSizeKB} KB\n` +
            `╰─⬣ \n` +
            `> 🔗 ${userMention} aquí tienes la URL del archivo.`;

          msg.reply({
            text: responseText,
            mentions: [participant],
          });
        })
        .end(buffer);
    } catch (err) {
      sendError(totoro, msg, "Error: " + err);
    }
  },
};

// Función para convertir un stream a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// Función para acortar URL usando TinyURL
async function shortenUrl(url) {
  try {
    const response = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error acortando la URL: " + error.message);
  }
}
